import { useEffect, useState } from "react";

import { getSettings, saveSettings } from "../utils/settings";

export default function useAppSettings() {
  const [settings, setSettings] = useState(getSettings());

  useEffect(() => {
    const syncSettings = (event) => {
      if (event?.type === "app-settings-change" && event.detail) {
        setSettings(event.detail);
        return;
      }

      setSettings(getSettings());
    };

    window.addEventListener("storage", syncSettings);
    window.addEventListener("app-settings-change", syncSettings);

    return () => {
      window.removeEventListener("storage", syncSettings);
      window.removeEventListener("app-settings-change", syncSettings);
    };
  }, []);

  const updateSettings = (nextSettings) => {
    setSettings(nextSettings);
    saveSettings(nextSettings);
  };

  return [settings, updateSettings];
}
