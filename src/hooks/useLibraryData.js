import { useEffect, useState } from "react";

import {
  getLibraryData,
  getLibraryEventName,
} from "../utils/libraryData";

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

    return () => {
      window.removeEventListener("storage", syncLibrary);
      window.removeEventListener(getLibraryEventName(), syncLibrary);
    };
  }, []);

  return libraryData;
}
