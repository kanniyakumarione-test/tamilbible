export const defaultSettings = {
  fontSize: 24,
  lineHeight: 1.8,
  bgIndex: 0,
  bgType: "image",
  customBackground: null,
  cardOpacity: 0.5,
  textAlign: "center",
  language: "ta",
  readerWidth: 960,
  showReference: true,
  enableMainPresentation: false,
  enableStagePresentation: true,
  mainPresentationScreen: "screen1",
  stagePresentationScreen: "screen1",
  presentationPreset: "horizontal",
  presentationMaxFontSize: 80,
  presentationJustify: "center",
  presentationTransition: true,
  presentationOutline: false,
  presentationShadow: true,
  presentationUppercase: false,
  presentationBorder: false,
  presentationBox: false,
  presentationHeaderBox: true,
  presentationLineWrap: true,
  presentationHideStanzaNumber: false,
  presentationTwoLines: false,
  presentationKeepOnTop: true,
  presentationShowDateTime: false,
  presentationShowVerseLogo: false,
  presentationShowCustomLogo: false,
  stagePreset: "primary",
  stageWindowView: false,
  stageSmallWindow: false,
  stageGreenScreen: true,
  stageShowDateTime: false,
  stageMessage: "",
  stageMessageVisible: false,
  stageMotionBackground: "stars",
  stageStillBackground: 0,
  stageTextColor1: "#ffffff",
  stageTextColor2: "#f8fafc",
  stageOverlayColor: "#000000",
  stageLogoImage: null,
};

export const getSettings = () => {
  const stored = JSON.parse(localStorage.getItem("appSettings") || "null");
  return { ...defaultSettings, ...(stored || {}) };
};

export const saveSettings = (settings) => {
  localStorage.setItem("appSettings", JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent("app-settings-change", { detail: settings }));
};
