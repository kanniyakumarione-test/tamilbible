import { memo, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";

import { defaultSettings } from "../utils/settings";
import useAppSettings from "../hooks/useAppSettings";
import useInstallPrompt from "../hooks/useInstallPrompt";
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

function Section({ title, subtitle, children, className = "" }) {
  return (
    <section className={`rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,_rgba(15,23,42,0.9),_rgba(8,17,32,0.92))] p-4 shadow ${className}`}>
      <div className="mb-4">
        <h3 className="text-base font-semibold text-white md:text-lg">{title}</h3>
        <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function Segmented({ options, value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-black/20 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
            value === option.value
              ? "bg-gradient-to-br from-indigo-500 to-sky-500 text-white shadow-lg shadow-indigo-950/30"
              : "text-slate-300 hover:bg-white/5"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function StepperControl({
  label,
  valueLabel,
  min,
  max,
  step,
  value,
  onChange,
  presets = [],
}) {
  const updateValue = (direction) => {
    const nextValue = Math.min(
      max,
      Math.max(min, Number((value + step * direction).toFixed(2)))
    );

    onChange(nextValue);
  };

  return (
    <div className="rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-300">{label}</p>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
          {valueLabel}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => updateValue(-1)}
          className="h-11 w-11 rounded-2xl border border-white/10 bg-white/5 text-lg font-bold text-white transition hover:bg-white/10"
        >
          -
        </button>
        <div className="flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-center text-sm font-semibold text-white">
          {valueLabel}
        </div>
        <button
          type="button"
          onClick={() => updateValue(1)}
          className="h-11 w-11 rounded-2xl border border-white/10 bg-white/5 text-lg font-bold text-white transition hover:bg-white/10"
        >
          +
        </button>
      </div>

      {presets.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => onChange(preset.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                value === preset.value
                  ? "bg-gradient-to-br from-indigo-500 to-sky-500 text-white"
                  : "border border-white/10 bg-white/5 text-slate-300"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

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

function InfoPill({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
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

function areSettingsEqual(left, right) {
  if (left === right) {
    return true;
  }

  return Object.keys(defaultSettings).every((key) => left[key] === right[key]);
}

export default function Settings() {
  const [settings, update] = useAppSettings();
  const { canInstall, isInstalled, promptInstall } = useInstallPrompt();
  const [draft, setDraft] = useState(settings);
  const backgroundInputRef = useRef(null);
  const previewCardRef = useRef(null);
  const previewTextRef = useRef(null);
  const previewDraft = useDeferredValue(draft);
  const [previewFontSize, setPreviewFontSize] = useState(draft.fontSize);

  useEffect(() => {
    if (!areSettingsEqual(settings, draft)) {
      const syncFrame = window.requestAnimationFrame(() => {
        setDraft(settings);
      });

      return () => window.cancelAnimationFrame(syncFrame);
    }

    return undefined;
  }, [settings]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!areSettingsEqual(draft, settings)) {
        update(draft);
      }
    }, 280);

    return () => clearTimeout(timeout);
  }, [draft, settings, update]);

  const t = getUIText(draft.language);

  const previewBackground = useMemo(() => {
    if (previewDraft.bgType === "custom" && previewDraft.customBackground) {
      return `url(${previewDraft.customBackground})`;
    }

    return previewDraft.bgType === "gradient"
      ? gradients[previewDraft.bgIndex]
      : `url(${backgrounds[previewDraft.bgIndex]})`;
  }, [previewDraft.bgIndex, previewDraft.bgType, previewDraft.customBackground]);

  const updateDraft = (patch) => setDraft((current) => ({ ...current, ...patch }));

  const resetSettings = () => setDraft(defaultSettings);

  useEffect(() => {
    let mounted = true;
    let rafId = null;

    const fitPreviewText = () => {
      const container = previewCardRef.current;
      const textEl = previewTextRef.current;

      if (!container || !textEl) {
        return;
      }

      const max = Math.max(previewDraft.fontSize || 24, 18);
      const min = 18;
      let lo = min;
      let hi = max;
      let best = min;

      while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        textEl.style.fontSize = `${mid}px`;
        const fits =
          textEl.scrollHeight <= container.clientHeight &&
          textEl.scrollWidth <= container.clientWidth;

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

    rafId = window.requestAnimationFrame(fitPreviewText);

    return () => {
      mounted = false;
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [
    previewDraft.fontSize,
    previewDraft.lineHeight,
    previewDraft.textAlign,
    previewDraft.language,
    t.previewVerse,
  ]);

  const handleBackgroundUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const resized = await resizeImage(file);
    updateDraft({
      bgType: "custom",
      customBackground: resized,
    });

    event.target.value = "";
  };

  const activeBackgrounds = draft.bgType === "gradient" ? gradients : backgrounds;
  const [tab, setTab] = useState("reading");
  const [isMobile, setIsMobile] = useState(() => (typeof window !== "undefined" ? window.innerWidth < 768 : false));

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (isMobile && tab === "presentation") {
      setTab("reading");
    }
  }, [isMobile, tab]);
  return (
    <div className="app-shell px-4 pb-16 pt-4 md:px-6 md:pt-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">{t.readingSetup}</p>
            <h1 className="mt-2 text-2xl font-bold text-white">{t.settingsTitle}</h1>
            <p className="mt-1 text-sm text-slate-300 max-w-xl">{t.settingsIntro}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={resetSettings} className="rounded px-3 py-2 bg-slate-800 text-sm text-white">{t.resetSettings}</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="flex gap-3 mb-4">
              <button onClick={() => setTab("reading")} className={`px-4 py-2 rounded ${tab === "reading" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-200"}`}>Reading</button>
              <button onClick={() => setTab("visual")} className={`px-4 py-2 rounded ${tab === "visual" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-200"}`}>Visual</button>
              {!isMobile && (
                <button onClick={() => setTab("presentation")} className={`px-4 py-2 rounded ${tab === "presentation" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-200"}`}>
                  Presentation
                </button>
              )}
            </div>

            <div className="space-y-5">
              {tab === "reading" && (
                <div className="space-y-5">
                  <Section title="Reading Experience" subtitle="Adjust font, spacing, and layout.">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-4">
                        <StepperControl label={t.fontSize} value={draft.fontSize} valueLabel={`${draft.fontSize}px`} min={18} max={42} step={1} onChange={(fontSize) => updateDraft({ fontSize })} />
                        <StepperControl label={t.lineSpacing} value={draft.lineHeight} valueLabel={`${draft.lineHeight.toFixed(1)}x`} min={1.3} max={2.4} step={0.1} onChange={(lineHeight) => updateDraft({ lineHeight })} />
                        <StepperControl label={t.readerWidth} value={draft.readerWidth} valueLabel={`${draft.readerWidth}px`} min={640} max={1200} step={20} onChange={(readerWidth) => updateDraft({ readerWidth })} />
                      </div>

                      <div className="space-y-4">
                        <StepperControl label={t.cardOpacity} value={draft.cardOpacity} valueLabel={`${Math.round(draft.cardOpacity * 100)}%`} min={0.2} max={0.9} step={0.05} onChange={(cardOpacity) => updateDraft({ cardOpacity })} />
                        <div>
                          <p className="mb-2 text-sm text-slate-300">{t.textAlign}</p>
                          <Segmented value={draft.textAlign} onChange={(textAlign) => updateDraft({ textAlign })} options={[{ value: "left", label: t.left }, { value: "center", label: t.center }, { value: "justify", label: t.justify }]} />
                        </div>
                        <div>
                          <p className="mb-2 text-sm text-slate-300">{t.language}</p>
                          <Segmented value={draft.language} onChange={(language) => updateDraft({ language })} options={[{ value: "ta", label: t.tamil }, { value: "en", label: t.english }]} />
                        </div>
                      </div>
                    </div>
                  </Section>
                </div>
              )}

              {tab === "visual" && (
                <div className="space-y-5">
                  <Section title="Visual Setup" subtitle="Backgrounds, uploads and quick visual tweaks.">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="mb-2 text-sm text-slate-300">Background Type</p>
                        <Segmented value={draft.bgType === "gradient" ? "gradient" : "image"} onChange={(mode) => updateDraft({ bgType: mode, bgIndex: draft.bgIndex ?? 0 })} options={[{ value: "image", label: t.imageBackgrounds }, { value: "gradient", label: t.gradientBackgrounds }]} />

                        <div className="mt-4 space-y-3">
                          <div className="rounded p-3 bg-slate-800">
                            <p className="text-sm font-semibold text-white">{t.customBackground}</p>
                            <div className="mt-3 flex gap-2">
                              <button onClick={() => backgroundInputRef.current?.click()} className="px-3 py-2 rounded bg-indigo-600 text-white">{t.uploadImage}</button>
                              {draft.customBackground ? (<button onClick={() => updateDraft({ customBackground: null, bgType: "image", bgIndex: 0 })} className="px-3 py-2 rounded bg-slate-700 text-white">{t.removeImage}</button>) : null}
                            </div>
                            <input ref={backgroundInputRef} type="file" accept="image/*" onChange={handleBackgroundUpload} className="hidden" />
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="mb-2 text-sm text-slate-300">{draft.bgType === "gradient" ? t.gradientBackgroundsIntro : t.imageBackgroundsIntro}</p>
                        <div className="grid grid-cols-3 gap-3">
                          {activeBackgrounds.map((item, i) => {
                            const isGradientItem = typeof item === "string" && item.startsWith("linear-gradient");
                            return (
                              <BackgroundTile key={`${draft.bgType}-${i}`} active={draft.bgIndex === i} onClick={() => updateDraft({ bgType: isGradientItem ? "gradient" : "image", bgIndex: i })}>
                                {isGradientItem ? <div className="h-20 w-full" style={{ background: item }} /> : <img src={item} alt={`bg-${i}`} className="h-20 w-full object-cover" />}
                              </BackgroundTile>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </Section>
                </div>
              )}

              {tab === "presentation" && (
                <div className="space-y-5">
                  <Section title="Presentation" subtitle="Settings for live displays and stage screens.">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="block">
                          <p className="mb-2 text-sm text-slate-300">{t.presets}</p>
                          <select
                            value={draft.presentationPreset}
                            onChange={(e) => {
                              const val = e.target.value;
                              const presetMap = {
                                horizontal: {
                                  presentationJustify: "center",
                                  presentationMaxFontSize: 80,
                                  presentationShadow: true,
                                  presentationBox: true,
                                  presentationHeaderBox: true,
                                  presentationUppercase: false,
                                },
                                primary: {
                                  presentationJustify: "center",
                                  presentationMaxFontSize: 100,
                                  presentationShadow: true,
                                  presentationBox: false,
                                  presentationHeaderBox: true,
                                },
                                stretch: {
                                  presentationJustify: "justify",
                                  presentationMaxFontSize: 140,
                                  presentationShadow: false,
                                  presentationBox: false,
                                  presentationHeaderBox: false,
                                  presentationLineWrap: false,
                                },
                                center: {
                                  presentationJustify: "center",
                                  presentationMaxFontSize: 90,
                                  presentationShadow: true,
                                  presentationBox: true,
                                  presentationUppercase: true,
                                },
                                minimal: {
                                  presentationJustify: "center",
                                  presentationMaxFontSize: 60,
                                  presentationShadow: false,
                                  presentationBox: false,
                                  presentationHeaderBox: false,
                                  presentationOutline: true,
                                },
                              };

                              updateDraft({ presentationPreset: val, ...(presetMap[val] || {}) });
                            }}
                            className="w-full rounded px-3 py-2 bg-slate-800 text-white"
                          >
                            <option value="horizontal">{t.fullScreenHorizontal}</option>
                            <option value="primary">{t.fullScreenPrimary}</option>
                            <option value="stretch">Stretch (fill)</option>
                            <option value="center">Center Focus</option>
                            <option value="minimal">Minimal</option>
                          </select>
                        </label>
                      </div>
                      <div>
                        <label>
                          <p className="mb-2 text-sm text-slate-300">{t.maximumFontSize}</p>
                          <input type="number" min={30} max={180} value={settings.presentationMaxFontSize} onChange={(e) => updateDraft({ presentationMaxFontSize: Number(e.target.value) || 0 })} className="w-full rounded px-3 py-2 bg-slate-800 text-white" />
                        </label>
                      </div>
                    </div>
                  </Section>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="rounded p-4 bg-slate-900">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-slate-400">{t.livePreview}</p>
                  <p className="text-sm text-slate-300">{t.applyNow}</p>
                </div>
                <div className="text-xs text-slate-300 rounded bg-slate-800 px-3 py-1">{draft.language === "en" ? "EN" : "TA"}</div>
              </div>

              <div className="rounded p-4" style={{ background: previewBackground, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div
                  ref={previewCardRef}
                  className="rounded p-4"
                  style={{
                    maxWidth: `${previewDraft.readerWidth}px`,
                    background: `rgba(0,0,0,${previewDraft.cardOpacity})`,
                    minHeight: "20rem",
                  }}
                >
                  {previewDraft.showReference && <p className="text-sm font-bold text-white" style={{ textAlign: previewDraft.textAlign }}>{t.previewRef}</p>}
                  <p
                    ref={previewTextRef}
                    className="font-bold text-white"
                    style={{
                      fontSize: `${previewFontSize}px`,
                      lineHeight: previewDraft.lineHeight,
                      textAlign: previewDraft.textAlign,
                      overflowWrap: "break-word",
                    }}
                  >
                    {t.previewVerse}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
