import { createReadStream, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { promises as fs } from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const stateDir = path.join(__dirname, "data");
const stateFile = path.join(stateDir, "presentation-state.json");

const port = Number(process.env.PORT || 8787);
const host = process.env.HOST || "0.0.0.0";
const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";
const presenceStaleAfterMs = 15000;

function log(message, level = "INFO") {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level}] ${message}`);
}

const defaultRoomState = {
  sermon: {
    queue: [],
    activeItem: null,
    displayMode: "live",
    updatedAt: null,
  },
  presence: [],
};

function ensureStateDir() {
  if (!existsSync(stateDir)) {
    mkdirSync(stateDir, { recursive: true });
  }
}

function normalizeSermon(sermon) {
  return {
    ...defaultRoomState.sermon,
    ...(sermon || {}),
    queue: Array.isArray(sermon?.queue) ? sermon.queue : [],
    updatedAt: Number(sermon?.updatedAt) || Date.now(),
  };
}

function normalizePresence(devices) {
  if (!Array.isArray(devices)) {
    return [];
  }

  return devices
    .filter((device) => device && typeof device.id === "string")
    .map((device) => ({
      id: device.id,
      label: device.label || "Remote Device",
      platform: device.platform || "Unknown device",
      userAgent: device.userAgent || "",
      connectedAt: Number(device.connectedAt) || Date.now(),
      lastSeenAt: Number(device.lastSeenAt) || Date.now(),
    }));
}

function loadState() {
  ensureStateDir();

  if (!existsSync(stateFile)) {
    writeFileSync(stateFile, JSON.stringify({}, null, 2));
    return {};
  }

  try {
    const parsed = JSON.parse(readFileSync(stateFile, "utf8"));
    const normalized = {};
    for (const [room, roomState] of Object.entries(parsed || {})) {
      normalized[room] = {
        sermon: normalizeSermon(roomState?.sermon),
        presence: normalizePresence(roomState?.presence),
      };
    }
    return normalized;
  } catch {
    writeFileSync(stateFile, JSON.stringify({}, null, 2));
    return {};
  }
}

let state = loadState(); // Map of roomCode -> roomState
const clients = new Set(); // Set of { res, roomCode }

function getRoomState(roomCode) {
  if (!roomCode) return structuredClone(defaultRoomState);
  if (!state[roomCode]) {
    state[roomCode] = structuredClone(defaultRoomState);
  }
  return state[roomCode];
}

async function persistState() {
  ensureStateDir();
  await fs.writeFile(stateFile, JSON.stringify(state, null, 2));
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, Cache-Control",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(data));
}

function sendNoContent(res) {
  res.writeHead(204, {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, Cache-Control",
  });
  res.end();
}

function sendSseEvent(client, type, payload) {
  client.write(`data: ${JSON.stringify({ type, payload })}\n\n`);
}

function broadcast(roomCode, type, payload) {
  if (!roomCode) return;
  for (const client of clients) {
    if (client.roomCode === roomCode) {
      sendSseEvent(client.res, type, payload);
    }
  }
}

function prunePresence(roomCode, now = Date.now()) {
  if (!roomCode) return [];
  const roomState = getRoomState(roomCode);
  const nextPresence = normalizePresence(roomState.presence).filter(
    (device) => now - (device.lastSeenAt || 0) <= presenceStaleAfterMs
  );

  if (nextPresence.length !== roomState.presence.length) {
    state[roomCode] = { ...roomState, presence: nextPresence };
    persistState().catch(() => {});
    broadcast(roomCode, "presence", nextPresence);
  }

  return nextPresence;
}

function getLanIps() {
  const interfaces = os.networkInterfaces();
  const ips = [];

  for (const entries of Object.values(interfaces)) {
    for (const entry of entries || []) {
      if (entry.family === "IPv4" && !entry.internal) {
        ips.push(entry.address);
      }
    }
  }

  const uniqueIps = Array.from(new Set(ips));

  // Sort IPs to prioritize common LAN ranges (192.168.x.x, 10.x.x.x)
  return uniqueIps.sort((a, b) => {
    const isCommon = (ip) => ip.startsWith("192.168.") || ip.startsWith("10.");
    if (isCommon(a) && !isCommon(b)) return -1;
    if (!isCommon(a) && isCommon(b)) return 1;
    return a.localeCompare(b);
  });
}

function getServerInfo(frontendPort) {
  const candidatePort = frontendPort || process.env.FRONTEND_PORT || port;
  const lanIps = getLanIps();
  const publicOrigin = process.env.PUBLIC_ORIGIN || null;

  return {
    backendOrigin: `http://localhost:${port}`,
    lanIps,
    candidateOrigins: [
      ...(publicOrigin ? [publicOrigin] : []),
      ...lanIps.map((ip) => `http://${ip}:${candidatePort}`),
    ],
  };
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });

    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });

    req.on("error", reject);
  });
}

function getContentType(filePath) {
  if (filePath.endsWith(".html")) return "text/html; charset=utf-8";
  if (filePath.endsWith(".js")) return "application/javascript; charset=utf-8";
  if (filePath.endsWith(".css")) return "text/css; charset=utf-8";
  if (filePath.endsWith(".json")) return "application/json; charset=utf-8";
  if (filePath.endsWith(".svg")) return "image/svg+xml";
  if (filePath.endsWith(".png")) return "image/png";
  if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) return "image/jpeg";
  if (filePath.endsWith(".webmanifest")) return "application/manifest+json; charset=utf-8";
  return "application/octet-stream";
}

function serveStatic(req, res) {
  const requestPath = req.url === "/" ? "/index.html" : new URL(req.url, "http://localhost").pathname;
  const cleanPath = requestPath.replace(/^\/+/, "");
  const directFile = path.join(distDir, cleanPath);
  const filePath = existsSync(directFile) ? directFile : path.join(distDir, "index.html");

  if (!existsSync(filePath)) {
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    res.end(
      '<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>404 Not Found</title></head><body style="font-family: sans-serif; padding: 2rem; text-align: center;"><h2>Frontend build not found</h2><p>Please run <code>npm run build</code> first before using the backend server.</p></body></html>'
    );
    return;
  }

  res.writeHead(200, {
    "Content-Type": getContentType(filePath),
    "Cache-Control": filePath.endsWith("index.html") ? "no-store" : "public, max-age=31536000, immutable",
  });

  createReadStream(filePath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  log(`${req.method} ${url.pathname}`);

  if (req.method === "OPTIONS") {
    sendNoContent(res);
    return;
  }

  const roomCode = url.searchParams.get("room") || "default";

  if (url.pathname === "/api/presentation/stream" && req.method === "GET") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": allowedOrigin,
    });

    res.write("\n");
    const clientRecord = { res, roomCode };
    clients.add(clientRecord);
    
    const roomState = getRoomState(roomCode);
    sendSseEvent(res, "sermon", normalizeSermon(roomState.sermon));
    sendSseEvent(res, "presence", prunePresence(roomCode));

    const keepAliveId = setInterval(() => {
      res.write(": keep-alive\n\n");
    }, 20000);

    req.on("close", () => {
      clearInterval(keepAliveId);
      clients.delete(clientRecord);
    });
    return;
  }

  if (url.pathname === "/api/presentation/state" && req.method === "GET") {
    const roomState = getRoomState(roomCode);
    sendJson(res, 200, { sermon: normalizeSermon(roomState.sermon) });
    return;
  }

  if (url.pathname === "/api/presentation/state" && req.method === "POST") {
    try {
      const body = await parseBody(req);
      const nextSermon = normalizeSermon(body?.sermon);
      const roomState = getRoomState(roomCode);
      const currentUpdatedAt = Number(roomState.sermon?.updatedAt) || 0;

      if (nextSermon.updatedAt >= currentUpdatedAt) {
        state[roomCode] = { ...roomState, sermon: nextSermon };
        await persistState();
        broadcast(roomCode, "sermon", nextSermon);
      }

      sendJson(res, 200, { sermon: normalizeSermon(state[roomCode].sermon) });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (url.pathname === "/api/presentation/presence" && req.method === "GET") {
    sendJson(res, 200, { devices: prunePresence(roomCode) });
    return;
  }

  if (url.pathname === "/api/presentation/presence" && req.method === "POST") {
    try {
      const body = await parseBody(req);
      const device = body?.device;

      if (!device || typeof device.id !== "string") {
        sendJson(res, 400, { error: "Presence device id is required." });
        return;
      }

      const now = Date.now();
      const normalizedDevice = {
        id: device.id,
        label: device.label || "Remote Device",
        platform: device.platform || "Unknown device",
        userAgent: device.userAgent || "",
        connectedAt: Number(device.connectedAt) || now,
        lastSeenAt: now,
      };

      const roomState = getRoomState(roomCode);
      const currentPresence = prunePresence(roomCode, now).filter((entry) => entry.id !== normalizedDevice.id);
      const nextPresence = [normalizedDevice, ...currentPresence];
      state[roomCode] = { ...roomState, presence: nextPresence };
      await persistState();
      broadcast(roomCode, "presence", nextPresence);
      sendJson(res, 200, { devices: nextPresence });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (url.pathname.startsWith("/api/presentation/presence/") && req.method === "DELETE") {
    const deviceId = decodeURIComponent(url.pathname.slice("/api/presentation/presence/".length));
    const roomState = getRoomState(roomCode);
    const nextPresence = prunePresence(roomCode).filter((device) => device.id !== deviceId);
    state[roomCode] = { ...roomState, presence: nextPresence };
    await persistState();
    broadcast(roomCode, "presence", nextPresence);
    sendJson(res, 200, { devices: nextPresence });
    return;
  }

  if (url.pathname === "/api/presentation/server-info" && req.method === "GET") {
    const frontendPort = url.searchParams.get("frontendPort");
    sendJson(res, 200, getServerInfo(frontendPort));
    return;
  }

  serveStatic(req, res);
});

setInterval(() => {
  const now = Date.now();
  for (const roomCode of Object.keys(state)) {
    prunePresence(roomCode, now);
  }
}, 5000);

server.listen(port, host, () => {
  const serverInfo = getServerInfo(process.env.FRONTEND_PORT);
  const previewUrls = serverInfo.candidateOrigins.length
    ? serverInfo.candidateOrigins.join(", ")
    : "No LAN IP detected";

  console.log(`Presentation backend running on http://${host}:${port}`);
  console.log(`Phone-friendly frontend candidates: ${previewUrls}`);
});
