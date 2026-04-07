import { memo, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { defaultSettings } from "../utils/settings";
import useAppSettings from "../hooks/useAppSettings";
import useInstallPrompt from "../hooks/useInstallPrompt";
import { getUIText } from "../utils/uiText";
import SmoothBackground from "../components/SmoothBackground";
import {
  FONT_FAMILY_OPTIONS,
  TAMIL_FONT_OPTIONS,
} from "../utils/appearance";
import { optimizeImage, tryOptimizeExternalImage } from "../utils/imageOptimization";
import { getPresentationScreens } from "../utils/screens";
import { getSiteUrl } from "../utils/siteUrl";
import { QRCode } from "react-qr-code";

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
];

const motionBackgroundOptions = [
  { value: "stars", key: "stars" },
  { value: "waves", key: "waves" },
  { value: "particles", key: "particles" },
  { value: "aurora", key: "aurora" },
  { value: "embers", key: "embers" },
  { value: "halo", key: "halo" },
  { value: "mist", key: "mist" },
];

const Panel = memo(function Panel({ title, subtitle, children, className = "", isTamil = false }) {
  return (
    <section
      className={`app-surface w-full min-w-0 rounded-[1.25rem] p-4 ${className}`}
    >
      <div className="mb-4">
        <p
          className={`font-semibold text-sky-400/80 border-b border-white/5 pb-2 mb-3 ${
            isTamil ? "text-sm tracking-normal" : "text-[10px] uppercase tracking-[0.28em]"
          }`}
        >
          {title}
        </p>
        <p className={`max-w-2xl text-slate-300 ${isTamil ? "text-sm leading-7" : "text-xs leading-6"}`}>
          {subtitle}
        </p>
      </div>
      {children}
    </section>
  );
});

const TabButton = memo(function TabButton({ active, children, onClick, isTamil = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-2 font-semibold transition ${
        isTamil ? "text-sm" : "text-[13px]"
      } ${
        active
          ? "bg-[linear-gradient(135deg,#0ea5e9,#22c55e)] text-slate-950 shadow-md"
          : "border border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]"
      }`}
    >
      {children}
    </button>
  );
});

const MetricPill = memo(function MetricPill({ label, value, isTamil = false }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
      <p
        className={`text-slate-500 ${
          isTamil ? "text-xs font-medium tracking-normal" : "text-[9px] uppercase tracking-[0.2em]"
        }`}
      >
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
});

const StepControl = memo(function StepControl({ label, valueLabel, value, min, max, step, onChange }) {
  const updateValue = (direction) => {
    const nextValue = Math.min(
      max,
      Math.max(min, Number((value + step * direction).toFixed(2)))
    );
    onChange(nextValue);
  };

  return (
    <div className="w-full min-w-0 rounded-xl border border-white/10 bg-black/20 p-3">
      <div className="flex min-w-0 items-center justify-between gap-2.5">
        <p className="min-w-0 flex-1 break-words text-xs font-medium text-slate-300">{label}</p>
        <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.06] px-2 py-0.5 text-[10px] text-slate-400">
          {valueLabel}
        </span>
      </div>

      <div className="mt-3 flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={() => updateValue(-1)}
          className="h-9 w-9 rounded-lg border border-white/10 bg-white/[0.06] text-base font-bold text-white transition hover:bg-white/[0.1]"
        >
          -
        </button>
        <div className="flex-1 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-center text-xs font-semibold text-white">
          {valueLabel}
        </div>
        <button
          type="button"
          onClick={() => updateValue(1)}
          className="h-9 w-9 rounded-lg border border-white/10 bg-white/[0.06] text-base font-bold text-white transition hover:bg-white/[0.1]"
        >
          +
        </button>
      </div>
    </div>
  );
});

const ChoiceRow = memo(function ChoiceRow({ label, options, value, onChange, isTamil = false }) {
  return (
    <div className="w-full min-w-0 rounded-xl border border-white/10 bg-black/20 p-3">
      <p className={`break-words font-medium text-slate-300 ${isTamil ? "text-sm" : "text-xs"}`}>{label}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-full px-3 py-1.5 font-semibold transition ${
              isTamil ? "text-xs" : "text-[10px]"
            } ${
              value === option.value
                ? "bg-[linear-gradient(135deg,#38bdf8,#22c55e)] text-slate-950 shadow-sm"
                : "border border-white/10 bg-white/[0.05] text-slate-300 hover:bg-white/[0.08]"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
});

const PopupSelectRow = memo(function PopupSelectRow({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const selected = options.find((option) => option.value === value) || options[0];

  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (event) => {
      if (wrapperRef.current?.contains(event.target)) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  return (
    <div ref={wrapperRef} className={`relative w-full min-w-0 rounded-xl border border-white/10 bg-black/20 p-3 transition-all ${open ? "z-40" : "z-10"}`}>
      <p className="break-words text-xs font-medium text-slate-300">{label}</p>

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="mt-3 flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-left text-xs text-white transition hover:border-sky-400/30 hover:bg-white/[0.08]"
      >
        <span>{selected?.label}</span>
        <span className={`text-[10px] text-slate-400 transition ${open ? "rotate-180" : ""}`}>▼</span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 rounded-xl border border-white/10 bg-[linear-gradient(180deg,_rgba(15,23,42,0.98),_rgba(8,17,32,0.98))] p-1.5 shadow-2xl shadow-black/60">
          <div className="max-h-56 overflow-y-auto pr-1 custom-scroll">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition ${
                  option.value === value
                    ? "bg-sky-400/20 text-sky-200"
                    : "text-slate-300 hover:bg-white/[0.05]"
                }`}
              >
                <span>{option.label}</span>
                {option.value === value ? <span className="text-[10px] text-sky-400">Selected</span> : null}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

const SwitchRow = memo(function SwitchRow({ label, description, checked, onChange }) {
  return (
    <label className="flex w-full min-w-0 items-start justify-between gap-4 rounded-xl border border-white/10 bg-black/20 px-3.5 py-3">
      <div className="min-w-0 flex-1">
        <p className="break-words text-xs font-medium text-white">{label}</p>
        {description ? <p className="mt-1 text-[11px] leading-5 text-slate-400">{description}</p> : null}
      </div>
      <span
        className={`relative mt-0.5 inline-flex h-6 w-10 shrink-0 items-center rounded-full transition ${
          checked ? "bg-emerald-500" : "bg-slate-700"
        }`}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="peer sr-only"
        />
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white transition ${
            checked ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </span>
    </label>
  );
});

function areSettingsEqual(left, right) {
  if (left === right) return true;
  return Object.keys(defaultSettings || {}).every((key) => left[key] === right[key]);
}

export default function Settings() {
  const [isMobileViewport, setIsMobileViewport] = useState(
    () => (typeof window !== "undefined" ? window.innerWidth < 768 : false)
  );
  const [settings, update] = useAppSettings();
  const { canInstall, isInstalled, installInstructions, promptInstall } = useInstallPrompt();
  const [draft, setDraft] = useState(() => ({ ...defaultSettings, ...settings }));
  const [backgroundUrl, setBackgroundUrl] = useState(() =>
    typeof settings.customBackground === "string" && /^https?:\/\//i.test(settings.customBackground)
      ? settings.customBackground
      : ""
  );
  const [tab, setTab] = useState("reader");
  const [installFeedback, setInstallFeedback] = useState("");
  const previewCardRef = useRef(null);
  const previewTextRef = useRef(null);
  const [screenOptions, setScreenOptions] = useState([
    {
      value: "current-screen",
      label: `Screen 1 \u2192 ${window?.screen?.availWidth || 1920}x${window?.screen?.availHeight || 1080}`,
    },
  ]);
  const previewDraft = useDeferredValue(draft);
  const t = getUIText(draft.language);
  const isTamil = draft.language !== "en";
  const isBilingual = draft.language === "ta-en";

  const settingsPageText = useMemo(
    () => ({
      tabs: {
        reader: isTamil ? "வாசிப்பு" : "Reader",
        visual: isTamil ? "தோற்றம்" : "Visual",
        presentation: t.presentation || "Presentation",
      },
      panels: {
        readerControls: {
          title: isTamil ? "வாசிப்பு கட்டுப்பாடுகள்" : "Reader Controls",
          subtitle: isTamil
            ? "எழுத்தளவு, வரி இடைவெளி, அட்டை தெளிவு, மற்றும் மொழியை உங்கள் வாசிப்பு முறைக்கு ஏற்றவாறு மாற்றுங்கள்."
            : "Adjust type size, spacing, opacity, and language for your reading flow.",
        },
        quickModes: {
          title: isTamil ? "விரைவு முறைகள்" : "Quick Modes",
          subtitle: isTamil
            ? "சிறிய மாற்றங்கள் மூலம் வாசிப்பு உணர்வை உடனே மாற்றலாம்."
            : "Small switches that change the reader feel immediately.",
        },
        backgroundStudio: {
          title: isTamil ? "பின்னணி அமைப்பு" : "Background Studio",
          subtitle: isTamil
            ? "படம் அல்லது நிறச்சரிவு பின்னணியை தேர்வு செய்து, உங்கள் சொந்த படத்தையும் பயன்படுத்தலாம்."
            : "Switch backgrounds or upload a custom image for a personal reading atmosphere.",
        },
        presentationDefaults: {
          title: t.mainDisplay || "Main Display",
          subtitle: isTamil
            ? "முக்கிய காட்சி மற்றும் புரொஜெக்டர் திரையின் எழுத்துகள் மற்றும் தோற்றத்தை மாற்றவும்."
            : "Adjust font size, styles, and layout for the main projector display.",
        },
        stageView: {
          title: t.stageDisplay || "Stage Display",
          subtitle: isTamil
            ? "சபை திரையின் ஸ்டைல் மற்றும் க்ரீன் ஸ்கிரீன் அமைப்புகள்."
            : "Controls for stage monitor screens and green screen chroma key.",
        },
        installApp: {
          title: t.installApp || "Install App",
          subtitle: isTamil
            ? "இந்த வேதாகமத்தை ஒரு தனி செயலி போல உங்கள் மொபைலில் நிறுவலாம்."
            : "Install this Bible as a standalone app on your home screen.",
        },
        remoteControl: {
          title: t.remoteControl || "Remote Control",
          subtitle: isTamil
            ? "இந்த போனை ரிமோட் போல பயன்படுத்தி டிஸ்பிளேவை கட்டுப்படுத்தலாம்."
            : "Use your phone as a remote to control the live display.",
        },
        aboutApp: {
          title: t.aboutApp || "About App",
          subtitle: isTamil
            ? "செயலியின் பதிப்பு மற்றும் தயாரிப்பு விவரங்கள்."
            : "Version info and developer details.",
        },
        livePreview: {
          title: t.livePreview,
          subtitle: isTamil ? "மாற்றங்கள் உடனே முன்னோட்டத்தில் தெரியும்." : "Changes are applied immediately for quick tuning.",
        },
      },
      labels: {
        referencePosition: isTamil ? "குறிப்பு இடம்" : "Reference position",
        top: isTamil ? "மேல்" : "Top",
        bottom: isTamil ? "கீழ்" : "Bottom",
        hidden: isTamil ? "மறை" : "Hidden",
      },
    }),
    [isTamil, t]
  );

  useEffect(() => {
    if (!areSettingsEqual(settings, draft)) {
      const rafId = window.requestAnimationFrame(() => setDraft(settings));
      return () => window.cancelAnimationFrame(rafId);
    }
    return undefined;
  }, [settings]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (!areSettingsEqual(draft, settings)) update(draft);
    }, 280);
    return () => window.clearTimeout(timeout);
  }, [draft, settings, update]);


  const updateDraft = (patch) => setDraft((current) => ({ ...current, ...patch }));
  const resetSettings = () => setDraft(defaultSettings);

  useEffect(() => {
    const handleResize = () => setIsMobileViewport(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    
    // Load screens for presentation setup
    void getPresentationScreens().then(setScreenOptions);
    
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleBackgroundUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const optimized = await optimizeImage(file);
      updateDraft({ bgType: "custom", customBackground: optimized });
    } catch {}
    event.target.value = "";
  };

  const handleBackgroundUrlApply = async () => {
    const trimmedUrl = backgroundUrl.trim();
    if (!trimmedUrl) return;
    updateDraft({ bgType: "custom", customBackground: trimmedUrl });
    try {
      const optimized = await tryOptimizeExternalImage(trimmedUrl);
      if (optimized !== trimmedUrl) updateDraft({ customBackground: optimized });
    } catch {}
  };

  const handleInstall = async () => {
    const didPrompt = await promptInstall();
    if (!didPrompt) setInstallFeedback(installInstructions);
    else setInstallFeedback("");
  };

  const getBackgroundValue = (type, index, custom) => {
    if (type === "custom") return custom;
    if (type === "gradient") return gradients[index];
    return backgrounds[index];
  };

  return (
    <div className="app-shell app-page pb-20 pt-3 md:pt-4">
      <SmoothBackground
        background={getBackgroundValue(settings.bgType, settings.bgIndex, settings.customBackground)}
        bgType={settings.bgType}
        customBackground={settings.customBackground}
        motionVariant={settings.motionBackground}
        isFullPage={true}
      />
      
      <div className="app-page-inner">
        <header className="app-hero relative mb-4 overflow-hidden px-5 py-6 md:px-7 md:py-8">
          <div className="relative z-10">
            <p className={`font-semibold text-sky-400/80 ${isTamil ? "text-sm" : "text-[10px] uppercase tracking-[0.28em]"}`}>
              {t.settings}
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white md:text-3xl">
              {t.settingsTitle}
            </h1>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <MetricPill label={t.fontSize} value={`${draft.fontSize}px`} isTamil={isTamil} />
              <MetricPill
                label={t.language}
                value={draft.language === "en" ? "EN" : isBilingual ? "TA+EN" : "TA"}
                isTamil={isTamil}
              />
              <MetricPill label={isTamil ? "அகலம்" : "Width"} value={`${draft.readerWidth}px`} isTamil={isTamil} />
            </div>
          </div>
        </header>

        <div className="mb-4 scrollbar-none -mx-1 flex items-center gap-2 overflow-x-auto px-1">
          <div className="flex shrink-0 gap-2">
            {tabs.map((item) => (
              <TabButton key={item.id} active={tab === item.id} onClick={() => setTab(item.id)} isTamil={isTamil}>
                {settingsPageText.tabs[item.id]}
              </TabButton>
            ))}
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.1fr,0.9fr]">
            <div className="min-w-0 space-y-4">
              {tab === "reader" && (
                <>
                  <Panel title={settingsPageText.panels.readerControls.title} subtitle={settingsPageText.panels.readerControls.subtitle} isTamil={isTamil} className="relative z-20">
                    <div className="grid gap-3 md:grid-cols-2">
                      <StepControl label={t.fontSize} value={draft.fontSize} valueLabel={`${draft.fontSize}px`} min={18} max={42} step={1} onChange={(fontSize) => updateDraft({ fontSize })} />
                      <StepControl label={t.lineSpacing} value={draft.lineHeight} valueLabel={`${draft.lineHeight.toFixed(1)}x`} min={1.3} max={2.4} step={0.1} onChange={(lineHeight) => updateDraft({ lineHeight })} />
                      <StepControl label={t.readerWidth} value={draft.readerWidth} valueLabel={`${draft.readerWidth}px`} min={640} max={1200} step={20} onChange={(readerWidth) => updateDraft({ readerWidth })} />
                      <StepControl label={t.cardOpacity} value={draft.cardOpacity} valueLabel={`${Math.round(draft.cardOpacity * 100)}%`} min={0.2} max={0.9} step={0.05} onChange={(cardOpacity) => updateDraft({ cardOpacity })} />
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <ChoiceRow label={t.textAlign} value={draft.textAlign} onChange={(textAlign) => updateDraft({ textAlign })} isTamil={isTamil} options={[{ value: "left", label: t.left }, { value: "center", label: t.center }, { value: "justify", label: t.justify }]} />
                      <ChoiceRow label={t.language} value={draft.language} onChange={(language) => updateDraft({ language })} isTamil={isTamil} options={[{ value: "ta", label: t.tamil }, { value: "en", label: t.english }, { value: "ta-en", label: t.tamilEnglish }]} />
                      <PopupSelectRow label="English Font" value={draft.fontFamily} onChange={(fontFamily) => updateDraft({ fontFamily })} options={FONT_FAMILY_OPTIONS} />
                      <PopupSelectRow label="Tamil Font" value={draft.tamilFontFamily} onChange={(tamilFontFamily) => updateDraft({ tamilFontFamily })} options={TAMIL_FONT_OPTIONS} />
                    </div>
                    <div className="mt-3">
                      <ChoiceRow
                        label={settingsPageText.labels.referencePosition}
                        value={draft.referencePosition || (draft.showReference === false ? "hidden" : "top")}
                        onChange={(pos) => updateDraft({ referencePosition: pos, showReference: pos !== "hidden" })}
                        isTamil={isTamil}
                        options={[{ value: "top", label: settingsPageText.labels.top }, { value: "bottom", label: settingsPageText.labels.bottom }, { value: "hidden", label: settingsPageText.labels.hidden }]}
                      />
                    </div>
                  </Panel>
                  <Panel title={settingsPageText.panels.quickModes.title} subtitle={settingsPageText.panels.quickModes.subtitle} isTamil={isTamil} className="relative z-10">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <SwitchRow label={t.readerBox} description={t.readerBoxDesc} checked={draft.showReaderBox !== false} onChange={(val) => updateDraft({ showReaderBox: val })} />
                      <SwitchRow label={t.keepAwake} description={t.keepAwakeDesc} checked={draft.keepScreenAwake} onChange={(val) => updateDraft({ keepScreenAwake: val })} />
                      <SwitchRow label={t.tamilKeyboard} description={t.tamilKeyboardDesc} checked={draft.tamilKeyboardAutoOpen} onChange={(val) => updateDraft({ tamilKeyboardAutoOpen: val })} />
                    </div>
                  </Panel>
                </>
              )}

              {tab === "visual" && (
                <Panel title={settingsPageText.panels.backgroundStudio.title} subtitle={settingsPageText.panels.backgroundStudio.subtitle} isTamil={isTamil}>
                  <div className="grid gap-3">
                    <ChoiceRow label={t.backgroundType} value={draft.bgType || "image"} onChange={(bgType) => updateDraft({ bgType })} isTamil={isTamil} options={[{ value: "image", label: t.image }, ...(!isMobileViewport ? [{ value: "motion", label: "Motion" }] : []), { value: "gradient", label: t.gradient }, { value: "custom", label: t.custom }]} />
                    
                    {draft.bgType === "custom" ? (
                      <div className="space-y-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <button type="button" onClick={() => document.getElementById("bg-upload").click()} className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/5 p-4 hover:bg-white/10">
                            <input id="bg-upload" type="file" accept="image/*" className="hidden" onChange={handleBackgroundUpload} />
                            <span className="text-xs font-medium text-white">{t.uploadImage}</span>
                          </button>
                          <div className="flex gap-2">
                            <input type="text" value={backgroundUrl} onChange={(e) => setBackgroundUrl(e.target.value)} placeholder="Image URL..." className="flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white outline-none" />
                            <button onClick={handleBackgroundUrlApply} className="rounded-lg bg-sky-500 px-3 py-2 text-xs font-bold text-white">Apply</button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 gap-2 md:grid-cols-5">
                        {(draft.bgType === "gradient" ? gradients : draft.bgType === "motion" ? motionBackgroundOptions : backgrounds).map((val, idx) => (
                          <button
                            key={idx}
                            onClick={() => updateDraft(draft.bgType === "motion" ? { motionBackground: val.value } : { bgIndex: idx })}
                            className={`aspect-video rounded-lg border-2 transition ${
                              (draft.bgType === "motion" ? draft.motionBackground === val.value : draft.bgIndex === idx)
                                ? "border-sky-400 shadow-md"
                                : "border-white/5 hover:border-white/20"
                            } overflow-hidden`}
                            style={draft.bgType === "gradient" ? { background: val } : {}}
                          >
                            {draft.bgType === "image" && <img src={val} alt="" className="h-full w-full object-cover" />}
                            {draft.bgType === "motion" && <div className="flex h-full w-full items-center justify-center text-[8px] uppercase text-slate-400">{val.key}</div>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </Panel>
              )}

            </div>

            <div className="flex flex-col gap-4">
              <div className="xl:sticky xl:top-4">
                <Panel title={settingsPageText.panels.livePreview.title} subtitle={settingsPageText.panels.livePreview.subtitle} isTamil={isTamil}>
                  <div
                    ref={previewCardRef}
                    className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-white/10 shadow-2xl md:aspect-[4/3]"
                    style={{
                      background:
                        previewDraft.bgType === "gradient"
                          ? gradients[previewDraft.bgIndex]
                          : undefined,
                    }}
                  >
                    {previewDraft.bgType !== "gradient" && (
                      <SmoothBackground
                        background={getBackgroundValue(previewDraft.bgType, previewDraft.bgIndex, previewDraft.customBackground)}
                        bgType={previewDraft.bgType}
                        customBackground={previewDraft.customBackground}
                        motionVariant={previewDraft.motionBackground}
                        isFullPage={false}
                      />
                    )}
                    <div
                      className="relative z-10 flex h-full flex-col items-center justify-center p-5 transition-all duration-300"
                      style={{
                        backgroundColor:
                          previewDraft.showReaderBox !== false
                            ? `rgba(0,0,0,${previewDraft.cardOpacity ?? 0.5})`
                            : "transparent",
                        backdropFilter:
                          previewDraft.showReaderBox !== false ? "blur(8px)" : "none",
                        borderRadius:
                          previewDraft.showReaderBox !== false ? "0.75rem" : "0",
                      }}
                    >
                      <div
                        ref={previewTextRef}
                        className="w-full text-white"
                        style={{
                          textAlign: previewDraft.textAlign || "center",
                          lineHeight: previewDraft.lineHeight || 1.8,
                          fontSize: `${Math.min(previewDraft.fontSize || 24, 28)}px`,
                        }}
                      >
                        <p className="font-bold" style={{ textShadow: "0 2px 14px rgba(0,0,0,0.6)" }}>
                          {t.previewVerse}
                        </p>
                        <p className="mt-3 text-xs font-semibold text-slate-300" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.8)" }}>
                          {t.previewRef}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={resetSettings}
                      className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-bold text-white hover:bg-white/10"
                    >
                      {t.resetSettings}
                    </button>
                    <button
                      onClick={() => window.location.reload()}
                      className="flex-1 rounded-xl bg-sky-500 py-3 text-xs font-bold text-white shadow-lg active:scale-95"
                    >
                      Save & Refresh
                    </button>
                  </div>
                </Panel>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}
