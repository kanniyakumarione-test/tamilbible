import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import useAppSettings from "../hooks/useAppSettings";
import useLibraryData from "../hooks/useLibraryData";
import { setSermonDisplayMode } from "../utils/libraryData";
import MotionBackground from "../components/MotionBackground";
import { getPresentationFontFamily, getCustomGradientString, getFontCss, TAMIL_FONT_OPTIONS, FONT_FAMILY_OPTIONS } from "../utils/appearance";

const backgrounds = [
  "/bg/bg1.jpg",
  "/bg/bg2.jpg",
  "/bg/bg3.jpg",
  "/bg/bg4.jpg",
  "/bg/bg5.jpg",
];

function getReaderBackground(settings) {
  const gradients = [
    "linear-gradient(to right, #000000, #434343)",
    "linear-gradient(to right, #1e3c72, #2a5298)",
    "linear-gradient(to right, #42275a, #734b6d)",
    "linear-gradient(to right, #0f2027, #203a43, #2c5364)",
    "linear-gradient(to right, #000428, #004e92)",
  ];

  if (settings.presentationGreenScreen) {
    return "#00b140";
  }

  if (settings.bgType === "motion") {
    return "#000000";
  }

  if (settings.bgType === "custom" && settings.customBackground) {
    return `url(${settings.customBackground})`;
  }

  if (settings.bgType === "gradient") {
    return getCustomGradientString(settings.customGradientType, settings.customGradientColor1, settings.customGradientColor2);
  }

  return `url(${backgrounds[settings.bgIndex]})`;
}

function getStageBackground(settings) {
  if (settings.stageGreenScreen) {
    return "#00b140";
  }

  return `url(${backgrounds[settings.stageStillBackground || 0]})`;
}

function StageSideCard({ title, children }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-black/25 p-5 backdrop-blur-md">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-400">
        {title}
      </p>
      <div className="mt-4">{children}</div>
    </div>
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

function PresentationText({ text, style, className = "", twoLines = false, innerRef, isBilingual, settings }) {
  let lines;
  if (text.includes('\n')) {
    lines = text.split('\n');
  } else {
    lines = twoLines ? splitIntoPresentationLines(text, 2) : [text];
  }

  const getLineStyle = (index) => {
    const baseMargin = { marginTop: index > 0 ? "0.8em" : 0, marginBottom: 0 };
    if (!isBilingual || lines.length !== 2) return { ...style, ...baseMargin };
    
    if (index === 0) {
      return { 
        ...style, 
        ...baseMargin,
        fontFamily: getFontCss(settings?.tamilFontFamily, TAMIL_FONT_OPTIONS)
      };
    } else {
      return { 
        ...style, 
        ...baseMargin,
        fontFamily: getFontCss(settings?.fontFamily, FONT_FAMILY_OPTIONS)
      };
    }
  };

  return (
    <div className={className} ref={innerRef}>
      {lines.map((line, index) => (
        <p
          key={`${line}-${index}`}
          className="text-balance w-full"
          style={getLineStyle(index)}
        >
          {line}
        </p>
      ))}
    </div>
  );
}

function FitTextContainer({ text, baseStyle, className, maxFontSize, minFontSize, twoLines, isBilingual, settings }) {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const [dynamicFontSize, setDynamicFontSize] = useState(maxFontSize);

  useEffect(() => {
    let mounted = true;
    let rafId = null;

    const fitText = () => {
      const container = containerRef.current;
      const textEl = textRef.current;
      if (!container || !textEl) return;

      let lo = minFontSize;
      let hi = maxFontSize;
      let best = minFontSize;

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
      if (mounted) setDynamicFontSize(best);
    };

    rafId = window.requestAnimationFrame(fitText);
    
    let ro = null;
    if (typeof ResizeObserver !== "undefined" && containerRef.current?.parentElement) {
      ro = new ResizeObserver(() => {
        rafId = window.requestAnimationFrame(fitText);
      });
      ro.observe(containerRef.current.parentElement);
    }

    return () => {
      mounted = false;
      if (rafId) window.cancelAnimationFrame(rafId);
      if (ro) ro.disconnect();
    };
  }, [text, maxFontSize, minFontSize, twoLines]);

  return (
    <div 
      className={`flex-1 min-h-0 flex flex-col ${
        settings?.presentationVerticalAlign === "top" ? "justify-start pt-8" :
        settings?.presentationVerticalAlign === "bottom" ? "justify-end pb-8" : "justify-center"
      } overflow-hidden w-full h-full`}
      ref={containerRef}
      style={{ fontSize: `${dynamicFontSize}px` }}
    >
      <PresentationText
        innerRef={textRef}
        text={text}
        className={className}
        style={baseStyle}
        twoLines={twoLines}
        isBilingual={isBilingual}
        settings={settings}
      />
    </div>
  );
}

function ClockBadge({ compact = false }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <div
      className={`rounded-full border border-white/10 bg-black/30 text-white/90 backdrop-blur-md ${
        compact ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"
      }`}
    >
      {new Intl.DateTimeFormat(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(now)}
    </div>
  );
}

function CountdownTimer({ targetTime, title, subtitle, styleType = "classic" }) {
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
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-8">
        <div className="flex animate-pulse items-center gap-4 text-amber-500/80 mb-8">
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-amber-500/50"></div>
          <span className="text-sm font-bold uppercase tracking-[0.4em]">{title || "Starting Soon"}</span>
          <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-amber-500/50"></div>
        </div>
        
        <div className="relative">
          <div className="absolute inset-0 blur-3xl bg-white/10 rounded-full scale-150"></div>
          <div className="relative font-sans text-[9rem] md:text-[16rem] font-light leading-none tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white to-stone-400 tabular-nums drop-shadow-2xl">
            {m.toString().padStart(2, '0')}<span className="text-stone-600 opacity-50 mx-2 animate-pulse">:</span>{s.toString().padStart(2, '0')}
          </div>
        </div>
        
        <p className="mt-12 text-lg md:text-xl font-medium tracking-widest text-stone-400 opacity-80 uppercase">{subtitle || "Please take your seats"}</p>
      </div>
    );
  }

  if (styleType === "minimal") {
    return (
      <div className="relative z-10 flex min-h-screen items-center justify-center px-8">
        <div className="relative border border-white/10 bg-black/40 backdrop-blur-xl rounded-[3rem] px-16 py-12 text-center shadow-2xl">
          {title && <p className="mb-4 text-xs md:text-sm font-bold uppercase tracking-[0.3em] text-amber-400">{title}</p>}
          <div className="font-sans text-[6rem] md:text-[9rem] font-black leading-none tracking-tighter text-white tabular-nums drop-shadow-md">
            {m.toString().padStart(2, '0')}<span className="text-white/30">:</span>{s.toString().padStart(2, '0')}
          </div>
          {subtitle && <p className="mt-6 text-sm md:text-base font-semibold text-stone-400">{subtitle}</p>}
        </div>
      </div>
    );
  }

  if (styleType === "elegant") {
    return (
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-8">
        <div className="text-center bg-black/60 backdrop-blur-2xl px-20 py-16 rounded-[4rem] border border-amber-900/30 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
          {title && <p className="mb-8 text-xl md:text-2xl font-serif italic tracking-[0.2em] text-amber-500">{title}</p>}
          <div className="font-serif text-[7rem] md:text-[12rem] font-medium leading-none text-white drop-shadow-2xl flex items-center justify-center">
            {m.toString().padStart(2, '0')}<span className="text-amber-600/50 mx-4 font-light">:</span>{s.toString().padStart(2, '0')}
          </div>
          {subtitle && <p className="mt-10 text-sm md:text-lg font-sans tracking-[0.4em] text-stone-400 uppercase">{subtitle}</p>}
        </div>
      </div>
    );
  }

  if (styleType === "neon") {
    return (
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-8 bg-[#050510]">
        <div className="text-center">
          {title && <p className="mb-8 text-sm md:text-lg font-bold uppercase tracking-[0.5em] text-fuchsia-500 drop-shadow-[0_0_10px_rgba(217,70,239,0.8)]">{title}</p>}
          <div className="font-mono text-[8rem] md:text-[14rem] font-bold leading-none tracking-wider text-cyan-300 tabular-nums drop-shadow-[0_0_30px_rgba(34,211,238,0.6)]">
            {m.toString().padStart(2, '0')}<span className="text-fuchsia-500 animate-pulse">:</span>{s.toString().padStart(2, '0')}
          </div>
          {subtitle && <p className="mt-12 text-xs md:text-sm font-semibold tracking-[0.6em] text-cyan-500 uppercase drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">{subtitle}</p>}
        </div>
      </div>
    );
  }

  if (styleType === "blocks") {
    return (
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-8">
        {title && <p className="mb-12 text-sm md:text-xl font-bold uppercase tracking-[0.4em] text-white/50">{title}</p>}
        <div className="flex items-center gap-4 md:gap-8">
          <div className="flex flex-col items-center bg-white/10 backdrop-blur-xl border-t border-white/20 rounded-3xl p-8 md:p-12 shadow-2xl">
            <span className="font-mono text-[6rem] md:text-[12rem] font-black leading-none text-white">{m.toString().padStart(2, '0')}</span>
            <span className="mt-4 text-xs md:text-sm font-bold uppercase tracking-widest text-amber-400">Minutes</span>
          </div>
          <div className="text-[4rem] md:text-[8rem] font-black text-white/20 animate-pulse">:</div>
          <div className="flex flex-col items-center bg-white/10 backdrop-blur-xl border-t border-white/20 rounded-3xl p-8 md:p-12 shadow-2xl">
            <span className="font-mono text-[6rem] md:text-[12rem] font-black leading-none text-white">{s.toString().padStart(2, '0')}</span>
            <span className="mt-4 text-xs md:text-sm font-bold uppercase tracking-widest text-amber-400">Seconds</span>
          </div>
        </div>
        {subtitle && <p className="mt-12 text-sm md:text-base font-semibold tracking-widest text-stone-300">{subtitle}</p>}
      </div>
    );
  }

  if (styleType === "rings") {
    const progress = (s / 60) * 100;
    return (
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-8">
        <div className="relative flex items-center justify-center w-[400px] h-[400px] md:w-[600px] md:h-[600px]">
          <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]">
            <circle cx="50%" cy="50%" r="48%" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4%" />
            <circle cx="50%" cy="50%" r="48%" fill="none" stroke="#fbbf24" strokeWidth="4%" strokeDasharray="301.59" strokeDashoffset={301.59 - (progress / 100) * 301.59} strokeLinecap="round" className="transition-all duration-1000 ease-linear" pathLength="100" />
          </svg>
          <div className="absolute inset-0 border-[2px] border-dashed border-white/10 rounded-full animate-[spin_30s_linear_infinite]"></div>
          
          <div className="text-center z-10 flex flex-col items-center justify-center">
            {title && <p className="mb-4 text-xs md:text-sm font-bold uppercase tracking-[0.3em] text-amber-400">{title}</p>}
            <div className="font-sans text-[5rem] md:text-[8rem] font-bold leading-none tracking-tighter text-white tabular-nums">
              {m.toString().padStart(2, '0')}<span className="text-white/30">:</span>{s.toString().padStart(2, '0')}
            </div>
            {subtitle && <p className="mt-4 text-[10px] md:text-xs font-semibold tracking-widest text-stone-400 uppercase max-w-[250px] md:max-w-[350px]">{subtitle}</p>}
          </div>
        </div>
      </div>
    );
  }

  if (styleType === "terminal") {
    return (
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-8 bg-black font-mono">
        <div className="w-full max-w-[800px] text-left">
          {title && <p className="mb-6 text-xl md:text-3xl text-green-500">{`> ${title}`}</p>}
          <div className="text-[7rem] md:text-[14rem] font-bold text-green-500 tabular-nums">
            {m.toString().padStart(2, '0')}:{s.toString().padStart(2, '0')}<span className="animate-[pulse_1s_step-end_infinite]">_</span>
          </div>
          {subtitle && <p className="mt-6 text-lg md:text-2xl text-green-700">{`$ ${subtitle}`}</p>}
        </div>
      </div>
    );
  }

  if (styleType === "outline") {
    return (
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-8 text-center">
        {title && <p className="mb-6 text-xl md:text-3xl font-black uppercase tracking-[0.3em] text-white drop-shadow-md">{title}</p>}
        <div className="text-[10rem] md:text-[18rem] font-black tracking-tighter tabular-nums drop-shadow-2xl" style={{ WebkitTextStroke: '6px white', color: 'transparent' }}>
          {m.toString().padStart(2, '0')}:{s.toString().padStart(2, '0')}
        </div>
        {subtitle && <p className="mt-8 text-2xl md:text-4xl font-bold text-white/50">{subtitle}</p>}
      </div>
    );
  }

  if (styleType === "progressbar") {
    const progress = (s / 60) * 100;
    return (
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-8 text-center w-full">
        <div className="text-[9rem] md:text-[15rem] font-black tracking-tight text-white tabular-nums drop-shadow-2xl">
          {m.toString().padStart(2, '0')}:{s.toString().padStart(2, '0')}
        </div>
        <div className="mt-8 h-4 w-[60%] md:w-[40%] overflow-hidden rounded-full bg-white/10 shadow-inner">
          <div className="h-full bg-amber-400 transition-all duration-1000 ease-linear shadow-[0_0_15px_rgba(251,191,36,0.8)]" style={{ width: `${progress}%` }}></div>
        </div>
        {title && <p className="mt-12 text-2xl md:text-4xl font-bold uppercase tracking-[0.4em] text-stone-300 drop-shadow-lg">{title}</p>}
        {subtitle && <p className="mt-4 text-xl md:text-2xl font-bold tracking-widest text-stone-400 uppercase drop-shadow-md">{subtitle}</p>}
      </div>
    );
  }

  // Classic Style (Default)
  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center px-8">
      <div className="text-center">
        {title && <p className="mb-6 text-2xl md:text-3xl font-semibold uppercase tracking-[0.45em] text-stone-300">{title}</p>}
        <div className="font-mono text-[8rem] md:text-[14rem] font-bold leading-none tracking-tighter text-white tabular-nums drop-shadow-2xl">
          {m.toString().padStart(2, '0')}:{s.toString().padStart(2, '0')}
        </div>
        {subtitle && <p className="mt-8 text-2xl md:text-4xl text-stone-200">{subtitle}</p>}
      </div>
    </div>
  );
}

function StageClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  
  return (
    <div className="absolute top-6 right-8 text-4xl font-mono font-bold text-amber-400 bg-black/50 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10">
      {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </div>
  );
}

function DisplayBody({ isStage, settings, activeItem, nextItem, displayMode, timerTarget }) {
  const title = settings.presentationTitle || "Tamil Bible Premium";
  const subtitle = settings.presentationSubtitle || "Live Scripture Display";
  const announcementTitle = settings.presentationAnnouncementTitle || "Welcome";
  const announcementBody = settings.presentationAnnouncementBody || "Service will begin shortly.";
  const presentationFont = getPresentationFontFamily(settings);
  const isBilingual = settings.language === "ta-en";
  const liveReference = activeItem
    ? activeItem.isSong 
      ? null
      : isBilingual && activeItem.bookEnglish && activeItem.bookEnglish !== activeItem.bookTamil
        ? `${activeItem.bookTamil} / ${activeItem.bookEnglish} ${activeItem.chapter}:${activeItem.verse}`
        : `${activeItem.bookTamil || activeItem.bookEnglish} ${activeItem.chapter}:${activeItem.verse}`
    : null;
  const mainMaxFont = Math.max(Math.min(settings.presentationMaxFontSize || 90, 72), 28);
  const mainTextStyle = {
    lineHeight: settings.presentationLineHeight || (settings.presentationTwoLines ? 1.08 : 1.24),
    textAlign: settings.presentationJustify || "center",
    textTransform: settings.presentationUppercase ? "uppercase" : "none",
    textShadow: settings.presentationShadow ? "0 4px 18px rgba(0,0,0,0.52)" : "none",
    WebkitTextStroke: settings.presentationOutline ? "1px rgba(0,0,0,0.8)" : "0px",
    whiteSpace: settings.presentationLineWrap === false ? "nowrap" : "normal",
    overflowWrap: "normal",
    wordBreak: "normal",
    maxWidth: "100%",
    marginInline: "auto",
    fontFamily: presentationFont,
    letterSpacing: `${settings.presentationLetterSpacing || 0}px`,
  };
  const stageMaxFont = Math.max(Math.min((settings.presentationMaxFontSize || 90) * (settings.stageSmallWindow ? 0.82 : 1), 140), 34);
  const stageTextStyle = {
    lineHeight: settings.presentationLineHeight || (settings.presentationTwoLines ? 1.05 : 1.2),
    textAlign: settings.presentationJustify || "center",
    textTransform: settings.presentationUppercase ? "uppercase" : "none",
    textShadow: settings.presentationShadow ? "0 4px 16px rgba(0,0,0,0.55)" : "none",
    color: settings.stageTextColor1 || "#ffffff",
    WebkitTextStroke: settings.presentationOutline ? "1px rgba(0,0,0,0.8)" : "0px",
    whiteSpace: settings.presentationLineWrap === false ? "nowrap" : "normal",
    overflowWrap: "normal",
    wordBreak: "normal",
    maxWidth: "100%",
    fontFamily: presentationFont,
    letterSpacing: `${settings.presentationLetterSpacing || 0}px`,
  };

  if (!isStage) {
    if (displayMode === "black") {
      return (
        <div className="relative z-10 flex min-h-screen items-center justify-center bg-black" />
      );
    }

    if (displayMode === "logo") {
      if (settings.presentationShowCustomLogo && settings.stageLogoImage) {
        return (
          <div className="relative z-50 flex h-screen w-screen items-center justify-center bg-black">
            <img
              src={settings.stageLogoImage}
              alt="Presentation logo"
              className="h-full w-full object-contain"
            />
          </div>
        );
      }

      return (
        <div className="relative z-10 flex min-h-screen items-center justify-center px-8">
          <div className={settings.presentationBox ? "rounded-[2rem] border border-white/10 bg-black/35 px-16 py-12 backdrop-blur-md" : "px-16 py-12"}>
            <div className="text-center">
              <p className="text-5xl font-bold text-white">{title}</p>
              <p className="mt-4 text-xl text-stone-300">{subtitle}</p>
            </div>
          </div>
        </div>
      );
    }

    if (displayMode === "title") {
      return (
        <div className="relative z-10 flex min-h-screen items-center justify-center px-8">
          <div className={`max-w-5xl text-center ${settings.presentationBox ? "rounded-[2rem] border border-white/10 bg-black/35 px-16 py-12 backdrop-blur-md" : ""}`}>
            <h1 className="text-balance text-6xl font-bold text-white md:text-8xl">{title}</h1>
            <p className="mt-6 text-balance text-2xl leading-10 text-stone-200 md:text-3xl">{subtitle}</p>
          </div>
        </div>
      );
    }

    if (displayMode === "announcement") {
      return (
        <div className="relative z-10 flex min-h-screen items-center justify-center px-8">
          <div className={`max-w-5xl text-center ${settings.presentationBox ? "rounded-[2rem] border border-white/10 bg-black/35 px-16 py-12 backdrop-blur-md" : ""}`}>
            <h1 className="text-balance text-5xl font-bold text-white md:text-7xl">{announcementTitle}</h1>
            <p className="mt-6 text-balance text-2xl leading-10 text-stone-200 md:text-3xl">{announcementBody}</p>
          </div>
        </div>
      );
    }

    if (displayMode === "timer") {
      return (
        <CountdownTimer 
          targetTime={timerTarget} 
          title={settings.presentationAnnouncementTitle || "Service begins in"} 
          subtitle={settings.presentationAnnouncementBody || "Please silence your mobile phones."} 
          styleType={settings.timerStyle || "classic"}
        />
      );
    }

    if (displayMode === "clear") {
      return null;
    }

  }

  if (isStage) {
    return (
      <div
        className={`relative z-10 grid h-full w-full gap-6 px-6 py-6 ${
          settings.stagePreset === "horizontal"
            ? "xl:grid-cols-[1.3fr,0.7fr]"
            : "xl:grid-cols-[1fr]"
        }`}
        style={{
          maxWidth: settings.stageSmallWindow ? "1180px" : undefined,
          marginInline: settings.stageSmallWindow ? "auto" : undefined,
        }}
      >
        <div
          className={`flex h-full min-h-0 flex-col overflow-hidden px-8 py-10 ${
            settings.stageWindowView ? "justify-start" : "justify-center"
          }`}
          style={{
            maxWidth:
              settings.stagePreset === "primary" && settings.stageSmallWindow
                ? "920px"
                : undefined,
            width:
              settings.stagePreset === "primary" && settings.stageSmallWindow
                ? "100%"
                : undefined,
            marginInline:
              settings.stagePreset === "primary" && settings.stageSmallWindow
                ? "auto"
                : undefined,
          }}
        >
          {settings.stageShowDateTime ? (
            <div className="mb-6 flex justify-end">
              <ClockBadge />
            </div>
          ) : null}
          {activeItem ? (
            <div key={activeItem.id} className={`flex-1 flex flex-col min-h-0 ${
              settings.presentationTransition === false ? "animate-none" :
              settings.presentationTransition === true ? "animate-fade-in" :
              `animate-${settings.presentationTransition || "fade-in"}`
            }`}>
              <p
                className="hidden text-lg font-semibold uppercase tracking-[0.35em]"
                style={{ color: settings.stageTextColor2 || "#f8fafc" }}
              >

              </p>
              {liveReference && (
                <p
                  className="text-4xl font-bold shrink-0"
                  style={{ color: settings.stageTextColor2 || "#f8fafc" }}
                >
                  {liveReference}
                </p>
              )}
              <div className="mt-8 flex-1 min-h-0 flex flex-col">
                <FitTextContainer
                  text={activeItem.text}
                  className="font-bold"
                  baseStyle={stageTextStyle}
                  maxFontSize={stageMaxFont}
                  minFontSize={18}
                  twoLines={settings.presentationTwoLines}
                  isBilingual={isBilingual}
                  settings={settings}
                />
              </div>
            </div>
          ) : (
            <p className="text-4xl font-bold text-white">
              Add a verse to the sermon queue to start the stage screen.
            </p>
          )}

          {settings.presentationShowVerseLogo ? (
            <div className="mt-8 flex justify-end">
              <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/85">
                Tamil Bible Premium
              </div>
            </div>
          ) : null}

          {settings.stagePreset !== "horizontal" && settings.stageMessageVisible && settings.stageMessage ? (
            <div className="mt-8 flex-shrink-0 animate-pulse rounded-3xl border border-white/10 bg-red-500/20 px-10 py-6 text-center">
              <p className="text-3xl font-bold text-red-200">{settings.stageMessage}</p>
            </div>
          ) : null}
        </div>

        {settings.stagePreset === "horizontal" ? (
          <div
            className="flex min-h-0 flex-col space-y-5 overflow-hidden"
            style={{
              maxWidth: settings.stageSmallWindow ? "320px" : undefined,
            }}
          >
            {settings.stageMessageVisible && settings.stageMessage ? (
              <StageSideCard title="Message">
                <p className="text-2xl font-semibold leading-10 text-white">
                  {settings.stageMessage}
                </p>
              </StageSideCard>
            ) : null}

            <StageSideCard title="Next Verse">
              {nextItem ? (
                <div className="flex min-h-0 flex-col overflow-hidden">
                  <p className="shrink-0 text-xl font-bold text-white">
                    {nextItem.isSong ? nextItem.bookTamil : `${nextItem.bookTamil} ${nextItem.chapter}:${nextItem.verse}`}
                  </p>
                  <p className="mt-4 min-h-0 flex-1 overflow-hidden text-ellipsis whitespace-pre-wrap text-lg leading-9 text-stone-200">
                    {nextItem.text}
                  </p>
                </div>
              ) : (
                <p className="text-lg text-stone-300">No next verse queued yet.</p>
              )}
            </StageSideCard>

            {settings.presentationShowCustomLogo && settings.stageLogoImage ? (
              <StageSideCard title="Logo">
                <img
                  src={settings.stageLogoImage}
                  alt="Stage logo"
                  className="max-h-40 max-w-full object-contain"
                />
              </StageSideCard>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="relative z-10 flex h-full w-full items-center justify-center px-8 py-10">
      <div
        className={`flex flex-col w-full h-full rounded-[2rem] px-10 py-12 ${settings.presentationBox ? "border border-white/15 backdrop-blur-md" : ""}`}
        style={{
          maxHeight: "90vh",
          maxWidth: settings.presentationPreset === "horizontal" ? "1400px" : "1100px",
          background: settings.presentationBox
            ? `rgba(0, 0, 0, ${Math.min((settings.cardOpacity ?? 0.5) + 0.2, 0.9)})`
            : "transparent",
          boxShadow: settings.presentationBorder
            ? "0 0 0 1px rgba(255,255,255,0.2) inset"
            : "none",
        }}
      >
        {activeItem ? (
          <div className="flex-1 flex flex-col min-h-0 w-full">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                {liveReference && (
                  <div
                    key={`ref-${activeItem.id}`}
                    className={`inline-flex max-w-full items-center rounded-full px-4 py-2 ${
                      settings.presentationTransition === false ? "animate-none" :
                      settings.presentationTransition === true ? "animate-fade-in" :
                      `animate-${settings.presentationTransition || "fade-in"}`
                    } ${
                      settings.presentationHeaderBox ? "border border-white/10 bg-black/25" : ""
                    }`}
                  >
                    <p className="truncate text-3xl font-bold text-white">
                      {liveReference}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {settings.presentationShowDateTime ? <ClockBadge compact /> : null}
                {settings.presentationShowVerseLogo ? (
                  <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/85">
                    Tamil Bible Premium
                  </div>
                ) : null}
                {settings.presentationShowCustomLogo && settings.stageLogoImage ? (
                  <img
                    src={settings.stageLogoImage}
                    alt="Presentation logo"
                    className="h-14 w-auto object-contain drop-shadow-lg"
                  />
                ) : null}
              </div>
            </div>

            <div 
              key={`text-${activeItem.id}`}
              className={`mt-8 flex-1 min-h-0 flex flex-col ${
                settings.presentationTransition === false ? "animate-none" :
                settings.presentationTransition === true ? "animate-fade-in" :
                `animate-${settings.presentationTransition || "fade-in"}`
              }`}
            >
              <FitTextContainer
                text={activeItem.text?.replace(new RegExp(`^${activeItem.verse}\\s+`), '')}
                className="font-bold text-white"
                baseStyle={mainTextStyle}
                maxFontSize={mainMaxFont}
                minFontSize={20}
                twoLines={settings.presentationTwoLines}
                isBilingual={isBilingual}
                settings={settings}
              />
            </div>
          </div>
        ) : (
          <div className="py-16 text-center">
            <p className="text-4xl font-bold text-white">No active sermon verse yet.</p>
            <p className="mt-4 text-xl text-stone-300">
              Add a verse from the chapter screen or open the phone remote.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PresentationDisplay() {
  const { mode = "main" } = useParams();
  const [settings] = useAppSettings();
  const libraryData = useLibraryData();
  const displayRef = useRef(null);

  const queue = libraryData.sermon.queue;
  const activeItem = libraryData.sermon.activeItem || queue[0] || null;
  const currentIndex = queue.findIndex((item) => item.id === activeItem?.id);
  const nextItem =
    currentIndex >= 0 && currentIndex < queue.length - 1 ? queue[currentIndex + 1] : null;

  const isStage = mode === "stage";
  const isEnabled = isStage
    ? settings.enableStagePresentation
    : settings.enableMainPresentation;
  const background = isStage ? getStageBackground(settings) : getReaderBackground(settings);
  const overlayColor = settings.stageOverlayColor || "#000000";
  const overlayOpacity = settings.presentationOverlayOpacity ?? 0.72;
  const displayMode = libraryData.sermon.displayMode || "live";
  const timerTarget = libraryData.sermon.timerTarget || null;
  const tickerText = libraryData.sermon.tickerText || "";
  const transitionKey = `${mode}:${displayMode}:${activeItem?.id || "none"}:${nextItem?.id || "none"}:${timerTarget || "none"}:${tickerText}`;
  const [renderState, setRenderState] = useState({
    activeItem,
    nextItem,
    displayMode,
    timerTarget,
    tickerText,
    transitionKey,
  });
  const [isFading, setIsFading] = useState(false);
  const transitionTimerRef = useRef(null);
  const fadeFrameRef = useRef(null);
  const visibleState =
    settings.presentationTransition === false || settings.presentationTransition === "none"
      ? {
          activeItem,
          nextItem,
          displayMode,
          timerTarget,
          tickerText,
        }
      : {
          activeItem: renderState.activeItem,
          nextItem: renderState.nextItem,
          displayMode: renderState.displayMode,
          timerTarget: renderState.timerTarget,
          tickerText: renderState.tickerText,
        };
  const effectiveIsFading =
    settings.presentationTransition === false || settings.presentationTransition === "none" ? false : isFading;

  useEffect(() => {
    const displayElement = displayRef.current;

    if (!displayElement || document.fullscreenElement) {
      return undefined;
    }

    const requestDisplayFullscreen = () => {
      displayElement.requestFullscreen?.().catch(() => {});
    };

    const fullscreenRequestId = window.requestAnimationFrame(requestDisplayFullscreen);

    return () => {
      window.cancelAnimationFrame(fullscreenRequestId);
    };
  }, []);

  useEffect(() => {
    if (renderState.transitionKey === transitionKey) {
      return undefined;
    }

    if (settings.presentationTransition === false || settings.presentationTransition === "none") {
      setRenderState({
        activeItem,
        nextItem,
        displayMode,
        timerTarget,
        tickerText,
        transitionKey,
      });
      return undefined;
    }

    fadeFrameRef.current = window.requestAnimationFrame(() => {
      setIsFading(true);
      fadeFrameRef.current = null;
    });

    if (transitionTimerRef.current) {
      window.clearTimeout(transitionTimerRef.current);
    }

    transitionTimerRef.current = window.setTimeout(() => {
      setRenderState({
        activeItem,
        nextItem,
        displayMode,
        timerTarget,
        tickerText,
        transitionKey,
      });
      setIsFading(false);
      transitionTimerRef.current = null;
    }, 220);

    return () => {
      if (fadeFrameRef.current) {
        window.cancelAnimationFrame(fadeFrameRef.current);
        fadeFrameRef.current = null;
      }
      if (transitionTimerRef.current) {
        window.clearTimeout(transitionTimerRef.current);
        transitionTimerRef.current = null;
      }
    };
  }, [
    activeItem,
    nextItem,
    displayMode,
    timerTarget,
    tickerText,
    transitionKey,
    renderState.transitionKey,
    settings.presentationTransition,
  ]);

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === "b" || event.key === "B") {
        setSermonDisplayMode("black");
      } else if (event.key === "l" || event.key === "L") {
        setSermonDisplayMode("live");
      } else if (event.key === "t" || event.key === "T") {
        setSermonDisplayMode("title");
      } else if (event.key === "o" || event.key === "O") {
        setSermonDisplayMode("logo");
      } else if (event.key === "a" || event.key === "A") {
        setSermonDisplayMode("announcement");
      }
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      // If the window is resized to match the screen dimensions (maximized)
      // Attempt to enter true fullscreen to hide the title bar.
      if (
        window.outerWidth >= window.screen.availWidth * 0.99 &&
        window.outerHeight >= window.screen.availHeight * 0.99 &&
        !document.fullscreenElement
      ) {
        document.documentElement.requestFullscreen().catch(() => {
          // If the browser blocks it due to lack of user gesture, we fail silently.
        });
      }
    };

    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      if (fadeFrameRef.current) {
        window.cancelAnimationFrame(fadeFrameRef.current);
      }
      if (transitionTimerRef.current) {
        window.clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={displayRef}
      onDoubleClick={() => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      }}
      className="relative flex h-screen w-screen flex-col overflow-hidden text-white cursor-default"
      style={{
        background: displayMode === "black" ? "#000000" : background,
        backgroundSize: "cover",
        backgroundPosition: "center",
        transition:
          settings.presentationTransition === false || settings.presentationTransition === "none"
            ? "none"
            : "background 220ms ease-in-out",
      }}
    >
      {displayMode !== "black" && !isStage && settings.bgType === "motion" && !settings.presentationGreenScreen ? (
        <MotionBackground variant={settings.motionBackground} />
      ) : null}
      {displayMode !== "black" ? (
        <div
          className="absolute inset-0"
          style={{
            transitionDuration:
              settings.presentationTransition === false || settings.presentationTransition === "none" ? "0ms" : undefined,
            background: isStage
              ? `linear-gradient(180deg, ${overlayColor}${Math.round((overlayOpacity * 0.45) * 255).toString(16).padStart(2, "0")}, ${overlayColor}${Math.round(overlayOpacity * 255).toString(16).padStart(2, "0")})`
              : `linear-gradient(180deg, rgba(7,17,31,${Math.max(overlayOpacity - 0.38, 0.12)}), rgba(7,17,31,${overlayOpacity}))`,
          }}
        />
      ) : null}

      {isEnabled ? (
        <div
          className="relative z-10 flex flex-1 min-h-0 w-full flex-col"
          style={{
            transitionDuration:
              settings.presentationTransition === false || settings.presentationTransition === "none" ? "0ms" : undefined,
          }}
        >
          <DisplayBody
            isStage={isStage}
            settings={settings}
            activeItem={activeItem}
            nextItem={nextItem}
            displayMode={displayMode}
            timerTarget={timerTarget}
          />
        </div>
      ) : (
        <div className="relative z-10 flex min-h-screen items-center justify-center px-8">
          <div className="rounded-[2rem] border border-white/10 bg-black/35 px-10 py-12 text-center backdrop-blur-md">
            <p className="text-lg font-semibold uppercase tracking-[0.4em] text-stone-400">
              {isStage ? "Stage View" : "Main Presentation"}
            </p>
            <p className="mt-6 text-4xl font-bold text-white">
              Turned Off
            </p>
            <p className="mt-4 text-lg text-stone-300">
              Enable this screen from Advanced Presentation when you want to show it again.
            </p>
          </div>
        </div>
      )}

      {/* Scrolling Ticker (Marquee) */}
      {!isStage && visibleState.tickerText ? (
        <div className="absolute bottom-0 left-0 right-0 z-50 flex items-center bg-black/60 backdrop-blur-lg border-t border-white/10 h-16 md:h-20 overflow-hidden">
          <div className="whitespace-nowrap animate-marquee">
            <span className="text-2xl md:text-3xl font-bold text-white tracking-wide drop-shadow-md">
              {visibleState.tickerText}
            </span>
            <span className="text-2xl md:text-3xl font-bold text-white tracking-wide drop-shadow-md ml-[100vw]">
              {visibleState.tickerText}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
