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
    <section className={`rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,_rgba(15,23,42,0.9),_rgba(8,17,32,0.92))] p-4 shadow-xl shadow-black/20 ${className}`}>
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
  const previewDraft = useDeferredValue(draft);

  useEffect(() => {
    if (!areSettingsEqual(settings, draft)) {
      const syncFrame = window.requestAnimationFrame(() => {
        setDraft(settings);
      });

      return () => window.cancelAnimationFrame(syncFrame);
    }
    return undefined;
  }, [draft, settings]);

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

  return (
    <div className="app-shell px-4 pb-24 pt-4 md:px-6 md:pt-6">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-5">
            <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.26),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.16),_transparent_24%),linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(8,17,32,0.98))] p-5 shadow-2xl shadow-black/30 md:p-7">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.34em] text-slate-400">
                    {t.readingSetup}
                  </p>
                  <h1 className="mt-3 text-3xl font-bold text-white md:text-5xl">
                    {t.settingsTitle}
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
                    {t.settingsIntro}
                  </p>
                </div>

                <button
                  onClick={resetSettings}
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-slate-100 transition hover:bg-white/10"
                >
                  {t.resetSettings}
                </button>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <InfoPill label={t.fontSize} value={`${draft.fontSize}px`} />
                <InfoPill
                  label={t.cardOpacity}
                  value={`${Math.round(draft.cardOpacity * 100)}%`}
                />
                <InfoPill
                  label={t.language}
                  value={draft.language === "en" ? t.english : t.tamil}
                />
              </div>
            </section>

            <Section title="Reading Experience" subtitle="Keep the primary controls together so the page is easier to scan and adjust.">
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-5">
                  <StepperControl
                    label={t.fontSize}
                    value={draft.fontSize}
                    valueLabel={`${draft.fontSize}px`}
                    min={18}
                    max={42}
                    step={1}
                    onChange={(fontSize) => updateDraft({ fontSize })}
                    presets={[
                      { value: 20, label: "20" },
                      { value: 24, label: "24" },
                      { value: 28, label: "28" },
                      { value: 32, label: "32" },
                    ]}
                  />

                  <StepperControl
                    label={t.lineSpacing}
                    value={draft.lineHeight}
                    valueLabel={`${draft.lineHeight.toFixed(1)}x`}
                    min={1.3}
                    max={2.4}
                    step={0.1}
                    onChange={(lineHeight) => updateDraft({ lineHeight })}
                    presets={[
                      { value: 1.4, label: "1.4x" },
                      { value: 1.6, label: "1.6x" },
                      { value: 1.8, label: "1.8x" },
                      { value: 2.0, label: "2.0x" },
                    ]}
                  />

                  <StepperControl
                    label={t.readerWidth}
                    value={draft.readerWidth}
                    valueLabel={`${draft.readerWidth}px`}
                    min={640}
                    max={1200}
                    step={20}
                    onChange={(readerWidth) => updateDraft({ readerWidth })}
                    presets={[
                      { value: 720, label: "720" },
                      { value: 860, label: "860" },
                      { value: 960, label: "960" },
                      { value: 1100, label: "1100" },
                    ]}
                  />
                </div>

                <div className="space-y-5">
                  <StepperControl
                    label={t.cardOpacity}
                    value={draft.cardOpacity}
                    valueLabel={`${Math.round(draft.cardOpacity * 100)}%`}
                    min={0.2}
                    max={0.9}
                    step={0.05}
                    onChange={(cardOpacity) => updateDraft({ cardOpacity })}
                    presets={[
                      { value: 0.3, label: "30%" },
                      { value: 0.5, label: "50%" },
                      { value: 0.7, label: "70%" },
                      { value: 0.85, label: "85%" },
                    ]}
                  />

                  <div>
                    <p className="mb-2 text-sm text-slate-300">{t.textAlign}</p>
                    <Segmented
                      value={draft.textAlign}
                      onChange={(textAlign) => updateDraft({ textAlign })}
                      options={[
                        { value: "left", label: t.left },
                        { value: "center", label: t.center },
                        { value: "justify", label: t.justify },
                      ]}
                    />
                  </div>

                  <div>
                    <p className="mb-2 text-sm text-slate-300">{t.showReference}</p>
                    <Segmented
                      value={String(draft.showReference)}
                      onChange={(value) => updateDraft({ showReference: value === "true" })}
                      options={[
                        { value: "true", label: t.yes },
                        { value: "false", label: t.no },
                      ]}
                    />
                  </div>

                  <div>
                    <p className="mb-2 text-sm text-slate-300">{t.language}</p>
                    <Segmented
                      value={draft.language}
                      onChange={(language) => updateDraft({ language })}
                      options={[
                        { value: "ta", label: t.tamil },
                        { value: "en", label: t.english },
                      ]}
                    />
                  </div>
                </div>
              </div>
            </Section>

            <Section
              title="Visual Setup"
              subtitle="Background choices and uploads are grouped here so the visual workflow feels simpler."
              className="[content-visibility:auto] [contain-intrinsic-size:900px]"
            >
              <div className="space-y-5">
                <div>
                  <p className="mb-2 text-sm text-slate-300">Background Type</p>
                  <Segmented
                    value={draft.bgType === "gradient" ? "gradient" : "image"}
                    onChange={(mode) =>
                      updateDraft({
                        bgType: mode,
                        bgIndex: draft.bgIndex ?? 0,
                      })
                    }
                    options={[
                      { value: "image", label: t.imageBackgrounds },
                      { value: "gradient", label: t.gradientBackgrounds },
                    ]}
                  />
                </div>

                <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
                  <div className="space-y-4">
                    <div className="rounded-[1.6rem] border border-white/10 bg-black/20 p-4">
                      <p className="text-sm font-semibold text-white">{t.customBackground}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-400">
                        {t.customBackgroundIntro}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          onClick={() => backgroundInputRef.current?.click()}
                          className="rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-950/30"
                        >
                          {t.uploadImage}
                        </button>
                        {draft.customBackground ? (
                          <button
                            onClick={() =>
                              updateDraft({
                                customBackground: null,
                                bgType: "image",
                                bgIndex: 0,
                              })
                            }
                            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:bg-white/10"
                          >
                            {t.removeImage}
                          </button>
                        ) : null}
                      </div>

                      <input
                        ref={backgroundInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleBackgroundUpload}
                        className="hidden"
                      />

                      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                        {draft.customBackground ? (
                          <img
                            src={draft.customBackground}
                            alt="Custom background"
                            className="h-44 w-full object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <div className="flex h-44 items-center justify-center text-sm text-slate-500">
                            {t.uploadImage}
                          </div>
                        )}
                      </div>
                    </div>

                    <Section
                      title={t.installApp}
                      subtitle={t.installAppIntro}
                      className="border-0 bg-[linear-gradient(180deg,_rgba(7,15,28,0.85),_rgba(7,15,28,0.92))] p-0 shadow-none"
                    >
                      <div className="space-y-4">
                        <button
                          onClick={promptInstall}
                          disabled={!canInstall}
                          className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-lg ${
                            canInstall
                              ? "bg-gradient-to-br from-indigo-500 to-sky-500 shadow-indigo-950/30"
                              : "cursor-not-allowed bg-slate-800 text-slate-400 shadow-none"
                          }`}
                        >
                          {isInstalled ? t.installed : t.installNow}
                        </button>

                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-7 text-slate-300">
                          {isInstalled ? t.installed : t.installHelp}
                        </div>
                      </div>
                    </Section>
                  </div>

                  <div>
                    <p className="mb-3 text-sm text-slate-300">
                      {draft.bgType === "gradient"
                        ? t.gradientBackgroundsIntro
                        : t.imageBackgroundsIntro}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {activeBackgrounds.map((item, i) => (
                        <BackgroundTile
                          key={`${draft.bgType}-${i}`}
                          active={draft.bgIndex === i}
                          onClick={() => updateDraft({ bgIndex: i })}
                        >
                          {draft.bgType === "gradient" ? (
                            <div className="h-28 w-full" style={{ background: item }} />
                          ) : (
                            <img
                              src={item}
                              alt={`Background ${i + 1}`}
                              className="h-28 w-full object-cover"
                              loading="lazy"
                              decoding="async"
                            />
                          )}
                        </BackgroundTile>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Section>
          </div>

          <div className="xl:sticky xl:top-6 xl:self-start">
            <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_32%),linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(8,17,32,0.96))] p-4 shadow-2xl shadow-black/30 md:p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">
                    {t.livePreview}
                  </p>
                  <p className="mt-2 text-sm text-slate-400">{t.applyNow}</p>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300">
                  {draft.language === "en" ? "EN" : "TA"}
                </div>
              </div>

              <div
                className="overflow-hidden rounded-[1.8rem] border border-white/10 p-4 md:p-5"
                style={{
                  background: previewBackground,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div
                  className="mx-auto rounded-[1.7rem] border border-white/15 px-5 py-7 shadow-xl"
                  style={{
                    maxWidth: `${previewDraft.readerWidth}px`,
                    background: `rgba(0, 0, 0, ${previewDraft.cardOpacity})`,
                  }}
                >
                  {previewDraft.showReference && (
                    <p
                      className="mb-4 text-sm font-bold text-white"
                      style={{
                        textAlign: previewDraft.textAlign,
                        textShadow: "0 2px 10px rgba(0, 0, 0, 0.65)",
                      }}
                    >
                      {t.previewRef}
                    </p>
                  )}

                  <p
                    className="font-bold text-white"
                    style={{
                      fontSize: `${previewDraft.fontSize}px`,
                      lineHeight: previewDraft.lineHeight,
                      textAlign: previewDraft.textAlign,
                      textShadow: "0 2px 14px rgba(0, 0, 0, 0.5)",
                    }}
                  >
                    {t.previewVerse}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
