const SERMON_EVENT_NAME = "app-presentation-sermon-sync";
const SERVER_INFO_EVENT_NAME = "app-presentation-server-info";
const REMOTE_STATE_KEY = "appRemotePresentationState";
const API_BASE = import.meta.env.VITE_PRESENTATION_API_BASE || "";

let streamStarted = false;
let remoteSermonCache = readRemoteSermonCache();
let serverInfoCache = null;

function getApiUrl(path) {
  return `${API_BASE}${path}`;
}

function emit(name, detail) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

function readRemoteSermonCache() {
  try {
    const stored = JSON.parse(localStorage.getItem(REMOTE_STATE_KEY) || "null");
    return stored?.sermon || null;
  } catch {
    return null;
  }
}

function saveRemoteSermonCache(sermon) {
  remoteSermonCache = sermon;
  localStorage.setItem(REMOTE_STATE_KEY, JSON.stringify({ sermon }));
}

function normalizeSermon(sermon) {
  return {
    queue: Array.isArray(sermon?.queue) ? sermon.queue : [],
    activeItem: sermon?.activeItem || null,
    displayMode: sermon?.displayMode || "live",
    updatedAt: Number(sermon?.updatedAt) || Date.now(),
  };
}

export function getPresentationSermonSyncEventName() {
  return SERMON_EVENT_NAME;
}

export function getPresentationServerInfoEventName() {
  return SERVER_INFO_EVENT_NAME;
}

export function getCachedRemoteSermon() {
  return remoteSermonCache;
}

export function getCachedPresentationServerInfo() {
  return serverInfoCache;
}

export async function pushPresentationSermonState(sermon) {
  const normalized = normalizeSermon(sermon);
  saveRemoteSermonCache(normalized);

  try {
    const response = await fetch(getApiUrl("/api/presentation/state"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sermon: normalized }),
    });

    if (!response.ok) {
      throw new Error("Failed to push presentation state.");
    }
  } catch {
    // Keep local fallback working when the backend is unavailable.
  }

  emit(SERMON_EVENT_NAME, normalized);
  return normalized;
}

export async function fetchPresentationSermonState() {
  try {
    const response = await fetch(getApiUrl("/api/presentation/state"), {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to load presentation state.");
    }

    const data = await response.json();
    const normalized = normalizeSermon(data?.sermon);
    saveRemoteSermonCache(normalized);
    emit(SERMON_EVENT_NAME, normalized);
    return normalized;
  } catch {
    return remoteSermonCache;
  }
}

function handleStreamMessage(event) {
  try {
    const message = JSON.parse(event.data);

    if (message?.type === "sermon" && message.payload) {
      const normalized = normalizeSermon(message.payload);
      saveRemoteSermonCache(normalized);
      emit(SERMON_EVENT_NAME, normalized);
    }

    if (message?.type === "server-info" && message.payload) {
      serverInfoCache = message.payload;
      emit(SERVER_INFO_EVENT_NAME, serverInfoCache);
    }
  } catch {
    // Ignore malformed stream events.
  }
}

export function startPresentationSyncStream() {
  if (streamStarted || typeof window === "undefined" || typeof EventSource === "undefined") {
    return;
  }

  streamStarted = true;

  const connect = () => {
    const source = new EventSource(getApiUrl("/api/presentation/stream"));

    source.onmessage = handleStreamMessage;
    source.onerror = () => {
      source.close();
      streamStarted = false;
      window.setTimeout(() => {
        startPresentationSyncStream();
      }, 2500);
    };
  };

  connect();
}

export async function fetchPresentationServerInfo(frontendPort = window.location.port) {
  try {
    const response = await fetch(
      getApiUrl(`/api/presentation/server-info?frontendPort=${encodeURIComponent(frontendPort)}`),
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to load server info.");
    }

    serverInfoCache = await response.json();
    emit(SERVER_INFO_EVENT_NAME, serverInfoCache);
    return serverInfoCache;
  } catch {
    serverInfoCache = null;
    return null;
  }
}
