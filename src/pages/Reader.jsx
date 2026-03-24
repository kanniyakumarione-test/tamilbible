import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

import bible from "../utils/loadBible";
import useAppSettings from "../hooks/useAppSettings";
import useLibraryData from "../hooks/useLibraryData";
import {
  getVerseId,
  recordHistory,
} from "../utils/libraryData";
import { getUIText } from "../utils/uiText";

export default function Reader() {
  const { book, chapter, verse } = useParams();
  const navigate = useNavigate();

  const decodedBook = decodeURIComponent(book);

  const [settings] = useAppSettings();
  const libraryData = useLibraryData();
  const t = getUIText(settings.language);
  const [fade, setFade] = useState(true);
  const scrollContainerRef = useRef(null);
  const autoScrollFrameRef = useRef(null);
  const lastAutoScrollTimeRef = useRef(null);

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

  const bookData = bible[decodedBook];
  const chapterData = bookData?.chapters.find((ch) => ch.chapter === chapter);
  const verses = chapterData?.verses || [];
  const currentVerseIndex = verses.findIndex((v) => v.verse === verse);

  useEffect(() => {
    const elem = document.documentElement;
    elem.requestFullscreen?.().catch(() => {});

    const onExit = () => {
      if (!document.fullscreenElement) navigate(-1);
    };

    document.addEventListener("fullscreenchange", onExit);
    return () => document.removeEventListener("fullscreenchange", onExit);
  }, [navigate]);

  useEffect(() => {
    const changeVerse = (newIndex) => {
      const nextVerse = verses[newIndex];

      if (!nextVerse) {
        return;
      }

      setFade(false);
      setTimeout(() => {
        navigate(
          `/reader/${encodeURIComponent(decodedBook)}/${chapter}/${nextVerse.verse}`
        );
        setFade(true);
      }, 150);
    };

    const handleKey = (e) => {
      if (e.key === "ArrowRight" && currentVerseIndex < verses.length - 1) {
        changeVerse(currentVerseIndex + 1);
      }

      if (e.key === "ArrowLeft" && currentVerseIndex > 0) {
        changeVerse(currentVerseIndex - 1);
      }

      if (e.key === "Escape") {
        document.exitFullscreen?.();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [chapter, currentVerseIndex, decodedBook, navigate, verses]);

  const verseData = verses[currentVerseIndex];
  const verseItem = verseData
    ? {
        id: getVerseId(decodedBook, chapter, verseData.verse),
        type: "verse",
        bookEnglish: decodedBook,
        bookTamil: bookData?.book.tamil || decodedBook,
        chapter,
        verse: verseData.verse,
        text: verseData.text,
      }
    : null;

  useEffect(() => {
    if (verseItem) {
      recordHistory(verseItem);
    }
  }, [verseItem]);

  useEffect(() => {
    lastAutoScrollTimeRef.current = null;

    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [verseItem?.id]);

  useEffect(() => {
    return () => {
      if (autoScrollFrameRef.current) {
        window.cancelAnimationFrame(autoScrollFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;

    if (!container) return undefined;

    const startAutoScroll = () => {
      const activeContainer = scrollContainerRef.current;

      if (!activeContainer) return;

      const maxScrollTop =
        activeContainer.scrollHeight - activeContainer.clientHeight;

      if (maxScrollTop <= 0) return;

      const step = (timestamp) => {
        const currentContainer = scrollContainerRef.current;

        if (!currentContainer) return;

        if (lastAutoScrollTimeRef.current === null) {
          lastAutoScrollTimeRef.current = timestamp;
        }

        const delta = timestamp - lastAutoScrollTimeRef.current;
        lastAutoScrollTimeRef.current = timestamp;
        const nextTop = currentContainer.scrollTop + delta * 0.03;
        const currentMax =
          currentContainer.scrollHeight - currentContainer.clientHeight;

        if (nextTop >= currentMax) {
          currentContainer.scrollTop = currentMax;
          autoScrollFrameRef.current = null;
          return;
        }

        currentContainer.scrollTop = nextTop;
        autoScrollFrameRef.current = window.requestAnimationFrame(step);
      };

      autoScrollFrameRef.current = window.requestAnimationFrame(step);
    };

    const startDelay = window.setTimeout(startAutoScroll, 700);

    return () => {
      window.clearTimeout(startDelay);
      if (autoScrollFrameRef.current) {
        window.cancelAnimationFrame(autoScrollFrameRef.current);
        autoScrollFrameRef.current = null;
      }
      lastAutoScrollTimeRef.current = null;
    };
  }, [verseItem?.id, settings.fontSize, settings.lineHeight, settings.readerWidth]);

  return (
    <div
      className="flex h-screen w-screen items-center justify-center overflow-hidden px-4 text-white"
      style={{
        background:
          settings.bgType === "custom" && settings.customBackground
            ? `url(${settings.customBackground})`
            : settings.bgType === "gradient"
            ? gradients[settings.bgIndex]
            : `url(${backgrounds[settings.bgIndex]})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className="flex max-h-[calc(100vh-2rem)] w-full flex-col rounded-3xl border border-white/20 px-6 py-10 backdrop-blur-md md:px-10 md:py-12"
        style={{
          maxWidth: `${settings.readerWidth || 960}px`,
          background: `rgba(0, 0, 0, ${settings.cardOpacity ?? 0.5})`,
          textAlign: settings.textAlign || "center",
          boxShadow: verseItem && libraryData.highlights[verseItem.id]
            ? `0 0 0 2px ${libraryData.highlights[verseItem.id].color} inset`
            : undefined,
        }}
      >
        {settings.showReference !== false && (
          <p
            className="mb-5 text-base font-bold text-white md:text-sm"
            style={{ textShadow: "0 2px 10px rgba(0, 0, 0, 0.65)" }}
          >
            {bookData?.book.tamil} {chapter}:{verseData?.verse}
          </p>
        )}

        <div
          ref={scrollContainerRef}
          data-lenis-prevent
          className="min-h-0 flex-1 overflow-y-auto pr-1 custom-scroll"
        >
          <div>
            <p
              style={{
                fontSize: `${Math.max(settings.fontSize, 22)}px`,
                lineHeight: settings.lineHeight || 1.8,
                textShadow: "0 2px 14px rgba(0, 0, 0, 0.5)",
              }}
              className={`font-bold transition-opacity duration-300 ${
                fade ? "opacity-100" : "opacity-0"
              }`}
            >
              {verseData?.text}
            </p>
          </div>

          {verseItem && libraryData.notes[verseItem.id] ? (
            <div className="mt-5 rounded-3xl border border-white/10 bg-black/20 px-4 py-4 text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                {t.note}
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-200">
                {libraryData.notes[verseItem.id].text}
              </p>
            </div>
          ) : null}
        </div>

      </div>
    </div>
  );
}
