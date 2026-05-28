import { memo, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { QRCode } from "react-qr-code";
import toast from "react-hot-toast";

import useAppSettings from "../hooks/useAppSettings";
import useLibraryData from "../hooks/useLibraryData";
import SmoothBackground from "../components/SmoothBackground";

const TAMIL_KEYBOARD_ROWS = [
  ["அ", "ஆ", "இ", "ஈ", "உ", "ஊ", "எ", "ஏ", "ஐ", "ஒ", "ஓ", "ஔ"],
  ["க", "ங", "ச", "ஞ", "ட", "ண", "த", "ந", "ப", "ம", "ய", "ர", "ல", "வ", "ழ", "ள", "ற", "ன"],
  ["ஜ", "ஷ", "ஸ", "ஹ", "க்ஷ", "ஶ"],
];

const TAMIL_SYMBOL_ROWS = [
  ["ஃ", "ா", "ி", "ீ", "ு", "ூ"],
  ["ெ", "ே", "ை", "ொ", "ோ", "ௌ", "்"],
];

import {
  clearSermonQueue,
  removeSermonQueueItem,
  setActiveSermonItem,
  setSermonDisplayMode,
  setSermonTickerText,
  addSavedSong,
  removeSavedSong,
  importSavedSongs,
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
import { matchTamilTextQuery, tamilToTanglish, consonantKey, normalizeRoman } from "../utils/bookSearch";
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

function PreviewCountdownTimer({ targetTime, title, subtitle, styleType = "classic" }) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!targetTime) return;
    const calc = () => {
      const now = Date.now();
      const diff = Math.max(0, targetTime - now);
      setTimeLeft(diff);
    };
    calc();
    const id = window.setInterval(calc, 200);
    return () => window.clearInterval(id);
  }, [targetTime]);

  const totalSeconds = Math.floor(timeLeft / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  
  if (styleType === "cinematic") {
    return (
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center rounded-2xl px-5 py-4 text-center">
        <div className="flex animate-pulse items-center gap-2 text-amber-500/80 mb-2">
          <div className="h-[1px] w-6 bg-gradient-to-r from-transparent to-amber-500/50"></div>
          <span className="text-[10px] font-bold uppercase tracking-[0.4em]">{title || "Starting Soon"}</span>
          <div className="h-[1px] w-6 bg-gradient-to-l from-transparent to-amber-500/50"></div>
        </div>
        
        <div className="relative">
          <div className="absolute inset-0 blur-xl bg-white/10 rounded-full scale-150"></div>
          <div className="relative font-sans text-6xl font-light leading-none tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white to-stone-400 tabular-nums drop-shadow-2xl">
            {m.toString().padStart(2, '0')}<span className="text-stone-600 opacity-50 mx-1 animate-pulse">:</span>{s.toString().padStart(2, '0')}
          </div>
        </div>
        
        <p className="mt-4 text-xs font-medium tracking-widest text-stone-400 opacity-80 uppercase">{subtitle || "Please take your seats"}</p>
      </div>
    );
  }

  if (styleType === "minimal") {
    return (
      <div className="relative z-10 flex h-full w-full items-center justify-center rounded-2xl px-5 py-4">
        <div className="relative border border-white/10 bg-black/40 backdrop-blur-xl rounded-[2rem] px-8 py-6 text-center shadow-2xl">
          {title && <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-amber-400">{title}</p>}
          <div className="font-sans text-5xl font-black leading-none tracking-tighter text-white tabular-nums drop-shadow-md">
            {m.toString().padStart(2, '0')}<span className="text-white/30">:</span>{s.toString().padStart(2, '0')}
          </div>
          {subtitle && <p className="mt-3 text-xs font-semibold text-stone-400">{subtitle}</p>}
        </div>
      </div>
    );
  }

  if (styleType === "elegant") {
    return (
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center rounded-2xl px-5 py-4 text-center">
        <div className="text-center bg-black/60 backdrop-blur-md px-10 py-6 rounded-[2rem] border border-amber-900/30 shadow-2xl">
          {title && <p className="mb-3 text-xs font-serif italic tracking-[0.2em] text-amber-500">{title}</p>}
          <div className="font-serif text-5xl font-medium leading-none text-white drop-shadow-2xl flex items-center justify-center">
            {m.toString().padStart(2, '0')}<span className="text-amber-600/50 mx-2 font-light">:</span>{s.toString().padStart(2, '0')}
          </div>
          {subtitle && <p className="mt-4 text-[10px] font-sans tracking-[0.3em] text-stone-400 uppercase">{subtitle}</p>}
        </div>
      </div>
    );
  }

  if (styleType === "neon") {
    return (
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center rounded-2xl bg-[#050510] px-5 py-4 text-center">
        {title && <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.4em] text-fuchsia-500 drop-shadow-[0_0_5px_rgba(217,70,239,0.8)]">{title}</p>}
        <div className="font-mono text-6xl font-bold leading-none tracking-wider text-cyan-300 tabular-nums drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]">
          {m.toString().padStart(2, '0')}<span className="text-fuchsia-500 animate-pulse">:</span>{s.toString().padStart(2, '0')}
        </div>
        {subtitle && <p className="mt-4 text-[9px] font-semibold tracking-[0.4em] text-cyan-500 uppercase drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]">{subtitle}</p>}
      </div>
    );
  }

  if (styleType === "blocks") {
    return (
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center rounded-2xl px-5 py-4">
        {title && <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">{title}</p>}
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-center bg-white/10 backdrop-blur-md border-t border-white/20 rounded-xl p-3 shadow-lg">
            <span className="font-mono text-4xl font-black leading-none text-white">{m.toString().padStart(2, '0')}</span>
            <span className="mt-2 text-[8px] font-bold uppercase tracking-widest text-amber-400">Min</span>
          </div>
          <div className="text-2xl font-black text-white/20 animate-pulse">:</div>
          <div className="flex flex-col items-center bg-white/10 backdrop-blur-md border-t border-white/20 rounded-xl p-3 shadow-lg">
            <span className="font-mono text-4xl font-black leading-none text-white">{s.toString().padStart(2, '0')}</span>
            <span className="mt-2 text-[8px] font-bold uppercase tracking-widest text-amber-400">Sec</span>
          </div>
        </div>
        {subtitle && <p className="mt-4 text-[10px] font-semibold tracking-widest text-stone-300">{subtitle}</p>}
      </div>
    );
  }

  if (styleType === "rings") {
    const progress = (s / 60) * 100;
    return (
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center rounded-2xl px-5 py-4">
        <div className="relative flex items-center justify-center w-[200px] h-[200px]">
          <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">
            <circle cx="50%" cy="50%" r="48%" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4%" />
            <circle cx="50%" cy="50%" r="48%" fill="none" stroke="#fbbf24" strokeWidth="4%" strokeDasharray="301.59" strokeDashoffset={301.59 - (progress / 100) * 301.59} strokeLinecap="round" className="transition-all duration-1000 ease-linear" pathLength="100" />
          </svg>
          <div className="absolute inset-0 border-[1.5px] border-dashed border-white/10 rounded-full animate-[spin_30s_linear_infinite]"></div>
          
          <div className="text-center z-10 flex flex-col items-center justify-center">
            {title && <p className="mb-2 text-[8px] font-bold uppercase tracking-[0.2em] text-amber-400">{title}</p>}
            <div className="font-sans text-3xl font-bold leading-none tracking-tighter text-white tabular-nums">
              {m.toString().padStart(2, '0')}<span className="text-white/30">:</span>{s.toString().padStart(2, '0')}
            </div>
            {subtitle && <p className="mt-2 text-[7px] font-semibold tracking-widest text-stone-400 uppercase max-w-[120px]">{subtitle}</p>}
          </div>
        </div>
      </div>
    );
  }

  if (styleType === "terminal") {
    return (
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center rounded-2xl bg-black px-5 py-4 text-left font-mono">
        <div className="w-full max-w-[200px]">
          {title && <p className="mb-2 text-[10px] text-green-500">{`> ${title}`}</p>}
          <div className="text-5xl font-bold text-green-500 tabular-nums">
            {m.toString().padStart(2, '0')}:{s.toString().padStart(2, '0')}<span className="animate-[pulse_1s_step-end_infinite]">_</span>
          </div>
          {subtitle && <p className="mt-2 text-[8px] text-green-700">{`$ ${subtitle}`}</p>}
        </div>
      </div>
    );
  }

  if (styleType === "outline") {
    return (
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center rounded-2xl px-5 py-4 text-center">
        {title && <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-white">{title}</p>}
        <div className="text-7xl font-black tracking-tighter tabular-nums drop-shadow-2xl" style={{ WebkitTextStroke: '2px white', color: 'transparent' }}>
          {m.toString().padStart(2, '0')}:{s.toString().padStart(2, '0')}
        </div>
        {subtitle && <p className="mt-2 text-[9px] font-bold text-white/50">{subtitle}</p>}
      </div>
    );
  }

  if (styleType === "progressbar") {
    const progress = (s / 60) * 100;
    return (
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center rounded-2xl px-5 py-4 text-center">
        <div className="text-6xl font-black tracking-tight text-white tabular-nums drop-shadow-md">
          {m.toString().padStart(2, '0')}:{s.toString().padStart(2, '0')}
        </div>
        <div className="mt-4 h-1 w-[80%] overflow-hidden rounded-full bg-white/10">
          <div className="h-full bg-amber-400 transition-all duration-1000 ease-linear" style={{ width: `${progress}%` }}></div>
        </div>
        {title && <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.3em] text-stone-300">{title}</p>}
        {subtitle && <p className="mt-2 text-[9px] font-semibold tracking-widest text-stone-400 uppercase">{subtitle}</p>}
      </div>
    );
  }

  // Classic Style (Default)
  return (
    <div className="relative z-10 flex h-full w-full flex-col items-center justify-center rounded-2xl px-5 py-4 text-center">
      <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-stone-300">
        {title || "Service begins in"}
      </p>
      <div className="text-7xl font-black tracking-tight text-white tabular-nums drop-shadow-lg">
        {m.toString().padStart(2, '0')}:{s.toString().padStart(2, '0')}
      </div>
      <p className="mt-3 text-sm text-stone-400">
        {subtitle || "Please silence your mobile phones."}
      </p>
    </div>
  );
}

const SelectControl = memo(function SelectControl({ label, value, onChange, options }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((o) => o.value === value) || options[0];

  return (
    <>
      <div className="block">
        {label && <p className="mb-1.5 text-xs font-semibold text-stone-400">{label}</p>}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-left text-sm text-slate-100 outline-none transition hover:bg-black/60 focus:border-amber-500/40"
          >
            <span className="truncate">{selectedOption?.label || value}</span>
            <svg className="ml-2 h-4 w-4 shrink-0 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative z-10 w-full max-w-sm animate-fade-in overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
            <div className="border-b border-white/10 bg-slate-800/50 px-5 py-4">
              <h3 className="text-base font-bold text-white">{label}</h3>
            </div>
            <div 
              className="max-h-[60vh] overflow-y-auto p-2 custom-scroll overscroll-contain"
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm transition ${
                    value === option.value 
                      ? "bg-amber-500/20 text-amber-400 font-semibold" 
                      : "text-stone-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {option.label}
                  {value === option.value && (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
});

const CheckboxControl = memo(function CheckboxControl({ label, checked, onChange, tooltip }) {
  return (
    <label className="flex items-center gap-3 text-sm text-stone-200" title={tooltip}>
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

const ConnectedDevicesPanel = memo(function ConnectedDevicesPanel({ t }) {
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
    <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-black/40">
      <div className="flex items-center justify-between rounded-t-2xl border-b border-white/5 bg-white/5 px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200/80">{t?.connectedDevices || "CONNECTED DEVICES"}</p>
        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-white/10 px-2 text-xs font-bold text-white">
          {remoteDevices.length}
        </span>
      </div>
      <div className="p-4">
        <p className="mb-3 text-[10px] text-stone-400">{t?.activeRemotesPrompt || "Active remotes seen in the last 15 seconds."}</p>

        {remoteDevices.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-white/5 p-4 text-center">
            <p className="text-sm text-stone-500">{t?.noRemoteDevicesConnectedYet || "No remote devices connected yet."}</p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {remoteDevices.map((device) => (
              <div
                key={device.id}
                className="rounded-2xl border border-emerald-400/15 bg-emerald-400/10 px-4 py-3"
              >
                <p className="text-sm font-semibold text-white">{device.label}</p>
                <p className="mt-1 text-xs leading-6 text-emerald-100/80">
                  {device.platform} connected
                </p>
              </div>
            ))}
          </div>
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
  const features = ["noopener=yes", "noreferrer=yes", "popup=yes", "location=no", "toolbar=no", "menubar=no", "status=no", "scrollbars=no"];

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
  const [customTimerMinutes, setCustomTimerMinutes] = useState(5);
  const [tickerInput, setTickerInput] = useState(libraryData?.sermon?.tickerText || "");
  
  // Custom Song State
  const [songTitle, setSongTitle] = useState("");
  const [lyricsText, setLyricsText] = useState("");
  const [songSlides, setSongSlides] = useState([]);
  const [syncFolderHandle, setSyncFolderHandle] = useState(null);
  const [songSearchQuery, setSongSearchQuery] = useState("");
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const searchInputRef = useRef(null);
  const keyboardRef = useRef(null);

  useEffect(() => {
    if (!isKeyboardOpen) return undefined;
    const handlePointerDown = (event) => {
      if (
        searchInputRef.current?.contains(event.target) ||
        keyboardRef.current?.contains(event.target) ||
        event.target.closest('.keyboard-toggle-btn')
      ) return;
      setIsKeyboardOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isKeyboardOpen]);

  const insertTamilText = (text) => {
    const input = searchInputRef.current;
    if (!input) {
      setSongSearchQuery((current) => current + text);
      return;
    }
    const selectionStart = input.selectionStart ?? songSearchQuery.length;
    const selectionEnd = input.selectionEnd ?? songSearchQuery.length;
    
    const newValue = `${songSearchQuery.slice(0, selectionStart)}${text}${songSearchQuery.slice(selectionEnd)}`;
    setSongSearchQuery(newValue);
    
    window.requestAnimationFrame(() => {
      input.focus({ preventScroll: true });
      input.setSelectionRange(selectionStart + text.length, selectionStart + text.length);
    });
  };

  const removeTamilText = () => {
    const input = searchInputRef.current;
    if (!input) {
      setSongSearchQuery((current) => current.slice(0, -1));
      return;
    }
    const selectionStart = input.selectionStart ?? songSearchQuery.length;
    const selectionEnd = input.selectionEnd ?? songSearchQuery.length;
    
    let newValue = songSearchQuery;
    let newCursor = selectionStart;
    
    if (selectionStart !== selectionEnd) {
      newValue = `${songSearchQuery.slice(0, selectionStart)}${songSearchQuery.slice(selectionEnd)}`;
    } else if (selectionStart > 0) {
      newValue = `${songSearchQuery.slice(0, selectionStart - 1)}${songSearchQuery.slice(selectionEnd)}`;
      newCursor = selectionStart - 1;
    }
    
    setSongSearchQuery(newValue);
    window.requestAnimationFrame(() => {
      input.focus({ preventScroll: true });
      input.setSelectionRange(newCursor, newCursor);
    });
  };

  const filteredSongs = useMemo(() => {
    if (!libraryData?.savedSongs) return [];
    if (!songSearchQuery || !songSearchQuery.trim()) return libraryData.savedSongs;
    
    const query = songSearchQuery.toLowerCase().trim();
    const queryRoman = normalizeRoman(query);
    const queryConsonants = consonantKey(query);

    return libraryData.savedSongs.filter(song => {
      const title = song.title || "";
      if (matchTamilTextQuery(title, query)) return true;
      
      const titleTanglish = tamilToTanglish(title);
      const titleRoman = normalizeRoman(titleTanglish);
      if (titleRoman.includes(queryRoman)) return true;
      
      if (queryConsonants.length > 1) {
        const titleConsonants = consonantKey(titleTanglish);
        if (titleConsonants.includes(queryConsonants)) return true;
      }
      
      return false;
    });
  }, [libraryData?.savedSongs, songSearchQuery]);
  
  const groupedSongs = useMemo(() => {
    if (!filteredSongs || filteredSongs.length === 0) return [];
    
    const sorted = [...filteredSongs].sort((a, b) => {
      const titleA = (a.title || "").trim();
      const titleB = (b.title || "").trim();
      return titleA.localeCompare(titleB, 'ta');
    });

    const groups = [];
    let currentGroup = null;

    sorted.forEach(song => {
      const title = (song.title || "").trim();
      if (!title) return;
      
      let firstChar = title.charAt(0).toUpperCase();
      
      if (!currentGroup || currentGroup.letter !== firstChar) {
        currentGroup = { letter: firstChar, songs: [] };
        groups.push(currentGroup);
      }
      currentGroup.songs.push(song);
    });

    return groups;
  }, [filteredSongs]);

  const handleProcessLyrics = (textToProcess = lyricsText) => {
    if (!textToProcess.trim()) return;
    const stanzas = textToProcess.split(/\n\s*\n/).filter(s => s.trim());
    setSongSlides(stanzas);
  };

  const handleSelectSyncFolder = async () => {
    try {
      const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
      setSyncFolderHandle(handle);
      toast.success("Sync folder connected! Songs will auto-save to 'Worship_Songs_AutoSync.json'");
    } catch (err) {
      console.log("Sync folder selection cancelled or failed:", err);
    }
  };

  // Auto-sync effect
  useEffect(() => {
    const syncToFolder = async () => {
      if (!syncFolderHandle || !libraryData?.savedSongs) return;
      try {
        const fileHandle = await syncFolderHandle.getFileHandle("Worship_Songs_AutoSync.json", { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(JSON.stringify(libraryData.savedSongs, null, 2));
        await writable.close();
      } catch (err) {
        console.error("Auto-sync failed:", err);
        if (err.name === 'NotAllowedError') {
          setSyncFolderHandle(null);
          toast.error("Sync folder permission lost. Please re-select.");
        }
      }
    };
    syncToFolder();
  }, [libraryData?.savedSongs, syncFolderHandle]);

  const handleSaveSongToLibrary = () => {
    if (!songTitle.trim() || !lyricsText.trim()) {
      toast.error("Please enter a title and lyrics to save.");
      return;
    }
    const songId = `song-${Date.now()}`;
    addSavedSong({ id: songId, title: songTitle.trim(), lyrics: lyricsText.trim() });
    toast.success("Song saved to library!");
  };

  const fileInputRef = useRef(null);

  const exportSongLibrary = () => {
    if (!libraryData?.savedSongs || libraryData.savedSongs.length === 0) {
      toast.error("Library is empty. Nothing to backup.");
      return;
    }
    const dataStr = JSON.stringify(libraryData.savedSongs, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Worship_Songs_Backup_${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Song Library backup downloaded!");
  };

  const importSongLibrary = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (importSavedSongs(parsed)) {
          toast.success("Song Library restored successfully!");
        } else {
          toast.error("Invalid backup file format.");
        }
      } catch (err) {
        toast.error("Failed to parse backup file.");
      }
    };
    reader.readAsText(file);
    event.target.value = ""; // Reset input
  };

  const handleSendToPresentation = (text, index) => {
    const item = {
      id: `song-${Date.now()}-${index}`,
      bookTamil: songTitle.trim(),
      chapter: "",
      verse: "",
      isSong: true,
      text: text.trim(),
    };
    setActiveSermonItem(item);
    setSermonDisplayMode("live");
    toast.success("Projected instantly!");
  };

  const remoteUrl = `${baseRemoteUrl}?room=${activeRoomCode}`;
  const remoteNeedsPublicHost = !remoteOrigin || isLocalOnlyHost(new URL(remoteUrl).hostname);
  const [copiedRemoteUrl, setCopiedRemoteUrl] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState("main");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

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
    ? (activeItem.isSong ? null : `${activeItem.bookTamil} ${activeItem.chapter}:${activeItem.verse}`)
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
        const textRect = textEl.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const fits = textRect.height <= containerRect.height && textRect.width <= containerRect.width;

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
  }, [
    activeItem?.text,
    settings.presentationMaxFontSize,
    settings.presentationJustify,
    settings.presentationLineWrap,
    settings.presentationTwoLines,
    settings.presentationUppercase,
    settings.presentationFont,
    settings.presentationLineHeight,
  ]);

  // Song Slide Hotkeys
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input or textarea
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      
      // Check for ALT + 1 through 9
      if (e.altKey && e.key >= "1" && e.key <= "9") {
        const index = parseInt(e.key, 10) - 1;
        if (songSlides && index < songSlides.length) {
          e.preventDefault();
          handleSendToPresentation(songSlides[index], index);
        }
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [songSlides, handleSendToPresentation]);

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
        const textRect = textEl.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const fits = textRect.height <= containerRect.height && textRect.width <= containerRect.width;

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
  }, [
    activeItem?.text,
    settings.presentationMaxFontSize,
    settings.presentationJustify,
    settings.presentationLineWrap,
    settings.presentationTwoLines,
    settings.presentationUppercase,
    settings.presentationFont,
    settings.presentationLineHeight,
  ]);

  return (
    <div className="hidden px-4 pb-6 pt-4 md:block md:px-6 md:pt-6">
      <div className="w-full space-y-3">
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
              {t.openMainDisplay || "Open Main Display"}
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
              {t.openStageDisplay || "Open Stage Display"}
            </button>
            <Link
              to="/presentation-remote"
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white"
            >
              {t.openPhoneRemote || "Open Phone Remote"}
            </Link>
          </div>
        </section>

        <section className="rounded-[1.8rem] border border-white/10 bg-[#000000] p-5 shadow-xl shadow-black/20">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{t.liveQueue || "LIVE QUEUE"}</p>
              <h2 className="mt-1 text-2xl font-bold text-white">
                {activeItem ? (activeItem.isSong ? activeItem.bookTamil : `${activeItem.bookTamil} ${activeItem.chapter}:${activeItem.verse}`) : (t.noActiveVerse || "No active verse")}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {queue.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition"
                >
                  Clear All
                </button>
              )}
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">
                {queue.length} queued
              </span>
            </div>
          </div>

          <p className="mb-6 text-xs leading-5 text-stone-400">
            {t.queueDescription || "The display windows below update live from this sermon queue. Pick which verse should show right now, then open the main or stage screen in a separate window."}
          </p>

          <div className="space-y-3">
            {queue.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-center">
                <p className="text-sm text-stone-500">
                  {t.queueEmptyPrompt || "Add verses from the chapter screen using the 'Sermon' button, then control them here."}
                </p>
              </div>
            ) : (
              queue.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  className={`rounded-[1.4rem] border p-4 transition-all ${
                    item.id === activeItem?.id
                      ? "border-green-500/40 bg-green-900/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]"
                      : "border-white/10 bg-white/[0.03] opacity-60 hover:opacity-100"
                  }`}
                >
                  <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex-1 pr-0 xl:pr-4">
                      <p className="text-base font-semibold text-white">
                        {item.isSong ? item.bookTamil : `${item.bookTamil} ${item.chapter}:${item.verse}`}
                      </p>
                      <p className="mt-2 line-clamp-2 text-sm leading-7 text-stone-300">
                        {item.text}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {item.id === activeItem?.id ? (
                        <div className="flex items-center rounded-xl bg-green-500/20 border border-green-500/30 px-4 py-2.5 text-sm font-bold text-green-400">
                          <span className="mr-2 h-2.5 w-2.5 rounded-full bg-green-400 animate-pulse"></span>
                          LIVE NOW
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setActiveSermonItem(item)}
                          className="rounded-xl bg-[#000000] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-900"
                        >
                          Show Live
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeSermonQueueItem(item.id)}
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-[1.8rem] border border-white/10 bg-[#000000] p-5 shadow-xl shadow-black/20">
          <div className="grid gap-8 lg:grid-cols-[2fr,0.9fr]">
            {/* Left Side: Inputs and Quick Display Modes */}
            <div className="flex flex-col space-y-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <p className="mb-1.5 text-xs font-semibold text-stone-400">{t.titleSlideTitle || "Title Slide Title"}</p>
                  <input
                    type="text"
                    value={settings.presentationTitle}
                    onChange={(e) => updateSettings({ presentationTitle: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-amber-500/40"
                  />
                </label>

                <label className="block">
                  <p className="mb-1.5 text-xs font-semibold text-stone-400">{t.titleSlideSubtitle || "Title Slide Subtitle"}</p>
                  <input
                    type="text"
                    value={settings.presentationSubtitle}
                    onChange={(e) => updateSettings({ presentationSubtitle: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-amber-500/40"
                  />
                </label>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <p className="mb-1.5 text-xs font-semibold text-stone-400">{t.announcementTitle || "Announcement Title"}</p>
                  <input
                    type="text"
                    value={settings.presentationAnnouncementTitle}
                    onChange={(e) => updateSettings({ presentationAnnouncementTitle: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-amber-500/40"
                  />
                </label>

                <label className="block">
                  <p className="mb-1.5 text-xs font-semibold text-stone-400">{t.announcementBody || "Announcement Body"}</p>
                  <textarea
                    value={settings.presentationAnnouncementBody}
                    onChange={(e) => updateSettings({ presentationAnnouncementBody: e.target.value })}
                    rows={2}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-amber-500/40"
                  />
                </label>
              </div>

              <div>
                <p className="mb-1.5 text-xs font-semibold text-stone-400">{t.logoImage || "Logo Image"}</p>
                <div className="flex h-24 items-center justify-center rounded-[1rem] border border-white/10 bg-black/40 p-4">
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
                <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-stone-400">
                  {t.quickDisplayModes || "Quick Display Modes"}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSermonDisplayMode("live")}
                    className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${displayMode === "live" ? "bg-white text-black shadow-lg shadow-white/20" : "bg-white/10 text-white hover:bg-white/15"}`}
                  >
                    {t.liveBtn || "Live"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSermonDisplayMode("title")}
                    className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${displayMode === "title" ? "bg-white text-black shadow-lg shadow-white/20" : "bg-white/10 text-white hover:bg-white/15"}`}
                  >
                    {t.title || "Title"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSermonDisplayMode("logo")}
                    className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${displayMode === "logo" ? "bg-white text-black shadow-lg shadow-white/20" : "bg-white/10 text-white hover:bg-white/15"}`}
                  >
                    {t.logo || "Logo"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSermonDisplayMode("announcement")}
                    className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${displayMode === "announcement" ? "bg-white text-black shadow-lg shadow-white/20" : "bg-white/10 text-white hover:bg-white/15"}`}
                  >
                    {t.announcement || "Announcement"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSermonDisplayMode("black")}
                    className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${displayMode === "black" ? "bg-white text-black shadow-lg shadow-white/20" : "bg-white/10 text-white hover:bg-white/15"}`}
                  >
                    {t.black || "Black"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSermonDisplayMode("clear")}
                    className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${displayMode === "clear" ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30" : "bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30"}`}
                  >
                    Clear Text
                  </button>
                  
                  <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-950/20 p-1.5 pl-4 shadow-inner">
                    <div className="flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <input 
                        type="number" 
                        value={customTimerMinutes} 
                        onChange={(e) => setCustomTimerMinutes(Number(e.target.value))}
                        className="w-10 bg-black/40 rounded-md border border-amber-500/30 px-1 py-1 text-amber-400 font-bold outline-none text-center focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                        min={1}
                        max={99}
                      />
                      <span className="text-amber-500/60 text-xs font-bold uppercase tracking-wider mr-2">min</span>
                      
                      <div className="w-40 mr-2">
                        <SelectControl 
                          value={settings.timerStyle || "classic"}
                          onChange={(val) => updateSettings({ timerStyle: val })}
                          options={[
                            { value: "classic", label: "Classic" },
                            { value: "cinematic", label: "Cinematic" },
                            { value: "minimal", label: "Minimal" },
                            { value: "elegant", label: "Elegant Serif" },
                            { value: "neon", label: "Neon Glow" },
                            { value: "blocks", label: "Split Blocks" },
                            { value: "rings", label: "Spinning Rings" },
                            { value: "terminal", label: "Retro Terminal" },
                            { value: "outline", label: "Bold Outline" },
                            { value: "progressbar", label: "Progress Bar" }
                          ]}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (displayMode === "timer") {
                          setSermonDisplayMode("clear");
                          toast.success("Timer stopped!");
                        } else {
                          setSermonDisplayMode("timer", Date.now() + customTimerMinutes * 60000 + 1000);
                          toast.success(`${customTimerMinutes}-minute countdown started!`);
                        }
                      }}
                      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold tracking-wide transition-all ${displayMode === "timer" ? "bg-amber-400 text-amber-950 shadow-[0_0_20px_rgba(251,191,36,0.4)] hover:bg-amber-300" : "bg-gradient-to-r from-amber-600/30 to-amber-500/20 text-amber-300 border border-amber-500/30 hover:border-amber-400/50 hover:from-amber-600/40 hover:to-amber-500/30 hover:shadow-lg hover:shadow-amber-500/20"}`}
                    >
                      {displayMode === "timer" ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                          </svg>
                          Stop
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                          Start Timer
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-white/10 pt-6">
                <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-stone-400">
                  Scrolling Ticker (Marquee)
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tickerInput}
                    onChange={(e) => setTickerInput(e.target.value)}
                    placeholder="Enter announcement (e.g., Youth Meeting Friday 6PM)"
                    className="flex-1 rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white placeholder-stone-500 outline-none focus:border-amber-500/50"
                  />
                  {libraryData?.sermon?.tickerText ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSermonTickerText("");
                      }}
                      className="rounded-xl bg-red-500/20 px-5 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/30"
                    >
                      Stop
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (tickerInput.trim()) setSermonTickerText(tickerInput.trim());
                      }}
                      className="rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-amber-400 whitespace-nowrap"
                    >
                      Show Ticker
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side: QR Code */}
            <div className="flex flex-col h-full">
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4 text-center h-full">
                <div className="flex items-center justify-center gap-2">
                  <p className="text-sm font-semibold text-white">{t.phoneRemote || "Phone Remote QR"}</p>
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
                      {t.switchNetwork || "Switch Network Address"}
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
                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500">{t.roomCode || "Room Code"}</p>
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
                ) : /^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$/.test(new URL(remoteUrl).hostname) ? (
                  <p className="mt-3 text-xs leading-6 text-stone-500">
                    {t.sameWifiMessage || "Make sure your phone is on the same Wi-Fi network to use this address."}
                  </p>
                ) : (
                  <p className="mt-3 text-xs leading-6 text-stone-500">
                    {t.scanToControl || "Scan this code to control the presentation from your phone."}
                  </p>
                )}

                <ConnectedDevicesPanel t={t} />
              </div>
            </div>
          </div>
        </section>

        {/* Custom Song Builder Panel */}
        <section className="mt-8 rounded-[1.6rem] border border-white/10 bg-[#000000] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold uppercase tracking-widest text-white">
              Custom Song / Slides
            </h2>
          </div>
          
          <div className="flex flex-col xl:flex-row gap-8">
            {/* Left Column: Saved Songs Library */}
            <div className="w-full xl:w-1/3 flex flex-col border-r border-white/10 xl:pr-8">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400">Library</h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleSelectSyncFolder}
                    title={syncFolderHandle ? "Auto-Syncing to Folder" : "Select Auto-Sync Folder"}
                    className={`rounded p-1.5 transition ${syncFolderHandle ? "bg-emerald-500/20 text-emerald-500" : "bg-white/5 text-stone-400 hover:bg-white/10 hover:text-white"}`}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    </svg>
                  </button>
                  <button
                    onClick={exportSongLibrary}
                    title="Backup Library to File"
                    className="rounded bg-white/5 p-1.5 text-stone-400 hover:bg-white/10 hover:text-white transition"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    title="Restore Library from File"
                    className="rounded bg-white/5 p-1.5 text-stone-400 hover:bg-white/10 hover:text-white transition"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".json"
                    onChange={importSongLibrary}
                    className="hidden"
                  />
                </div>
              </div>
              <div className="mb-4 relative">
                <div className="relative flex items-center">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search songs..."
                    value={songSearchQuery}
                    onChange={(e) => setSongSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 pl-4 pr-12 py-2 text-sm text-white placeholder-stone-500 outline-none focus:border-amber-500/50 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setIsKeyboardOpen(!isKeyboardOpen)}
                    title="Tamil Keyboard"
                    className="keyboard-toggle-btn absolute right-2 flex h-7 w-8 items-center justify-center rounded-lg bg-white/5 text-[11px] font-bold text-stone-400 hover:bg-white/10 hover:text-white transition"
                  >
                    ta
                  </button>
                </div>
                
                {isKeyboardOpen && (
                  <div
                    ref={keyboardRef}
                    onMouseDown={(event) => event.preventDefault()}
                    className="absolute left-0 top-full mt-2 z-50 w-full overflow-hidden rounded-2xl border border-white/10 bg-black/95 p-3 shadow-2xl backdrop-blur-3xl"
                  >
                    <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Tamil Keyboard</span>
                      <button type="button" onClick={() => setIsKeyboardOpen(false)} className="text-stone-500 hover:text-white">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      {TAMIL_KEYBOARD_ROWS.map((row, rowIndex) => (
                        <div key={`row-${rowIndex}`} className="flex flex-wrap justify-center gap-1">
                          {row.map((key) => (
                            <button
                              key={key}
                              type="button"
                              onClick={() => insertTamilText(key)}
                              className="flex h-8 w-7 items-center justify-center rounded-lg bg-white/5 text-[13px] text-stone-200 hover:bg-white/10 hover:text-white active:scale-95"
                            >
                              {key}
                            </button>
                          ))}
                        </div>
                      ))}
                      <div className="pt-2">
                        {TAMIL_SYMBOL_ROWS.map((row, rowIndex) => (
                          <div key={`sym-${rowIndex}`} className="flex flex-wrap justify-center gap-1 mb-1.5">
                            {row.map((key) => (
                              <button
                                key={key}
                                type="button"
                                onClick={() => insertTamilText(key)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-900/40 text-[13px] text-zinc-300 hover:bg-sky-900/60 hover:text-white active:scale-95"
                              >
                                {key}
                              </button>
                            ))}
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-center gap-2 pt-1">
                        <button type="button" onClick={() => insertTamilText(" ")} className="flex h-8 w-20 items-center justify-center rounded-lg bg-white/5 text-xs text-stone-300 hover:bg-white/10">Space</button>
                        <button type="button" onClick={removeTamilText} className="flex h-8 w-16 items-center justify-center rounded-lg bg-white/5 text-xs text-stone-300 hover:bg-white/10">&larr;</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div 
                className="flex-1 min-h-[250px] max-h-[400px] overflow-y-auto custom-scroll pr-2 flex flex-col gap-2 relative"
                onWheel={(e) => e.stopPropagation()}
              >
                {groupedSongs?.length > 0 ? (
                  groupedSongs.map((group) => (
                    <div key={group.letter} className="mb-4 last:mb-0">
                      <div className="sticky top-0 z-10 mb-2 bg-[#000000]/80 backdrop-blur-md pb-1 pt-1 -mx-2 px-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-xs font-extrabold text-amber-500 ring-1 ring-amber-500/30">
                          {group.letter}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {group.songs.map((song) => (
                          <div 
                            key={song.id}
                            onClick={() => {
                              setSongTitle(song.title);
                              setLyricsText(song.lyrics);
                              handleProcessLyrics(song.lyrics);
                              toast.success("Song loaded!");
                            }}
                            className="group relative rounded-xl border border-white/5 bg-white/5 p-3 text-left transition hover:cursor-pointer hover:border-amber-500/50 hover:bg-white/10"
                          >
                            <p className="font-bold text-white truncate pr-8">{song.title}</p>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeSavedSong(song.id);
                              }}
                              className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="m-auto text-center text-stone-500">
                    <p className="text-xs">{songSearchQuery ? "No matching songs found." : "No saved songs yet."}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Middle Column: Editor */}
            <div className="w-full xl:w-1/3 flex flex-col xl:border-r border-white/10 xl:pr-8">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400">Editor</h3>
                <button
                  type="button"
                  onClick={() => {
                    setSongTitle("");
                    setLyricsText("");
                    setSongSlides([]);
                  }}
                  className="rounded bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-400 hover:bg-white/10 hover:text-white transition"
                >
                  New Song
                </button>
              </div>
              <input
                type="text"
                placeholder="Song Title (e.g. How Great is Our God)"
                value={songTitle}
                onChange={(e) => setSongTitle(e.target.value)}
                className="mb-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-stone-500 outline-none focus:border-amber-500/50"
              />
              <textarea
                placeholder="Paste lyrics here...&#10;Separate stanzas with a blank line to automatically split slides."
                value={lyricsText}
                onChange={(e) => setLyricsText(e.target.value)}
                onWheel={(e) => e.stopPropagation()}
                rows={8}
                className="w-full flex-1 resize-y rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-stone-500 outline-none focus:border-amber-500/50 scrollbar-none"
              ></textarea>
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => handleProcessLyrics()}
                  className="flex-1 rounded-xl bg-amber-500 px-4 py-3 text-sm font-bold text-black transition hover:bg-amber-400"
                >
                  Generate Slides
                </button>
                <button
                  type="button"
                  onClick={handleSaveSongToLibrary}
                  className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-400 transition hover:bg-emerald-500/20"
                >
                  Save
                </button>
              </div>
            </div>
            
            {/* Right Column: Slides */}
            <div className="w-full xl:w-1/3 flex flex-col">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-stone-400">Generated Slides</h3>
              <div 
                className="flex-1 flex flex-col min-h-[250px] max-h-[400px] overflow-y-auto custom-scroll pr-2 gap-3"
                onWheel={(e) => e.stopPropagation()}
              >
                {songSlides.length === 0 ? (
                  <div className="m-auto text-center text-stone-500">
                    <p className="text-sm">No slides generated yet.</p>
                  </div>
                ) : (
                  songSlides.map((slide, index) => (
                    <div key={index} className="group relative rounded-xl border border-white/5 bg-white/5 p-4 transition hover:border-amber-500/30">
                      <div className="absolute left-2 top-2 flex h-5 items-center justify-center rounded-full bg-black/50 px-2 text-[9px] font-bold tracking-wider text-stone-400">
                        ALT + {index + 1}
                      </div>
                      <p className="pl-6 whitespace-pre-wrap text-sm text-stone-300">
                        {slide}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleSendToPresentation(slide, index)}
                        className="absolute right-3 top-3 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white opacity-0 transition group-hover:opacity-100 hover:bg-white/20"
                      >
                        Project
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2 mb-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-stone-400">Display Assignment</h2>
            <p className="mt-1.5 text-xs text-stone-500">
              💡 <span className="font-semibold text-stone-400">Pro Tip:</span> Double-click anywhere on the live presentation window to toggle true Fullscreen mode!
            </p>
          </div>
          <button 
            type="button"
            onClick={async () => {
              try {
                const screens = await getPresentationScreens();
                setScreenOptions(screens);
                toast.success("Displays detected and updated!");
              } catch (err) {
                toast.error("Failed to detect displays. Please ensure permissions are granted.");
              }
            }}
            className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-amber-500 transition hover:bg-amber-500/20 hover:border-amber-400/50"
          >
            Detect Displays
          </button>
        </div>

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

        <AccordionSection title={t.configurationProfiles || "Configuration Profiles"}>
          <div className="flex flex-col gap-6">
            <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
              <p className="mb-4 text-sm font-semibold text-stone-300">{t.savedProfiles || "Saved Profiles"}</p>
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
                <p className="text-sm text-stone-500">{t.noSavedProfiles || "No saved profiles yet."}</p>
              )}
              
              <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
                <input
                  type="text"
                  placeholder={t.profileNamePlaceholder || "Profile Name (e.g. Sunday Morning)"}
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-stone-500 outline-none focus:border-amber-500/50"
                />
                <button
                  onClick={saveProfile}
                  className="whitespace-nowrap rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  {t.saveCurrent || "Save Current"}
                </button>
              </div>
            </div>
          </div>
        </AccordionSection>

        <AccordionSection title={t.mainPresentationScreenSetup || "Main Presentation Screen Setup"}>
          <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="flex flex-col gap-4">
              <SelectControl
                label={t.presets}
                value={settings.presentationPreset}
                onChange={(value) => updateSettings({ presentationPreset: value })}
                options={[
                  { value: "horizontal", label: t.fullScreenHorizontal },
                  { value: "primary", label: t.fullScreenPrimary },
                ]}
              />

              <SelectControl
                label="Slide Transition"
                value={settings.presentationTransition || "fade-in"}
                onChange={(value) => updateSettings({ presentationTransition: value })}
                options={[
                  { value: "fade-in", label: "Smooth Fade" },
                  { value: "slide-up", label: "Slide Up" },
                  { value: "slide-down", label: "Slide Down" },
                  { value: "slide-left", label: "Slide Left" },
                  { value: "slide-right", label: "Slide Right" },
                  { value: "zoom-in", label: "Zoom In" },
                  { value: "zoom-out", label: "Zoom Out" },
                  { value: "blur-in", label: "Blur In" },
                  { value: "bounce-in", label: "Bounce Pop" },
                  { value: "flip-x", label: "Flip Horizontal" },
                  { value: "flip-y", label: "Flip Vertical" },
                  { value: "swing-in", label: "Swing Drop" },
                  { value: "spin-in", label: "Spin & Fade" },
                  { value: "focus-in", label: "Focus In" },
                  { value: "drop-bounce", label: "Drop Bounce" },
                  { value: "none", label: "None (Instant)" },
                ]}
              />

              <div className="grid gap-4 sm:grid-cols-2">
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
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block">
                  <p className="mb-1.5 text-xs font-semibold text-stone-400">{t.maximumFontSize}</p>
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
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-amber-500/40"
                  />
                </label>

                <label className="block">
                  <p className="mb-1.5 text-xs font-semibold text-stone-400">{t.letterSpacing || "Letter Spacing"}</p>
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
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-amber-500/40"
                  />
                </label>

                <label className="block">
                  <p className="mb-1.5 text-xs font-semibold text-stone-400">{t.lineSpacing || "Line Spacing"}</p>
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
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-amber-500/40"
                  />
                </label>
              </div>
            </div>

            <div className="grid gap-3 content-start md:grid-cols-2">
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

        <AccordionSection title={t.stageviewScreenSetup || "Stageview Screen Setup"}>
          <div className="flex flex-col gap-4">
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
                <p className="mb-1.5 text-xs font-semibold text-stone-400">{t.stageScreenStyle}</p>
                <div className="grid gap-3 content-start md:grid-cols-2">
                  <CheckboxControl label={t.greenScreen} checked={settings.stageGreenScreen} onChange={(value) => updateSettings({ stageGreenScreen: value })} />
                  <CheckboxControl label={t.windowView} checked={settings.stageWindowView} onChange={(value) => updateSettings({ stageWindowView: value })} tooltip="Pins lyrics to the top of the screen instead of vertically centering them" />
                  <CheckboxControl label={t.smallWindow} checked={settings.stageSmallWindow} onChange={(value) => updateSettings({ stageSmallWindow: value })} tooltip="Restricts the max width of the text block for ultra-wide stage displays" />
                  <CheckboxControl label={t.showDateAndTime} checked={settings.stageShowDateTime} onChange={(value) => updateSettings({ stageShowDateTime: value })} />
                </div>
              </div>
            </div>

            <label className="block">
              <p className="mb-1.5 text-xs font-semibold text-stone-400">{t.message}</p>
              <textarea
                value={settings.stageMessage}
                onChange={(e) => updateSettings({ stageMessage: e.target.value })}
                rows={2}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-amber-500/40"
              />
            </label>

            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => {
                  updateSettings({ stageMessageVisible: true });
                  toast.success("Stage Message shown!");
                }} 
                className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                {t.showMessage}
              </button>
              <button 
                onClick={() => {
                  updateSettings({ stageMessage: "", stageMessageVisible: false });
                  toast.success("Stage Message cleared!");
                }} 
                className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                {t.clearMessage}
              </button>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">{t.stillBackground}</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {backgrounds.map((bg, index) => (
                    <BackgroundTile key={`stage-bg-${bg}`} active={settings.stageStillBackground === index} onClick={() => updateSettings({ stageStillBackground: index })}>
                      <img src={bg} alt={`Still background ${index + 1}`} className="h-16 w-full object-cover" />
                    </BackgroundTile>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
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

        <AccordionSection title={t.livePreviews || "Live Previews"}>
          <div className="space-y-4">
            <div className="flex space-x-3">
              <button
                onClick={() => setActivePreviewTab("main")}
                className={`rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition ${
                  activePreviewTab === "main" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-black/40 text-stone-400 border border-white/10 hover:bg-black/60"
                }`}
              >
                {t.mainPreview || "Main Preview"}
              </button>
              <button
                onClick={() => setActivePreviewTab("stage")}
                className={`rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition ${
                  activePreviewTab === "stage" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-black/40 text-stone-400 border border-white/10 hover:bg-black/60"
                }`}
              >
                {t.stagePreview || "Stage Preview"}
              </button>
            </div>

            {activePreviewTab === "main" ? (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="relative flex h-72 w-full items-center justify-center overflow-hidden rounded-[1.5rem] border border-white/10 bg-black p-4 shadow-inner shadow-black/40">
                <SmoothBackground
                  background={displayMode === "black" || (displayMode === "logo" && settings.presentationShowCustomLogo && settings.stageLogoImage) ? "#000000" : settings.presentationGreenScreen ? "#00b140" : settings.background}
                  bgType={displayMode === "black" || (displayMode === "logo" && settings.presentationShowCustomLogo && settings.stageLogoImage) ? "solid" : settings.presentationGreenScreen ? "gradient" : settings.bgType}
                  customBackground={settings.customBackground}
                  motionVariant={settings.motionBackground}
                />
                {displayMode === "logo" && settings.presentationShowCustomLogo && settings.stageLogoImage ? (
                  <div className="relative z-50 flex h-full w-full items-center justify-center bg-black">
                    <img
                      src={settings.stageLogoImage}
                      alt="Presentation logo"
                      className="h-full w-full object-contain"
                    />
                  </div>
                ) : displayMode === "black" ? (
                  <div className="relative z-50 flex h-full w-full items-center justify-center bg-black">
                    <p className="text-sm font-semibold uppercase tracking-[0.28em] text-stone-500">Black Screen</p>
                  </div>
                ) : displayMode === "timer" ? (
                  <PreviewCountdownTimer 
                    targetTime={libraryData?.sermon?.timerTarget} 
                    title={settings.presentationAnnouncementTitle}
                    subtitle={settings.presentationAnnouncementBody}
                    styleType={settings.timerStyle || "classic"}
                  />
                ) : displayMode === "title" || displayMode === "announcement" || (!settings.presentationShowCustomLogo && displayMode === "logo") ? (
                  <div
                    className={`relative z-10 flex h-full w-full flex-col items-center justify-center rounded-2xl px-5 py-4 text-center ${settings.presentationBox ? "backdrop-blur-md" : ""}`}
                    style={{
                      background: settings.presentationBox ? "rgba(0,0,0,0.35)" : "transparent",
                      boxShadow: settings.presentationBox ? "0 0 0 1px rgba(255,255,255,0.1) inset" : "none",
                      maxWidth: "35rem",
                    }}
                  >
                    {displayMode === "title" || displayMode === "logo" ? (
                      <>
                        <p className="text-3xl font-bold text-white">{settings.presentationTitle}</p>
                        <p className="mt-2 text-sm text-stone-300">{settings.presentationSubtitle}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-3xl font-bold text-white">{settings.presentationAnnouncementTitle}</p>
                        <p className="mt-2 text-sm text-stone-300">{settings.presentationAnnouncementBody}</p>
                      </>
                    )}
                  </div>
                ) : displayMode === "clear" ? null : (
                  <div
                    className={`relative z-10 flex w-full flex-1 min-h-0 flex-col justify-center rounded-2xl px-5 py-4 text-center ${settings.presentationBox ? "backdrop-blur-sm" : ""}`}
                    style={{
                      background: settings.presentationBox ? "rgba(0,0,0,0.45)" : "transparent",
                      boxShadow: settings.presentationBorder ? "0 0 0 1px rgba(255,255,255,0.2) inset" : "none",
                      maxWidth: settings.presentationPreset === "horizontal" ? "100%" : "55rem",
                      height: "100%",
                    }}
                  >
                    <div className="flex w-full items-start justify-between gap-4">
                      <div>
                        {settings.showReference && previewReference && (
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
                      </div>
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        {settings.presentationShowDateTime ? (
                          <div className="rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-[10px] text-white/90 backdrop-blur-md">
                            {new Intl.DateTimeFormat(undefined, {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            }).format(new Date())}
                          </div>
                        ) : null}
                        {settings.presentationShowVerseLogo ? (
                          <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80">
                            Tamil Bible Premium
                          </div>
                        ) : null}
                        {settings.presentationShowCustomLogo && settings.stageLogoImage ? (
                          <img
                            src={settings.stageLogoImage}
                            alt="Presentation logo"
                            className="h-8 w-auto object-contain drop-shadow-md"
                          />
                        ) : null}
                      </div>
                    </div>
                    
                    <div 
                      ref={previewContainerRef} 
                      className={`flex flex-1 flex-col overflow-hidden w-full min-h-0 ${
                        settings.presentationVerticalAlign === "top" ? "justify-start pt-2" :
                        settings.presentationVerticalAlign === "bottom" ? "justify-end pb-2" : "justify-center"
                      }`}
                    >
                      <div ref={previewTextRef} className="shrink-0" style={{ fontSize: `${previewFontSize}px` }}>
                        <PresentationPreviewText
                          text={previewItem.text}
                          twoLines={settings.presentationTwoLines}
                          settings={settings}
                          style={{
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
                    {/* Ticker Text Preview */}
                  {libraryData?.sermon?.tickerText ? (
                    <div className="absolute bottom-0 left-0 right-0 z-50 h-[10%] min-h-[1.5rem] overflow-hidden rounded-b-2xl bg-gradient-to-t from-black/80 to-transparent">
                      <div className="flex h-full items-center bg-black/40 px-4 backdrop-blur-md">
                        <div className="animate-marquee whitespace-nowrap">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white">
                            {libraryData.sermon.tickerText}
                          </span>
                          <span className="ml-8 text-[10px] font-bold uppercase tracking-widest text-white">
                            {libraryData.sermon.tickerText}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>


              </div>
              )}
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
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
                        className={`flex h-full min-h-0 flex-col overflow-hidden p-4 ${
                          settings.stageWindowView ? "justify-start" : "justify-center"
                        }`}
                      >
                            {settings.stageShowDateTime && settings.stagePreset !== "horizontal" && (
                              <div className="mb-2 flex justify-end">
                                <div className="rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-[10px] text-white/90 backdrop-blur-md">
                                  {new Date().toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })}
                                </div>
                              </div>
                            )}

                            {displayMode !== "clear" && previewReference && (
                              <p
                                className="text-sm font-bold"
                                style={{ color: settings.stageTextColor2 || "#f8fafc" }}
                              >
                                {previewReference}
                              </p>
                            )}
                            {displayMode !== "clear" && (
                            <div ref={stagePreviewContainerRef} className="flex-1 min-h-0 w-full flex flex-col justify-center">
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
                            )}
                            {settings.stagePreset !== "horizontal" && settings.stageMessage ? (
                              <div className={`mt-4 rounded-2xl border px-4 py-3 text-center ${settings.stageMessageVisible ? 'animate-pulse border-white/10 bg-red-500/20' : 'border-white/10 bg-white/5 opacity-70'}`}>
                                {!settings.stageMessageVisible && (
                                  <span className="mb-1 block text-[9px] font-bold uppercase tracking-widest text-stone-400">Draft (Not Live)</span>
                                )}
                                <p className={`text-sm font-bold ${settings.stageMessageVisible ? 'text-red-200' : 'text-stone-300'}`}>{settings.stageMessage}</p>
                              </div>
                            ) : null}
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
                                  {nextItem.isSong ? nextItem.bookTamil : `${nextItem.bookTamil} ${nextItem.chapter}:${nextItem.verse}`}
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
            )}
          </div>
        </AccordionSection>
      </div>
      
      {showClearConfirm && createPortal(
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[2rem] border border-white/10 bg-[#000000] p-6 shadow-2xl shadow-black/40 text-center">
            <h3 className="text-xl font-bold text-white mb-2">Clear Queue</h3>
            <p className="text-sm text-stone-300 mb-8">Are you sure you want to remove all other items from the live queue? The currently active item will remain.</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  clearSermonQueue();
                  setShowClearConfirm(false);
                }}
                className="flex-1 rounded-xl bg-red-500/20 px-4 py-3 text-sm font-semibold text-red-400 border border-red-500/30 transition hover:bg-red-500/30"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
