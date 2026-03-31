import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import useAppSettings from "../hooks/useAppSettings";
import useLibraryData from "../hooks/useLibraryData";
import { setSermonDisplayMode } from "../utils/libraryData";
import MotionBackground from "../components/MotionBackground";
import {
  getPresentationFontFamily,
} from "../utils/appearance";

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

  if (settings.bgType === "motion") {
    return "#07111f";
  }

  if (settings.bgType === "custom" && settings.customBackground) {
    return `url(${settings.customBackground})`;
  }

  if (settings.bgType === "gradient") {
    return gradients[settings.bgIndex];
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
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
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

function PresentationText({ text, style, className = "", twoLines = false }) {
  const lines = twoLines ? splitIntoPresentationLines(text, 2) : [text];

  return (
    <div className={className}>
      {lines.map((line, index) => (
        <p
          key={`${line}-${index}`}
          className={index > 0 ? "mt-[0.22em]" : ""}
          style={{ ...style, margin: 0 }}
        >
          {line}
        </p>
      ))}
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
        weekday: compact ? undefined : "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(now)}
    </div>
  );
}

function DisplayBody({ isStage, settings, activeItem, nextItem, displayMode }) {
  const title = settings.presentationTitle || "Tamil Bible Premium";
  const subtitle = settings.presentationSubtitle || "Live Scripture Display";
  const announcementTitle = settings.presentationAnnouncementTitle || "Welcome";
  const announcementBody = settings.presentationAnnouncementBody || "Service will begin shortly.";
  const presentationFont = getPresentationFontFamily(settings);
  const liveReference = activeItem
    ? `${activeItem.bookTamil} ${activeItem.chapter}:${activeItem.verse}`
    : null;
  const mainTextStyle = {
    fontSize: `${Math.max(Math.min(settings.presentationMaxFontSize || 90, 72), 28)}px`,
    lineHeight: settings.presentationTwoLines ? 1.08 : 1.24,
    textAlign: settings.presentationJustify || "center",
    textTransform: settings.presentationUppercase ? "uppercase" : "none",
    textShadow: settings.presentationShadow ? "0 4px 18px rgba(0,0,0,0.52)" : "none",
    WebkitTextStroke: settings.presentationOutline ? "1px rgba(0,0,0,0.8)" : "0px",
    whiteSpace: settings.presentationLineWrap === false ? "nowrap" : "normal",
    overflowWrap: "anywhere",
    wordBreak: "break-word",
    maxWidth: "100%",
    marginInline: "auto",
    fontFamily: presentationFont,
    letterSpacing: `${settings.presentationLetterSpacing || 0}px`,
  };
  const stageTextStyle = {
    fontSize: `${Math.max(
      Math.min(
        (settings.presentationMaxFontSize || 90) * (settings.stageSmallWindow ? 0.82 : 1),
        140
      ),
      34
    )}px`,
    lineHeight: settings.presentationTwoLines ? 1.05 : 1.2,
    textAlign: settings.presentationJustify || "center",
    textTransform: settings.presentationUppercase ? "uppercase" : "none",
    textShadow: settings.presentationShadow ? "0 4px 16px rgba(0,0,0,0.55)" : "none",
    color: settings.stageTextColor1 || "#ffffff",
    WebkitTextStroke: settings.presentationOutline ? "1px rgba(0,0,0,0.8)" : "0px",
    whiteSpace: settings.presentationLineWrap === false ? "nowrap" : "normal",
    overflowWrap: "anywhere",
    wordBreak: "break-word",
    maxWidth: "100%",
    fontFamily: presentationFont,
    letterSpacing: `${settings.presentationLetterSpacing || 0}px`,
  };

  if (displayMode === "black") {
    return (
      <div className="relative z-10 flex min-h-screen items-center justify-center bg-black" />
    );
  }

  if (displayMode === "logo") {
    return (
      <div className="relative z-10 flex min-h-screen items-center justify-center px-8">
        <div className="rounded-[2rem] border border-white/10 bg-black/35 px-10 py-10 backdrop-blur-md">
          {settings.presentationShowCustomLogo && settings.stageLogoImage ? (
            <img
              src={settings.stageLogoImage}
              alt="Presentation logo"
              className="max-h-[45vh] max-w-[70vw] object-contain"
            />
          ) : (
            <div className="text-center">
              <p className="text-5xl font-bold text-white">{title}</p>
              <p className="mt-4 text-xl text-slate-300">{subtitle}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (displayMode === "title") {
    return (
      <div className="relative z-10 flex min-h-screen items-center justify-center px-8">
        <div className="max-w-5xl text-center">
          <p className="text-lg font-semibold uppercase tracking-[0.45em] text-slate-300">
            Presentation
          </p>
          <h1 className="mt-6 text-6xl font-bold text-white md:text-8xl">{title}</h1>
          <p className="mt-6 text-2xl leading-10 text-slate-200 md:text-3xl">{subtitle}</p>
        </div>
      </div>
    );
  }

  if (displayMode === "announcement") {
    return (
      <div className="relative z-10 flex min-h-screen items-center justify-center px-8">
        <div className="max-w-5xl rounded-[2rem] border border-white/10 bg-black/30 px-10 py-12 text-center backdrop-blur-md">
          <p className="text-lg font-semibold uppercase tracking-[0.45em] text-slate-300">
            Announcement
          </p>
          <h1 className="mt-6 text-5xl font-bold text-white md:text-7xl">{announcementTitle}</h1>
          <p className="mt-6 text-2xl leading-10 text-slate-200 md:text-3xl">{announcementBody}</p>
        </div>
      </div>
    );
  }

  if (isStage) {
    return (
      <div
        className={`relative z-10 grid min-h-screen gap-6 px-6 py-6 ${
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
          className={`flex flex-col rounded-[2rem] border border-white/10 bg-black/25 px-8 py-10 backdrop-blur-md ${
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
            <>
              <p
                className="text-lg font-semibold uppercase tracking-[0.35em]"
                style={{ color: settings.stageTextColor2 || "#f8fafc" }}
              >
                Live Verse
              </p>
              <p
                className="mt-5 text-4xl font-bold"
                style={{ color: settings.stageTextColor2 || "#f8fafc" }}
              >
                {liveReference}
              </p>
              <PresentationText
                text={activeItem.text}
                className="mt-10 font-bold"
                style={stageTextStyle}
                twoLines={settings.presentationTwoLines}
              />
            </>
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
        </div>

        {settings.stagePreset === "horizontal" ? (
          <div
            className="space-y-5"
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
                <>
                  <p className="text-xl font-bold text-white">
                    {nextItem.bookTamil} {nextItem.chapter}:{nextItem.verse}
                  </p>
                  <p className="mt-4 text-lg leading-9 text-slate-200">
                    {nextItem.text}
                  </p>
                </>
              ) : (
                <p className="text-lg text-slate-300">No next verse queued yet.</p>
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
    <div className="relative z-10 flex min-h-screen items-center justify-center px-8 py-10">
      <div
        className="w-full rounded-[2rem] border border-white/15 px-10 py-12 backdrop-blur-md"
        style={{
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
          <>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div
                  className={`inline-flex max-w-full items-center rounded-full px-4 py-2 ${
                    settings.presentationHeaderBox ? "border border-white/10 bg-black/25" : ""
                  }`}
                >
                  <p className="truncate text-3xl font-bold text-white">
                    {liveReference}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {settings.presentationShowDateTime ? <ClockBadge compact /> : null}
                {settings.presentationShowVerseLogo ? (
                  <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/85">
                    Tamil Bible Premium
                  </div>
                ) : null}
                {settings.presentationShowCustomLogo && settings.stageLogoImage ? (
                  <div className="flex h-14 w-20 items-center justify-center rounded-2xl border border-white/10 bg-black/25 p-2">
                    <img
                      src={settings.stageLogoImage}
                      alt="Presentation logo"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                ) : null}
              </div>
            </div>

            <PresentationText
              text={activeItem.text}
              className="mt-6 font-bold text-white"
              style={mainTextStyle}
              twoLines={settings.presentationTwoLines}
            />
          </>
        ) : (
          <div className="py-16 text-center">
            <p className="text-4xl font-bold text-white">No active sermon verse yet.</p>
            <p className="mt-4 text-xl text-slate-300">
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
  const transitionKey = `${mode}:${displayMode}:${activeItem?.id || "none"}:${nextItem?.id || "none"}`;
  const [renderState, setRenderState] = useState({
    activeItem,
    nextItem,
    displayMode,
    transitionKey,
  });
  const [isFading, setIsFading] = useState(false);
  const transitionTimerRef = useRef(null);
  const fadeFrameRef = useRef(null);
  const visibleState =
    settings.presentationTransition === false
      ? {
          activeItem,
          nextItem,
          displayMode,
        }
      : {
          activeItem: renderState.activeItem,
          nextItem: renderState.nextItem,
          displayMode: renderState.displayMode,
        };
  const effectiveIsFading =
    settings.presentationTransition === false ? false : isFading;

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

    if (settings.presentationTransition === false) {
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
    return () => {
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
      className="relative min-h-screen overflow-hidden text-white"
      style={{
        background: visibleState.displayMode === "black" ? "#000000" : background,
        backgroundSize: "cover",
        backgroundPosition: "center",
        transition:
          settings.presentationTransition === false
            ? "none"
            : "background 220ms ease-in-out",
      }}
    >
      {visibleState.displayMode !== "black" && !isStage && settings.bgType === "motion" ? (
        <MotionBackground variant={settings.motionBackground} />
      ) : null}
      {visibleState.displayMode !== "black" ? (
        <div
          className={`absolute inset-0 transition-opacity duration-200 ease-in-out ${
            effectiveIsFading ? "opacity-0" : "opacity-100"
          }`}
          style={{
            transitionDuration:
              settings.presentationTransition === false ? "0ms" : undefined,
            background: isStage
              ? `linear-gradient(180deg, ${overlayColor}${Math.round((overlayOpacity * 0.45) * 255).toString(16).padStart(2, "0")}, ${overlayColor}${Math.round(overlayOpacity * 255).toString(16).padStart(2, "0")})`
              : `linear-gradient(180deg, rgba(7,17,31,${Math.max(overlayOpacity - 0.38, 0.12)}), rgba(7,17,31,${overlayOpacity}))`,
          }}
        />
      ) : null}

      {isEnabled ? (
        <div
          className={`transition-opacity duration-200 ease-in-out ${
            effectiveIsFading ? "opacity-0" : "opacity-100"
          }`}
          style={{
            transitionDuration:
              settings.presentationTransition === false ? "0ms" : undefined,
          }}
        >
          <DisplayBody
            isStage={isStage}
            settings={settings}
            activeItem={visibleState.activeItem}
            nextItem={visibleState.nextItem}
            displayMode={visibleState.displayMode}
          />
        </div>
      ) : (
        <div className="relative z-10 flex min-h-screen items-center justify-center px-8">
          <div className="rounded-[2rem] border border-white/10 bg-black/35 px-10 py-12 text-center backdrop-blur-md">
            <p className="text-lg font-semibold uppercase tracking-[0.4em] text-slate-400">
              {isStage ? "Stage View" : "Main Presentation"}
            </p>
            <p className="mt-6 text-4xl font-bold text-white">
              Turned Off
            </p>
            <p className="mt-4 text-lg text-slate-300">
              Enable this screen from Advanced Presentation when you want to show it again.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
