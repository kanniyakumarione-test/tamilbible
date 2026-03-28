import useAppSettings from "../hooks/useAppSettings";
import useLibraryData from "../hooks/useLibraryData";
import { getUIText } from "../utils/uiText";
import MotionBackground from "../components/MotionBackground";

const backgrounds = [
  "/bg/bg1.jpg",
  "/bg/bg2.jpg",
  "/bg/bg3.jpg",
  "/bg/bg4.jpg",
  "/bg/bg5.jpg",
];

const gradients = [
  "linear-gradient(to right, #000000, #434343)",
  "linear-gradient(to right, #1e3c72, #2a5298)",
  "linear-gradient(to right, #42275a, #734b6d)",
  "linear-gradient(to right, #0f2027, #203a43, #2c5364)",
  "linear-gradient(to right, #000428, #004e92)",
];

export default function SermonMode() {
  const [settings] = useAppSettings();
  const libraryData = useLibraryData();
  const t = getUIText(settings.language);
  const activeItem = libraryData.sermon.activeItem;

  const background =
    settings.bgType === "motion"
      ? "#07111f"
      : settings.bgType === "custom" && settings.customBackground
      ? `url(${settings.customBackground})`
      : settings.bgType === "gradient"
      ? gradients[settings.bgIndex]
      : `url(${backgrounds[settings.bgIndex]})`;

  return (
    <div
      className="relative flex min-h-screen items-center justify-center px-6 py-10 text-white"
      style={{
        background,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {settings.bgType === "motion" ? <MotionBackground variant={settings.motionBackground} /> : null}
      <div className="absolute inset-0 bg-slate-950/55" />
      <div
        className="relative z-10 w-full max-w-6xl rounded-[2rem] border border-white/15 px-8 py-10 shadow-2xl"
        style={{
          background: `rgba(0, 0, 0, ${Math.min((settings.cardOpacity ?? 0.5) + 0.15, 0.88)})`,
        }}
      >
        {activeItem ? (
          <>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-300">
              Sermon Mode
            </p>
            <p className="mt-4 text-2xl font-bold text-white md:text-3xl">
              {activeItem.bookTamil} {activeItem.chapter}:{activeItem.verse}
            </p>
            <p
              className="mt-8 font-bold text-white"
              style={{
                fontSize: `${Math.max(settings.presentationMaxFontSize || 72, 56)}px`,
                lineHeight: 1.35,
                textAlign: settings.presentationJustify || "center",
                textShadow: settings.presentationShadow
                  ? "0 4px 18px rgba(0,0,0,0.45)"
                  : "none",
              }}
            >
              {activeItem.text}
            </p>
          </>
        ) : (
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-300">
              Sermon Mode
            </p>
            <h1 className="mt-4 text-3xl font-bold text-white md:text-5xl">
              Queue a verse from the reader
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-300">
              Add a verse to sermon mode from the chapter page, then open this screen on your projector or second display.
            </p>
            <p className="mt-6 text-sm text-slate-400">{t.noItemsYet}</p>
          </div>
        )}
      </div>
    </div>
  );
}
