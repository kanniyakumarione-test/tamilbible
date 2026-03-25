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
  "linear-gradient(135deg, #1e293b 0%, #0f172a 45%, #020617 100%)",
  "linear-gradient(135deg, #16324f 0%, #1d4ed8 45%, #38bdf8 100%)",
  "linear-gradient(135deg, #312e81 0%, #6d28d9 45%, #db2777 100%)",
  "linear-gradient(135deg, #1f2937 0%, #0f766e 45%, #22c55e 100%)",
  "linear-gradient(135deg, #3f1d2e 0%, #9a3412 45%, #f59e0b 100%)",
];

const tabs = [
  { id: "reader", label: "Reader" },
  { id: "visual", label: "Visual" },
  { id: "app", label: "App" },
];

const presentationPresetMap = {
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

function Panel({ title, subtitle, children, className = "" }) {
  return (
    <section
      className={`rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,_rgba(11,18,32,0.96),_rgba(7,12,23,0.98))] p-5 shadow-2xl shadow-black/20 ${className}`}
    >
      <div className="mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-300/70">
          {title}
        </p>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function TabButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${
        active
          ? "bg-[linear-gradient(135deg,#0ea5e9,#22c55e)] text-slate-950 shadow-lg"
          : "border border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]"
      }`}
    >
      {children}
    </button>
  );
}

function MetricPill({ label, value }) {
  return (
    <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-2 text-base font-semibold text-white">{value}</p>
    </div>
  );
}

function StepControl({ label, valueLabel, value, min, max, step, onChange }) {
  const updateValue = (direction) => {
    const nextValue = Math.min(
      max,
      Math.max(min, Number((value + step * direction).toFixed(2)))
    );
    onChange(nextValue);
  };

  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-200">{label}</p>
        <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-slate-300">
          {valueLabel}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => updateValue(-1)}
          className="h-11 w-11 rounded-2xl border border-white/10 bg-white/[0.06] text-lg font-bold text-white transition hover:bg-white/[0.1]"
        >
          -
        </button>
        <div className="flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-center text-sm font-semibold text-white">
          {valueLabel}
        </div>
        <button
          type="button"
          onClick={() => updateValue(1)}
          className="h-11 w-11 rounded-2xl border border-white/10 bg-white/[0.06] text-lg font-bold text-white transition hover:bg-white/[0.1]"
        >
          +
        </button>
      </div>
    </div>
  );
}

function ChoiceRow({ label, options, value, onChange }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
      <p className="text-sm font-medium text-slate-200">{label}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
              value === option.value
                ? "bg-[linear-gradient(135deg,#38bdf8,#22c55e)] text-slate-950"
                : "border border-white/10 bg-white/[0.05] text-slate-200 hover:bg-white/[0.08]"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SwitchRow({ label, description, checked, onChange }) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-4">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        {description ? <p className="mt-1 text-xs leading-6 text-slate-400">{description}</p> : null}
      </div>
      <span
        className={`relative mt-0.5 inline-flex h-7 w-12 shrink-0 items-center rounded-full transition ${
          checked ? "bg-emerald-400/90" : "bg-slate-700"
        }`}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="peer sr-only"
        />
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white transition ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </span>
    </label>
  );
}

const BackgroundTile = memo(function BackgroundTile({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`overflow-hidden rounded-[1.4rem] border-2 transition ${
        active ? "border-cyan-300 shadow-lg shadow-cyan-950/30" : "border-white/10 hover:border-white/20"
      }`}
    >
      {children}
    </button>
  );
});

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
  const { canInstall, isInstalled, installInstructions, promptInstall } = useInstallPrompt();
  const [draft, setDraft] = useState(settings);
  const [tab, setTab] = useState("reader");
  const [installFeedback, setInstallFeedback] = useState("");
  const backgroundInputRef = useRef(null);
  const previewCardRef = useRef(null);
  const previewTextRef = useRef(null);
  const previewDraft = useDeferredValue(draft);
  const [previewFontSize, setPreviewFontSize] = useState(draft.fontSize);
  const t = getUIText(draft.language);

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
    const timeout = window.setTimeout(() => {
      if (!areSettingsEqual(draft, settings)) {
        update(draft);
      }
    }, 280);

    return () => window.clearTimeout(timeout);
  }, [draft, settings, update]);

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
    previewDraft.readerWidth,
    previewDraft.cardOpacity,
    previewDraft.showReference,
    t.previewVerse,
    t.previewRef,
  ]);

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

  const handleInstall = async () => {
    const didPrompt = await promptInstall();

    if (!didPrompt) {
      setInstallFeedback(installInstructions);
      return;
    }

    setInstallFeedback("");
  };

  const activeBackgrounds = draft.bgType === "gradient" ? gradients : backgrounds;

  return (
    <div className="app-shell px-4 pb-20 pt-4 md:px-6 md:pt-6">
      <div className="mx-auto max-w-7xl">
        <section className="mb-6 overflow-hidden rounded-[2.2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.18),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(56,189,248,0.18),_transparent_26%),linear-gradient(180deg,_rgba(8,15,29,0.98),_rgba(4,9,17,0.98))] p-6 shadow-2xl shadow-black/30 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cyan-300/70">
                {t.readingSetup}
              </p>
              <h1 className="mt-3 max-w-3xl text-3xl font-bold text-white md:text-5xl">
                {t.settingsTitle}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
                {t.settingsIntro}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <MetricPill label={t.fontSize} value={`${draft.fontSize}px`} />
              <MetricPill label={t.language} value={draft.language === "en" ? t.english : t.tamil} />
              <MetricPill label={t.readerWidth} value={`${draft.readerWidth}px`} />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {tabs.map((item) => (
              <TabButton key={item.id} active={tab === item.id} onClick={() => setTab(item.id)}>
                {item.label}
              </TabButton>
            ))}

            <button
              type="button"
              onClick={resetSettings}
              className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/[0.1]"
            >
              {t.resetSettings}
            </button>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
          <div className="space-y-6">
            {tab === "reader" ? (
              <>
                <Panel title="Reader Controls" subtitle="Dial in type size, spacing, card strength, and language for your reading flow.">
                  <div className="grid gap-4 md:grid-cols-2">
                    <StepControl label={t.fontSize} value={draft.fontSize} valueLabel={`${draft.fontSize}px`} min={18} max={42} step={1} onChange={(fontSize) => updateDraft({ fontSize })} />
                    <StepControl label={t.lineSpacing} value={draft.lineHeight} valueLabel={`${draft.lineHeight.toFixed(1)}x`} min={1.3} max={2.4} step={0.1} onChange={(lineHeight) => updateDraft({ lineHeight })} />
                    <StepControl label={t.readerWidth} value={draft.readerWidth} valueLabel={`${draft.readerWidth}px`} min={640} max={1200} step={20} onChange={(readerWidth) => updateDraft({ readerWidth })} />
                    <StepControl label={t.cardOpacity} value={draft.cardOpacity} valueLabel={`${Math.round(draft.cardOpacity * 100)}%`} min={0.2} max={0.9} step={0.05} onChange={(cardOpacity) => updateDraft({ cardOpacity })} />
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <ChoiceRow
                      label={t.textAlign}
                      value={draft.textAlign}
                      onChange={(textAlign) => updateDraft({ textAlign })}
                      options={[
                        { value: "left", label: t.left },
                        { value: "center", label: t.center },
                        { value: "justify", label: t.justify },
                      ]}
                    />
                    <ChoiceRow
                      label={t.language}
                      value={draft.language}
                      onChange={(language) => updateDraft({ language })}
                      options={[
                        { value: "ta", label: t.tamil },
                        { value: "en", label: t.english },
                      ]}
                    />
                  </div>

                  <div className="mt-4">
                    <SwitchRow
                      label={t.showReference}
                      description="Show the verse reference above the preview and reader card."
                      checked={draft.showReference}
                      onChange={(showReference) => updateDraft({ showReference })}
                    />
                  </div>
                </Panel>

                <Panel title="Quick Reading Modes" subtitle="Small switches that change how the reader feels immediately.">
                  <div className="grid gap-4 md:grid-cols-2">
                    <SwitchRow
                      label="Compact card"
                      description="Lower the card opacity for a lighter reading layer."
                      checked={draft.cardOpacity <= 0.4}
                      onChange={(checked) => updateDraft({ cardOpacity: checked ? 0.35 : 0.5 })}
                    />
                    <SwitchRow
                      label="Wide layout"
                      description="Use a wider reader width for desktop study sessions."
                      checked={draft.readerWidth >= 1040}
                      onChange={(checked) => updateDraft({ readerWidth: checked ? 1120 : 900 })}
                    />
                  </div>
                </Panel>
              </>
            ) : null}

            {tab === "visual" ? (
              <>
                <Panel title="Background Studio" subtitle="Switch between photo and gradient backgrounds, then upload a custom image if you want a more personal reading atmosphere.">
                  <div className="grid gap-4 lg:grid-cols-[0.7fr,1.3fr]">
                    <div className="space-y-4">
                      <ChoiceRow
                        label="Background Type"
                        value={draft.bgType === "gradient" ? "gradient" : "image"}
                        onChange={(mode) => updateDraft({ bgType: mode, bgIndex: draft.bgIndex ?? 0 })}
                        options={[
                          { value: "image", label: t.imageBackgrounds },
                          { value: "gradient", label: t.gradientBackgrounds },
                        ]}
                      />

                      <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                        <p className="text-sm font-medium text-white">{t.customBackground}</p>
                        <p className="mt-2 text-xs leading-6 text-slate-400">{t.customBackgroundIntro}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => backgroundInputRef.current?.click()}
                            className="rounded-xl bg-[linear-gradient(135deg,#0ea5e9,#22c55e)] px-4 py-2.5 text-sm font-semibold text-slate-950"
                          >
                            {t.uploadImage}
                          </button>
                          {draft.customBackground ? (
                            <button
                              type="button"
                              onClick={() => updateDraft({ customBackground: null, bgType: "image", bgIndex: 0 })}
                              className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-semibold text-white"
                            >
                              {t.removeImage}
                            </button>
                          ) : null}
                        </div>
                        <input ref={backgroundInputRef} type="file" accept="image/*" onChange={handleBackgroundUpload} className="hidden" />
                      </div>
                    </div>

                    <div>
                      <p className="mb-3 text-sm text-slate-400">
                        {draft.bgType === "gradient" ? t.gradientBackgroundsIntro : t.imageBackgroundsIntro}
                      </p>
                      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                        {activeBackgrounds.map((item, index) => {
                          const isGradientItem = typeof item === "string" && item.startsWith("linear-gradient");

                          return (
                            <BackgroundTile
                              key={`${draft.bgType}-${index}`}
                              active={draft.bgIndex === index}
                              onClick={() => updateDraft({ bgType: isGradientItem ? "gradient" : "image", bgIndex: index })}
                            >
                              {isGradientItem ? (
                                <div className="h-24 w-full" style={{ background: item }} />
                              ) : (
                                <img src={item} alt={`background-${index + 1}`} className="h-24 w-full object-cover" />
                              )}
                            </BackgroundTile>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </Panel>

                <Panel title="Visual Shortcuts" subtitle="Fast switches for common reading looks without hunting through every control.">
                  <div className="grid gap-4 md:grid-cols-2">
                    <SwitchRow
                      label="Reference-first style"
                      description="Keeps the verse reference visible for study and teaching use."
                      checked={draft.showReference}
                      onChange={(showReference) => updateDraft({ showReference })}
                    />
                    <SwitchRow
                      label="Gradient mood"
                      description="Use a smooth gradient instead of image backgrounds."
                      checked={draft.bgType === "gradient"}
                      onChange={(checked) => updateDraft({ bgType: checked ? "gradient" : "image", bgIndex: 0 })}
                    />
                  </div>
                </Panel>
              </>
            ) : null}

            {tab === "app" ? (
              <>
                <Panel title="Install App" subtitle="Make the Bible feel more like a native app with offline support and a home-screen shortcut.">
                  <div className="rounded-[1.6rem] border border-emerald-400/20 bg-emerald-400/10 p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-white">
                          {isInstalled ? t.installed : t.installBannerTitle}
                        </p>
                        <p className="mt-2 max-w-2xl text-sm leading-7 text-emerald-50/90">
                          {isInstalled ? t.installAppIntro : t.installBannerText}
                        </p>
                        {!isInstalled ? (
                          <p className="mt-3 text-xs leading-6 text-emerald-100/80">
                            {installFeedback || installInstructions}
                          </p>
                        ) : null}
                      </div>

                      <button
                        type="button"
                        onClick={handleInstall}
                        disabled={isInstalled}
                        className={`rounded-2xl px-5 py-3 text-sm font-semibold ${
                          isInstalled
                            ? "cursor-default bg-white/10 text-white/70"
                            : "bg-white text-slate-950 shadow-lg"
                        }`}
                      >
                        {isInstalled ? t.installed : canInstall ? t.installNow : "How To Install"}
                      </button>
                    </div>
                  </div>
                </Panel>

                <Panel title="Presentation Defaults" subtitle="Quick app-level controls for sermon screens and projector-ready output.">
                  <div className="grid gap-4 md:grid-cols-2">
                    <ChoiceRow
                      label={t.presets}
                      value={draft.presentationPreset}
                      onChange={(presentationPreset) => updateDraft({ presentationPreset, ...(presentationPresetMap[presentationPreset] || {}) })}
                      options={[
                        { value: "horizontal", label: t.fullScreenHorizontal },
                        { value: "primary", label: t.fullScreenPrimary },
                        { value: "stretch", label: "Stretch" },
                        { value: "center", label: "Center Focus" },
                        { value: "minimal", label: "Minimal" },
                      ]}
                    />
                    <StepControl
                      label={t.maximumFontSize}
                      value={draft.presentationMaxFontSize}
                      valueLabel={`${draft.presentationMaxFontSize}px`}
                      min={30}
                      max={180}
                      step={2}
                      onChange={(presentationMaxFontSize) => updateDraft({ presentationMaxFontSize })}
                    />
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <SwitchRow label={t.enableShadow} description="Add more separation against bright projector backgrounds." checked={draft.presentationShadow} onChange={(presentationShadow) => updateDraft({ presentationShadow })} />
                    <SwitchRow label={t.enableBox} description="Show the verse inside a darker container on the presentation output." checked={draft.presentationBox} onChange={(presentationBox) => updateDraft({ presentationBox })} />
                    <SwitchRow label={t.enableUppercase} description="Use all-caps for bolder on-screen scripture." checked={draft.presentationUppercase} onChange={(presentationUppercase) => updateDraft({ presentationUppercase })} />
                    <SwitchRow label={t.showLyricsInTwoLines} description="Split content into a tighter stage-friendly layout." checked={draft.presentationTwoLines} onChange={(presentationTwoLines) => updateDraft({ presentationTwoLines })} />
                  </div>
                </Panel>
              </>
            ) : null}
          </div>

          <div className="space-y-6">
            <Panel title={t.livePreview} subtitle="Every change is applied immediately so you can tune the reader without leaving this page.">
              <div
                className="rounded-[1.8rem] border border-white/10 p-4"
                style={{
                  backgroundImage: previewBackground,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div
                  ref={previewCardRef}
                  className="rounded-[1.6rem] border border-white/10 px-5 py-5 shadow-2xl shadow-black/20"
                  style={{
                    maxWidth: `${previewDraft.readerWidth}px`,
                    minHeight: "24rem",
                    background: `rgba(2, 6, 23, ${previewDraft.cardOpacity})`,
                    backdropFilter: "blur(12px)",
                  }}
                >
                  {previewDraft.showReference ? (
                    <p
                      className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-100/90"
                      style={{ textAlign: previewDraft.textAlign }}
                    >
                      {t.previewRef}
                    </p>
                  ) : null}
                  <p
                    ref={previewTextRef}
                    className="mt-4 font-bold text-white"
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
            </Panel>

            <Panel title="Snapshot" subtitle="A quick summary of your current reading profile.">
              <div className="grid gap-3 sm:grid-cols-2">
                <MetricPill label={t.textAlign} value={previewDraft.textAlign} />
                <MetricPill label="Background" value={previewDraft.bgType === "gradient" ? "Gradient" : previewDraft.bgType === "custom" ? "Custom" : "Image"} />
                <MetricPill label={t.cardOpacity} value={`${Math.round(previewDraft.cardOpacity * 100)}%`} />
                <MetricPill label={t.showReference} value={previewDraft.showReference ? t.yes : t.no} />
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}
