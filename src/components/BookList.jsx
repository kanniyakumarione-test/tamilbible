import { useState } from "react";
import { Link } from "react-router-dom";
import oldBible from "../utils/loadOldTestament";
import newBible from "../utils/loadNewTestament";
import useAppSettings from "../hooks/useAppSettings";
import { getUIText } from "../utils/uiText";
import { getBookNameFromEntry } from "../utils/bibleContent";

export default function BookList() {
  const [tab, setTab] = useState(null);
  const [settings] = useAppSettings();
  const t = getUIText(settings.language);

  const books = tab === "old" ? oldBible : tab === "new" ? newBible : [];

  return (
    <div className="pb-24">
      <section className="app-surface mb-5 rounded-[2.2rem] p-5 md:p-6">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              {t.library}
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white md:text-3xl">
              {t.chooseStart}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
              {settings.language === "en"
                ? "Start by choosing a testament, then open any book from a cleaner full-width library grid."
                : "முதலில் ஏற்பாட்டைத் தேர்வு செய்து, அதன் பின் விரிவான முழு அகல library grid-இல் இருந்து புத்தகத்தைத் திறக்கவும்."}
            </p>
          </div>

          {tab && (
            <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300">
              {books.length} books
            </div>
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <button
            onClick={() => setTab("old")}
            className={`group overflow-hidden rounded-[1.9rem] border px-5 py-6 text-left transition md:px-7 md:py-8 ${
              tab === "old"
                ? "border-indigo-300/70 bg-[radial-gradient(circle_at_top_left,_rgba(129,140,248,0.45),_transparent_40%),linear-gradient(180deg,_rgba(79,70,229,0.82),_rgba(18,24,38,0.94))] text-white shadow-xl shadow-indigo-950/30"
                : "border-white/10 bg-[linear-gradient(180deg,_rgba(12,19,34,0.96),_rgba(7,11,22,0.98))] text-slate-100 hover:-translate-y-0.5 hover:border-indigo-400/40"
            }`}
          >
            <span className="mb-3 inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-indigo-100">
              {t.testament}
            </span>
            <span className="block text-2xl font-bold md:text-3xl">
              {t.oldTestament}
            </span>
            <span className="mt-4 block text-sm leading-7 text-slate-300">
              {t.oldDesc}
            </span>
            <span className="mt-6 inline-flex text-sm font-semibold text-white/90">
              {settings.language === "en" ? "Browse books" : "புத்தகங்களை பார்க்க"}
            </span>
          </button>

          <button
            onClick={() => setTab("new")}
            className={`group overflow-hidden rounded-[1.9rem] border px-5 py-6 text-left transition md:px-7 md:py-8 ${
              tab === "new"
                ? "border-cyan-300/70 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.38),_transparent_40%),linear-gradient(180deg,_rgba(8,145,178,0.7),_rgba(15,23,42,0.92))] text-white shadow-xl shadow-cyan-950/30"
                : "border-white/10 bg-[linear-gradient(180deg,_rgba(12,19,34,0.96),_rgba(7,11,22,0.98))] text-slate-100 hover:-translate-y-0.5 hover:border-cyan-400/40"
            }`}
          >
            <span className="mb-3 inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-100">
              {t.testament}
            </span>
            <span className="block text-2xl font-bold md:text-3xl">
              {t.newTestament}
            </span>
            <span className="mt-4 block text-sm leading-7 text-slate-300">
              {t.newDesc}
            </span>
            <span className="mt-6 inline-flex text-sm font-semibold text-white/90">
              {settings.language === "en" ? "Browse books" : "புத்தகங்களை பார்க்க"}
            </span>
          </button>
        </div>
      </section>

      {tab && (
        <section className="app-surface rounded-[2.2rem] p-5 md:p-6">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                {t.books}
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-white">
                {tab === "old" ? t.oldTestament : t.newTestament}
              </h3>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300">
              {books.length}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {books.map((b, i) => (
              <Link
                key={i}
                to={`/${encodeURIComponent(b.book.english)}`}
                className="group rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,_rgba(18,28,46,0.96),_rgba(10,15,28,0.98))] px-4 py-4 text-left transition hover:-translate-y-0.5 hover:border-sky-400/35 hover:shadow-[0_18px_32px_rgba(2,6,23,0.22)]"
              >
                <span className="mb-3 block h-px w-12 bg-gradient-to-r from-sky-300/70 to-transparent transition group-hover:w-20" />
                <span className="block text-base font-semibold text-slate-100">
                  {getBookNameFromEntry(b, settings.language)}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
