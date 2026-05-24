import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import booksList from "../data/Books.json";

import {
  getHighlightedTextParts,
  matchTamilTextQuery,
  normalizeRoman,
  tamilToTanglish,
} from "../utils/bookSearch";
import useAppSettings from "../hooks/useAppSettings";
import { getUIText } from "../utils/uiText";
import { getBookName, isEnglishLanguage } from "../utils/bibleContent";
import { openReader } from "../utils/openReader";
import {
  getAllBookMetadata,
  getBookLabelFromMetadata,
  loadBibleBooks,
  NEW_TESTAMENT_START_INDEX,
} from "../utils/bibleData";

const TAMIL_KEYBOARD_ROWS = [
  ["அ", "ஆ", "இ", "ஈ", "உ", "ஊ", "எ", "ஏ", "ஐ", "ஒ", "ஓ", "ஔ"],
  ["க", "ங", "ச", "ஞ", "ட", "ண", "த", "ந", "ப", "ம", "ய", "ர", "ல", "வ", "ழ", "ள", "ற", "ன"],
  ["ஜ", "ஷ", "ஸ", "ஹ", "க்ஷ", "ஶ"],
];

const TAMIL_SYMBOL_ROWS = [
  ["ஃ", "ா", "ி", "ீ", "ு", "ூ"],
  ["ெ", "ே", "ை", "ொ", "ோ", "ௌ", "்"],
];

const searchVerseIndexCache = new Map();
function normalizeRomanWords(text = "") {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((part) => normalizeRoman(part))
    .filter(Boolean);
}

function normalizeTamilWords(text = "") {
  return text
    .normalize("NFC")
    .split(/[^\u0B80-\u0BFF0-9]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function getSearchVerseIndex(books, language) {
  const cacheKey = language;

  if (searchVerseIndexCache.has(cacheKey)) {
    return searchVerseIndexCache.get(cacheKey);
  }

  const testamentLookup = new Map(
    booksList.map((entry, index) => [entry.book.english.trim(), index >= NEW_TESTAMENT_START_INDEX ? "new" : "old"])
  );

  const index = books.flatMap((bookData) =>
    bookData.chapters.flatMap((ch) =>
      ch.verses.map((v) => ({
        englishBook: bookData.book.english,
        book: getBookName(bookData, language),
        chapter: ch.chapter,
        verse: v.verse,
        text: v.text,
        testament: testamentLookup.get(bookData.book.english) || "old",
        tanglishWords: normalizeRomanWords(tamilToTanglish(v.text)),
        tamilWords: normalizeTamilWords(v.text),
      }))
    )
  );

  searchVerseIndexCache.set(cacheKey, index);
  return index;
}

function HighlightedVerse({ text, query }) {
  const parts = getHighlightedTextParts(text, query);

  return (
    <p className="whitespace-normal break-words leading-8 text-stone-200 mt-2 text-[15px]">
      {parts.map((part, index) => (
        <span
          key={`${part.text}-${index}`}
          className={
            part.match
              ? "rounded-md bg-amber-500/20 px-1.5 py-0.5 text-amber-200 font-bold ring-1 ring-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
              : ""
          }
        >
          {part.text}
        </span>
      ))}
    </p>
  );
}

function SearchPagination({
  visibleStart,
  visibleEnd,
  total,
  currentPage,
  totalPages,
  onPrev,
  onNext,
  prevLabel,
  nextLabel,
}) {
  return (
    <div className="flex flex-col items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/[0.02] p-4 text-sm text-stone-300 shadow-2xl backdrop-blur-md md:flex-row md:px-6">
      <p className="font-medium tracking-wide">
        Showing <span className="text-white font-semibold">{visibleStart}-{visibleEnd}</span> of <span className="text-white font-semibold">{total}</span>
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onPrev}
          disabled={currentPage === 1}
          className="group flex h-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 text-xs font-semibold text-stone-200 transition-all hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="mr-1 inline-block transition-transform group-hover:-translate-x-1">&larr;</span> {prevLabel}
        </button>
        <span className="flex h-10 items-center justify-center rounded-2xl bg-black/40 px-5 text-xs font-bold text-zinc-400 ring-1 ring-white/10">
          {currentPage} / {totalPages}
        </span>
        <button
          type="button"
          onClick={onNext}
          disabled={currentPage === totalPages}
          className="group flex h-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 text-xs font-semibold text-stone-200 transition-all hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {nextLabel} <span className="ml-1 inline-block transition-transform group-hover:translate-x-1">&rarr;</span>
        </button>
      </div>
    </div>
  );
}

import { createPortal } from "react-dom";

function PopupFilterSelect({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const selected = options.find((option) => option.value === value) || options[0];

  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (event) => {
      if (wrapperRef.current?.contains(event.target)) return;
      // Also check if clicking inside the portal
      if (event.target.closest('.filter-portal-content')) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const handleEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="group flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3.5 text-left text-sm font-medium text-stone-200 outline-none transition-all hover:border-zinc-600/30 hover:bg-white/[0.05]"
      >
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-200/80">{label}</span>
          <span className="text-white group-hover:text-amber-100">{selected?.label}</span>
        </div>
        <svg
          className={`h-5 w-5 text-stone-400 transition-transform duration-300 ${open ? "rotate-180 text-zinc-200" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-4 pb-8 backdrop-blur-sm sm:items-center sm:p-0">
          <div className="absolute inset-0" onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            className="filter-portal-content relative z-10 flex max-h-[75vh] w-full max-w-md flex-col overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#000000] p-2 shadow-[0_30px_60px_rgba(0,0,0,0.6)] sm:max-h-[60vh] animate-in slide-in-from-bottom-10 fade-in duration-300"
          >
            <div className="mb-2 flex items-center justify-between p-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-200">{label}</p>
                <p className="mt-1 text-lg font-semibold text-white">{selected?.label}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-stone-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div data-lenis-prevent className="flex-1 overflow-y-auto px-2 pb-4 custom-scroll">
              <div className="flex flex-col gap-1">
                {options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3.5 text-left text-sm font-medium transition-all ${
                      option.value === value
                        ? "bg-[#0a0a0a]/15 text-zinc-300 ring-1 ring-zinc-700/30"
                        : "text-stone-300 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    {option.label}
                    {option.value === value && (
                      <svg className="h-5 w-5 text-zinc-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default function Search() {
  const RESULTS_PER_PAGE = 10;
  const navigate = useNavigate();
  const [settings] = useAppSettings();
  const t = getUIText(settings.language);
  const keyboardLabels = {
    space: ["en", "ta-en"].includes(settings.language) ? "Space" : "இடைவெளி",
    backspace: ["en", "ta-en"].includes(settings.language) ? "Backspace" : "பின்நீக்கு",
    clear: ["en", "ta-en"].includes(settings.language) ? "Clear" : "அழி",
    close: ["en", "ta-en"].includes(settings.language) ? "Close" : "மூடு",
    symbols: ["en", "ta-en"].includes(settings.language) ? "Symbols" : "குறிகள்",
    keyboard: ["en", "ta-en"].includes(settings.language) ? "Tamil Keyboard" : "தமிழ் விசைப்பலகை",
    hide: ["en", "ta-en"].includes(settings.language) ? "Hide" : "மறை",
  };
  const showTamilKeyboard = !isEnglishLanguage(settings.language);
  const searchInputRef = useRef(null);
  const keyboardRef = useRef(null);
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [versePage, setVersePage] = useState(1);
  const [verseResults, setVerseResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [testamentFilter, setTestamentFilter] = useState("all");
  const [bookFilter, setBookFilter] = useState("all");
  const [exactWordOnly, setExactWordOnly] = useState(false);

  const bookOptions = useMemo(
    () =>
      [
        {
          value: "all",
          label: ["en", "ta-en"].includes(settings.language) ? "All Books" : "அனைத்து புத்தகங்கள்",
          testament: "all",
        },
        ...getAllBookMetadata().map((entry, index) => ({
          value: entry.book.english.trim(),
          label: getBookLabelFromMetadata(entry.book.english.trim(), settings.language),
          testament: index >= NEW_TESTAMENT_START_INDEX ? "new" : "old",
        })),
      ],
    [settings.language]
  );

  const effectiveBookFilter = useMemo(() => {
    if (bookFilter === "all") return "all";
    const isVisible = bookOptions.some(
      (option) =>
        option.value === bookFilter &&
        (testamentFilter === "all" || option.testament === testamentFilter)
    );
    return isVisible ? bookFilter : "all";
  }, [bookFilter, bookOptions, testamentFilter]);

  useEffect(() => {
    if (!isKeyboardOpen) return undefined;
    const handlePointerDown = (event) => {
      if (
        searchInputRef.current?.contains(event.target) ||
        keyboardRef.current?.contains(event.target)
      ) return;
      setIsKeyboardOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isKeyboardOpen]);

  useEffect(() => {
    const value = submittedQuery.trim();
    let cancelled = false;
    let frameId = null;

    if (!value) return undefined;

    frameId = window.requestAnimationFrame(() => {
      if (!cancelled) setIsSearching(true);
    });

    const searchTimer = window.setTimeout(() => {
      void loadBibleBooks(settings.language === "en" ? "en" : "ta")
        .then((books) => {
          if (cancelled) return;

          const verseIndex = getSearchVerseIndex(books, settings.language);
          const normalizedQuery = normalizeRoman(value);
          const isTanglishQuery = normalizedQuery && /^[a-z0-9\s._-]+$/i.test(value);
          const queryWords = normalizeRomanWords(value);
          const queryTamilWords = normalizeTamilWords(value);

          const matches = verseIndex.filter((verse) => {
            if (testamentFilter !== "all" && verse.testament !== testamentFilter) return false;
            if (effectiveBookFilter !== "all" && verse.englishBook !== effectiveBookFilter) return false;

            if (isTanglishQuery) {
              if (!queryWords.length) return false;
              if (exactWordOnly) {
                if (queryWords.length === 1) return verse.tanglishWords.includes(queryWords[0]);
                return verse.tanglishWords.join(" ").includes(queryWords.join(" "));
              }
              // Partial match logic (exactWordOnly is false)
              if (queryWords.length === 1) {
                return verse.tanglishWords.some(word => word.includes(queryWords[0]));
              }
              return verse.tanglishWords.join(" ").includes(queryWords.join(" "));
            }

            if (exactWordOnly && queryTamilWords.length) {
              if (queryTamilWords.length === 1) return verse.tamilWords.includes(queryTamilWords[0]);
              return verse.text.includes(queryTamilWords.join(" "));
            }

            return matchTamilTextQuery(verse.text, value);
          });

          if (cancelled) return;
          setVerseResults(matches);
          setIsSearching(false);
        })
        .catch(() => {
          if (cancelled) return;
          setVerseResults([]);
          setIsSearching(false);
        });
    }, 50);

    return () => {
      cancelled = true;
      if (frameId) window.cancelAnimationFrame(frameId);
      window.clearTimeout(searchTimer);
    };
  }, [submittedQuery, settings.language, testamentFilter, effectiveBookFilter, exactWordOnly]);

  const hasSubmittedQuery = Boolean(submittedQuery.trim());
  const visibleVerseResults = useMemo(() => (hasSubmittedQuery ? verseResults : []), [hasSubmittedQuery, verseResults]);
  const visibleIsSearching = hasSubmittedQuery ? isSearching : false;
  const totalVersePages = Math.max(1, Math.ceil(visibleVerseResults.length / RESULTS_PER_PAGE));
  const currentVersePage = Math.min(versePage, totalVersePages);
  const paginatedVerseResults = useMemo(() => {
    const start = (currentVersePage - 1) * RESULTS_PER_PAGE;
    return visibleVerseResults.slice(start, start + RESULTS_PER_PAGE);
  }, [currentVersePage, visibleVerseResults]);
  const visibleStart = visibleVerseResults.length ? (currentVersePage - 1) * RESULTS_PER_PAGE + 1 : 0;
  const visibleEnd = visibleVerseResults.length ? Math.min(currentVersePage * RESULTS_PER_PAGE, visibleVerseResults.length) : 0;

  const handleSearchFocus = () => {
    if (showTamilKeyboard && settings.tamilKeyboardAutoOpen !== false) {
      setIsKeyboardOpen(true);
    }
    searchInputRef.current?.focus({ preventScroll: true });
    navigator.virtualKeyboard?.show?.();
  };

  const handleSearchSubmit = (event) => {
    event?.preventDefault?.();
    setVersePage(1);
    setSubmittedQuery(query.trim());
    setIsKeyboardOpen(false);
  };

  const updateQueryAtCursor = (transform) => {
    const input = searchInputRef.current;
    if (!input) {
      setQuery((current) => transform(current, current.length, current.length).value);
      return;
    }
    const selectionStart = input.selectionStart ?? query.length;
    const selectionEnd = input.selectionEnd ?? query.length;
    const nextState = transform(query, selectionStart, selectionEnd);
    setQuery(nextState.value);
    window.requestAnimationFrame(() => {
      input.focus({ preventScroll: true });
      input.setSelectionRange(nextState.cursor, nextState.cursor);
    });
  };

  const insertTamilText = (text) => {
    updateQueryAtCursor((current, start, end) => ({
      value: `${current.slice(0, start)}${text}${current.slice(end)}`,
      cursor: start + text.length,
    }));
  };

  const removeTamilText = () => {
    updateQueryAtCursor((current, start, end) => {
      if (start !== end) return { value: `${current.slice(0, start)}${current.slice(end)}`, cursor: start };
      if (start === 0) return { value: current, cursor: 0 };
      return { value: `${current.slice(0, start - 1)}${current.slice(end)}`, cursor: start - 1 };
    });
  };

  return (
    <div className="app-shell pt-2 md:pt-4">
      <div className="mx-auto w-full max-w-[1600px] px-4 md:px-8 lg:px-12">
        <section className="relative z-20 mb-8 rounded-[2.5rem] border border-white/5 bg-[#000000] p-6 shadow-2xl backdrop-blur-2xl md:p-10">
          <div className="pointer-events-none absolute inset-0 -z-10 rounded-[2.5rem] " />
          
          <div className="text-center">
            <span className="inline-block rounded-full border border-zinc-600/20 bg-zinc-700/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-200 shadow-[0_0_20px_rgba(255, 255, 255,0.1)]">
              {t.globalSearch}
            </span>
            <h1 className={`mt-5 py-2 bg-gradient-to-br from-white via-white to-zinc-500 bg-clip-text font-extrabold tracking-tight text-transparent ${isEnglishLanguage(settings.language) ? 'text-4xl md:text-5xl lg:text-6xl' : 'text-[26px] leading-snug sm:text-3xl md:text-4xl lg:text-5xl'}`}>
              {t.searchTitle}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-stone-400 md:text-base">
              {t.searchIntro}
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative mt-8 group">
            <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-amber-400 to-black opacity-20 blur-lg transition duration-500 group-hover:opacity-40" />
            <div className="relative flex flex-col gap-3 rounded-[2rem] bg-black/40 p-2 shadow-inner ring-1 ring-white/10 backdrop-blur-xl sm:flex-row sm:p-2.5">
              <div className="relative flex-1">
                <svg className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="search"
                  value={query}
                  placeholder={t.searchPlaceholder}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={handleSearchFocus}
                  lang="ta"
                  inputMode="search"
                  enterKeyHint="search"
                  autoCapitalize="none"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  className="w-full bg-transparent py-4 pl-12 pr-6 text-lg text-white outline-none placeholder:text-stone-500"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="flex items-center justify-center rounded-[1.5rem] bg-gradient-to-r from-zinc-800 to-blue-600 px-8 py-4 text-sm font-bold text-white shadow-[0_0_20px_rgba(255, 255, 255,0.3)] transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255, 255, 255,0.5)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70"
              >
                {isSearching ? (
                  <svg className="h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  t.search
                )}
              </button>
            </div>
          </form>

          {showTamilKeyboard && !isKeyboardOpen && settings.tamilKeyboardAutoOpen === false && (
            <div className="mt-5 flex justify-center">
              <button
                type="button"
                onClick={() => setIsKeyboardOpen(true)}
                className="group flex items-center gap-2 rounded-full border border-zinc-600/20 bg-zinc-700/10 px-5 py-2 text-xs font-semibold text-zinc-400 transition-all hover:bg-zinc-700/20"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {keyboardLabels.keyboard}
              </button>
            </div>
          )}
        </section>

        {showTamilKeyboard && isKeyboardOpen && (
          <section
            ref={keyboardRef}
            onMouseDown={(event) => event.preventDefault()}
            className="mb-8 overflow-hidden rounded-[2rem] border border-white/10 bg-black/80 shadow-2xl backdrop-blur-2xl animate-in slide-in-from-top-4 fade-in duration-300"
          >
            <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0a0a0a]/20 text-zinc-200">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-stone-200">{keyboardLabels.keyboard}</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsKeyboardOpen(false)}
                className="rounded-full bg-white/5 p-2 text-stone-400 transition hover:bg-white/10 hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4 md:p-6">
              <div className="space-y-2">
                {TAMIL_KEYBOARD_ROWS.map((row, rowIndex) => (
                  <div key={`row-${rowIndex}`} className="flex flex-wrap justify-center gap-1.5 md:gap-2">
                    {row.map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => insertTamilText(key)}
                        className="flex h-11 w-9 items-center justify-center rounded-xl bg-white/[0.04] text-[15px] font-medium text-stone-200 shadow-sm ring-1 ring-white/5 transition-all hover:-translate-y-0.5 hover:bg-[#0a0a0a]/20 hover:text-zinc-400 hover:ring-zinc-700/50 active:translate-y-0 sm:w-11 md:h-12 md:w-14 md:text-lg"
                      >
                        {key}
                      </button>
                    ))}
                  </div>
                ))}
              </div>

              <div className="mx-auto mt-6 max-w-2xl rounded-2xl bg-black/30 p-4 ring-1 ring-white/5">
                <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">
                  {keyboardLabels.symbols}
                </p>
                <div className="space-y-2">
                  {TAMIL_SYMBOL_ROWS.map((row, rowIndex) => (
                    <div key={`symbol-row-${rowIndex}`} className="flex flex-wrap justify-center gap-1.5 md:gap-2">
                      {row.map((key) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => insertTamilText(key)}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-900/30 text-[15px] font-medium text-zinc-400 ring-1 ring-zinc-700/20 transition-all hover:bg-[#0a0a0a]/30 hover:ring-zinc-700/60 active:scale-95 md:h-11 md:w-12 md:text-lg"
                        >
                          {key}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => insertTamilText(" ")}
                  className="flex h-12 w-32 items-center justify-center rounded-xl bg-white/[0.06] text-sm font-semibold text-stone-200 ring-1 ring-white/10 transition hover:bg-white/10 active:scale-95 md:w-40"
                >
                  {keyboardLabels.space}
                </button>
                <button
                  type="button"
                  onClick={removeTamilText}
                  className="flex h-12 w-24 items-center justify-center rounded-xl bg-white/[0.06] text-sm font-semibold text-stone-200 ring-1 ring-white/10 transition hover:bg-white/10 active:scale-95 md:w-28"
                >
                  {keyboardLabels.backspace}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setSubmittedQuery("");
                  }}
                  className="flex h-12 w-24 items-center justify-center rounded-xl bg-rose-500/10 text-sm font-semibold text-rose-300 ring-1 ring-rose-500/20 transition hover:bg-rose-500/20 active:scale-95 md:w-28"
                >
                  {keyboardLabels.clear}
                </button>
              </div>
            </div>
          </section>
        )}

        <div className="mb-8 grid gap-4 lg:grid-cols-[1.5fr,1fr]">
          <div className="flex flex-wrap items-center gap-2 rounded-[2rem] border border-white/5 bg-white/[0.02] p-2 backdrop-blur-xl">
            {[
              { value: "all", label: "All Testaments", icon: "📚" },
              { value: "old", label: t.oldTestament, icon: "📜" },
              { value: "new", label: t.newTestament, icon: "🕊️" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setVersePage(1);
                  setTestamentFilter(option.value);
                }}
                className={`flex-1 rounded-[1.5rem] px-4 py-3.5 text-xs font-bold transition-all sm:text-sm ${
                  testamentFilter === option.value
                    ? "bg-gradient-to-r from-zinc-800 to-black text-white shadow-lg"
                    : "text-stone-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="mr-2 text-base">{option.icon}</span>
                {option.label}
              </button>
            ))}
          </div>
          
          <div className="flex gap-2">
            <div className="flex flex-1 items-center rounded-[2rem] border border-white/5 bg-white/[0.02] p-2 backdrop-blur-xl">
              <PopupFilterSelect
                label="Filter by Book"
                value={effectiveBookFilter}
                onChange={(value) => {
                  setVersePage(1);
                  setBookFilter(value);
                }}
                options={bookOptions.filter(
                  (option) => option.value === "all" || testamentFilter === "all" || option.testament === testamentFilter
                )}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setVersePage(1);
                setExactWordOnly((current) => !current);
              }}
              className={`flex items-center justify-center rounded-[1.8rem] px-5 text-xs font-bold transition-all ${
                exactWordOnly
                  ? "bg-gradient-to-br from-amber-400 to-black text-amber-950 shadow-[0_0_20px_rgba(255, 255, 255,0.3)]"
                  : "border border-white/5 bg-white/[0.02] text-stone-400 backdrop-blur-xl hover:bg-white/5 hover:text-white"
              }`}
            >
              Exact Match
            </button>
          </div>
        </div>

        <section className="relative w-full">
          {hasSubmittedQuery && !!visibleVerseResults.length && (
            <div className="mb-6">
              <SearchPagination
                visibleStart={visibleStart}
                visibleEnd={visibleEnd}
                total={visibleVerseResults.length}
                currentPage={currentVersePage}
                totalPages={totalVersePages}
                onPrev={() => setVersePage((page) => Math.max(1, page - 1))}
                onNext={() => setVersePage((page) => Math.min(totalVersePages, page + 1))}
                prevLabel={t.prev}
                nextLabel={t.next}
              />
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {visibleIsSearching && (
              <div className="col-span-full flex min-h-[300px] flex-col items-center justify-center rounded-[2rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl">
                <div className="relative flex h-16 w-16 items-center justify-center">
                  <div className="absolute inset-0 animate-ping rounded-full bg-zinc-700 opacity-20" />
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-600 border-t-transparent" />
                </div>
                <p className="mt-4 text-sm font-medium text-stone-400">Searching divine wisdom...</p>
              </div>
            )}

            {!visibleIsSearching && paginatedVerseResults.map((r, i) => (
              <button
                key={`${r.englishBook}-${r.chapter}-${r.verse}-${visibleStart + i}`}
                onClick={() =>
                  openReader(`/reader/${encodeURIComponent(r.englishBook)}/${r.chapter}/${r.verse}`, navigate)
                }
                className="group relative overflow-hidden rounded-[2rem] border border-white/5 bg-[#000000] p-6 text-left shadow-lg backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-zinc-700/30 hover:shadow-[0_20px_40px_rgba(255, 255, 255,0.15)]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative z-10">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 text-xs font-bold tracking-wide text-zinc-300 ring-1 ring-white/10">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      {r.book} {r.chapter}:{r.verse}
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-stone-400 transition-colors group-hover:bg-[#0a0a0a]/20 group-hover:text-zinc-300">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                  <HighlightedVerse text={r.text} query={submittedQuery} />
                </div>
              </button>
            ))}

            {!hasSubmittedQuery && (
              <div className="col-span-full flex min-h-[40vh] flex-col items-center justify-center rounded-[3rem] border border-dashed border-white/10 bg-white/[0.01] p-8 text-center backdrop-blur-sm">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-sky-900/20 ring-1 ring-zinc-700/20">
                  <svg className="h-10 w-10 text-zinc-200/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="mb-2 text-2xl font-bold text-stone-200">What are you looking for?</h3>
                <p className="max-w-md text-stone-400">{t.typeToSearch || "Enter any word or phrase in Tamil or Tanglish to discover verses."}</p>
              </div>
            )}

            {hasSubmittedQuery && !visibleIsSearching && !visibleVerseResults.length && (
              <div className="col-span-full flex min-h-[40vh] flex-col items-center justify-center rounded-[3rem] border border-dashed border-white/10 bg-white/[0.01] p-8 text-center backdrop-blur-sm">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-rose-900/20 ring-1 ring-rose-500/20">
                  <svg className="h-10 w-10 text-rose-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="mb-2 text-2xl font-bold text-stone-200">No verses found</h3>
                <p className="max-w-md text-stone-400">We couldn't find any verses matching "{submittedQuery}". Try adjusting your filters or checking your spelling.</p>
              </div>
            )}
          </div>

          {hasSubmittedQuery && !!visibleVerseResults.length && (
            <div className="mt-6">
              <SearchPagination
                visibleStart={visibleStart}
                visibleEnd={visibleEnd}
                total={visibleVerseResults.length}
                currentPage={currentVersePage}
                totalPages={totalVersePages}
                onPrev={() => setVersePage((page) => Math.max(1, page - 1))}
                onNext={() => setVersePage((page) => Math.min(totalVersePages, page + 1))}
                prevLabel={t.prev}
                nextLabel={t.next}
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
