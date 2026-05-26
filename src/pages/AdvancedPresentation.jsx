import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { QRCode } from "react-qr-code";

import useAppSettings from "../hooks/useAppSettings";
import useLibraryData from "../hooks/useLibraryData";
import SmoothBackground from "../components/SmoothBackground";
import {
  removeSermonQueueItem,
  setActiveSermonItem,
  setSermonDisplayMode,
} from "../utils/libraryData";
import {
  fetchPresentationServerInfo,
  getCachedPresentationServerInfo,
  getPresentationServerInfoEventName,
  getPresentationSermonSyncEventName,
  startPresentationSyncStream,
  resetPresentationSyncStream,
  pushPresentationSermonState,
} from "../utils/presentationBackend";
import {
  getActiveRemoteDevices,
  getRemotePresenceEventName,
  startRemotePresenceStream,
  syncRemoteDevicesFromBackend,
  resetRemotePresenceStream,
} from "../utils/presentationRemotePresence";
import { getUIText } from "../utils/uiText";
import MotionBackground from "../components/MotionBackground";
import { getPresentationFontFamily, getCustomGradientString } from "../utils/appearance";
import { getSiteUrl } from "../utils/siteUrl";
import { optimizeImage } from "../utils/imageOptimization";
import { getRoomCode, generateRoomCode, setRoomCode } from "../utils/roomCode";

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
      className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#000000]"
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
      <p className="mb-2 text-sm text-stone-300">{label}</p>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3 pr-10 text-sm text-slate-100 outline-none transition hover:bg-black/30 focus:border-amber-500/40"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-white text-black">
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-stone-400">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </label>
  );
});

const CheckboxControl = memo(function CheckboxControl({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-3 text-sm text-stone-200">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-white/20 bg-black/20 accent-amber-400"
        />
        <span>{label}</span>
      </label>
    );
  });

const ColorChip = memo(function ColorChip({ label, value, onChange }) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-stone-200">
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
      type="button"
      onClick={onClick}
      className={`overflow-hidden rounded-2xl border-2 transition ${
        active ? "border-cyan-300 shadow-lg shadow-cyan-950/30" : "border-white/10 hover:border-white/20"
      }`}
    >
      {children}
    </button>
  );
});

const ControlPanel = memo(function ControlPanel({ title, subtitle, children, className = "" }) {
  return (
    <div className={`rounded-[2.2rem] border border-white/10 bg-black/20 p-6 backdrop-blur-xl ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <p className="mt-1 text-sm text-stone-400">{subtitle}</p>
      </div>
      {children}
    </div>
  );
});

const ConnectedDevicesPanel = memo(function ConnectedDevicesPanel() {
  const [remoteDevices, setRemoteDevices] = useState(() => getActiveRemoteDevices());

  useEffect(() => {
    const syncRemoteDevices = (event) => {
      if (event?.type === getRemotePresenceEventName() && Array.isArray(event.detail)) {
        setRemoteDevices(event.detail);
        return;
      }

      setRemoteDevices(getActiveRemoteDevices());
    };

    syncRemoteDevices();
    startRemotePresenceStream();
    void syncRemoteDevicesFromBackend();

    window.addEventListener("storage", syncRemoteDevices);
    window.addEventListener(getRemotePresenceEventName(), syncRemoteDevices);

    const refreshId = window.setInterval(() => {
      setRemoteDevices(getActiveRemoteDevices());
    }, 5000);

    return () => {
      window.removeEventListener("storage", syncRemoteDevices);
      window.removeEventListener(getRemotePresenceEventName(), syncRemoteDevices);
      window.clearInterval(refreshId);
    };
  }, []);

  return (
    <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-400">
            Connected Devices
          </p>
          <p className="mt-2 text-xs leading-6 text-stone-400">
            Active remotes seen in the last 15 seconds.
          </p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-stone-200">
          {remoteDevices.length}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {remoteDevices.length ? (
          remoteDevices.map((device) => (
            <div
              key={device.id}
              className="rounded-2xl border border-emerald-400/15 bg-emerald-400/10 px-4 py-3"
            >
              <p className="text-sm font-semibold text-white">{device.label}</p>
              <p className="mt-1 text-xs leading-6 text-emerald-100/80">
                {device.platform} connected
              </p>
            </div>
          ))
        ) : (
          <p className="rounded-2xl border border-dashed border-white/10 px-4 py-4 text-sm text-stone-400">
            No remote devices connected yet.
          </p>
        )}
      </div>
    </div>
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
  const features = ["noopener=yes", "noreferrer=yes", "popup=yes"];

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


function isLocalOnlyHost(hostname) {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname === "::1"
  );
}

function splitIntoPresentationLines(text = "", lineCount = 2) {
  const normalized = text.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return [];
  }

  const words = normalized.split(" ");

  if (words.length <= lineCount) {
    return [normalized];
  }

  const targetLength = Math.ceil(normalized.length / lineCount);
  const lines = [];
  let currentLine = "";

  words.forEach((word, index) => {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;
    const wordsRemaining = words.length - index - 1;
    const linesRemaining = lineCount - lines.length - 1;
    const shouldBreak =
      nextLine.length >= targetLength &&
      linesRemaining > 0 &&
      wordsRemaining >= linesRemaining;

    if (shouldBreak) {
      lines.push(nextLine);
      currentLine = "";
      return;
    }

    currentLine = nextLine;
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.filter(Boolean);
}

import { getFontCss, FONT_FAMILY_OPTIONS, TAMIL_FONT_OPTIONS } from "../utils/appearance";

function PresentationPreviewText({ text, style, twoLines = false, settings }) {
  if (text?.includes("\n")) {
    const parts = text.split("\n");
    return (
      <div className="flex flex-col gap-[0.8em]">
        {parts.map((part, index) => {
          const lineStyle = { ...style, margin: 0 };
          
          if (parts.length === 2 && settings) {
            if (index === 0) {
              lineStyle.fontFamily = getFontCss(settings.tamilFontFamily, TAMIL_FONT_OPTIONS);
            } else {
              lineStyle.fontFamily = getFontCss(settings.fontFamily, FONT_FAMILY_OPTIONS);
            }
          }

          return (
            <p
              key={index}
              className={`font-bold ${twoLines ? "text-center" : ""}`}
              style={lineStyle}
            >
              {part}
            </p>
          );
        })}
      </div>
    );
  }

  const lines = twoLines ? splitIntoPresentationLines(text, 2) : [text];

  return (
    <>
      {lines.map((line, index) => (
        <p
          key={`${line}-${index}`}
          className={`font-bold ${index > 0 ? "mt-2" : ""}`}
          style={{ ...style, margin: 0 }}
        >
          {line}
        </p>
      ))}
    </>
  );
}

const StatusCard = memo(function StatusCard({ label, value, icon, colorClass }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-${colorClass}/20 text-${colorClass}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">{label}</p>
          <p className="mt-0.5 text-sm font-bold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
});

export default function AdvancedPresentation() {
  const [settings, update] = useAppSettings();
  const libraryData = useLibraryData();
  const [profileName, setProfileName] = useState("");

  const saveProfile = () => {
    if (!profileName.trim()) return;
    const presentationSettings = Object.keys(settings).reduce((acc, key) => {
      if (
        key.startsWith("presentation") ||
        key.startsWith("stage") ||
        key.startsWith("bg") ||
        key.startsWith("motion") ||
        key.startsWith("customGradient") ||
        key.startsWith("customBackground") ||
        key.startsWith("cardOpacity")
      ) {
        if (key !== "presentationProfiles") {
          acc[key] = settings[key];
        }
      }
      return acc;
    }, {});

    const newProfile = { id: Date.now(), name: profileName.trim(), data: presentationSettings };
    const updatedProfiles = [...(settings.presentationProfiles || []), newProfile];
    update({ presentationProfiles: updatedProfiles });
    setProfileName("");
  };

  const loadProfile = (profile) => {
    update({ ...profile.data });
  };

  const deleteProfile = (id) => {
    const updatedProfiles = (settings.presentationProfiles || []).filter((p) => p.id !== id);
    update({ presentationProfiles: updatedProfiles });
  };
  const previewTextRef = useRef(null);
  const previewContainerRef = useRef(null);
  const [previewFontSize, setPreviewFontSize] = useState(
    Math.min(settings.presentationMaxFontSize || 80, 80)
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
  const [serverInfo, setServerInfo] = useState(() => getCachedPresentationServerInfo());
  const [selectedOriginIndex, setSelectedOriginIndex] = useState(0);

  const candidateOrigins = useMemo(() => {
    const list = [...(serverInfo?.candidateOrigins || [])];
    const publicUrl = getSiteUrl();

    if (publicUrl && !publicUrl.includes("localhost") && !list.includes(publicUrl)) {
      list.push(publicUrl);
    }

    return list;
  }, [serverInfo]);

  const remoteOrigin = isLocalOnlyHost(window.location.hostname)
    ? candidateOrigins[selectedOriginIndex] || null
    : window.location.origin;

  const baseRemoteUrl = remoteOrigin
    ? `${remoteOrigin}/presentation-remote`
    : `${window.location.origin}/presentation-remote`;
  
  const [activeRoomCode, setActiveRoomCode] = useState(getRoomCode());
  const remoteUrl = `${baseRemoteUrl}?room=${activeRoomCode}`;
  const remoteNeedsPublicHost = !remoteOrigin || isLocalOnlyHost(new URL(remoteUrl).hostname);
  const [copiedRemoteUrl, setCopiedRemoteUrl] = useState(false);

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

  useEffect(() => {
    const syncServerInfo = (event) => {
      if (event?.type === getPresentationServerInfoEventName() && event.detail) {
        setServerInfo(event.detail);
      }
    };

    window.addEventListener(getPresentationServerInfoEventName(), syncServerInfo);
    void fetchPresentationServerInfo();

    return () => {
      window.removeEventListener(getPresentationServerInfoEventName(), syncServerInfo);
    };
  }, []);

  const previewItem = activeItem || { text: t.previewVerse, reference: t.previewRef };
  const previewReference = activeItem
    ? `${activeItem.bookTamil} ${activeItem.chapter}:${activeItem.verse}`
    : t.previewRef;
  const presentationFont = getPresentationFontFamily(settings);

  const previewBackground = useMemo(() => {
    if (settings.bgType === "motion" || !settings.bgType) {
      return null;
    }

    if (settings.bgType === "custom" && settings.customBackground) {
      return `url(${settings.customBackground})`;
    }

    return settings.bgType === "gradient"
      ? getCustomGradientString(settings.customGradientType, settings.customGradientColor1, settings.customGradientColor2)
      : `url(${backgrounds[settings.bgIndex]})`;
  }, [settings.bgIndex, settings.bgType, settings.customBackground]);

  const stageBackground = useMemo(() => {
    if (settings.stageGreenScreen) {
      return "#10b981"; // Modern emerald-green for chroma key
    }
    return `url(${backgrounds[settings.stageStillBackground || 0]})`;
  }, [settings.stageStillBackground, settings.stageGreenScreen]);

  const updateSettings = (patch) => update({ ...settings, ...patch });

  const handleCopyRemoteUrl = async () => {
    try {
      await navigator.clipboard.writeText(remoteUrl);
      setCopiedRemoteUrl(true);
      window.setTimeout(() => setCopiedRemoteUrl(false), 1800);
    } catch {
      setCopiedRemoteUrl(false);
    }
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      const optimized = await optimizeImage(file);
      updateSettings({ stageLogoImage: optimized, presentationShowCustomLogo: true });
    } catch (error) {
      console.error("[AdvancedPresentation] Logo Optimization failed:", error);
    }
    
    event.target.value = "";
  };

  useEffect(() => {
    let mounted = true;
    let rafId = null;

    const fitPreview = () => {
      const container = previewContainerRef.current;
      const textEl = previewTextRef.current;
      if (!container || !textEl) return;

      const max = Math.min((settings.presentationMaxFontSize || 80) * 0.5, 42);
      const min = 14;

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
  }, [activeItem?.text, settings.presentationMaxFontSize, settings.presentationJustify]);

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
  }, [activeItem?.text, settings.presentationMaxFontSize, settings.presentationJustify]);

  return (
    <div className="hidden px-4 pb-6 pt-4 md:block md:px-6 md:pt-6">
      <div className="w-full space-y-5">
        <section className="overflow-hidden rounded-[2rem] border border-white/10  p-5 shadow-2xl shadow-black/30 md:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-stone-400">
            {t.screenSetup}
          </p>
          <h1 className="mt-3 text-3xl font-bold text-white md:text-5xl">
            {t.advancedPresentation}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-300 md:text-base">
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
              className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black shadow-lg shadow-white/20 transition hover:bg-stone-200"
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

        <section className="rounded-[1.8rem] border border-white/10 bg-[#000000] p-5 shadow-xl shadow-black/20">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-400">
                Live Queue
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white">
                {activeItem
                  ? `${activeItem.bookTamil} ${activeItem.chapter}:${activeItem.verse}`
                  : "No active verse"}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-300">
                The display windows below update live from this sermon queue. Pick which verse should show right now, then open the main or stage screen in a separate window.
              </p>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-stone-300">
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
                      ? "border-zinc-600/40 bg-zinc-700/10"
                      : "border-white/10 bg-white/[0.03]"
                  }`}
                >
                  <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                      <p className="text-base font-semibold text-white">
                        {item.bookTamil} {item.chapter}:{item.verse}
                      </p>
                      <p className="mt-2 line-clamp-2 text-sm leading-7 text-stone-300">
                        {item.text}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveSermonItem(item)}
                        className="rounded-xl bg-[#000000] px-4 py-2.5 text-sm font-semibold text-white"
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
              <p className="rounded-[1.4rem] border border-dashed border-white/10 px-4 py-5 text-sm text-stone-400">
                Add verses from the chapter screen using the `Sermon` button, then control them here.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-[1.8rem] border border-white/10 bg-[#000000] p-5 shadow-xl shadow-black/20">
          <div className="grid gap-8 lg:grid-cols-[2fr,0.9fr]">
            {/* Left Side: Inputs and Quick Display Modes */}
            <div className="flex flex-col space-y-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <p className="mb-2 text-sm text-stone-300">Title Slide Title</p>
                  <input
                    type="text"
                    value={settings.presentationTitle}
                    onChange={(e) => updateSettings({ presentationTitle: e.target.value })}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-zinc-600/40"
                  />
                </label>

                <label className="block">
                  <p className="mb-2 text-sm text-stone-300">Title Slide Subtitle</p>
                  <input
                    type="text"
                    value={settings.presentationSubtitle}
                    onChange={(e) => updateSettings({ presentationSubtitle: e.target.value })}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-zinc-600/40"
                  />
                </label>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <p className="mb-2 text-sm text-stone-300">Announcement Title</p>
                  <input
                    type="text"
                    value={settings.presentationAnnouncementTitle}
                    onChange={(e) => updateSettings({ presentationAnnouncementTitle: e.target.value })}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-zinc-600/40"
                  />
                </label>

                <label className="block">
                  <p className="mb-2 text-sm text-stone-300">Announcement Body</p>
                  <textarea
                    value={settings.presentationAnnouncementBody}
                    onChange={(e) => updateSettings({ presentationAnnouncementBody: e.target.value })}
                    rows={3}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-zinc-600/40"
                  />
                </label>
              </div>

              <div>
                <p className="mb-2 text-sm text-stone-300">{t.logoImage || "Logo Image"}</p>
                <div className="flex h-36 items-center justify-center rounded-[1.5rem] border border-white/10 bg-black/40 p-4">
                  {settings.stageLogoImage ? (
                    <img src={settings.stageLogoImage} alt="Presentation logo" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <span className="text-sm text-stone-500">{t.uploadLogo || "Upload Logo"}</span>
                  )}
                </div>
                <div className="mt-3 flex gap-3">
                  <button type="button" onClick={() => logoInputRef.current?.click()} className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15">{t.uploadLogo || "Upload Logo"}</button>
                  {settings.stageLogoImage ? (
                    <button type="button" onClick={() => updateSettings({ stageLogoImage: null, presentationShowCustomLogo: false })} className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15">{t.removeLogo || "Remove Logo"}</button>
                  ) : null}
                </div>
                <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </div>

              <div>
                <p className="mb-2 text-sm text-stone-300">Quick Display Modes</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSermonDisplayMode("live")}
                    className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${displayMode === "live" ? "bg-white text-black shadow-lg shadow-white/20" : "bg-white/10 text-white hover:bg-white/15"}`}
                  >
                    Live
                  </button>
                  <button
                    type="button"
                    onClick={() => setSermonDisplayMode("title")}
                    className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${displayMode === "title" ? "bg-white text-black shadow-lg shadow-white/20" : "bg-white/10 text-white hover:bg-white/15"}`}
                  >
                    Title
                  </button>
                  <button
                    type="button"
                    onClick={() => setSermonDisplayMode("logo")}
                    className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${displayMode === "logo" ? "bg-white text-black shadow-lg shadow-white/20" : "bg-white/10 text-white hover:bg-white/15"}`}
                  >
                    Logo
                  </button>
                  <button
                    type="button"
                    onClick={() => setSermonDisplayMode("announcement")}
                    className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${displayMode === "announcement" ? "bg-white text-black shadow-lg shadow-white/20" : "bg-white/10 text-white hover:bg-white/15"}`}
                  >
                    Announcement
                  </button>
                  <button
                    type="button"
                    onClick={() => setSermonDisplayMode("black")}
                    className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${displayMode === "black" ? "bg-white text-black shadow-lg shadow-white/20" : "bg-white/10 text-white hover:bg-white/15"}`}
                  >
                    Black
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side: QR Code */}
            <div className="flex flex-col h-full">
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4 text-center h-full">
                <div className="flex items-center justify-center gap-2">
                  <p className="text-sm font-semibold text-white">Phone Remote QR</p>
                  {!serverInfo ? (
                    <span className="inline-flex items-center rounded-full bg-red-400/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-400 ring-1 ring-inset ring-red-400/20">
                      Backend Offline
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 ring-1 ring-inset ring-emerald-400/20">
                      Live
                    </span>
                  )}
                </div>

                {!serverInfo ? (
                  <p className="mt-2 text-[10px] text-stone-400">
                    Run <code>npm run backend</code> to enable network discovery.
                  </p>
                ) : null}

                {candidateOrigins.length > 1 && isLocalOnlyHost(window.location.hostname) ? (
                  <div className="mt-3">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-stone-500">
                      Switch Network Address
                    </p>
                    <select
                      value={selectedOriginIndex}
                      onChange={(e) => setSelectedOriginIndex(Number(e.target.value))}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-stone-200 outline-none"
                    >
                      {candidateOrigins.map((origin, idx) => (
                        <option key={origin} value={idx} className="bg-white text-black">
                          {new URL(origin).hostname} ({idx === 0 ? "Default" : "Mirror"})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}
                
                <div className="mt-4 flex items-center justify-between rounded-xl bg-black/40 px-3 py-2 border border-white/5">
                  <div className="text-left">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Room Code</p>
                    <p className="text-sm font-bold text-white tracking-widest">{activeRoomCode}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newCode = generateRoomCode();
                      setRoomCode(newCode);
                      setActiveRoomCode(newCode);
                      resetPresentationSyncStream();
                      resetRemotePresenceStream();
                      
                      // Push our active presentation state to populate the new room instantly
                      if (libraryData?.sermon) {
                        pushPresentationSermonState({
                          ...libraryData.sermon,
                          updatedAt: Date.now()
                        });
                      }
                    }}
                    className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-stone-300 hover:bg-white/10"
                    title="Generate New Room Code"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>

                <div className="mx-auto mt-4 flex h-40 w-40 items-center justify-center rounded-2xl bg-white p-3">
                  <QRCode value={remoteUrl} size={136} bgColor="#ffffff" fgColor="#000000" level="M" />
                </div>
                <p className="mt-3 break-all text-xs leading-6 text-stone-400">{remoteUrl}</p>
                <button
                  type="button"
                  onClick={handleCopyRemoteUrl}
                  className="mt-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
                >
                  {copiedRemoteUrl ? "Copied" : "Copy Link"}
                </button>
                {remoteNeedsPublicHost ? (
                  <div className="flex flex-col">
                    <p className="rounded-xl border border-zinc-600/20 bg-zinc-700/10 px-3 py-2 text-xs leading-6 text-amber-100">
                      Your phone usually cannot reach "localhost". {candidateOrigins.length > 1 ? "Try selecting a different address above." : "Make sure the backend is running on your LAN."}
                    </p>
                  </div>
                ) : (
                  <p className="mt-3 text-xs leading-6 text-stone-500">
                    Make sure your phone is on the same Wi-Fi network to use this address.
                  </p>
                )}

                <ConnectedDevicesPanel />
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-[1.6rem] border border-white/10 bg-[#000000] p-4">
            <div className="mb-4">
              <CheckboxControl
                label={t.enableMainPresentation}
                checked={settings.enableMainPresentation}
                onChange={(value) => updateSettings({ enableMainPresentation: value })}
              />
            </div>
            <div className="mb-4">
              <CheckboxControl
                label={t.syncLiveVerse || "Sync Live Verse"}
                checked={settings.syncLiveVerse || false}
                onChange={(value) => updateSettings({ syncLiveVerse: value })}
              />
            </div>
            <SelectControl
              label={t.mainPresentationScreen}
              value={settings.mainPresentationScreen}
              onChange={(value) => updateSettings({ mainPresentationScreen: value })}
              options={screenOptions}
            />
          </div>

          <div className="rounded-[1.6rem] border border-white/10 bg-[#000000] p-4">
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

        <AccordionSection title="Configuration Profiles">
          <div className="flex flex-col gap-6">
            <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
              <p className="mb-4 text-sm font-semibold text-stone-300">Saved Profiles</p>
              {settings.presentationProfiles?.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {settings.presentationProfiles.map((p) => (
                    <div key={p.id} className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2">
                      <span className="text-sm font-medium text-white">{p.name}</span>
                      <button onClick={() => loadProfile(p)} className="ml-2 rounded bg-amber-500/20 px-2 py-1 text-xs font-semibold text-amber-400 hover:bg-amber-500/30">Load</button>
                      <button onClick={() => deleteProfile(p.id)} className="rounded bg-red-500/20 px-2 py-1 text-xs font-semibold text-red-400 hover:bg-red-500/30">X</button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-stone-500">No saved profiles yet.</p>
              )}
              
              <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
                <input
                  type="text"
                  placeholder="Profile Name (e.g. Sunday Morning)"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-stone-500 outline-none focus:border-amber-500/50"
                />
                <button
                  onClick={saveProfile}
                  className="whitespace-nowrap rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Save Current
                </button>
              </div>
            </div>
          </div>
        </AccordionSection>

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
                <p className="mb-2 text-sm text-stone-300">{t.maximumFontSize}</p>
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
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-zinc-600/40"
                />
              </label>

              <SelectControl
                label={t.textAlign}
                value={settings.presentationJustify}
                onChange={(value) => updateSettings({ presentationJustify: value })}
                options={[
                  { value: "left", label: "Left" },
                  { value: "center", label: t.center },
                  { value: "right", label: "Right" },
                ]}
              />

              <SelectControl
                label={t.verticalAlign || "Vertical Alignment"}
                value={settings.presentationVerticalAlign || "center"}
                onChange={(value) => updateSettings({ presentationVerticalAlign: value })}
                options={[
                  { value: "top", label: "Top" },
                  { value: "center", label: t.center || "Center" },
                  { value: "bottom", label: "Bottom" },
                ]}
              />

              <label className="block">
                <p className="mb-2 text-sm text-stone-300">Letter Spacing</p>
                <input
                  type="number"
                  min={0}
                  max={12}
                  value={settings.presentationLetterSpacing || 0}
                  onChange={(e) =>
                    updateSettings({
                      presentationLetterSpacing: Number(e.target.value) || 0,
                    })
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-zinc-600/40"
                />
              </label>

              <label className="block mt-4">
                <p className="mb-2 text-sm text-stone-300">{t.lineSpacing || "Line Spacing"}</p>
                <input
                  type="number"
                  step="0.1"
                  min={1}
                  max={3}
                  value={settings.presentationLineHeight || 1.2}
                  onChange={(e) =>
                    updateSettings({
                      presentationLineHeight: Number(e.target.value) || 1.2,
                    })
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-zinc-600/40"
                />
              </label>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <CheckboxControl label={t.enableTransition} checked={settings.presentationTransition} onChange={(value) => updateSettings({ presentationTransition: value })} />
              <CheckboxControl label={t.enableOutline} checked={settings.presentationOutline} onChange={(value) => updateSettings({ presentationOutline: value })} />
              <CheckboxControl label={t.enableShadow} checked={settings.presentationShadow} onChange={(value) => updateSettings({ presentationShadow: value })} />
              <CheckboxControl label={t.enableUppercase} checked={settings.presentationUppercase} onChange={(value) => updateSettings({ presentationUppercase: value })} />
              <CheckboxControl label={t.enableBorder} checked={settings.presentationBorder} onChange={(value) => updateSettings({ presentationBorder: value })} />
              <CheckboxControl label={t.enableBox} checked={settings.presentationBox} onChange={(value) => updateSettings({ presentationBox: value })} />
              <CheckboxControl label={t.enableHeaderBox} checked={settings.presentationHeaderBox} onChange={(value) => updateSettings({ presentationHeaderBox: value })} />
              <CheckboxControl label={t.enableLineWrap} checked={settings.presentationLineWrap} onChange={(value) => updateSettings({ presentationLineWrap: value })} />
              <CheckboxControl label={t.bilingualProjection || "Bilingual Projection"} checked={settings.presentationBilingual} onChange={(value) => updateSettings({ presentationBilingual: value })} />
              <CheckboxControl label={t.greenScreenMode || "Chroma Key (Green Screen)"} checked={settings.presentationGreenScreen} onChange={(value) => updateSettings({ presentationGreenScreen: value })} />
              <CheckboxControl label={t.showLyricsInTwoLines} checked={settings.presentationTwoLines} onChange={(value) => updateSettings({ presentationTwoLines: value })} />
              <CheckboxControl label={t.showDateAndTime} checked={settings.presentationShowDateTime} onChange={(value) => updateSettings({ presentationShowDateTime: value })} />
              <CheckboxControl label={t.showVerseviewLogo} checked={settings.presentationShowVerseLogo} onChange={(value) => updateSettings({ presentationShowVerseLogo: value })} />
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
                <p className="mb-2 text-sm text-stone-300">{t.stageScreenStyle}</p>
                <div className="grid gap-3 md:grid-cols-2">
                  <CheckboxControl label={t.greenScreen} checked={settings.stageGreenScreen} onChange={(value) => updateSettings({ stageGreenScreen: value })} />
                  <CheckboxControl label={t.windowView} checked={settings.stageWindowView} onChange={(value) => updateSettings({ stageWindowView: value })} />
                  <CheckboxControl label={t.smallWindow} checked={settings.stageSmallWindow} onChange={(value) => updateSettings({ stageSmallWindow: value })} />
                  <CheckboxControl label={t.showDateAndTime} checked={settings.stageShowDateTime} onChange={(value) => updateSettings({ stageShowDateTime: value })} />
                </div>
              </div>
            </div>

            <label className="block">
              <p className="mb-2 text-sm text-stone-300">{t.message}</p>
              <textarea
                value={settings.stageMessage}
                onChange={(e) => updateSettings({ stageMessage: e.target.value })}
                rows={3}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-zinc-600/40"
              />
            </label>

            <div className="flex flex-wrap gap-3">
              <button onClick={() => updateSettings({ stageMessageVisible: true })} className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15">{t.showMessage}</button>
              <button onClick={() => updateSettings({ stageMessage: "", stageMessageVisible: false })} className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15">{t.clearMessage}</button>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">{t.stillBackground}</p>
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
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">{t.textColor}</p>
                  <div className="flex flex-wrap gap-3">
                    <ColorChip label={t.textOne} value={settings.stageTextColor1} onChange={(stageTextColor1) => updateSettings({ stageTextColor1 })} />
                    <ColorChip label={t.textTwo} value={settings.stageTextColor2} onChange={(stageTextColor2) => updateSettings({ stageTextColor2 })} />
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">{t.overlayColor}</p>
                  <ColorChip label={t.overlay} value={settings.stageOverlayColor} onChange={(stageOverlayColor) => updateSettings({ stageOverlayColor })} />
                </div>
              </div>
            </div>
          </div>
        </AccordionSection>

        <AccordionSection title="Live Previews">
          <div className="space-y-8">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">Main Preview</p>
              <div className="relative flex h-52 items-center justify-center overflow-hidden rounded-[1.5rem] border border-white/10 bg-black p-4 shadow-inner shadow-black/40">
                <SmoothBackground
                  background={settings.presentationGreenScreen ? "#00b140" : settings.background}
                  bgType={settings.presentationGreenScreen ? "gradient" : settings.bgType}
                  customBackground={settings.customBackground}
                  motionVariant={settings.motionBackground}
                />
                <div
                  className={`relative z-10 flex w-full flex-1 min-h-0 flex-col justify-center rounded-2xl px-5 py-4 text-center ${settings.presentationBox ? "backdrop-blur-sm" : ""}`}
                  style={{
                    background: settings.presentationBox ? "rgba(0,0,0,0.45)" : "transparent",
                    boxShadow: settings.presentationBorder ? "0 0 0 1px rgba(255,255,255,0.2) inset" : "none",
                    maxWidth: settings.presentationPreset === "horizontal" ? "100%" : "55rem",
                    height: "100%",
                  }}
                >
                  {settings.showReference && (
                    <p
                      className={`mb-2 text-xs font-bold uppercase tracking-[0.24em] text-white/90 ${
                        settings.presentationHeaderBox
                          ? "inline-flex rounded-full border border-white/10 bg-black/25 px-3 py-1.5"
                          : ""
                      }`}
                      style={{ flexShrink: 0 }}
                    >
                      {previewReference}
                    </p>
                  )}
                  <div 
                    ref={previewContainerRef} 
                    className={`flex flex-1 flex-col overflow-hidden w-full min-h-0 ${
                      settings.presentationVerticalAlign === "top" ? "justify-start pt-2" :
                      settings.presentationVerticalAlign === "bottom" ? "justify-end pb-2" : "justify-center"
                    }`}
                  >
                    <div ref={previewTextRef}>
                      <PresentationPreviewText
                        text={previewItem.text}
                        twoLines={settings.presentationTwoLines}
                        settings={settings}
                        style={{
                          fontSize: `${previewFontSize}px`,
                          lineHeight: settings.presentationLineHeight || (settings.presentationTwoLines ? 1.08 : 1.2),
                          textAlign: settings.presentationJustify,
                          textTransform: settings.presentationUppercase ? "uppercase" : "none",
                          textShadow: settings.presentationShadow ? "0 2px 10px rgba(0,0,0,0.75)" : "none",
                          WebkitTextStroke: settings.presentationOutline ? "1px rgba(0,0,0,0.8)" : "0px",
                          whiteSpace: settings.presentationLineWrap === false ? "nowrap" : "normal",
                          overflowWrap: "normal",
                          wordBreak: "normal",
                          letterSpacing: `${settings.presentationLetterSpacing || 0}px`,
                          color: "#ffffff",
                          fontFamily: presentationFont,
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap justify-end gap-2">
                    {settings.presentationShowDateTime ? (
                      <div className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80">
                        Date / Time
                      </div>
                    ) : null}
                    {settings.presentationShowVerseLogo ? (
                      <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80">
                        Tamil Bible Premium
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">Stage Preview</p>
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
                        maxWidth: settings.stageSmallWindow ? "36rem" : "100%",
                        marginInline: settings.stageSmallWindow ? "auto" : undefined,
                      }}
                    >
                      <div
                        className={`rounded-[1.25rem] border border-white/10 bg-black/25 p-4 backdrop-blur-sm ${
                          settings.stageWindowView ? "flex flex-col justify-start" : ""
                        }`}
                      >
                        {displayMode === "title" ? (
                          <>
                            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-300">Title</p>
                            <p className="mt-3 text-2xl font-bold text-white">{settings.presentationTitle}</p>
                            <p className="mt-3 text-sm leading-6 text-stone-200">{settings.presentationSubtitle}</p>
                          </>
                        ) : displayMode === "announcement" ? (
                          <>
                            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-300">Announcement</p>
                            <p className="mt-3 text-2xl font-bold text-white">{settings.presentationAnnouncementTitle}</p>
                            <p className="mt-3 text-sm leading-6 text-stone-200">{settings.presentationAnnouncementBody}</p>
                          </>
                        ) : displayMode === "logo" ? (
                          <div className="flex h-full min-h-40 items-center justify-center">
                            {settings.presentationShowCustomLogo && settings.stageLogoImage ? (
                              <img src={settings.stageLogoImage} alt="Stage logo preview" className="max-h-32 max-w-full object-contain" />
                            ) : (
                              <div className="text-center">
                                <p className="text-2xl font-bold text-white">{settings.presentationTitle}</p>
                                <p className="mt-2 text-sm text-stone-200">{settings.presentationSubtitle}</p>
                              </div>
                            )}
                          </div>
                        ) : displayMode === "black" ? (
                          <div className="flex h-full min-h-40 items-center justify-center bg-black">
                            <p className="text-sm uppercase tracking-[0.28em] text-stone-500">Black Screen</p>
                          </div>
                        ) : (
                          <>
                            <p
                              className="text-sm font-bold"
                              style={{ color: settings.stageTextColor2 || "#f8fafc" }}
                            >
                              {previewReference}
                            </p>
                            <div ref={stagePreviewContainerRef} style={{ width: "100%", height: "100%" }}>
                              <div ref={stagePreviewTextRef} className="mt-4" style={{ fontSize: `${stagePreviewFontSize}px` }}>
                                <PresentationPreviewText
                                  text={previewItem.text}
                                  twoLines={settings.presentationTwoLines}
                                  settings={settings}
                                  style={{
                                    lineHeight: settings.presentationLineHeight || (settings.presentationTwoLines ? 1.05 : 1.2),
                                    textAlign: settings.presentationJustify || "center",
                                    textTransform: settings.presentationUppercase ? "uppercase" : "none",
                                    textShadow: settings.presentationShadow ? "0 4px 16px rgba(0,0,0,0.55)" : "none",
                                    color: settings.stageTextColor1 || "#ffffff",
                                    WebkitTextStroke: settings.presentationOutline ? "1px rgba(0,0,0,0.8)" : "0px",
                                    whiteSpace: settings.presentationLineWrap === false ? "nowrap" : "normal",
                                    overflowWrap: "normal",
                                    wordBreak: "normal",
                                    letterSpacing: `${settings.presentationLetterSpacing || 0}px`,
                                    fontFamily: presentationFont,
                                  }}
                                />
                              </div>
                            </div>
                            {settings.stagePreset !== "horizontal" && settings.stageMessage ? (
                              <div className={`mt-4 rounded-2xl border px-4 py-3 text-center ${settings.stageMessageVisible ? 'animate-pulse border-white/10 bg-red-500/20' : 'border-white/10 bg-white/5 opacity-70'}`}>
                                {!settings.stageMessageVisible && (
                                  <span className="mb-1 block text-[9px] font-bold uppercase tracking-widest text-stone-400">Draft (Not Live)</span>
                                )}
                                <p className={`text-sm font-bold ${settings.stageMessageVisible ? 'text-red-200' : 'text-stone-300'}`}>{settings.stageMessage}</p>
                              </div>
                            ) : null}
                          </>
                        )}
                      </div>

                      {settings.stagePreset === "horizontal" ? (
                        <div className="space-y-4">
                          {settings.stageShowDateTime ? (
                            <div className="rounded-[1.25rem] border border-white/10 bg-black/25 p-4 backdrop-blur-sm">
                              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-300">Date / Time</p>
                              <p className="mt-3 text-sm text-white">Clock visible on stage screen</p>
                            </div>
                          ) : null}

                          {settings.stageMessageVisible && settings.stageMessage ? (
                            <div className="rounded-[1.25rem] border border-white/10 bg-black/25 p-4 backdrop-blur-sm">
                              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-300">Message</p>
                              <p className="mt-3 text-sm leading-6 text-white">{settings.stageMessage}</p>
                            </div>
                          ) : null}

                          <div className="rounded-[1.25rem] border border-white/10 bg-black/25 p-4 backdrop-blur-sm">
                            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-300">Next Verse</p>
                            {nextItem ? (
                              <>
                                <p className="mt-3 text-sm font-bold text-white">
                                  {nextItem.bookTamil} {nextItem.chapter}:{nextItem.verse}
                                </p>
                                <p className="mt-2 text-sm leading-6 text-stone-200">{nextItem.text}</p>
                              </>
                            ) : (
                              <p className="mt-3 text-sm text-stone-300">No next verse queued yet.</p>
                            )}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

          </div>
        </AccordionSection>
      </div>
    </div>
  );
}
