import { useState } from "react";
import { Link } from "react-router-dom";
import oldBible from "../utils/loadOldTestament";
import newBible from "../utils/loadNewTestament";
import useAppSettings from "../hooks/useAppSettings";
import { getUIText } from "../utils/uiText";

export default function BookList() {
  const [tab, setTab] = useState(null);
  const [settings] = useAppSettings();
  const t = getUIText(settings.language);

  const books = tab === "old" ? oldBible : tab === "new" ? newBible : [];

  return (
    <div className="pb-24">
      <section className="app-surface mb-5 rounded-[2rem] p-4 md:p-5">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              {t.library}
            </p>
            <h2 className="mt-2 text-xl font-bold text-white md:text-2xl">
              {t.chooseStart}
            </h2>
          </div>

          {tab && (
            <div className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300 md:block">
              {books.length} books
            </div>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <button
            onClick={() => setTab("old")}
            className={`overflow-hidden rounded-[1.75rem] border px-5 py-6 text-left transition md:px-6 md:py-7 ${
              tab === "old"
                ? "border-indigo-300/70 bg-[radial-gradient(circle_at_top_left,_rgba(129,140,248,0.45),_transparent_45%),linear-gradient(180deg,_rgba(79,70,229,0.7),_rgba(30,41,59,0.92))] text-white shadow-xl shadow-indigo-950/30"
                : "border-white/10 bg-[linear-gradient(180deg,_rgba(15,23,42,0.92),_rgba(15,23,42,0.74))] text-slate-100 hover:border-indigo-400/40 hover:bg-slate-900"
            }`}
          >
            <span className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.32em] text-indigo-200">
              {t.testament}
            </span>
            <span className="block text-xl font-bold md:text-2xl">
              {t.oldTestament}
            </span>
            <span className="mt-3 block text-sm text-slate-300">
              {t.oldDesc}
            </span>
          </button>

          <button
            onClick={() => setTab("new")}
            className={`overflow-hidden rounded-[1.75rem] border px-5 py-6 text-left transition md:px-6 md:py-7 ${
              tab === "new"
                ? "border-cyan-300/70 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.38),_transparent_45%),linear-gradient(180deg,_rgba(8,145,178,0.58),_rgba(15,23,42,0.92))] text-white shadow-xl shadow-cyan-950/30"
                : "border-white/10 bg-[linear-gradient(180deg,_rgba(15,23,42,0.92),_rgba(15,23,42,0.74))] text-slate-100 hover:border-cyan-400/40 hover:bg-slate-900"
            }`}
          >
            <span className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-200">
              {t.testament}
            </span>
            <span className="block text-xl font-bold md:text-2xl">
              {t.newTestament}
            </span>
            <span className="mt-3 block text-sm text-slate-300">
              {t.newDesc}
            </span>
          </button>
        </div>
      </section>

      {tab && (
        <section className="app-surface rounded-[2rem] p-4 md:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                {t.books}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-white">
                {tab === "old" ? t.oldTestament : t.newTestament}
              </h3>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300">
              {books.length}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {books.map((b, i) => (
              <Link
                key={i}
                to={`/${encodeURIComponent(b.book.english)}/1`}
                className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,_rgba(30,41,59,0.92),_rgba(15,23,42,0.86))] px-4 py-4 text-left transition hover:-translate-y-0.5 hover:border-sky-400/35 hover:bg-slate-800"
              >
                <span className="block text-base font-semibold text-slate-100">
                  {b.book.tamil}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
