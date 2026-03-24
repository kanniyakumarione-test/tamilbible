import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import bible from "../utils/loadBible";
import {
  findMatchingBooks,
  getHighlightedTextParts,
  matchTamilTextQuery,
} from "../utils/bookSearch";
import useAppSettings from "../hooks/useAppSettings";
import { getUIText } from "../utils/uiText";

const verseIndex = Object.values(bible).flatMap((bookData) =>
  bookData.chapters.flatMap((ch) =>
    ch.verses.map((v) => ({
      englishBook: bookData.book.english,
      book: bookData.book.tamil,
      chapter: ch.chapter,
      verse: v.verse,
      text: v.text,
    }))
  )
);

function HighlightedVerse({ text, query }) {
  const parts = getHighlightedTextParts(text, query);

  return (
    <p className="leading-7 text-slate-100">
      {parts.map((part, index) => (
        <span
          key={`${part.text}-${index}`}
          className={
            part.match
              ? "rounded-md bg-sky-400/15 px-1 text-sky-100"
              : ""
          }
        >
          {part.text}
        </span>
      ))}
    </p>
  );
}

export default function Search() {
  const navigate = useNavigate();
  const [settings] = useAppSettings();
  const t = getUIText(settings.language);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(query);
    }, 180);

    return () => clearTimeout(timeout);
  }, [query]);

  const bookResults = useMemo(() => {
    const value = debouncedQuery.trim();
    return value ? findMatchingBooks(value).slice(0, 12) : [];
  }, [debouncedQuery]);

  const verseResults = useMemo(() => {
    const value = debouncedQuery.trim();

    if (!value) {
      return [];
    }

    const matches = [];

    for (const verse of verseIndex) {
      if (matchTamilTextQuery(verse.text, value)) {
        matches.push(verse);
      }

      if (matches.length >= 50) {
        break;
      }
    }

    return matches;
  }, [debouncedQuery]);

  return (
    <div className="app-shell px-4 pb-24 pt-4 md:px-6 md:pt-6">
      <div className="mx-auto max-w-5xl">
        <section className="mb-5 overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.22),_transparent_28%),linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(8,17,32,0.96))] px-5 py-7 shadow-2xl shadow-black/25 md:px-7 md:py-8">
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
            <input
              type="text"
              value={query}
              placeholder={t.searchPlaceholder}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-[1.5rem] border border-white/10 bg-black/30 px-5 py-4 text-base text-white outline-none placeholder:text-slate-500 focus:border-sky-400/50 focus:bg-black/40"
            />
          </div>
        </section>

        {!!bookResults.length && (
          <section className="app-surface mb-5 rounded-[2rem] p-4 md:p-5">
            <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">{t.books}</h2>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300">
                {bookResults.length}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {bookResults.map((result) => (
                <button
                  key={result.book.english}
                  onClick={() =>
                    navigate(`/${encodeURIComponent(result.book.english)}`)
                  }
                  className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,_rgba(30,41,59,0.92),_rgba(15,23,42,0.86))] p-4 text-left transition hover:border-sky-400/30 hover:bg-slate-800"
                >
                  <span className="block text-base font-semibold text-slate-100">
                    {result.book.tamil}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="app-surface rounded-[2rem] p-4 md:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">{t.verses}</h2>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300">
              {verseResults.length}
            </span>
          </div>

          <div className="space-y-3">
            {verseResults.map((r, i) => (
              <button
                key={`${r.englishBook}-${r.chapter}-${r.verse}-${i}`}
                onClick={() =>
                  navigate(
                    `/reader/${encodeURIComponent(r.englishBook)}/${r.chapter}/${r.verse}`
                  )
                }
                className="block w-full rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,_rgba(30,41,59,0.88),_rgba(15,23,42,0.86))] p-4 text-left transition hover:border-sky-400/30 hover:bg-slate-800"
              >
                <p className="mb-2 text-sm text-slate-400">
                  {r.book} {r.chapter}:{r.verse}
                </p>
                <HighlightedVerse text={r.text} query={debouncedQuery} />
              </button>
            ))}

            {!debouncedQuery && (
              <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.03] px-5 py-10 text-center text-sm text-slate-400">
                {t.typeToSearch}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
