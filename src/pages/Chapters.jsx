import { useParams, Link } from "react-router-dom";
import useAppSettings from "../hooks/useAppSettings";
import { getUIText } from "../utils/uiText";
import { getBibleByLanguage, getBookName } from "../utils/bibleContent";

export default function Chapters() {
  const { book } = useParams();
  const decodedBook = decodeURIComponent(book);
  const [settings] = useAppSettings();
  const t = getUIText(settings.language);

  const bookData = getBibleByLanguage(settings.language)[decodedBook];

  return (
    <div className="app-shell px-4 pb-24 pt-4 md:px-6 md:pt-6">
      <div className="mx-auto max-w-5xl">
        <section className="app-surface mb-5 rounded-[2rem] px-5 py-6 md:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">
            {t.chapters}
          </p>
          <h1 className="mt-3 text-2xl font-bold text-white md:text-3xl">
            {getBookName(bookData, settings.language)}
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            {t.selectChapter}
          </p>
        </section>

        <section className="app-surface rounded-[2rem] p-4 md:p-5">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
            {bookData?.chapters.map((ch) => (
              <Link
                key={ch.chapter}
                to={`/${encodeURIComponent(decodedBook)}/${ch.chapter}`}
                className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,_rgba(30,41,59,0.92),_rgba(15,23,42,0.84))] px-3 py-4 text-center text-base font-semibold text-slate-100 transition hover:border-sky-400/30 hover:bg-slate-800"
              >
                {ch.chapter}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
