import { useSyncExternalStore } from "react";

import {
  getLibraryData,
  getLibraryEventName,
} from "../utils/libraryData";
import {
  fetchPresentationSermonState,
  getPresentationSermonSyncEventName,
  startPresentationSyncStream,
} from "../utils/presentationBackend";

let currentLibraryData = getLibraryData();
let sharedListeners = new Set();
let sharedSubscriptionStarted = false;

function emitLibraryUpdate(nextValue = getLibraryData()) {
  currentLibraryData = nextValue;
  sharedListeners.forEach((listener) => listener());
}

function ensureSharedLibrarySubscription() {
  if (sharedSubscriptionStarted || typeof window === "undefined") {
    return;
  }

  sharedSubscriptionStarted = true;

  const syncLibrary = (event) => {
    if (event?.type === getLibraryEventName() && event.detail) {
      emitLibraryUpdate(event.detail);
      return;
    }

    emitLibraryUpdate();
  };

  window.addEventListener("storage", syncLibrary);
  window.addEventListener(getLibraryEventName(), syncLibrary);
  window.addEventListener(getPresentationSermonSyncEventName(), syncLibrary);

  startPresentationSyncStream();
  void fetchPresentationSermonState()
    .then(() => {
      emitLibraryUpdate();
    })
    .catch(() => {});
}

function subscribe(listener) {
  ensureSharedLibrarySubscription();
  sharedListeners.add(listener);

  return () => {
    sharedListeners.delete(listener);
  };
}

export default function useLibraryData() {
  return useSyncExternalStore(subscribe, () => currentLibraryData, () => currentLibraryData);
}
