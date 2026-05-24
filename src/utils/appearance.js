export const FONT_FAMILY_OPTIONS = [
  { value: "system-sans", label: "System Sans", css: '"Segoe UI", Inter, Arial, sans-serif' },
  { value: "inter", label: "Inter", css: '"Inter", "Segoe UI", sans-serif' },
  { value: "montserrat", label: "Montserrat", css: '"Montserrat", sans-serif' },
  { value: "poppins", label: "Poppins", css: '"Poppins", sans-serif' },
  { value: "raleway", label: "Raleway", css: '"Raleway", sans-serif' },
  { value: "quicksand", label: "Quicksand", css: '"Quicksand", sans-serif' },
  { value: "josefin", label: "Josefin Sans", css: '"Josefin Sans", sans-serif' },
  { value: "outfit", label: "Outfit", css: '"Outfit", "Segoe UI", sans-serif' },
  { value: "oswald", label: "Oswald", css: '"Oswald", sans-serif' },
  { value: "anton", label: "Anton", css: '"Anton", sans-serif' },
  { value: "bebas", label: "Bebas Neue", css: '"Bebas Neue", sans-serif' },
  { value: "classic-serif", label: "Classic Serif", css: '"Georgia", "Times New Roman", serif' },
  { value: "playfair", label: "Playfair Display", css: '"Playfair Display", serif' },
  { value: "lora", label: "Lora", css: '"Lora", serif' },
  { value: "cinzel", label: "Cinzel", css: '"Cinzel", serif' },
  { value: "modern-serif", label: "Modern Serif", css: '"Merriweather", "Georgia", serif' },
  { value: "dancing-script", label: "Dancing Script", css: '"Dancing Script", cursive' },
  { value: "pacifico", label: "Pacifico", css: '"Pacifico", cursive' },
  { value: "clean-ui", label: "Clean UI", css: '"Trebuchet MS", "Segoe UI", sans-serif' },
  { value: "roboto", label: "Roboto", css: '"Roboto", "Segoe UI", sans-serif' },
];

export const TAMIL_FONT_OPTIONS = [
  { value: "noto-sans-tamil", label: "Noto Sans Tamil", css: '"Noto Sans Tamil", sans-serif' },
  { value: "anek-tamil", label: "Anek Tamil", css: '"Anek Tamil", sans-serif' },
  { value: "catamaran", label: "Catamaran", css: '"Catamaran", sans-serif' },
  { value: "mukta-malar", label: "Mukta Malar", css: '"Mukta Malar", "Noto Sans Tamil", sans-serif' },
  { value: "hind-madurai", label: "Hind Madurai", css: '"Hind Madurai", "Noto Sans Tamil", sans-serif' },
  { value: "baloo-thambi", label: "Baloo Thambi 2", css: '"Baloo Thambi 2", sans-serif' },
  { value: "meera-inimai", label: "Meera Inimai", css: '"Meera Inimai", sans-serif' },
  { value: "pavanam", label: "Pavanam", css: '"Pavanam", sans-serif' },
  { value: "latha", label: "Latha", css: '"Latha", "Noto Sans Tamil", sans-serif' },
  { value: "noto-serif-tamil", label: "Noto Serif Tamil", css: '"Noto Serif Tamil", serif' },
  { value: "tiro-tamil", label: "Tiro Tamil", css: '"Tiro Tamil", serif' },
  { value: "arima-madurai", label: "Arima Madurai", css: '"Arima Madurai", "Noto Serif Tamil", serif' },
  { value: "vijaya", label: "Vijaya", css: '"Vijaya", "Noto Serif Tamil", serif' },
  { value: "kavivanar", label: "Kavivanar", css: '"Kavivanar", cursive' },
  { value: "coiny", label: "Coiny", css: '"Coiny", cursive' },
];


export const THEME_PRESETS = [
  {
    value: "dark",
    label: "Dark",
    bodyBackground: "#000000",
    shellBackground: "#000000",
    surface: "rgba(0, 0, 0, 0.78)",
    surfaceStrong: "rgba(0, 0, 0, 0.94)",
    border: "rgba(255, 255, 255, 0.1)",
    text: "#fafafa",
    muted: "#a8a29e",
    selection: "rgba(255, 255, 255, 0.28)",
    readerCard: "rgba(0, 0, 0, 0.5)",
    noteCard: "rgba(0, 0, 0, 0.8)",
    presentationOverlay: "rgba(0, 0, 0, 0.8)",
    colorScheme: "dark",
  },
  {
    value: "sepia",
    label: "Sepia",
    bodyBackground:
      "radial-gradient(circle at top left, rgba(180, 125, 72, 0.16), transparent 28%), radial-gradient(circle at top right, rgba(120, 90, 50, 0.14), transparent 30%), linear-gradient(180deg, #2d2218 0%, #1d150f 100%)",
    shellBackground:
      "radial-gradient(circle at top left, rgba(194, 120, 61, 0.08), transparent 24%), radial-gradient(circle at top right, rgba(146, 64, 14, 0.12), transparent 30%)",
    surface: "rgba(58, 43, 30, 0.78)",
    surfaceStrong: "rgba(58, 43, 30, 0.94)",
    border: "rgba(224, 197, 162, 0.18)",
    text: "#f4eadb",
    muted: "#c0a98d",
    selection: "rgba(217, 119, 6, 0.26)",
    readerCard: "rgba(37, 27, 19, 0.58)",
    noteCard: "rgba(47, 33, 22, 0.28)",
    presentationOverlay: "rgba(24,18,13,0.68)",
    colorScheme: "dark",
  },
  {
    value: "paper",
    label: "Paper",
    bodyBackground:
      "radial-gradient(circle at top left, rgba(180, 167, 128, 0.12), transparent 24%), linear-gradient(180deg, #f5efe2 0%, #eee3cf 100%)",
    shellBackground:
      "radial-gradient(circle at top left, rgba(180, 167, 128, 0.08), transparent 24%), radial-gradient(circle at top right, rgba(214, 188, 138, 0.12), transparent 30%)",
    surface: "rgba(255, 251, 243, 0.82)",
    surfaceStrong: "rgba(255, 251, 243, 0.96)",
    border: "rgba(120, 90, 60, 0.16)",
    text: "#2b2116",
    muted: "#7a6551",
    selection: "rgba(180, 83, 9, 0.22)",
    readerCard: "rgba(255, 250, 241, 0.84)",
    noteCard: "rgba(244, 235, 218, 0.7)",
    presentationOverlay: "rgba(61,47,31,0.28)",
    colorScheme: "light",
  },
];

export const GRADIENT_BACKGROUND_PACKS = {
  classic: [
    "linear-gradient(135deg, #0a0a0a 0%, #000000 45%, #000000 100%)",
    "linear-gradient(135deg, #000000 0%, #ffffff 45%, #ffffff 100%)",
    "linear-gradient(135deg, #0a0a0a 0%, #0a0a0a 45%, #0a0a0a 100%)",
    "linear-gradient(135deg, #1f2937 0%, #ffffff 45%, #ffffff 100%)",
    "linear-gradient(135deg, #3f1d2e 0%, #9a3412 45%, #ffffff 100%)",
  ],
  sepia: [
    "linear-gradient(135deg, #3d2b1f 0%, #2b1f17 45%, #1c140f 100%)",
    "linear-gradient(135deg, #594128 0%, #7c4a1a 45%, #c0843d 100%)",
    "linear-gradient(135deg, #5f4b3a 0%, #6b5b47 45%, #b08968 100%)",
    "linear-gradient(135deg, #3f2f24 0%, #6f4e37 45%, #d4a373 100%)",
    "linear-gradient(135deg, #4c3526 0%, #7f5539 45%, #ddb892 100%)",
  ],
  aurora: [
    "linear-gradient(135deg, #000000 0%, #14532d 45%, #22d3ee 100%)",
    "linear-gradient(135deg, #111827 0%, #0a0a0a 45%, #06b6d4 100%)",
    "linear-gradient(135deg, #172554 0%, #4338ca 45%, #60a5fa 100%)",
    "linear-gradient(135deg, #000000 0%, #0a0a0a 45%, #ffffff 100%)",
    "linear-gradient(135deg, #1f2937 0%, #ffffff 45%, #ffffff 100%)",
  ],
};

export function getFontCss(value, options) {
  return options.find((option) => option.value === value)?.css || options[0].css;
}

export function getThemePreset(value = "dark") {
  return THEME_PRESETS.find((theme) => theme.value === value) || THEME_PRESETS[0];
}

export function getGradientPack(value = "classic") {
  return GRADIENT_BACKGROUND_PACKS[value] || GRADIENT_BACKGROUND_PACKS.classic;
}

export function getCustomGradientString(type, color1, color2) {
  const t = type || "linear-gradient";
  const c1 = color1 || "#000000";
  const c2 = color2 || "#1a1a1a";
  if (t === "solid") return c1;
  if (t === "radial-gradient") return `radial-gradient(circle, ${c1} 0%, ${c2} 100%)`;
  if (t === "conic-gradient") return `conic-gradient(from 0deg at 50% 50%, ${c1} 0%, ${c2} 100%)`;
  return `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`;
}

export function getResolvedBackground(settings, gradientsArray, backgroundsArray) {
  if (settings.bgType === "custom") return settings.customBackground;
  if (settings.bgType === "gradient") return getCustomGradientString(settings.customGradientType, settings.customGradientColor1, settings.customGradientColor2);
  if (settings.bgType === "motion") return undefined;
  return backgroundsArray?.[settings.bgIndex] || "";
}

export function getReaderFontFamily(settings, language = settings?.language || "ta") {
  const isTamilLike = language !== "en";
  return isTamilLike
    ? getFontCss(settings?.tamilFontFamily || "noto-sans-tamil", TAMIL_FONT_OPTIONS)
    : getFontCss(settings?.fontFamily || "system-sans", FONT_FAMILY_OPTIONS);
}

export function getPresentationFontFamily(settings) {
  return getFontCss(settings?.presentationFontFamily || settings?.fontFamily || "system-sans", FONT_FAMILY_OPTIONS);
}
