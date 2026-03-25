import { useEffect, useState } from "react";

export default function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const userAgent = window.navigator.userAgent || "";
  const isIos = /iphone|ipad|ipod/i.test(userAgent);
  const isAndroid = /android/i.test(userAgent);

  useEffect(() => {
    const updateInstalledState = () => {
      const standaloneMedia = window.matchMedia?.("(display-mode: standalone)");
      const standaloneMode = standaloneMedia?.matches;
      const iosStandalone = window.navigator.standalone === true;
      setIsInstalled(Boolean(standaloneMode || iosStandalone));
    };

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      updateInstalledState();
    };

    updateInstalledState();

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const installInstructions = deferredPrompt
    ? "Tap Install Now to open the browser install prompt."
    : isIos
    ? "On iPhone or iPad, open the Share menu and choose Add to Home Screen."
    : isAndroid
    ? "If the install prompt does not appear, open the browser menu and choose Install App or Add to Home screen."
    : "If the install prompt does not appear, open the browser menu and choose Install App.";

  const promptInstall = async () => {
    if (!deferredPrompt) return false;

    await deferredPrompt.prompt();
    await deferredPrompt.userChoice.catch(() => null);
    setDeferredPrompt(null);
    return true;
  };

  return {
    canInstall: Boolean(deferredPrompt) && !isInstalled,
    isInstalled,
    installInstructions,
    promptInstall,
  };
}
