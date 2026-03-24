import { Link, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

import useAppSettings from "../hooks/useAppSettings";
import useLibraryData from "../hooks/useLibraryData";
import {
  setSermonDisplayMode,
  showNextSermonItem,
  showPreviousSermonItem,
} from "../utils/libraryData";

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

function getReaderBackground(settings) {
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

function ControlButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
        active
          ? "bg-[linear-gradient(135deg,#2563eb,#38bdf8)] text-white shadow-lg"
          : "border border-white/10 bg-black/30 text-slate-100 hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
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

function DisplayBody({ isStage, settings, activeItem, nextItem, displayMode }) {
  const title = settings.presentationTitle || "Tamil Bible Premium";
  const subtitle = settings.presentationSubtitle || "Live Scripture Display";
  const announcementTitle = settings.presentationAnnouncementTitle || "Welcome";
  const announcementBody = settings.presentationAnnouncementBody || "Service will begin shortly.";

  if (displayMode === "black") {
    return (
      <div className="relative z-10 flex min-h-screen items-center justify-center bg-black">
        <p className="text-lg uppercase tracking-[0.4em] text-slate-500">Black Screen</p>
      </div>
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
    const textStyle = {
      fontSize: `${Math.max(Math.min(settings.presentationMaxFontSize || 90, 140), 40)}px`,
      lineHeight: settings.presentationTwoLines ? 1.15 : 1.28,
      textAlign: settings.presentationJustify || "center",
      textTransform: settings.presentationUppercase ? "uppercase" : "none",
      textShadow: settings.presentationShadow ? "0 4px 16px rgba(0,0,0,0.55)" : "none",
      color: settings.stageTextColor1 || "#ffffff",
      WebkitTextStroke: settings.presentationOutline ? "1px rgba(0,0,0,0.8)" : "0px",
      whiteSpace: settings.presentationLineWrap ? "normal" : "nowrap",
      overflowWrap: settings.presentationLineWrap ? "break-word" : "normal",
    };

    return (
      <div className="relative z-10 grid min-h-screen gap-6 px-8 py-8 xl:grid-cols-[1.3fr,0.7fr]">
        <div className="flex flex-col justify-center rounded-[2rem] border border-white/10 bg-black/25 px-10 py-12 backdrop-blur-md">
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
                {activeItem.bookTamil} {activeItem.chapter}:{activeItem.verse}
              </p>
              <p className="mt-10 font-bold" style={textStyle}>
                {activeItem.text}
              </p>
            </>
          ) : (
            <p className="text-4xl font-bold text-white">
              Add a verse to the sermon queue to start the stage screen.
            </p>
          )}
        </div>

        <div className="space-y-5">
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
            <p className="text-base font-semibold uppercase tracking-[0.36em] text-slate-300">
              Live Presentation
            </p>
            <p className="mt-5 text-3xl font-bold text-white">
              {activeItem.bookTamil} {activeItem.chapter}:{activeItem.verse}
            </p>
              {(() => {
                const mainTextStyle = {
                  fontSize: `${Math.max(Math.min(settings.presentationMaxFontSize || 90, 140), 48)}px`,
                  lineHeight: settings.presentationTwoLines ? 1.14 : 1.28,
                  textAlign: settings.presentationJustify || "center",
                  textTransform: settings.presentationUppercase ? "uppercase" : "none",
                  textShadow: settings.presentationShadow ? "0 4px 18px rgba(0,0,0,0.52)" : "none",
                  WebkitTextStroke: settings.presentationOutline ? "1px rgba(0,0,0,0.8)" : "0px",
                  whiteSpace: settings.presentationLineWrap ? "normal" : "nowrap",
                  overflowWrap: settings.presentationLineWrap ? "break-word" : "normal",
                };

                return (
                  <div>
                    {settings.presentationHeaderBox ? (
                      <div className="inline-block rounded px-3 py-1" style={{ background: "rgba(255,255,255,0.04)" }}>
                        <p className="text-base font-semibold uppercase tracking-[0.36em] text-slate-300">Live Presentation</p>
                      </div>
                    ) : null}

                    <p className="mt-6 font-bold text-white" style={mainTextStyle}>
                      {activeItem.text}
                    </p>
                  </div>
                );
              })()}
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
  const displayMode = libraryData.sermon.displayMode || "live";
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideControlsTimerRef = useRef(null);

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
    const showControls = () => {
      setControlsVisible(true);

      if (hideControlsTimerRef.current) {
        window.clearTimeout(hideControlsTimerRef.current);
      }

      hideControlsTimerRef.current = window.setTimeout(() => {
        setControlsVisible(false);
      }, 3200);
    };

    const handleKey = (event) => {
      showControls();

      if (event.key === "ArrowRight") {
        showNextSermonItem();
      } else if (event.key === "ArrowLeft") {
        showPreviousSermonItem();
      } else if (event.key === "b" || event.key === "B") {
        setSermonDisplayMode("black");
      } else if (event.key === "l" || event.key === "L") {
        setSermonDisplayMode("live");
      } else if (event.key === "t" || event.key === "T") {
        setSermonDisplayMode("title");
      } else if (event.key === "o" || event.key === "O") {
        setSermonDisplayMode("logo");
      } else if (event.key === "a" || event.key === "A") {
        setSermonDisplayMode("announcement");
      } else if (event.key === "h" || event.key === "H") {
        setControlsVisible((current) => !current);
      }
    };

    showControls();
    window.addEventListener("mousemove", showControls);
    window.addEventListener("touchstart", showControls);
    window.addEventListener("keydown", handleKey);

    return () => {
      if (hideControlsTimerRef.current) {
        window.clearTimeout(hideControlsTimerRef.current);
      }
      window.removeEventListener("mousemove", showControls);
      window.removeEventListener("touchstart", showControls);
      window.removeEventListener("keydown", handleKey);
    };
  }, []);

  return (
    <div
      ref={displayRef}
      className="relative min-h-screen overflow-hidden text-white"
      style={{
        background: displayMode === "black" ? "#000000" : background,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {displayMode !== "black" ? (
        <div
          className="absolute inset-0"
          style={{
            background: isStage
              ? `linear-gradient(180deg, ${overlayColor}55, ${overlayColor}cc)`
              : "linear-gradient(180deg, rgba(7,17,31,0.34), rgba(7,17,31,0.72))",
          }}
        />
      ) : null}

      {isEnabled ? (
        <DisplayBody
          isStage={isStage}
          settings={settings}
          activeItem={activeItem}
          nextItem={nextItem}
          displayMode={displayMode}
        />
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

      <div
        className={`pointer-events-none fixed bottom-4 left-4 right-4 z-30 flex flex-col gap-3 transition duration-300 xl:left-auto xl:right-4 xl:max-w-3xl ${
          controlsVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="pointer-events-auto rounded-[1.6rem] border border-white/10 bg-[rgba(5,10,20,0.72)] p-3 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-wrap items-center gap-2">
            <ControlButton onClick={() => showPreviousSermonItem()}>Prev</ControlButton>
            <ControlButton onClick={() => showNextSermonItem()}>Next</ControlButton>
            <ControlButton active={displayMode === "live"} onClick={() => setSermonDisplayMode("live")}>
              Live
            </ControlButton>
            <ControlButton active={displayMode === "title"} onClick={() => setSermonDisplayMode("title")}>
              Title
            </ControlButton>
            <ControlButton active={displayMode === "logo"} onClick={() => setSermonDisplayMode("logo")}>
              Logo
            </ControlButton>
            <ControlButton active={displayMode === "announcement"} onClick={() => setSermonDisplayMode("announcement")}>
              Announcement
            </ControlButton>
            <ControlButton active={displayMode === "black"} onClick={() => setSermonDisplayMode("black")}>
              Black
            </ControlButton>
            <Link
              to="/presentation-remote"
              className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
            >
              Remote
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
