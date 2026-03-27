export function openReader(path, navigate) {
  if (typeof window === "undefined") {
    navigate(path);
    return;
  }

  const fullscreenTarget = document.documentElement;

  if (!document.fullscreenElement && fullscreenTarget?.requestFullscreen) {
    fullscreenTarget.requestFullscreen().catch(() => {});
  }

  navigate(path);
}
