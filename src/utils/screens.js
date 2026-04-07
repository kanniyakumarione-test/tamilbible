export function getScreenValue(screen, index) {
  return String(screen?.label ?? screen?.id ?? `screen-${index}`);
}

export function getScreenLabel(screen, index) {
  const width = screen?.availWidth ?? screen?.width ?? window.screen.availWidth ?? window.innerWidth;
  const height = screen?.availHeight ?? screen?.height ?? window.screen.availHeight ?? window.innerHeight;
  return `Screen ${index + 1} \u2192 ${width}x${height}`;
}

export async function getPresentationScreens() {
  if ("getScreenDetails" in window) {
    try {
      const details = await window.getScreenDetails();
      const detectedScreens = details.screens?.length ? details.screens : [details.currentScreen];

      if (detectedScreens?.length) {
        return detectedScreens.map((screen, index) => ({
          value: getScreenValue(screen, index),
          label: getScreenLabel(screen, index),
        }));
      }
    } catch {
      // Fall back to the current screen when screen placement is unavailable.
    }
  }

  return [
    {
      value: "current-screen",
      label: `Screen 1 \u2192 ${window.screen.availWidth}x${window.screen.availHeight}`,
    },
  ];
}
