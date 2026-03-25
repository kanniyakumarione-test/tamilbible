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

const defaultState = {
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
    ...defaultState.sermon,
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
    writeFileSync(stateFile, JSON.stringify(defaultState, null, 2));
    return structuredClone(defaultState);
  }

  try {
    const parsed = JSON.parse(readFileSync(stateFile, "utf8"));
    return {
      sermon: normalizeSermon(parsed?.sermon),
      presence: normalizePresence(parsed?.presence),
    };
  } catch {
    writeFileSync(stateFile, JSON.stringify(defaultState, null, 2));
    return structuredClone(defaultState);
  }
}

let state = loadState();
const clients = new Set();

async function persistState() {
  ensureStateDir();
  await fs.writeFile(stateFile, JSON.stringify(state, null, 2));
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(data));
}

function sendNoContent(res) {
  res.writeHead(204, {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end();
}

function sendSseEvent(client, type, payload) {
  client.write(`data: ${JSON.stringify({ type, payload })}\n\n`);
}

function broadcast(type, payload) {
  for (const client of clients) {
    sendSseEvent(client, type, payload);
  }
}

function prunePresence(now = Date.now()) {
  const nextPresence = normalizePresence(state.presence).filter(
    (device) => now - (device.lastSeenAt || 0) <= presenceStaleAfterMs
  );

  if (nextPresence.length !== state.presence.length) {
    state = { ...state, presence: nextPresence };
    persistState().catch(() => {});
    broadcast("presence", nextPresence);
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

  return Array.from(new Set(ips));
}

function getServerInfo(frontendPort) {
  const candidatePort = frontendPort || process.env.FRONTEND_PORT || port;
  const lanIps = getLanIps();

  return {
    backendOrigin: `http://localhost:${port}`,
    lanIps,
    candidateOrigins: lanIps.map((ip) => `http://${ip}:${candidatePort}`),
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
    sendJson(res, 404, { error: "Frontend build not found. Run npm run build first." });
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

  if (req.method === "OPTIONS") {
    sendNoContent(res);
    return;
  }

  if (url.pathname === "/api/presentation/stream" && req.method === "GET") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": allowedOrigin,
    });

    res.write("\n");
    clients.add(res);
    sendSseEvent(res, "sermon", normalizeSermon(state.sermon));
    sendSseEvent(res, "presence", prunePresence());

    const keepAliveId = setInterval(() => {
      res.write(": keep-alive\n\n");
    }, 20000);

    req.on("close", () => {
      clearInterval(keepAliveId);
      clients.delete(res);
    });
    return;
  }

  if (url.pathname === "/api/presentation/state" && req.method === "GET") {
    sendJson(res, 200, { sermon: normalizeSermon(state.sermon) });
    return;
  }

  if (url.pathname === "/api/presentation/state" && req.method === "POST") {
    try {
      const body = await parseBody(req);
      const nextSermon = normalizeSermon(body?.sermon);
      const currentUpdatedAt = Number(state.sermon?.updatedAt) || 0;

      if (nextSermon.updatedAt >= currentUpdatedAt) {
        state = { ...state, sermon: nextSermon };
        await persistState();
        broadcast("sermon", nextSermon);
      }

      sendJson(res, 200, { sermon: normalizeSermon(state.sermon) });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (url.pathname === "/api/presentation/presence" && req.method === "GET") {
    sendJson(res, 200, { devices: prunePresence() });
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

      const currentPresence = prunePresence(now).filter((entry) => entry.id !== normalizedDevice.id);
      const nextPresence = [normalizedDevice, ...currentPresence];
      state = { ...state, presence: nextPresence };
      await persistState();
      broadcast("presence", nextPresence);
      sendJson(res, 200, { devices: nextPresence });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (url.pathname.startsWith("/api/presentation/presence/") && req.method === "DELETE") {
    const deviceId = decodeURIComponent(url.pathname.slice("/api/presentation/presence/".length));
    const nextPresence = prunePresence().filter((device) => device.id !== deviceId);
    state = { ...state, presence: nextPresence };
    await persistState();
    broadcast("presence", nextPresence);
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
  prunePresence();
}, 5000);

server.listen(port, host, () => {
  const serverInfo = getServerInfo(process.env.FRONTEND_PORT);
  const previewUrls = serverInfo.candidateOrigins.length
    ? serverInfo.candidateOrigins.join(", ")
    : "No LAN IP detected";

  console.log(`Presentation backend running on http://${host}:${port}`);
  console.log(`Phone-friendly frontend candidates: ${previewUrls}`);
});
