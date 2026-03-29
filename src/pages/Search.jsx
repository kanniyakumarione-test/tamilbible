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
import { getBibleByLanguage, getBookName, isEnglishLanguage } from "../utils/bibleContent";
import { openReader } from "../utils/openReader";

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
const NEW_TESTAMENT_START_INDEX = 39;

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

function getSearchVerseIndex(activeBible, language) {
  const cacheKey = language;

  if (searchVerseIndexCache.has(cacheKey)) {
    return searchVerseIndexCache.get(cacheKey);
  }

  const testamentLookup = new Map(
    booksList.map((entry, index) => [entry.book.english.trim(), index >= NEW_TESTAMENT_START_INDEX ? "new" : "old"])
  );

  const index = Object.values(activeBible).flatMap((bookData) =>
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
    <p className="whitespace-normal break-words leading-7 text-slate-100">
      {parts.map((part, index) => (
        <span
          key={`${part.text}-${index}`}
          className={part.match ? "rounded-md bg-sky-400/15 px-1 text-sky-100 break-words" : ""}
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
    <div className="mb-4 flex flex-col gap-3 rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300 md:flex-row md:items-center md:justify-between">
      <p>
        {visibleStart}-{visibleEnd} / {total}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={currentPage === 1}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-200 transition hover:border-sky-400/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {prevLabel}
        </button>
        <span className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs text-slate-300">
          {currentPage} / {totalPages}
        </span>
        <button
          type="button"
          onClick={onNext}
          disabled={currentPage === totalPages}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-200 transition hover:border-sky-400/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}

function PopupFilterSelect({ label, value, options, onChange }) {
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

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
          {label}
        </span>
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-left text-sm text-slate-100 outline-none transition hover:border-sky-400/30"
        >
          <span>{selected?.label}</span>
          <span className={`text-slate-400 transition ${open ? "rotate-180" : ""}`}>v</span>
        </button>
      </label>

      {open && (
        <div className="fixed inset-0 z-[80] overflow-y-auto bg-slate-950/70 px-4 py-6 backdrop-blur-sm">
          <div
            className="absolute inset-0"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-[81] mx-auto flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,_rgba(15,23,42,0.98),_rgba(8,17,32,0.98))] p-3 shadow-2xl shadow-black/50">
            <div className="mb-3 flex items-center justify-between gap-3 px-2 pt-1">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{label}</p>
                <p className="mt-1 text-sm text-slate-300">{selected?.label}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-sky-400/30 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto pr-1 custom-scroll overscroll-contain">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm transition ${
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
        </div>
      )}
    </div>
  );
}

export default function Search() {
  const RESULTS_PER_PAGE = 50;
  const navigate = useNavigate();
  const [settings] = useAppSettings();
  const t = getUIText(settings.language);
  const keyboardLabels = {
    space: settings.language === "en" ? "Space" : "இடைவெளி",
    backspace: settings.language === "en" ? "Backspace" : "பின்நீக்கு",
    clear: settings.language === "en" ? "Clear" : "அழி",
    close: settings.language === "en" ? "Close" : "மூடு",
    symbols: settings.language === "en" ? "Symbols" : "குறிகள்",
    keyboard: settings.language === "en" ? "Tamil Keyboard" : "தமிழ் விசைப்பலகை",
    hide: settings.language === "en" ? "Hide" : "மறை",
  };
  const showTamilKeyboard = !isEnglishLanguage(settings.language);
  const activeBible = useMemo(() => getBibleByLanguage(settings.language), [settings.language]);
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
          label: settings.language === "en" ? "All Books" : "அனைத்து புத்தகங்கள்",
          testament: "all",
        },
        ...booksList
        .filter((entry) => activeBible[entry.book.english.trim()])
        .map((entry, index) => ({
          value: entry.book.english.trim(),
          label: settings.language === "en" ? entry.book.english.trim() : (entry.book.tamil || entry.book.english).trim(),
          testament: index >= NEW_TESTAMENT_START_INDEX ? "new" : "old",
        })),
      ],
    [activeBible, settings.language]
  );

  useEffect(() => {
    if (bookFilter === "all") {
      return;
    }

    const isVisible = bookOptions.some(
      (option) =>
        option.value === bookFilter &&
        (testamentFilter === "all" || option.testament === testamentFilter)
    );

    if (!isVisible) {
      setBookFilter("all");
    }
  }, [bookFilter, bookOptions, testamentFilter]);

  useEffect(() => {
    setVersePage(1);
  }, [submittedQuery, testamentFilter, bookFilter, exactWordOnly]);

  useEffect(() => {
    if (!isKeyboardOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (
        searchInputRef.current?.contains(event.target) ||
        keyboardRef.current?.contains(event.target)
      ) {
        return;
      }

      setIsKeyboardOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isKeyboardOpen]);

  useEffect(() => {
    const value = submittedQuery.trim();

    if (!value) {
      setVerseResults([]);
      setIsSearching(false);
      return undefined;
    }

    setIsSearching(true);

    const searchTimer = window.setTimeout(() => {
      const verseIndex = getSearchVerseIndex(activeBible, settings.language);
      const normalizedQuery = normalizeRoman(value);
      const isTanglishQuery = normalizedQuery && /^[a-z0-9\s._-]+$/i.test(value);
      const queryWords = normalizeRomanWords(value);
      const queryTamilWords = normalizeTamilWords(value);
      const matches = verseIndex.filter((verse) => {
        if (testamentFilter !== "all" && verse.testament !== testamentFilter) {
          return false;
        }

        if (bookFilter !== "all" && verse.englishBook !== bookFilter) {
          return false;
        }

        if (isTanglishQuery) {
          if (!queryWords.length) {
            return false;
          }

          if (exactWordOnly) {
            if (queryWords.length === 1) {
              return verse.tanglishWords.includes(queryWords[0]);
            }

            return verse.tanglishWords.join(" ").includes(queryWords.join(" "));
          }

          if (queryWords.length === 1) {
            return verse.tanglishWords.includes(queryWords[0]);
          }

          const joinedVerseWords = verse.tanglishWords.join(" ");
          const joinedQueryWords = queryWords.join(" ");
          return joinedVerseWords.includes(joinedQueryWords);
        }

        if (exactWordOnly && queryTamilWords.length) {
          if (queryTamilWords.length === 1) {
            return verse.tamilWords.includes(queryTamilWords[0]);
          }

          return verse.text.includes(queryTamilWords.join(" "));
        }

        return matchTamilTextQuery(verse.text, value);
      });

      setVerseResults(matches);
      setIsSearching(false);
    }, 0);

    return () => {
      window.clearTimeout(searchTimer);
    };
  }, [submittedQuery, activeBible, settings.language, testamentFilter, bookFilter, exactWordOnly]);

  const totalVersePages = Math.max(1, Math.ceil(verseResults.length / RESULTS_PER_PAGE));
  const currentVersePage = Math.min(versePage, totalVersePages);
  const paginatedVerseResults = useMemo(() => {
    const start = (currentVersePage - 1) * RESULTS_PER_PAGE;
    return verseResults.slice(start, start + RESULTS_PER_PAGE);
  }, [currentVersePage, verseResults]);
  const visibleStart = verseResults.length ? (currentVersePage - 1) * RESULTS_PER_PAGE + 1 : 0;
  const visibleEnd = verseResults.length
    ? Math.min(currentVersePage * RESULTS_PER_PAGE, verseResults.length)
    : 0;

  const handleSearchFocus = () => {
    if (showTamilKeyboard && settings.tamilKeyboardAutoOpen !== false) {
      setIsKeyboardOpen(true);
    }
    searchInputRef.current?.focus({ preventScroll: true });
    navigator.virtualKeyboard?.show?.();
  };

  const handleSearchSubmit = (event) => {
    event?.preventDefault?.();
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
      if (start !== end) {
        return {
          value: `${current.slice(0, start)}${current.slice(end)}`,
          cursor: start,
        };
      }

      if (start === 0) {
        return {
          value: current,
          cursor: 0,
        };
      }

      return {
        value: `${current.slice(0, start - 1)}${current.slice(end)}`,
        cursor: start - 1,
      };
    });
  };

  return (
    <div className="app-shell app-page pb-24 pt-4 md:pt-6">
      <div className="app-page-inner">
        <section className="app-hero relative z-20 mb-5 overflow-visible bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.22),_transparent_28%),linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(8,17,32,0.96))] px-5 py-7 md:px-7 md:py-8">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">
            {t.globalSearch}
          </p>
          <h1 className="mt-3 text-2xl font-bold text-white md:text-4xl">
            {t.searchTitle}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
            {t.searchIntro}
          </p>

          <div className="mt-6">
            <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3 md:flex-row">
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
                className="w-full rounded-[1.5rem] border border-white/10 bg-black/30 px-5 py-4 text-base text-white outline-none placeholder:text-slate-500 focus:border-sky-400/50 focus:bg-black/40"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="rounded-[1.5rem] border border-sky-400/30 bg-sky-500/15 px-6 py-4 text-sm font-semibold text-sky-100 transition hover:border-sky-300/50 hover:bg-sky-500/25"
              >
                {isSearching ? "Searching..." : t.search}
              </button>
            </form>

            {showTamilKeyboard && !isKeyboardOpen && settings.tamilKeyboardAutoOpen === false ? (
              <div className="mt-3 flex justify-start">
                <button
                  type="button"
                  onClick={() => setIsKeyboardOpen(true)}
                  className="rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-xs font-semibold text-sky-100 transition hover:border-sky-300/40 hover:bg-sky-400/15"
                >
                  {keyboardLabels.keyboard}
                </button>
              </div>
            ) : null}

            <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "all", label: "All" },
                  { value: "old", label: t.oldTestament },
                  { value: "new", label: t.newTestament },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTestamentFilter(option.value)}
                    className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                      testamentFilter === option.value
                        ? "bg-[linear-gradient(135deg,#38bdf8,#22c55e)] text-slate-950"
                        : "border border-white/10 bg-white/[0.05] text-slate-200 hover:bg-white/[0.08]"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setExactWordOnly((current) => !current)}
                  className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                    exactWordOnly
                      ? "bg-[linear-gradient(135deg,#f59e0b,#f97316)] text-slate-950"
                      : "border border-white/10 bg-white/[0.05] text-slate-200 hover:bg-white/[0.08]"
                  }`}
                >
                  Exact Word
                </button>
              </div>

              <div className="mt-3">
                <PopupFilterSelect
                  label="Book Only"
                  value={bookFilter}
                  onChange={setBookFilter}
                  options={bookOptions.filter(
                    (option) => option.value === "all" || testamentFilter === "all" || option.testament === testamentFilter
                  )}
                />
              </div>
            </div>
            {showTamilKeyboard && isKeyboardOpen && (
              <div
                ref={keyboardRef}
                onMouseDown={(event) => event.preventDefault()}
                className="mt-4 rounded-[1.5rem] border border-sky-400/20 bg-[linear-gradient(180deg,_rgba(8,17,32,0.98),_rgba(15,23,42,0.96))] p-2.5 shadow-2xl shadow-black/30 md:rounded-[1.75rem] md:p-3"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-100/70">
                    {keyboardLabels.keyboard}
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsKeyboardOpen(false)}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition hover:border-sky-400/30 hover:text-white"
                  >
                    {keyboardLabels.hide}
                  </button>
                </div>

                <div className="space-y-2">
                  {TAMIL_KEYBOARD_ROWS.map((row, rowIndex) => (
                    <div
                      key={`row-${rowIndex}`}
                      className="grid grid-cols-6 gap-1.5 md:flex md:flex-wrap md:gap-2"
                    >
                      {row.map((key) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => insertTamilText(key)}
                          className="min-h-10 rounded-lg border border-white/10 bg-white/[0.05] px-2 py-2 text-center text-sm font-semibold text-white transition hover:border-sky-400/35 hover:bg-sky-400/10 md:min-h-12 md:min-w-20 md:rounded-xl md:px-5 md:py-3 md:text-base"
                        >
                          {key}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-2.5 md:p-3">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                    {keyboardLabels.symbols}
                  </p>
                  <div className="space-y-2">
                    {TAMIL_SYMBOL_ROWS.map((row, rowIndex) => (
                      <div
                        key={`symbol-row-${rowIndex}`}
                        className="grid grid-cols-6 gap-1.5 md:flex md:flex-wrap md:gap-2"
                      >
                        {row.map((key) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => insertTamilText(key)}
                            className="min-h-10 rounded-lg border border-sky-400/15 bg-sky-400/[0.06] px-2 py-2 text-center text-sm font-semibold text-sky-50 transition hover:border-sky-400/35 hover:bg-sky-400/10 md:min-h-11 md:min-w-20 md:px-5"
                          >
                            {key}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-1.5 md:grid-cols-4 md:gap-2">
                  <button
                    type="button"
                    onClick={() => insertTamilText(" ")}
                    className="rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2.5 text-sm font-semibold text-white transition hover:border-sky-400/35 hover:bg-sky-400/10 md:rounded-xl md:py-3"
                  >
                    {keyboardLabels.space}
                  </button>
                  <button
                    type="button"
                    onClick={removeTamilText}
                    className="rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2.5 text-sm font-semibold text-white transition hover:border-sky-400/35 hover:bg-sky-400/10 md:rounded-xl md:py-3"
                  >
                    {keyboardLabels.backspace}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setSubmittedQuery("");
                    }}
                    className="rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2.5 text-sm font-semibold text-white transition hover:border-sky-400/35 hover:bg-sky-400/10 md:rounded-xl md:py-3"
                  >
                    {keyboardLabels.clear}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsKeyboardOpen(false)}
                    className="rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2.5 text-sm font-semibold text-white transition hover:border-sky-400/35 hover:bg-sky-400/10 md:rounded-xl md:py-3"
                  >
                    {keyboardLabels.close}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="app-surface rounded-[2rem] p-4 md:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">{t.verses}</h2>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300">
              {verseResults.length}
            </span>
          </div>

          {!!submittedQuery && !!verseResults.length && (
            <SearchPagination
              visibleStart={visibleStart}
              visibleEnd={visibleEnd}
              total={verseResults.length}
              currentPage={currentVersePage}
              totalPages={totalVersePages}
              onPrev={() => setVersePage((page) => Math.max(1, page - 1))}
              onNext={() => setVersePage((page) => Math.min(totalVersePages, page + 1))}
              prevLabel={t.prev}
              nextLabel={t.next}
            />
          )}

          <div className="space-y-3">
            {isSearching && (
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-5 py-10 text-center text-sm text-slate-300">
                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-sky-300/20 border-t-sky-300" />
                Searching verses...
              </div>
            )}

            {paginatedVerseResults.map((r, i) => (
              <button
                key={`${r.englishBook}-${r.chapter}-${r.verse}-${visibleStart + i}`}
                onClick={() =>
                  openReader(`/reader/${encodeURIComponent(r.englishBook)}/${r.chapter}/${r.verse}`, navigate)
                }
                className="block w-full rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,_rgba(30,41,59,0.88),_rgba(15,23,42,0.86))] p-4 text-left transition hover:border-sky-400/30 hover:bg-slate-800"
              >
                <p className="mb-2 text-sm text-slate-400">
                  {r.book} {r.chapter}:{r.verse}
                </p>
                <HighlightedVerse text={r.text} query={submittedQuery} />
              </button>
            ))}

            {!submittedQuery && (
              <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.03] px-5 py-10 text-center text-sm text-slate-400">
                {t.typeToSearch}
              </div>
            )}

            {!!submittedQuery && !isSearching && !verseResults.length && (
              <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.03] px-5 py-10 text-center text-sm text-slate-400">
                No matching verses found.
              </div>
            )}
          </div>

          {!!submittedQuery && !!verseResults.length && (
            <SearchPagination
              visibleStart={visibleStart}
              visibleEnd={visibleEnd}
              total={verseResults.length}
              currentPage={currentVersePage}
              totalPages={totalVersePages}
              onPrev={() => setVersePage((page) => Math.max(1, page - 1))}
              onNext={() => setVersePage((page) => Math.min(totalVersePages, page + 1))}
              prevLabel={t.prev}
              nextLabel={t.next}
            />
          )}
        </section>
      </div>
    </div>
  );
}
