import { useEffect, useState } from "react";

import {
  getLibraryData,
  getLibraryEventName,
} from "../utils/libraryData";
import {
  fetchPresentationSermonState,
  getPresentationSermonSyncEventName,
  startPresentationSyncStream,
} from "../utils/presentationBackend";

export default function useLibraryData() {
  const [libraryData, setLibraryData] = useState(getLibraryData());

  useEffect(() => {
    const syncLibrary = (event) => {
      if (event?.type === getLibraryEventName() && event.detail) {
        setLibraryData(event.detail);
        return;
      }

      setLibraryData(getLibraryData());
    };

    window.addEventListener("storage", syncLibrary);
    window.addEventListener(getLibraryEventName(), syncLibrary);
    window.addEventListener(getPresentationSermonSyncEventName(), syncLibrary);

    startPresentationSyncStream();
    void fetchPresentationSermonState().then(() => {
      setLibraryData(getLibraryData());
    });

    return () => {
      window.removeEventListener("storage", syncLibrary);
      window.removeEventListener(getLibraryEventName(), syncLibrary);
      window.removeEventListener(getPresentationSermonSyncEventName(), syncLibrary);
    };
  }, []);

  return libraryData;
}
