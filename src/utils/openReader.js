export function openReader(path, navigate) {
  if (typeof window === "undefined") {
    navigate(path);
    return;
  }

  navigate(path);
}
