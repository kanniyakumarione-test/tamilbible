import { memo, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import useAppSettings from "../hooks/useAppSettings";
import useLibraryData from "../hooks/useLibraryData";
import {
  removeSermonQueueItem,
  setActiveSermonItem,
  setSermonDisplayMode,
} from "../utils/libraryData";
import { getUIText } from "../utils/uiText";

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

function AccordionSection({ title, defaultOpen = true, children }) {
  return (
    <details
      open={defaultOpen}
      className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,_rgba(15,23,42,0.94),_rgba(8,17,32,0.96))]"
    >
      <summary className="cursor-pointer list-none bg-white/10 px-5 py-4 text-base font-semibold text-white">
        {title}
      </summary>
      <div className="p-5">{children}</div>
    </details>
  );
}

const SelectControl = memo(function SelectControl({ label, value, onChange, options }) {
  return (
    <label className="block">
      <p className="mb-2 text-sm text-slate-300">{label}</p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400/40"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
        </select>
      </label>
    );
  });

const CheckboxControl = memo(function CheckboxControl({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-3 text-sm text-slate-200">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-white/20 bg-black/20 accent-sky-400"
        />
        <span>{label}</span>
      </label>
    );
  });

const ColorChip = memo(function ColorChip({ label, value, onChange }) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent p-0"
        />
        <span>{label}</span>
      </label>
    );
  });

const BackgroundTile = memo(function BackgroundTile({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`overflow-hidden rounded-2xl border-2 transition ${
        active ? "border-sky-400 shadow-lg shadow-sky-950/25" : "border-white/10 hover:border-white/20"
      }`}
    >
      {children}
    </button>
  );
});

function getScreenValue(screen, index) {
  return String(screen?.label ?? screen?.id ?? `screen-${index}`);
}

function getScreenLabel(screen, index) {
  const width = screen?.availWidth ?? screen?.width ?? window.screen.availWidth ?? window.innerWidth;
  const height = screen?.availHeight ?? screen?.height ?? window.screen.availHeight ?? window.innerHeight;
  return `Screen ${index + 1} \u2192 ${width}x${height}`;
}

async function getPresentationScreens() {
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

async function openPresentationWindow(path, targetScreenValue, windowName) {
  const features = ["noopener=yes", "noreferrer=yes"];

  if ("getScreenDetails" in window) {
    try {
      const details = await window.getScreenDetails();
      const detectedScreens = details.screens?.length ? details.screens : [details.currentScreen];
      const targetScreen =
        detectedScreens.find(
          (screen, index) => getScreenValue(screen, index) === targetScreenValue
        ) || details.currentScreen;

      if (targetScreen) {
        features.push(`left=${targetScreen.availLeft ?? targetScreen.left ?? 0}`);
        features.push(`top=${targetScreen.availTop ?? targetScreen.top ?? 0}`);
        features.push(`width=${targetScreen.availWidth ?? targetScreen.width ?? 1280}`);
        features.push(`height=${targetScreen.availHeight ?? targetScreen.height ?? 720}`);
      }
    } catch {
      // Fall back to a normal popup when screen placement is not permitted.
    }
  }

  window.open(path, windowName, features.join(","));
}

async function resizeImage(file) {
  const fileUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = fileUrl;
    });

    const canvas = document.createElement("canvas");
    const maxSize = 1600;
    const ratio = Math.min(maxSize / image.width, maxSize / image.height, 1);

    canvas.width = Math.round(image.width * ratio);
    canvas.height = Math.round(image.height * ratio);

    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL("image/jpeg", 0.82);
  } finally {
    URL.revokeObjectURL(fileUrl);
  }
}

export default function AdvancedPresentation() {
  const [settings, update] = useAppSettings();
  const libraryData = useLibraryData();
  const previewTextRef = useRef(null);
  const previewContainerRef = useRef(null);
  const [previewFontSize, setPreviewFontSize] = useState(
    Math.min(settings.presentationMaxFontSize || 80, 42)
  );

  const stagePreviewTextRef = useRef(null);
  const stagePreviewContainerRef = useRef(null);
  const [stagePreviewFontSize, setStagePreviewFontSize] = useState(24);
  const [screenOptions, setScreenOptions] = useState([
    {
      value: "current-screen",
      label: `Screen 1 \u2192 ${window.screen.availWidth}x${window.screen.availHeight}`,
    },
  ]);
  const t = getUIText(settings.language);
  const logoInputRef = useRef(null);
  const queue = libraryData.sermon.queue || [];
  const activeItem = libraryData.sermon.activeItem || queue[0] || null;
  const nextItem =
    activeItem && queue.length
      ? queue[queue.findIndex((item) => item.id === activeItem.id) + 1] || null
      : queue[1] || null;
  const displayMode = libraryData.sermon.displayMode || "live";
  const remoteUrl = `${window.location.origin}/presentation-remote`;
  const remoteQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(remoteUrl)}`;

  useEffect(() => {
    let mounted = true;

    const loadScreens = async () => {
      const screens = await getPresentationScreens();

      if (!mounted) {
        return;
      }

      setScreenOptions(screens);

      const mainExists = screens.some((screen) => screen.value === settings.mainPresentationScreen);
      const stageExists = screens.some((screen) => screen.value === settings.stagePresentationScreen);

      if (!mainExists || !stageExists) {
        update({
          ...settings,
          mainPresentationScreen: mainExists
            ? settings.mainPresentationScreen
            : screens[0]?.value || "current-screen",
          stagePresentationScreen: stageExists
            ? settings.stagePresentationScreen
            : screens[0]?.value || "current-screen",
        });
      }
    };

    loadScreens();

    return () => {
      mounted = false;
    };
  }, []);

  const previewBackground =
    settings.bgType === "custom" && settings.customBackground
      ? `url(${settings.customBackground})`
      : settings.bgType === "gradient"
      ? gradients[settings.bgIndex]
      : `url(${backgrounds[settings.bgIndex]})`;

  const stageBackground = settings.stageGreenScreen
    ? "#00b140"
    : `url(${backgrounds[settings.stageStillBackground || 0]})`;

  const previewItem = activeItem || {
    bookTamil: t.previewRef,
    chapter: "",
    verse: "",
    text: t.previewVerse,
  };

  const previewReference = activeItem
    ? `${previewItem.bookTamil} ${previewItem.chapter}:${previewItem.verse}`
    : t.previewRef;

  const updateSettings = (patch) => update({ ...settings, ...patch });

  const handleLogoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const resized = await resizeImage(file);
    updateSettings({ stageLogoImage: resized, presentationShowCustomLogo: true });
    event.target.value = "";
  };

  useEffect(() => {
    let mounted = true;
    let rafId = null;

    const fitPreview = () => {
      const container = previewContainerRef.current;
      const textEl = previewTextRef.current;
      if (!container || !textEl) return;

      const max = Math.min(settings.presentationMaxFontSize || 80, 42);
      const min = 18;

      // binary search for best font size
      let lo = min;
      let hi = max;
      let best = min;

      while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        textEl.style.fontSize = `${mid}px`;
        const fits = textEl.scrollHeight <= container.clientHeight && textEl.scrollWidth <= container.clientWidth;

        if (fits) {
          best = mid;
          lo = mid + 1;
        } else {
          hi = mid - 1;
        }
      }

      textEl.style.fontSize = `${best}px`;
      if (mounted) {
        setPreviewFontSize(best);
      }
    };

    rafId = window.requestAnimationFrame(fitPreview);

    return () => {
      mounted = false;
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [previewItem.text, settings.presentationMaxFontSize, settings.presentationTwoLines, settings.presentationJustify]);

  useEffect(() => {
    let mounted = true;
    let rafId = null;

    const fitStagePreview = () => {
      const container = stagePreviewContainerRef.current;
      const textEl = stagePreviewTextRef.current;
      if (!container || !textEl) return;

      const max = Math.min((settings.presentationMaxFontSize || 80) * 0.5, 36);
      const min = 14;

      let lo = min;
      let hi = Math.floor(max);
      let best = min;

      while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        textEl.style.fontSize = `${mid}px`;
        const fits = textEl.scrollHeight <= container.clientHeight && textEl.scrollWidth <= container.clientWidth;

        if (fits) {
          best = mid;
          lo = mid + 1;
        } else {
          hi = mid - 1;
        }
      }

      textEl.style.fontSize = `${best}px`;
      if (mounted) setStagePreviewFontSize(best);
    };

    rafId = window.requestAnimationFrame(fitStagePreview);

    return () => {
      mounted = false;
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [previewItem.text, settings.presentationMaxFontSize, settings.presentationTwoLines, settings.presentationJustify]);

  return (
    <div className="hidden px-4 pb-24 pt-4 md:block md:px-6 md:pt-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.22),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.16),_transparent_24%),linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(8,17,32,0.98))] p-5 shadow-2xl shadow-black/30 md:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-slate-400">
            {t.screenSetup}
          </p>
          <h1 className="mt-3 text-3xl font-bold text-white md:text-5xl">
            {t.advancedPresentation}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
            {t.advancedPresentationIntro}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() =>
                openPresentationWindow(
                  "/presentation/main",
                  settings.mainPresentationScreen,
                  "tamil-bible-presentation-main"
                )
              }
              className="rounded-2xl bg-[linear-gradient(135deg,#2563eb,#38bdf8)] px-5 py-3 text-sm font-semibold text-white shadow-lg"
            >
              Open Main Display
            </button>
            <button
              type="button"
              onClick={() =>
                openPresentationWindow(
                  "/presentation/stage",
                  settings.stagePresentationScreen,
                  "tamil-bible-presentation-stage"
                )
              }
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white"
            >
              Open Stage Display
            </button>
            <Link
              to="/presentation-remote"
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white"
            >
              Open Phone Remote
            </Link>
            <Link
              to="/sermon-control"
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white"
            >
              Open Sermon Control
            </Link>
          </div>
        </section>

        <section className="rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,_rgba(15,23,42,0.9),_rgba(8,17,32,0.92))] p-5 shadow-xl shadow-black/20">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                Live Queue
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white">
                {activeItem
                  ? `${activeItem.bookTamil} ${activeItem.chapter}:${activeItem.verse}`
                  : "No active verse"}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                The display windows below update live from this sermon queue. Pick which verse should show right now, then open the main or stage screen in a separate window.
              </p>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
              {queue.length} queued
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {queue.length ? (
              queue.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  className={`rounded-[1.4rem] border p-4 ${
                    item.id === activeItem?.id
                      ? "border-sky-400/40 bg-sky-400/10"
                      : "border-white/10 bg-white/[0.03]"
                  }`}
                >
                  <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                      <p className="text-base font-semibold text-white">
                        {item.bookTamil} {item.chapter}:{item.verse}
                      </p>
                      <p className="mt-2 line-clamp-2 text-sm leading-7 text-slate-300">
                        {item.text}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveSermonItem(item)}
                        className="rounded-xl bg-[linear-gradient(135deg,#2563eb,#38bdf8)] px-4 py-2.5 text-sm font-semibold text-white"
                      >
                        Show Live
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSermonQueueItem(item.id)}
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-[1.4rem] border border-dashed border-white/10 px-4 py-5 text-sm text-slate-400">
                Add verses from the chapter screen using the `Sermon` button, then control them here.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,_rgba(15,23,42,0.9),_rgba(8,17,32,0.92))] p-5 shadow-xl shadow-black/20">
          <div className="grid gap-5 lg:grid-cols-[1fr,1fr,0.9fr]">
            <label className="block">
              <p className="mb-2 text-sm text-slate-300">Title Slide Title</p>
              <input
                type="text"
                value={settings.presentationTitle}
                onChange={(e) => updateSettings({ presentationTitle: e.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400/40"
              />
            </label>

            <label className="block">
              <p className="mb-2 text-sm text-slate-300">Title Slide Subtitle</p>
              <input
                type="text"
                value={settings.presentationSubtitle}
                onChange={(e) => updateSettings({ presentationSubtitle: e.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400/40"
              />
            </label>

            <div>
              <p className="mb-2 text-sm text-slate-300">Quick Display Modes</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSermonDisplayMode("live")}
                  className="rounded-xl bg-[linear-gradient(135deg,#2563eb,#38bdf8)] px-4 py-2.5 text-sm font-semibold text-white"
                >
                  Live
                </button>
                <button
                  type="button"
                  onClick={() => setSermonDisplayMode("title")}
                  className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Title
                </button>
                <button
                  type="button"
                  onClick={() => setSermonDisplayMode("logo")}
                  className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Logo
                </button>
                <button
                  type="button"
                  onClick={() => setSermonDisplayMode("announcement")}
                  className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Announcement
                </button>
                <button
                  type="button"
                  onClick={() => setSermonDisplayMode("black")}
                  className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Black
                </button>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr,1fr,0.9fr]">
            <label className="block">
              <p className="mb-2 text-sm text-slate-300">Announcement Title</p>
              <input
                type="text"
                value={settings.presentationAnnouncementTitle}
                onChange={(e) => updateSettings({ presentationAnnouncementTitle: e.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400/40"
              />
            </label>

            <label className="block">
              <p className="mb-2 text-sm text-slate-300">Announcement Body</p>
              <textarea
                value={settings.presentationAnnouncementBody}
                onChange={(e) => updateSettings({ presentationAnnouncementBody: e.target.value })}
                rows={3}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400/40"
              />
            </label>

            <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4 text-center">
              <p className="text-sm font-semibold text-white">Phone Remote QR</p>
              <img
                src={remoteQrUrl}
                alt="Phone remote QR code"
                className="mx-auto mt-4 h-40 w-40 rounded-2xl bg-white p-2"
              />
              <p className="mt-3 break-all text-xs leading-6 text-slate-400">{remoteUrl}</p>
            </div>
          </div>
        </section>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,_rgba(15,23,42,0.92),_rgba(8,17,32,0.94))] p-4">
            <div className="mb-4">
              <CheckboxControl
                label={t.enableMainPresentation}
                checked={settings.enableMainPresentation}
                onChange={(value) => updateSettings({ enableMainPresentation: value })}
              />
            </div>
            <SelectControl
              label={t.mainPresentationScreen}
              value={settings.mainPresentationScreen}
              onChange={(value) => updateSettings({ mainPresentationScreen: value })}
              options={screenOptions}
            />
          </div>

          <div className="rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,_rgba(15,23,42,0.92),_rgba(8,17,32,0.94))] p-4">
            <div className="mb-4">
              <CheckboxControl
                label={t.enableStagePresentation}
                checked={settings.enableStagePresentation}
                onChange={(value) => updateSettings({ enableStagePresentation: value })}
              />
            </div>
            <SelectControl
              label={t.stageviewScreen}
              value={settings.stagePresentationScreen}
              onChange={(value) => updateSettings({ stagePresentationScreen: value })}
              options={screenOptions}
            />
          </div>
        </div>

        <AccordionSection title={t.mainPresentationScreenSetup}>
          <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-5">
              <SelectControl
                label={t.presets}
                value={settings.presentationPreset}
                onChange={(value) => updateSettings({ presentationPreset: value })}
                options={[
                  { value: "horizontal", label: t.fullScreenHorizontal },
                  { value: "primary", label: t.fullScreenPrimary },
                ]}
              />

              <label className="block">
                <p className="mb-2 text-sm text-slate-300">{t.maximumFontSize}</p>
                <input
                  type="number"
                  min={30}
                  max={180}
                  value={settings.presentationMaxFontSize}
                  onChange={(e) =>
                    updateSettings({
                      presentationMaxFontSize: Number(e.target.value) || 0,
                    })
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400/40"
                />
              </label>

              <SelectControl
                label={t.textAlign}
                value={settings.presentationJustify}
                onChange={(value) => updateSettings({ presentationJustify: value })}
                options={[
                  { value: "left", label: t.left },
                  { value: "center", label: t.center },
                  { value: "right", label: "Right" },
                ]}
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <CheckboxControl label={t.showLyricsInTwoLines} checked={settings.presentationTwoLines} onChange={(value) => updateSettings({ presentationTwoLines: value })} />
              <CheckboxControl label={t.enableShadow} checked={settings.presentationShadow} onChange={(value) => updateSettings({ presentationShadow: value })} />
              <CheckboxControl label={t.enableUppercase} checked={settings.presentationUppercase} onChange={(value) => updateSettings({ presentationUppercase: value })} />
              <CheckboxControl label={t.enableBorder} checked={settings.presentationBorder} onChange={(value) => updateSettings({ presentationBorder: value })} />
              <CheckboxControl label={t.enableBox} checked={settings.presentationBox} onChange={(value) => updateSettings({ presentationBox: value })} />
              <CheckboxControl label={t.showCustomLogo} checked={settings.presentationShowCustomLogo} onChange={(value) => updateSettings({ presentationShowCustomLogo: value })} />
            </div>
          </div>
        </AccordionSection>

        <AccordionSection title={t.stageviewScreenSetup}>
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <SelectControl
                label={t.presets}
                value={settings.stagePreset}
                onChange={(value) => updateSettings({ stagePreset: value })}
                options={[
                  { value: "primary", label: t.fullScreenPrimary },
                  { value: "horizontal", label: t.fullScreenHorizontal },
                ]}
              />

              <div>
                <p className="mb-2 text-sm text-slate-300">{t.stageScreenStyle}</p>
                <div className="grid gap-3 md:grid-cols-3">
                  <CheckboxControl label={t.greenScreen} checked={settings.stageGreenScreen} onChange={(value) => updateSettings({ stageGreenScreen: value })} />
                </div>
              </div>
            </div>

            <label className="block">
              <p className="mb-2 text-sm text-slate-300">{t.message}</p>
              <textarea
                value={settings.stageMessage}
                onChange={(e) => updateSettings({ stageMessage: e.target.value })}
                rows={3}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400/40"
              />
            </label>

            <div className="flex flex-wrap gap-3">
              <button onClick={() => updateSettings({ stageMessageVisible: true })} className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15">{t.showMessage}</button>
              <button onClick={() => updateSettings({ stageMessage: "", stageMessageVisible: false })} className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15">{t.clearMessage}</button>
            </div>

            <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
              <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Main Preview</p>
                  <div
                    className="flex h-52 items-center justify-center rounded-[1.5rem] border border-white/10 bg-black p-4 shadow-inner shadow-black/40"
                    style={{ backgroundImage: previewBackground, backgroundSize: "cover", backgroundPosition: "center" }}
                  >
                    <div
                      className="w-full rounded-2xl px-5 py-4 text-center backdrop-blur-sm"
                      style={{
                        background: settings.presentationBox ? "rgba(0,0,0,0.45)" : "transparent",
                        boxShadow: settings.presentationBorder ? "0 0 0 1px rgba(255,255,255,0.2) inset" : "none",
                        maxWidth: settings.presentationPreset === "horizontal" ? "100%" : "26rem",
                      }}
                    >
                      {settings.showReference && (
                        <p className="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-white/90">
                          {previewReference}
                        </p>
                      )}
                      <div ref={previewContainerRef} style={{ width: "100%", height: "100%" }}>
                        <p
                          ref={previewTextRef}
                          className="font-bold text-white"
                          style={{
                            fontSize: `${previewFontSize}px`,
                            lineHeight: settings.presentationTwoLines ? 1.14 : 1.28,
                            textAlign: settings.presentationJustify,
                            textTransform: settings.presentationUppercase ? "uppercase" : "none",
                            textShadow: settings.presentationShadow ? "0 2px 10px rgba(0,0,0,0.75)" : "none",
                            whiteSpace: "pre-line",
                            margin: 0,
                          }}
                        >
                          {previewItem.text}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{t.backgroundImage}</p>
                  <div className="h-44 rounded-[1.5rem] border border-white/10 bg-black" style={{ backgroundImage: previewBackground, backgroundSize: "cover", backgroundPosition: "center" }} />
                </div>

                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{t.logoImage}</p>
                  <div className="flex h-44 items-center justify-center rounded-[1.5rem] border border-white/10 bg-black/70 p-4">
                    {settings.stageLogoImage ? (
                      <img src={settings.stageLogoImage} alt="Stage logo" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="text-sm text-slate-500">{t.uploadLogo}</span>
                    )}
                  </div>
                  <div className="mt-3 flex gap-3">
                    <button onClick={() => logoInputRef.current?.click()} className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15">{t.uploadLogo}</button>
                    {settings.stageLogoImage ? (
                      <button onClick={() => updateSettings({ stageLogoImage: null, presentationShowCustomLogo: false })} className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15">{t.removeLogo}</button>
                    ) : null}
                  </div>
                  <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Stage Preview</p>
                  <div
                    className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-black"
                    style={{ background: stageBackground, backgroundSize: "cover", backgroundPosition: "center" }}
                  >
                    <div
                      className="grid min-h-72 gap-4 p-4"
                      style={{
                        background: settings.stageGreenScreen
                          ? "transparent"
                          : `linear-gradient(180deg, ${settings.stageOverlayColor || "#000000"}55, ${settings.stageOverlayColor || "#000000"}cc)`,
                        gridTemplateColumns: settings.stagePreset === "horizontal" ? "1.2fr 0.8fr" : "1fr",
                      }}
                    >
                      <div className="rounded-[1.25rem] border border-white/10 bg-black/25 p-4 backdrop-blur-sm">
                        {displayMode === "title" ? (
                          <>
                            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">Title</p>
                            <p className="mt-3 text-2xl font-bold text-white">{settings.presentationTitle}</p>
                            <p className="mt-3 text-sm leading-6 text-slate-200">{settings.presentationSubtitle}</p>
                          </>
                        ) : displayMode === "announcement" ? (
                          <>
                            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">Announcement</p>
                            <p className="mt-3 text-2xl font-bold text-white">{settings.presentationAnnouncementTitle}</p>
                            <p className="mt-3 text-sm leading-6 text-slate-200">{settings.presentationAnnouncementBody}</p>
                          </>
                        ) : displayMode === "logo" ? (
                          <div className="flex h-full min-h-40 items-center justify-center">
                            {settings.presentationShowCustomLogo && settings.stageLogoImage ? (
                              <img src={settings.stageLogoImage} alt="Stage logo preview" className="max-h-32 max-w-full object-contain" />
                            ) : (
                              <div className="text-center">
                                <p className="text-2xl font-bold text-white">{settings.presentationTitle}</p>
                                <p className="mt-2 text-sm text-slate-200">{settings.presentationSubtitle}</p>
                              </div>
                            )}
                          </div>
                        ) : displayMode === "black" ? (
                          <div className="flex h-full min-h-40 items-center justify-center bg-black">
                            <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Black Screen</p>
                          </div>
                        ) : (
                          <>
                            <p
                              className="text-xs font-semibold uppercase tracking-[0.28em]"
                              style={{ color: settings.stageTextColor2 || "#f8fafc" }}
                            >
                              Live Verse
                            </p>
                            <p
                              className="mt-3 text-sm font-bold"
                              style={{ color: settings.stageTextColor2 || "#f8fafc" }}
                            >
                              {previewReference}
                            </p>
                            <div ref={stagePreviewContainerRef} style={{ width: "100%", height: "100%" }}>
                              <p
                                ref={stagePreviewTextRef}
                                className="mt-4 font-bold"
                                style={{
                                  fontSize: `${stagePreviewFontSize}px`,
                                  lineHeight: settings.presentationTwoLines ? 1.15 : 1.28,
                                  textAlign: settings.presentationJustify || "center",
                                  textTransform: settings.presentationUppercase ? "uppercase" : "none",
                                  textShadow: settings.presentationShadow ? "0 4px 16px rgba(0,0,0,0.55)" : "none",
                                  color: settings.stageTextColor1 || "#ffffff",
                                  margin: 0,
                                }}
                              >
                                {previewItem.text}
                              </p>
                            </div>
                          </>
                        )}
                      </div>

                      {settings.stagePreset === "horizontal" ? (
                        <div className="space-y-4">
                          {settings.stageMessageVisible && settings.stageMessage ? (
                            <div className="rounded-[1.25rem] border border-white/10 bg-black/25 p-4 backdrop-blur-sm">
                              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">Message</p>
                              <p className="mt-3 text-sm leading-6 text-white">{settings.stageMessage}</p>
                            </div>
                          ) : null}

                          <div className="rounded-[1.25rem] border border-white/10 bg-black/25 p-4 backdrop-blur-sm">
                            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">Next Verse</p>
                            {nextItem ? (
                              <>
                                <p className="mt-3 text-sm font-bold text-white">
                                  {nextItem.bookTamil} {nextItem.chapter}:{nextItem.verse}
                                </p>
                                <p className="mt-2 text-sm leading-6 text-slate-200">{nextItem.text}</p>
                              </>
                            ) : (
                              <p className="mt-3 text-sm text-slate-300">No next verse queued yet.</p>
                            )}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                  <div>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{t.stillBackground}</p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {backgrounds.map((bg, index) => (
                        <BackgroundTile key={`stage-bg-${bg}`} active={settings.stageStillBackground === index} onClick={() => updateSettings({ stageStillBackground: index })}>
                          <img src={bg} alt={`Still background ${index + 1}`} className="h-24 w-full object-cover" />
                        </BackgroundTile>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{t.textColor}</p>
                      <div className="flex flex-wrap gap-3">
                        <ColorChip label={t.textOne} value={settings.stageTextColor1} onChange={(stageTextColor1) => updateSettings({ stageTextColor1 })} />
                        <ColorChip label={t.textTwo} value={settings.stageTextColor2} onChange={(stageTextColor2) => updateSettings({ stageTextColor2 })} />
                      </div>
                    </div>

                    <div>
                      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{t.overlayColor}</p>
                      <ColorChip label={t.overlay} value={settings.stageOverlayColor} onChange={(stageOverlayColor) => updateSettings({ stageOverlayColor })} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AccordionSection>
      </div>
    </div>
  );
}
