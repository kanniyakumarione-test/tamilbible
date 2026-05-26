export function openReader(path, navigate, options) {
  if (typeof window === "undefined") {
    navigate(path, options);
    return;
  }

  const fullscreenTarget = document.documentElement;

  if (!document.fullscreenElement && fullscreenTarget?.requestFullscreen) {
    fullscreenTarget.requestFullscreen().catch(() => {});
  }

  navigate(path, options);
}
