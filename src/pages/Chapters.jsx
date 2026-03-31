import { useParams, Link } from "react-router-dom";
import useAppSettings from "../hooks/useAppSettings";
import useBibleBook from "../hooks/useBibleBook";
import { getUIText } from "../utils/uiText";
import { getBookName } from "../utils/bibleContent";
import { getBookLabelFromMetadata } from "../utils/bibleData";

export default function Chapters() {
  const { book } = useParams();
  const decodedBook = decodeURIComponent(book);
  const [settings] = useAppSettings();
  const t = getUIText(settings.language);
  const language = settings.language === "en" ? "en" : "ta";
  const { bookData } = useBibleBook(decodedBook, language);
  const bookLabel = getBookName(bookData, settings.language) || getBookLabelFromMetadata(decodedBook, settings.language);

  return (
    <div className="app-shell app-page pb-24 pt-4 md:pt-6">
      <div className="app-page-inner">
        <section className="app-hero mb-5 overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.22),_transparent_28%),radial-gradient(circle_at_85%_18%,_rgba(99,102,241,0.2),_transparent_22%),linear-gradient(180deg,_rgba(10,18,33,0.98),_rgba(6,10,20,0.99))] px-5 py-7 md:px-7 md:py-9">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-300">
            {t.chapters}
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-5xl">
            {bookLabel}
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-300 md:max-w-2xl">
            {t.selectChapter}
          </p>
          <div className="mt-6 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-200">
            {bookData?.chapters?.length || 0} {t.chapters}
          </div>
        </section>

        <section className="app-surface rounded-[2.2rem] p-5 md:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                {t.chapters}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                {t.selectChapter}
              </h2>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300">
              {bookData?.chapters?.length || 0}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-8">
            {bookData?.chapters.map((ch) => (
              <Link
                key={ch.chapter}
                to={`/${encodeURIComponent(decodedBook)}/${ch.chapter}`}
                className="group rounded-[1.4rem] border border-white/10 bg-[linear-gradient(180deg,_rgba(18,29,47,0.96),_rgba(9,14,25,0.98))] px-3 py-5 text-center text-lg font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:border-sky-400/40 hover:shadow-[0_18px_32px_rgba(2,6,23,0.22)]"
              >
                <span className="mx-auto mb-3 block h-px w-8 bg-gradient-to-r from-transparent via-sky-300/70 to-transparent opacity-70 transition group-hover:w-12" />
                {ch.chapter}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
