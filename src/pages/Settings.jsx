import { memo, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";

import { defaultSettings } from "../utils/settings";
import useAppSettings from "../hooks/useAppSettings";
import useInstallPrompt from "../hooks/useInstallPrompt";
import { getUIText } from "../utils/uiText";
import MotionBackground from "../components/MotionBackground";
import {
  FONT_FAMILY_OPTIONS,
  TAMIL_FONT_OPTIONS,
  getPresentationFontFamily,
  getReaderFontFamily,
} from "../utils/appearance";

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

const motionBackgroundOptions = [
  { value: "stars", key: "stars" },
  { value: "waves", key: "waves" },
  { value: "particles", key: "particles" },
  { value: "aurora", key: "aurora" },
  { value: "embers", key: "embers" },
  { value: "halo", key: "halo" },
  { value: "mist", key: "mist" },
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

function Panel({ title, subtitle, children, className = "", isTamil = false }) {
  return (
    <section
      className={`w-full min-w-0 rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,_rgba(11,18,32,0.96),_rgba(7,12,23,0.98))] p-5 shadow-2xl shadow-black/20 ${className}`}
    >
      <div className="mb-5">
        <p
          className={`font-semibold text-cyan-300/70 ${
            isTamil ? "text-sm tracking-normal" : "text-[11px] uppercase tracking-[0.3em]"
          }`}
        >
          {title}
        </p>
        <p className={`mt-2 max-w-2xl text-slate-400 ${isTamil ? "text-[15px] leading-8" : "text-sm leading-7"}`}>
          {subtitle}
        </p>
      </div>
      {children}
    </section>
  );
}

function TabButton({ active, children, onClick, isTamil = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2.5 font-semibold transition ${
        isTamil ? "text-[15px]" : "text-sm"
      } ${
        active
          ? "bg-[linear-gradient(135deg,#0ea5e9,#22c55e)] text-slate-950 shadow-lg"
          : "border border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]"
      }`}
    >
      {children}
    </button>
  );
}

function MetricPill({ label, value, isTamil = false }) {
  return (
    <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-4 py-3">
      <p
        className={`text-slate-500 ${
          isTamil ? "text-sm font-medium tracking-normal" : "text-[11px] uppercase tracking-[0.24em]"
        }`}
      >
        {label}
      </p>
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
    <div className="w-full min-w-0 rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <p className="min-w-0 flex-1 break-words text-sm font-medium text-slate-200">{label}</p>
        <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-slate-300">
          {valueLabel}
        </span>
      </div>

      <div className="mt-4 flex min-w-0 items-center gap-3">
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

function ChoiceRow({ label, options, value, onChange, isTamil = false }) {
  return (
    <div className="w-full min-w-0 rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
      <p className={`break-words font-medium text-slate-200 ${isTamil ? "text-[15px]" : "text-sm"}`}>{label}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-full px-3 py-2 font-semibold transition ${
              isTamil ? "text-sm" : "text-xs"
            } ${
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

function PopupSelectRow({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const selected = options.find((option) => option.value === value) || options[0];

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (wrapperRef.current?.contains(event.target)) {
        return;
      }

      setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative w-full min-w-0 rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
      <p className="break-words text-sm font-medium text-slate-200">{label}</p>

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="mt-4 flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-left text-sm text-white transition hover:border-sky-400/30 hover:bg-white/[0.08]"
      >
        <span>{selected?.label}</span>
        <span className={`text-slate-400 transition ${open ? "rotate-180" : ""}`}>v</span>
      </button>

      {open && (
        <div className="absolute left-4 right-4 top-[calc(100%-0.25rem)] z-30 rounded-[1.3rem] border border-white/10 bg-[linear-gradient(180deg,_rgba(15,23,42,0.98),_rgba(8,17,32,0.98))] p-2 shadow-2xl shadow-black/40">
          <div className="max-h-64 overflow-y-auto pr-1 custom-scroll">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm transition ${
                  option.value === value
                    ? "bg-sky-400/15 text-sky-100"
                    : "text-slate-200 hover:bg-white/[0.05]"
                }`}
              >
                <span>{option.label}</span>
                {option.value === value ? <span className="text-xs text-sky-300">Selected</span> : null}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SwitchRow({ label, description, checked, onChange }) {
  return (
    <label className="flex w-full min-w-0 items-start justify-between gap-4 rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-4">
      <div className="min-w-0 flex-1">
        <p className="break-words text-sm font-medium text-white">{label}</p>
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
  const [backgroundUrl, setBackgroundUrl] = useState(() =>
    typeof settings.customBackground === "string" && /^https?:\/\//i.test(settings.customBackground)
      ? settings.customBackground
      : ""
  );
  const [tab, setTab] = useState("reader");
  const [installFeedback, setInstallFeedback] = useState("");
  const backgroundInputRef = useRef(null);
  const previewCardRef = useRef(null);
  const previewTextRef = useRef(null);
  const previewDraft = useDeferredValue(draft);
  const [previewFontSize, setPreviewFontSize] = useState(draft.fontSize);
  const t = getUIText(draft.language);
  const isTamil = draft.language !== "en";
  const isBilingual = draft.language === "ta-en";
  const settingsPageText = useMemo(
    () => ({
      tabs: {
        reader: isTamil ? "வாசிப்பு" : "Reader",
        visual: isTamil ? "தோற்றம்" : "Visual",
        app: isTamil ? "செயலி" : "App",
      },
      panels: {
        readerControls: {
          title: isTamil ? "வாசிப்பு கட்டுப்பாடுகள்" : "Reader Controls",
          subtitle: isTamil
            ? "எழுத்தளவு, வரி இடைவெளி, அட்டை தெளிவு, மற்றும் மொழியை உங்கள் வாசிப்பு முறைக்கு ஏற்றவாறு மாற்றுங்கள்."
            : "Dial in type size, spacing, card strength, and language for your reading flow.",
        },
        quickModes: {
          title: isTamil ? "விரைவு வாசிப்பு முறைகள்" : "Quick Reading Modes",
          subtitle: isTamil
            ? "சிறிய மாற்றங்கள் மூலம் வாசிப்பு உணர்வை உடனே மாற்றலாம்."
            : "Small switches that change how the reader feels immediately.",
        },
        backgroundStudio: {
          title: isTamil ? "பின்னணி அமைப்பு" : "Background Studio",
          subtitle: isTamil
            ? "படம் அல்லது நிறச்சரிவு பின்னணியை தேர்வு செய்து, விருப்பமிருந்தால் உங்கள் சொந்த படத்தையும் பயன்படுத்தலாம்."
            : "Switch between photo and gradient backgrounds, then upload a custom image if you want a more personal reading atmosphere.",
        },
        visualShortcuts: {
          title: isTamil ? "தோற்ற விரைவு தேர்வுகள்" : "Visual Shortcuts",
          subtitle: isTamil
            ? "பொதுவாக பயன்படுத்தப்படும் வாசிப்பு தோற்றங்களை விரைவாக மாற்றலாம்."
            : "Fast switches for common reading looks without hunting through every control.",
        },
        installApp: {
          title: t.installApp,
          subtitle: isTamil
            ? "இந்த வேதாகமத்தை மொபைல் அல்லது கணினியில் தனி செயலி போல பயன்படுத்தலாம்."
            : "Make the Bible feel more like a native app with offline support and a home-screen shortcut.",
        },
        presentationDefaults: {
          title: isTamil ? "வெளியீட்டு முன்னிருப்புகள்" : "Presentation Defaults",
          subtitle: isTamil
            ? "சபை திரை மற்றும் பிரசங்க காட்சிக்கான விரைவு செயலி அமைப்புகள்."
            : "Quick app-level controls for sermon screens and projector-ready output.",
        },
        livePreview: {
          title: t.livePreview,
          subtitle: isTamil
            ? "இங்கே செய்யும் மாற்றங்கள் உடனே முன்னோட்டத்தில் தெரியும்."
            : "Every change is applied immediately so you can tune the reader without leaving this page.",
        },
        snapshot: {
          title: isTamil ? "சுருக்கம்" : "Snapshot",
          subtitle: isTamil
            ? "தற்போதைய வாசிப்பு அமைப்பின் சுருக்கம்."
            : "A quick summary of your current reading profile.",
        },
      },
      labels: {
        compactCard: isTamil ? "சுருக்கமான அட்டை" : "Compact card",
        compactCardDesc: isTamil
          ? "லேசான வாசிப்பு தோற்றத்திற்காக அட்டையின் தெளிவை குறைக்கவும்."
          : "Lower the card opacity for a lighter reading layer.",
        wideLayout: isTamil ? "அகலமான அமைப்பு" : "Wide layout",
        wideLayoutDesc: isTamil
          ? "டெஸ்க்டாப் வாசிப்பிற்கு அகலமான படிப்பகத்தை பயன்படுத்தவும்."
          : "Use a wider reader width for desktop study sessions.",
        backgroundType: isTamil ? "பின்னணி வகை" : "Background Type",
        referenceFirst: isTamil ? "குறிப்பு முதலில்" : "Reference-first style",
        referenceFirstDesc: isTamil
          ? "ஆய்வு மற்றும் போதனைக்கு வசன குறிப்பை தெளிவாக காட்டும்."
          : "Keeps the verse reference visible for study and teaching use.",
        gradientMood: isTamil ? "நிறச்சரிவு தோற்றம்" : "Gradient mood",
        gradientMoodDesc: isTamil
          ? "படத்தின் பதிலாக மென்மையான நிறச்சரிவு பின்னணியை பயன்படுத்தும்."
          : "Use a smooth gradient instead of image backgrounds.",
        stretch: isTamil ? "நீட்டிப்பு" : "Stretch",
        centerFocus: isTamil ? "மைய கவனம்" : "Center Focus",
        minimal: isTamil ? "எளிமை" : "Minimal",
        background: isTamil ? "பின்னணி" : "Background",
        image: isTamil ? "படம்" : "Image",
        gradient: isTamil ? "நிறச்சரிவு" : "Gradient",
        custom: isTamil ? "தனிப்பயன்" : "Custom",
        showReferenceDesc: isTamil
          ? "முன்னோட்டம் மற்றும் வாசிப்பு அட்டையில் வசன குறிப்பை மேலே காட்டும்."
          : "Show the verse reference above the preview and reader card.",
        referencePosition: isTamil ? "குறிப்பு இடம்" : "Reference position",
        referencePositionDesc: isTamil
          ? "வசன குறிப்பை மேலே, கீழே, அல்லது மறைக்க தேர்வு செய்யுங்கள்."
          : "Choose whether the verse reference appears at the top, bottom, or stays hidden.",
        top: isTamil ? "மேல்" : "Top",
        bottom: isTamil ? "கீழ்" : "Bottom",
        hidden: isTamil ? "மறை" : "Hidden",
        readerBox: isTamil ? "வாசிப்பு பெட்டி" : "Reader box",
        readerBoxDesc: isTamil
          ? "வசனத்தை கருப்பு வாசிப்பு பெட்டிக்குள் காட்டும். அணைத்தால் உரை பின்னணியின் மேலே நேரடியாக தெரியும்."
          : "Show the verse inside the dark reader card. Turn it off to place the text directly on the background.",
        keepScreenAwake: isTamil ? "திரை அணையாமல் வைத்திரு" : "Keep screen awake",
        keepScreenAwakeDesc: isTamil
          ? "வாசிக்கும் போது திரை தானாக அணையாமல் பாதுகாக்கும்."
          : "Try to keep the device screen awake while you are reading verses.",
        tamilKeyboardAutoOpen: isTamil ? "தமிழ் விசைப்பலகை தானாக திற" : "Tamil keyboard auto-open",
        tamilKeyboardAutoOpenDesc: isTamil
          ? "தேடல் பெட்டியில் கவனம் சென்றவுடன் தமிழ் விசைப்பலகை தானாக திறக்கும்."
          : "Open the Tamil keyboard automatically when the search box gets focus.",
        howToInstall: isTamil ? "நிறுவும் முறை" : "How To Install",
        shadowDesc: isTamil
          ? "ஒளிரும் திரைகளில் எழுத்து தெளிவாகத் தெரிய உதவும்."
          : "Add more separation against bright projector backgrounds.",
        boxDesc: isTamil
          ? "வசனத்தை கறுப்பு பின்னணி பெட்டிக்குள் காட்டும்."
          : "Show the verse inside a darker container on the presentation output.",
        uppercaseDesc: isTamil
          ? "திரை எழுத்துகளை முழு பெரிய எழுத்தாக மாற்றும்."
          : "Use all-caps for bolder on-screen scripture.",
      },
    }),
    [isTamil, t.installApp, t.livePreview]
  );

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
    previewDraft.referencePosition,
    t.previewVerse,
    t.previewRef,
  ]);

  const previewBackground = useMemo(() => {
    if (previewDraft.bgType === "motion") {
      return null;
    }

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
    if (typeof draft.customBackground === "string" && /^https?:\/\//i.test(draft.customBackground)) {
      setBackgroundUrl(draft.customBackground);
      return;
    }

    if (!draft.customBackground) {
      setBackgroundUrl("");
    }
  }, [draft.customBackground]);

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

  const handleBackgroundUrlApply = () => {
    const trimmedUrl = backgroundUrl.trim();
    if (!trimmedUrl) return;

    updateDraft({
      bgType: "custom",
      customBackground: trimmedUrl,
    });
  };

  const handleInstall = async () => {
    const didPrompt = await promptInstall();

    if (!didPrompt) {
      setInstallFeedback(installInstructions);
      return;
    }

    setInstallFeedback("");
  };

  const activeBackgrounds =
    draft.bgType === "gradient"
      ? gradients
      : draft.bgType === "motion"
      ? motionBackgroundOptions
      : backgrounds;

  return (
    <div className="app-shell overflow-x-hidden px-4 pb-20 pt-4 md:px-6 md:pt-6">
      <div className="mx-auto w-full max-w-7xl overflow-x-hidden">
        <section className="mb-6 overflow-hidden rounded-[2.2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.18),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(56,189,248,0.18),_transparent_26%),linear-gradient(180deg,_rgba(8,15,29,0.98),_rgba(4,9,17,0.98))] p-6 shadow-2xl shadow-black/30 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p
                className={`font-semibold text-cyan-300/70 ${
                  isTamil ? "text-sm tracking-normal" : "text-xs uppercase tracking-[0.34em]"
                }`}
              >
                {t.readingSetup}
              </p>
              <h1 className="mt-3 max-w-3xl text-3xl font-bold text-white md:text-5xl">
                {t.settingsTitle}
              </h1>
              <p className={`mt-4 max-w-2xl text-slate-300 md:text-base ${isTamil ? "text-[15px] leading-8" : "text-sm leading-7"}`}>
                {t.settingsIntro}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <MetricPill label={t.fontSize} value={`${draft.fontSize}px`} isTamil={isTamil} />
              <MetricPill
                label={t.language}
                value={draft.language === "en" ? t.english : isBilingual ? t.tamilEnglish : t.tamil}
                isTamil={isTamil}
              />
              <MetricPill label={t.readerWidth} value={`${draft.readerWidth}px`} isTamil={isTamil} />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {tabs.map((item) => (
              <TabButton key={item.id} active={tab === item.id} onClick={() => setTab(item.id)} isTamil={isTamil}>
                {settingsPageText.tabs[item.id]}
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
          <div className="min-w-0 space-y-6">
            {tab === "reader" ? (
              <>
                <Panel
                  title={settingsPageText.panels.readerControls.title}
                  subtitle={settingsPageText.panels.readerControls.subtitle}
                  isTamil={isTamil}
                >
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
                      isTamil={isTamil}
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
                      isTamil={isTamil}
                      options={[
                        { value: "ta", label: t.tamil },
                        { value: "en", label: t.english },
                        { value: "ta-en", label: t.tamilEnglish },
                      ]}
                    />
                    <PopupSelectRow
                      label="Font Family"
                      value={draft.fontFamily}
                      onChange={(fontFamily) => updateDraft({ fontFamily })}
                      options={FONT_FAMILY_OPTIONS}
                    />
                    <PopupSelectRow
                      label="Tamil Font Family"
                      value={draft.tamilFontFamily}
                      onChange={(tamilFontFamily) => updateDraft({ tamilFontFamily })}
                      options={TAMIL_FONT_OPTIONS}
                    />
                  </div>

                  <div className="mt-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <ChoiceRow
                        label={settingsPageText.labels.referencePosition}
                        value={draft.referencePosition || (draft.showReference === false ? "hidden" : "top")}
                        onChange={(referencePosition) =>
                          updateDraft({
                            referencePosition,
                            showReference: referencePosition !== "hidden",
                          })
                        }
                        isTamil={isTamil}
                        options={[
                          { value: "top", label: settingsPageText.labels.top },
                          { value: "bottom", label: settingsPageText.labels.bottom },
                          { value: "hidden", label: settingsPageText.labels.hidden },
                        ]}
                      />
                      <SwitchRow
                        label={settingsPageText.labels.readerBox}
                        description={settingsPageText.labels.readerBoxDesc}
                        checked={draft.showReaderBox !== false}
                        onChange={(showReaderBox) => updateDraft({ showReaderBox })}
                      />
                      <SwitchRow
                        label={settingsPageText.labels.keepScreenAwake}
                        description={settingsPageText.labels.keepScreenAwakeDesc}
                        checked={draft.keepScreenAwake === true}
                        onChange={(keepScreenAwake) => updateDraft({ keepScreenAwake })}
                      />
                      {draft.language !== "en" ? (
                        <SwitchRow
                          label={settingsPageText.labels.tamilKeyboardAutoOpen}
                          description={settingsPageText.labels.tamilKeyboardAutoOpenDesc}
                          checked={draft.tamilKeyboardAutoOpen !== false}
                          onChange={(tamilKeyboardAutoOpen) => updateDraft({ tamilKeyboardAutoOpen })}
                        />
                      ) : null}
                    </div>
                  </div>
                </Panel>

                <Panel
                  title={settingsPageText.panels.quickModes.title}
                  subtitle={settingsPageText.panels.quickModes.subtitle}
                  isTamil={isTamil}
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <SwitchRow
                      label={settingsPageText.labels.compactCard}
                      description={settingsPageText.labels.compactCardDesc}
                      checked={draft.cardOpacity <= 0.4}
                      onChange={(checked) => updateDraft({ cardOpacity: checked ? 0.35 : 0.5 })}
                    />
                    <SwitchRow
                      label={settingsPageText.labels.wideLayout}
                      description={settingsPageText.labels.wideLayoutDesc}
                      checked={draft.readerWidth >= 1040}
                      onChange={(checked) => updateDraft({ readerWidth: checked ? 1120 : 900 })}
                    />
                  </div>
                </Panel>
              </>
            ) : null}

            {tab === "visual" ? (
              <>
                <Panel
                  title={settingsPageText.panels.backgroundStudio.title}
                  subtitle={settingsPageText.panels.backgroundStudio.subtitle}
                  isTamil={isTamil}
                >
                  <div className="grid gap-4 lg:grid-cols-[0.7fr,1.3fr]">
                    <div className="space-y-4">
                      <ChoiceRow
                        label={settingsPageText.labels.backgroundType}
                        value={draft.bgType === "gradient" ? "gradient" : draft.bgType === "motion" ? "motion" : "image"}
                        onChange={(mode) => updateDraft({ bgType: mode, bgIndex: draft.bgIndex ?? 0 })}
                        isTamil={isTamil}
                        options={[
                          { value: "image", label: t.imageBackgrounds },
                          { value: "motion", label: t.motionBackground },
                          { value: "gradient", label: t.gradientBackgrounds },
                        ]}
                      />

                      <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                        <p className="text-sm font-medium text-white">{t.customBackground}</p>
                        <p className="mt-2 text-xs leading-6 text-slate-400">{t.customBackgroundIntro}</p>
                        <label className="mt-4 block">
                          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                            {t.imageUrl}
                          </span>
                          <input
                            type="url"
                            value={backgroundUrl}
                            onChange={(event) => setBackgroundUrl(event.target.value)}
                            placeholder="https://example.com/background.jpg"
                            className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400/40"
                          />
                        </label>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={handleBackgroundUrlApply}
                            disabled={!backgroundUrl.trim()}
                            className="rounded-xl border border-sky-400/30 bg-sky-500/10 px-4 py-2.5 text-sm font-semibold text-sky-100 transition hover:border-sky-300/50 hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {t.useImageLink}
                          </button>
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
                              onClick={() => {
                                setBackgroundUrl("");
                                updateDraft({ customBackground: null, bgType: "image", bgIndex: 0 });
                              }}
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
                        {draft.bgType === "gradient"
                          ? t.gradientBackgroundsIntro
                          : draft.bgType === "motion"
                          ? t.motionBackgroundsIntro
                          : t.imageBackgroundsIntro}
                      </p>
                      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                        {activeBackgrounds.map((item, index) => {
                          const isGradientItem = typeof item === "string" && item.startsWith("linear-gradient");
                          const isMotionItem = draft.bgType === "motion";

                          return (
                            <BackgroundTile
                              key={`${draft.bgType}-${index}`}
                              active={isMotionItem ? draft.motionBackground === item.value : draft.bgIndex === index}
                              onClick={() =>
                                updateDraft(
                                  isMotionItem
                                    ? { bgType: "motion", motionBackground: item.value }
                                    : { bgType: isGradientItem ? "gradient" : "image", bgIndex: index }
                                )
                              }
                            >
                              {isMotionItem ? (
                                <div className="relative h-24 w-full overflow-hidden bg-slate-950">
                                  <MotionBackground variant={item.value} />
                                  <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/70 to-transparent px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                                    {t[item.key]}
                                  </div>
                                </div>
                              ) : isGradientItem ? (
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

                <Panel
                  title={settingsPageText.panels.visualShortcuts.title}
                  subtitle={settingsPageText.panels.visualShortcuts.subtitle}
                  isTamil={isTamil}
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <SwitchRow
                      label={settingsPageText.labels.referenceFirst}
                      description={settingsPageText.labels.referenceFirstDesc}
                      checked={(draft.referencePosition || (draft.showReference === false ? "hidden" : "top")) === "top"}
                      onChange={(checked) =>
                        updateDraft({
                          referencePosition: checked ? "top" : "bottom",
                          showReference: true,
                        })
                      }
                    />
                    <SwitchRow
                      label={settingsPageText.labels.gradientMood}
                      description={settingsPageText.labels.gradientMoodDesc}
                      checked={draft.bgType === "gradient"}
                      onChange={(checked) => updateDraft({ bgType: checked ? "gradient" : "image", bgIndex: 0 })}
                    />
                  </div>
                </Panel>
              </>
            ) : null}

            {tab === "app" ? (
              <>
                <Panel
                  title={settingsPageText.panels.installApp.title}
                  subtitle={settingsPageText.panels.installApp.subtitle}
                  isTamil={isTamil}
                >
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
                        {isInstalled ? t.installed : canInstall ? t.installNow : settingsPageText.labels.howToInstall}
                      </button>
                    </div>
                  </div>
                </Panel>

                <Panel
                  title={settingsPageText.panels.presentationDefaults.title}
                  subtitle={settingsPageText.panels.presentationDefaults.subtitle}
                  isTamil={isTamil}
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <ChoiceRow
                      label={t.presets}
                      value={draft.presentationPreset}
                      onChange={(presentationPreset) => updateDraft({ presentationPreset, ...(presentationPresetMap[presentationPreset] || {}) })}
                      isTamil={isTamil}
                      options={[
                        { value: "horizontal", label: t.fullScreenHorizontal },
                        { value: "primary", label: t.fullScreenPrimary },
                        { value: "stretch", label: settingsPageText.labels.stretch },
                        { value: "center", label: settingsPageText.labels.centerFocus },
                        { value: "minimal", label: settingsPageText.labels.minimal },
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
                    <PopupSelectRow
                      label="Presentation Font"
                      value={draft.presentationFontFamily}
                      onChange={(presentationFontFamily) => updateDraft({ presentationFontFamily })}
                      options={FONT_FAMILY_OPTIONS}
                    />
                    <StepControl
                      label="Letter Spacing"
                      value={draft.presentationLetterSpacing}
                      valueLabel={`${draft.presentationLetterSpacing}px`}
                      min={0}
                      max={12}
                      step={1}
                      onChange={(presentationLetterSpacing) => updateDraft({ presentationLetterSpacing })}
                    />
                    <StepControl
                      label="Overlay Opacity"
                      value={draft.presentationOverlayOpacity}
                      valueLabel={`${Math.round(draft.presentationOverlayOpacity * 100)}%`}
                      min={0.2}
                      max={0.95}
                      step={0.05}
                      onChange={(presentationOverlayOpacity) => updateDraft({ presentationOverlayOpacity })}
                    />
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <SwitchRow label={t.enableShadow} description={settingsPageText.labels.shadowDesc} checked={draft.presentationShadow} onChange={(presentationShadow) => updateDraft({ presentationShadow })} />
                    <SwitchRow label={t.enableBox} description={settingsPageText.labels.boxDesc} checked={draft.presentationBox} onChange={(presentationBox) => updateDraft({ presentationBox })} />
                    <SwitchRow label={t.enableUppercase} description={settingsPageText.labels.uppercaseDesc} checked={draft.presentationUppercase} onChange={(presentationUppercase) => updateDraft({ presentationUppercase })} />
                    <SwitchRow label={t.enableTransition} description="Fade changes between presentation states." checked={draft.presentationTransition} onChange={(presentationTransition) => updateDraft({ presentationTransition })} />
                    <SwitchRow label={t.enableLineWrap} description="Wrap long presentation lines instead of letting them run wide." checked={draft.presentationLineWrap} onChange={(presentationLineWrap) => updateDraft({ presentationLineWrap })} />
                    <SwitchRow label={t.enableBorder} description="Draw a subtle border around the presentation card." checked={draft.presentationBorder} onChange={(presentationBorder) => updateDraft({ presentationBorder })} />
                  </div>
                </Panel>
              </>
            ) : null}
          </div>

          <div className="min-w-0 space-y-6">
            <Panel
              title={settingsPageText.panels.livePreview.title}
              subtitle={settingsPageText.panels.livePreview.subtitle}
              isTamil={isTamil}
            >
              <div
                className="relative overflow-hidden rounded-[1.8rem] border border-white/10 p-4"
                style={{
                  background: previewBackground || "#07111f",
                  backgroundImage:
                    previewBackground && !previewBackground.startsWith("linear-gradient")
                      ? previewBackground
                      : undefined,
                  backgroundSize: previewBackground ? "cover" : undefined,
                  backgroundPosition: previewBackground ? "center" : undefined,
                }}
              >
                {previewDraft.bgType === "motion" ? (
                  <MotionBackground variant={previewDraft.motionBackground} />
                ) : null}
                <div
                  ref={previewCardRef}
                  className={`relative z-10 ${previewDraft.showReaderBox === false ? "px-0 py-2 shadow-none border-transparent bg-transparent" : "rounded-[1.6rem] border border-white/10 px-5 py-5 shadow-2xl shadow-black/20"}`}
                  style={{
                    maxWidth: `${previewDraft.readerWidth}px`,
                    minHeight: "24rem",
                    background: previewDraft.showReaderBox === false ? "transparent" : `rgba(2, 6, 23, ${previewDraft.cardOpacity})`,
                    backdropFilter: previewDraft.showReaderBox === false ? "none" : "blur(12px)",
                    fontFamily: getReaderFontFamily(previewDraft, previewDraft.language),
                  }}
                >
                  {(previewDraft.referencePosition || (previewDraft.showReference === false ? "hidden" : "top")) === "top" ? (
                    <p
                      className={`font-bold text-cyan-100/90 ${
                        isTamil ? "text-base tracking-normal" : "text-sm uppercase tracking-[0.18em]"
                      }`}
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
                      fontFamily: getReaderFontFamily(previewDraft, previewDraft.language),
                    }}
                  >
                    {t.previewVerse}
                  </p>
                  {isBilingual ? (
                    <p
                      className="mt-4 text-slate-200"
                      style={{
                        fontSize: `${Math.max(previewFontSize - 6, 18)}px`,
                        lineHeight: Math.max(previewDraft.lineHeight - 0.1, 1.5),
                        textAlign: previewDraft.textAlign,
                        overflowWrap: "break-word",
                        fontFamily: getReaderFontFamily(previewDraft, "en"),
                      }}
                    >
                      {t.previewVerseEnglish}
                    </p>
                  ) : null}
                  {(previewDraft.referencePosition || (previewDraft.showReference === false ? "hidden" : "top")) === "bottom" ? (
                    <p
                      className={`mt-4 font-bold text-cyan-100/90 ${
                        isTamil ? "text-base tracking-normal" : "text-sm uppercase tracking-[0.18em]"
                      }`}
                      style={{ textAlign: previewDraft.textAlign }}
                    >
                      {t.previewRef}
                    </p>
                  ) : null}
                </div>
              </div>
            </Panel>

            <Panel
              title={settingsPageText.panels.snapshot.title}
              subtitle={settingsPageText.panels.snapshot.subtitle}
              isTamil={isTamil}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <MetricPill label={t.textAlign} value={previewDraft.textAlign} isTamil={isTamil} />
                <MetricPill
                  label={settingsPageText.labels.background}
                  value={
                    previewDraft.bgType === "gradient"
                      ? settingsPageText.labels.gradient
                      : previewDraft.bgType === "motion"
                      ? t.motionBackground
                      : previewDraft.bgType === "custom"
                      ? settingsPageText.labels.custom
                      : settingsPageText.labels.image
                  }
                  isTamil={isTamil}
                />
                <MetricPill label={t.cardOpacity} value={`${Math.round(previewDraft.cardOpacity * 100)}%`} isTamil={isTamil} />
                <MetricPill
                  label={settingsPageText.labels.referencePosition}
                  value={(() => {
                    const position = previewDraft.referencePosition || (previewDraft.showReference === false ? "hidden" : "top");
                    if (position === "bottom") return settingsPageText.labels.bottom;
                    if (position === "hidden") return settingsPageText.labels.hidden;
                    return settingsPageText.labels.top;
                  })()}
                  isTamil={isTamil}
                />
                <MetricPill label={settingsPageText.labels.readerBox} value={previewDraft.showReaderBox === false ? t.no : t.yes} isTamil={isTamil} />
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}
