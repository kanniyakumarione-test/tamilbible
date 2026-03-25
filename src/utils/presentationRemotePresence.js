const STORAGE_KEY = "appPresentationRemotePresence";
const EVENT_NAME = "app-presentation-remote-presence";
const STALE_AFTER_MS = 15000;
const API_BASE = import.meta.env.VITE_PRESENTATION_API_BASE || "";

let presenceStreamStarted = false;

function getApiUrl(path) {
  return `${API_BASE}${path}`;
}

function emitChange(devices) {
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: devices }));
}

function normalizeDevices(stored) {
  if (!Array.isArray(stored)) {
    return [];
  }

  return stored
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

function isActiveDevice(device, now = Date.now()) {
  return now - (device.lastSeenAt || 0) <= STALE_AFTER_MS;
}

function getStoredDevices() {
  try {
    return normalizeDevices(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));
  } catch {
    return [];
  }
}

function saveStoredDevices(devices) {
  const normalized = normalizeDevices(devices);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  emitChange(normalized);
  return normalized;
}

export function getRemotePresenceEventName() {
  return EVENT_NAME;
}

export function getRemoteDevices() {
  return getStoredDevices();
}

export function saveRemoteDevices(devices) {
  return saveStoredDevices(devices);
}

export function pruneRemoteDevices(now = Date.now()) {
  const activeDevices = getStoredDevices().filter((device) => isActiveDevice(device, now));
  return saveStoredDevices(activeDevices);
}

export function getActiveRemoteDevices(now = Date.now()) {
  return getStoredDevices().filter((device) => isActiveDevice(device, now));
}

export async function syncRemoteDevicesFromBackend() {
  try {
    const response = await fetch(getApiUrl("/api/presentation/presence"), {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to load presence.");
    }

    const data = await response.json();
    return saveStoredDevices(data?.devices || []);
  } catch {
    return pruneRemoteDevices();
  }
}

export async function upsertRemoteDevice(device) {
  const now = Date.now();
  const current = pruneRemoteDevices(now);
  const nextDevice = {
    id: device.id,
    label: device.label || "Remote Device",
    platform: device.platform || "Unknown device",
    userAgent: device.userAgent || "",
    connectedAt: device.connectedAt || now,
    lastSeenAt: now,
  };

  const withoutCurrent = current.filter((entry) => entry.id !== nextDevice.id);
  const fallbackDevices = saveStoredDevices([nextDevice, ...withoutCurrent]);

  try {
    const response = await fetch(getApiUrl("/api/presentation/presence"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ device: nextDevice }),
    });

    if (!response.ok) {
      throw new Error("Failed to save presence.");
    }

    const data = await response.json();
    return saveStoredDevices(data?.devices || []);
  } catch {
    return fallbackDevices;
  }
}

export async function removeRemoteDevice(deviceId) {
  const nextDevices = saveStoredDevices(
    getStoredDevices().filter((device) => device.id !== deviceId)
  );

  try {
    const response = await fetch(
      getApiUrl(`/api/presentation/presence/${encodeURIComponent(deviceId)}`),
      { method: "DELETE" }
    );

    if (!response.ok) {
      throw new Error("Failed to remove presence.");
    }

    const data = await response.json();
    return saveStoredDevices(data?.devices || []);
  } catch {
    return nextDevices;
  }
}

export function startRemotePresenceStream() {
  if (
    presenceStreamStarted ||
    typeof window === "undefined" ||
    typeof EventSource === "undefined"
  ) {
    return;
  }

  presenceStreamStarted = true;
  const source = new EventSource(getApiUrl("/api/presentation/stream"));

  source.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);

      if (message?.type === "presence") {
        saveStoredDevices(message.payload || []);
      }
    } catch {
      // Ignore malformed stream events.
    }
  };

  source.onerror = () => {
    source.close();
    presenceStreamStarted = false;
    window.setTimeout(() => {
      startRemotePresenceStream();
    }, 2500);
  };
}
