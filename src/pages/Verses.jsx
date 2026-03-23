import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";

import bible from "../utils/loadBible";
import booksList from "../data/Books.json";
import { matchBookQuery } from "../utils/bookSearch";
import useAppSettings from "../hooks/useAppSettings";
import useLibraryData from "../hooks/useLibraryData";
import {
  cycleHighlight,
  getChapterId,
  getVerseId,
  isBookmarked,
  isFavorited,
  recordHistory,
  saveNote,
  toggleBookmark,
  toggleFavorite,
} from "../utils/libraryData";
import { getUIText } from "../utils/uiText";

export default function Verses() {
  const { book, chapter } = useParams();
  const navigate = useNavigate();

  const [selectedVerse, setSelectedVerse] = useState(null);
  const [autoScrollDirection, setAutoScrollDirection] = useState(null);
  const [settings] = useAppSettings();
  const libraryData = useLibraryData();
  const t = getUIText(settings.language);
  const [bookQuery, setBookQuery] = useState("");
  const readingPaneRef = useRef(null);
  const autoScrollFrameRef = useRef(null);
  const lastAutoScrollTimeRef = useRef(null);

  const decodedBook = decodeURIComponent(book);

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

  const getScrollMetrics = () => {
    if (window.innerWidth < 768) {
      const scrollElement =
        document.scrollingElement || document.documentElement;

      return {
        currentTop: window.scrollY,
        maxScrollTop: Math.max(
          scrollElement.scrollHeight - window.innerHeight,
          0
        ),
        setTop: (value) => window.scrollTo(0, value),
      };
    }

    const container = readingPaneRef.current;

    if (!container) {
      return null;
    }

    return {
      currentTop: container.scrollTop,
      maxScrollTop: Math.max(
        container.scrollHeight - container.clientHeight,
        0
      ),
      setTop: (value) => {
        container.scrollTop = value;
      },
    };
  };

  const bookData = bible[decodedBook];
  const chapterData = bookData?.chapters.find((ch) => ch.chapter === chapter);
  const chapterItem = useMemo(
    () => ({
      id: getChapterId(decodedBook, chapter),
      type: "chapter",
      bookEnglish: decodedBook,
      bookTamil: bookData?.book.tamil || decodedBook,
      chapter,
    }),
    [bookData?.book.tamil, chapter, decodedBook]
  );

  useEffect(() => {
    if (bookData && chapterData) {
      recordHistory(chapterItem);
    }
  }, [bookData, chapterData, chapterItem]);

  useEffect(() => {
    setAutoScrollDirection(null);
    lastAutoScrollTimeRef.current = null;

    if (window.innerWidth < 768) {
      window.scrollTo(0, 0);
    } else if (readingPaneRef.current) {
      readingPaneRef.current.scrollTop = 0;
    }
  }, [decodedBook, chapter]);

  useEffect(() => {
    if (!autoScrollDirection) {
      if (autoScrollFrameRef.current) {
        window.cancelAnimationFrame(autoScrollFrameRef.current);
        autoScrollFrameRef.current = null;
      }
      lastAutoScrollTimeRef.current = null;
      return;
    }

    const step = (timestamp) => {
      const metrics = getScrollMetrics();

      if (!metrics) {
        setAutoScrollDirection(null);
        return;
      }

      if (lastAutoScrollTimeRef.current === null) {
        lastAutoScrollTimeRef.current = timestamp;
      }

      const delta = timestamp - lastAutoScrollTimeRef.current;
      lastAutoScrollTimeRef.current = timestamp;
      const speed = 0.18;
      const direction = autoScrollDirection === "down" ? 1 : -1;
      const nextTop = metrics.currentTop + delta * speed * direction;

      if (nextTop <= 0) {
        metrics.setTop(0);
        setAutoScrollDirection(null);
        return;
      }

      if (nextTop >= metrics.maxScrollTop) {
        metrics.setTop(metrics.maxScrollTop);
        setAutoScrollDirection(null);
        return;
      }

      metrics.setTop(nextTop);
      autoScrollFrameRef.current = window.requestAnimationFrame(step);
    };

    autoScrollFrameRef.current = window.requestAnimationFrame(step);

    return () => {
      if (autoScrollFrameRef.current) {
        window.cancelAnimationFrame(autoScrollFrameRef.current);
        autoScrollFrameRef.current = null;
      }
      lastAutoScrollTimeRef.current = null;
    };
  }, [autoScrollDirection]);

  useEffect(() => {
    return () => {
      if (autoScrollFrameRef.current) {
        window.cancelAnimationFrame(autoScrollFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!selectedVerse || window.innerWidth >= 768) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedVerse]);

  const getVerseItem = (verse) => ({
    id: getVerseId(decodedBook, chapter, verse.verse),
    type: "verse",
    bookEnglish: decodedBook,
    bookTamil: bookData?.book.tamil || decodedBook,
    chapter,
    verse: verse.verse,
    text: verse.text,
  });

  const getMobilePopupVerseStyle = (text) => {
    const length = text?.length || 0;

    if (length > 320) {
      return {
        fontSize: "14px",
        lineHeight: 1.42,
      };
    }

    if (length > 220) {
      return {
        fontSize: "15px",
        lineHeight: 1.46,
      };
    }

    if (length > 140) {
      return {
        fontSize: "16px",
        lineHeight: 1.5,
      };
    }

    return {
      fontSize: `${Math.min(Math.max(settings.fontSize - 10, 15), 18)}px`,
      lineHeight: 1.52,
    };
  };

  const handleNote = (item) => {
    const currentNote = libraryData.notes[item.id]?.text || "";
    const nextNote = window.prompt(t.notePrompt, currentNote);
    if (nextNote === null) return;
    saveNote(item, nextNote);
  };

  const handleMobileVerseShare = async (verse) => {
    const shareText = `${bookData?.book.tamil} ${chapter}:${verse.verse}\n\n${verse.text}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${bookData?.book.tamil} ${chapter}:${verse.verse}`,
          text: shareText,
        });
        return;
      } catch {
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareText);
    } catch {
      window.prompt(t.share, shareText);
    }
  };

  const openVerse = (verse) => {
    recordHistory(getVerseItem(verse));

    if (window.innerWidth < 768) {
      setSelectedVerse(verse);
      return;
    }

    navigate(`/reader/${encodeURIComponent(decodedBook)}/${chapter}/${verse.verse}`);
  };

  const toggleAutoScroll = (direction) => {
    const metrics = getScrollMetrics();

    if (!metrics) return;

    setAutoScrollDirection((current) => {
      if (current === direction) {
        return null;
      }

      const immediateStep = direction === "down" ? 36 : -36;
      const nextTop = Math.min(
        Math.max(metrics.currentTop + immediateStep, 0),
        metrics.maxScrollTop
      );

      metrics.setTop(nextTop);
      return direction;
    });
  };

  const bookIndex = booksList.findIndex(
    (b) => b.book.english.trim() === decodedBook
  );

  let prevChapter = null;
  let nextChapter = null;
  const filteredBooks = booksList.filter((b) => matchBookQuery(b, bookQuery));

  if (parseInt(chapter) > 1) {
    prevChapter = `/${decodedBook}/${parseInt(chapter) - 1}`;
  } else if (bookIndex > 0) {
    const prevBook = booksList[bookIndex - 1].book.english.trim();
    const lastChapter = bible[prevBook].chapters.length;
    prevChapter = `/${prevBook}/${lastChapter}`;
  }

  if (parseInt(chapter) < bookData?.chapters.length) {
    nextChapter = `/${decodedBook}/${parseInt(chapter) + 1}`;
  } else if (bookIndex < booksList.length - 1) {
    const nextBook = booksList[bookIndex + 1].book.english.trim();
    nextChapter = `/${nextBook}/1`;
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#07111f] text-white md:h-screen md:overflow-hidden">
      <div className="md:flex md:h-screen">
        <aside data-lenis-prevent className="hidden w-[300px] shrink-0 overflow-y-auto border-r border-white/10 bg-[linear-gradient(180deg,_rgba(8,17,32,0.98),_rgba(10,18,30,0.94))] p-4 custom-scroll md:flex md:flex-col">
          <div className="mb-4 rounded-[1.75rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.22),_transparent_34%),linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(10,18,30,0.94))] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              {t.navigator}
            </p>
            <h2 className="mt-3 text-xl font-bold text-white">
              {bookData?.book.tamil}
            </h2>
            <p className="mt-1 text-sm text-slate-400">{t.chapter} {chapter}</p>
          </div>

          <div className="app-surface rounded-[1.75rem] p-4">
            <div className="mb-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                {t.books}
              </p>
              <input
                type="text"
                value={bookQuery}
                onChange={(e) => setBookQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="mb-3 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-400/40"
              />
              <div className="space-y-2">
                {filteredBooks.map((b) => (
                  <button
                    key={b.book.english}
                    onClick={() =>
                      navigate(`/${encodeURIComponent(b.book.english)}/1`)
                    }
                    className={`block w-full rounded-2xl px-4 py-3 text-left text-sm transition ${
                      b.book.english === decodedBook
                        ? "bg-gradient-to-br from-indigo-500 to-sky-500 text-white shadow-lg shadow-indigo-950/35"
                        : "border border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.07]"
                    }`}
                  >
                    {b.book.tamil}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                {t.chapters}
              </p>
              <div className="grid grid-cols-4 gap-2">
                {bookData?.chapters.map((ch) => (
                  <button
                    key={ch.chapter}
                    onClick={() => navigate(`/${decodedBook}/${ch.chapter}`)}
                    className={`rounded-xl py-2 text-sm font-medium transition ${
                      ch.chapter === chapter
                        ? "bg-gradient-to-br from-indigo-500 to-sky-500 text-white"
                        : "border border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.07]"
                    }`}
                  >
                    {ch.chapter}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                {t.verses}
              </p>
              <div className="grid grid-cols-4 gap-2">
                {chapterData?.verses.map((v) => (
                  <button
                    key={v.verse}
                    onClick={() =>
                      navigate(
                        `/reader/${encodeURIComponent(decodedBook)}/${chapter}/${v.verse}`
                      )
                    }
                    className="rounded-xl border border-white/10 bg-white/[0.03] py-2 text-sm text-slate-300 transition hover:bg-white/[0.07]"
                  >
                    {v.verse}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <main
          ref={readingPaneRef}
          data-lenis-prevent
          className="app-shell relative flex-1 overflow-x-hidden overflow-y-auto p-4 pb-24 md:h-screen md:p-6"
        >
          <div className="mx-auto max-w-5xl">
            <section className="mb-5 overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.2),_transparent_28%),linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(8,17,32,0.96))] px-5 py-6 shadow-2xl shadow-black/30 md:px-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">
                    {t.reading}
                  </p>
                  <h1 className="mt-3 text-2xl font-bold text-white md:text-3xl">
                    {bookData?.book.tamil}
                  </h1>
                  <p className="mt-2 text-sm text-slate-400">{t.chapter} {chapter}</p>
                </div>
                <button
                  onClick={() => toggleBookmark(chapterItem)}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    isBookmarked(libraryData, chapterItem.id)
                      ? "bg-white text-slate-950"
                      : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  {t.chapterBookmark}
                </button>
              </div>
            </section>

            <div className="space-y-3">
              {chapterData?.verses.map((v) => {
                const verseItem = getVerseItem(v);
                const bookmarked = isBookmarked(libraryData, verseItem.id);
                const favorited = isFavorited(libraryData, verseItem.id);
                const highlighted = libraryData.highlights[verseItem.id];
                const note = libraryData.notes[verseItem.id];

                return (
                  <div
                    key={v.verse}
                    className="min-w-0 overflow-hidden rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,_rgba(30,41,59,0.88),_rgba(15,23,42,0.86))] p-4 transition hover:border-sky-400/25 hover:bg-slate-800 md:p-5"
                    style={{
                      lineHeight: settings.lineHeight || 1.8,
                      boxShadow: highlighted
                        ? `inset 3px 0 0 ${highlighted.color}`
                        : undefined,
                    }}
                  >
                    <button onClick={() => openVerse(v)} className="block min-w-0 w-full overflow-hidden text-left">
                      <span
                        className="mr-2 inline text-sm font-bold text-white md:text-base"
                      >
                        {v.verse}.
                      </span>
                      <span className="whitespace-normal break-words text-base text-slate-100 md:text-lg">
                        {v.text}
                      </span>
                    </button>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => toggleBookmark(verseItem)}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                          bookmarked
                            ? "bg-white text-slate-950"
                            : "border border-white/10 bg-white/5 text-slate-200"
                        }`}
                      >
                        {t.bookmark}
                      </button>
                      <button
                        onClick={() => toggleFavorite(verseItem)}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                          favorited
                            ? "bg-rose-400 text-slate-950"
                            : "border border-white/10 bg-white/5 text-slate-200"
                        }`}
                      >
                        {t.favorite}
                      </button>
                      <button
                        onClick={() => cycleHighlight(verseItem)}
                        className="rounded-full px-3 py-1.5 text-xs font-semibold text-white"
                        style={{
                          background: highlighted?.color || "rgba(255,255,255,0.06)",
                          border: highlighted ? "none" : "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        {t.highlight}
                      </button>
                      <button
                        onClick={() => handleNote(verseItem)}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                          note
                            ? "bg-amber-300 text-slate-950"
                            : "border border-white/10 bg-white/5 text-slate-200"
                        }`}
                      >
                        {t.note}
                      </button>
                    </div>

                    {note ? (
                      <p className="mt-3 break-words rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm leading-6 text-slate-300">
                        {note.text}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex gap-3">
              {prevChapter && (
                <button
                  onClick={() => navigate(prevChapter)}
                  className="flex-1 rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-sm font-medium text-slate-100 transition hover:bg-white/[0.08]"
                >
                  {t.prev}
                </button>
              )}

              {nextChapter && (
                <button
                  onClick={() => navigate(nextChapter)}
                  className="flex-1 rounded-2xl p-4 text-sm font-semibold text-white shadow-lg"
                  style={{
                    background: "linear-gradient(135deg, #2563eb, #38bdf8)",
                  }}
                >
                  {t.next}
                </button>
              )}
            </div>
          </div>

          <div className="pointer-events-none fixed bottom-24 right-4 z-40 flex flex-col gap-3 md:bottom-6 md:right-6">
            <button
              onClick={() => toggleAutoScroll("up")}
              className={`pointer-events-auto h-12 w-12 rounded-full border text-xs font-bold tracking-[0.2em] shadow-lg backdrop-blur-md transition ${
                autoScrollDirection === "up"
                  ? "border-sky-300 bg-sky-400 text-slate-950"
                  : "border-white/10 bg-slate-900/80 text-white"
              }`}
              aria-label="Auto scroll up"
              title="Auto scroll up"
            >
              UP
            </button>
            <button
              onClick={() => toggleAutoScroll("down")}
              className={`pointer-events-auto h-12 w-12 rounded-full border text-xs font-bold tracking-[0.2em] shadow-lg backdrop-blur-md transition ${
                autoScrollDirection === "down"
                  ? "border-sky-300 bg-sky-400 text-slate-950"
                  : "border-white/10 bg-slate-900/80 text-white"
              }`}
              aria-label="Auto scroll down"
              title="Auto scroll down"
            >
              DN
            </button>
          </div>
        </main>
      </div>

      {selectedVerse ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm md:hidden">
          <button
            type="button"
            aria-label="Close verse preview"
            className="absolute inset-0"
            onClick={() => setSelectedVerse(null)}
          />

          <div
            className="relative z-10 w-full max-w-sm overflow-hidden rounded-[2rem] border border-white/10 p-5 shadow-2xl shadow-black/40"
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
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(7, 17, 31, 0.42), rgba(7, 17, 31, 0.58))",
                backdropFilter: "blur(1px)",
              }}
            />
            <div className="relative z-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                  {t.verse}
                </p>
                <p className="mt-2 text-sm font-bold text-white">
                  {bookData?.book.tamil} {chapter}:{selectedVerse.verse}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVerse(null)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white"
              >
                X
              </button>
            </div>

            <p
              className="mt-5 break-words text-left font-semibold text-white"
              style={getMobilePopupVerseStyle(selectedVerse.text)}
            >
              {selectedVerse.text}
            </p>

            <button
              type="button"
              onClick={() => handleMobileVerseShare(selectedVerse)}
              className="mt-5 w-full rounded-2xl bg-[linear-gradient(135deg,#2563eb,#38bdf8)] px-4 py-3 text-sm font-semibold text-white shadow-lg"
            >
              {t.share}
            </button>
            </div>
          </div>
        </div>
      ) : null}

    </div>
  );
}
