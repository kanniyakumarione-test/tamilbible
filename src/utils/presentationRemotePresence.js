const STORAGE_KEY = "appPresentationRemotePresence";
const EVENT_NAME = "app-presentation-remote-presence";
const STALE_AFTER_MS = 15000;

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

export function getRemotePresenceEventName() {
  return EVENT_NAME;
}

export function getRemoteDevices() {
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  return normalizeDevices(stored);
}

export function saveRemoteDevices(devices) {
  const normalized = normalizeDevices(devices);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  emitChange(normalized);
  return normalized;
}

export function pruneRemoteDevices(now = Date.now()) {
  const activeDevices = getRemoteDevices().filter((device) => isActiveDevice(device, now));
  return saveRemoteDevices(activeDevices);
}

export function getActiveRemoteDevices(now = Date.now()) {
  return getRemoteDevices().filter((device) => isActiveDevice(device, now));
}

export function upsertRemoteDevice(device) {
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
  return saveRemoteDevices([nextDevice, ...withoutCurrent]);
}

export function removeRemoteDevice(deviceId) {
  const nextDevices = getRemoteDevices().filter((device) => device.id !== deviceId);
  return saveRemoteDevices(nextDevices);
}
