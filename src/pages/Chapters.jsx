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
    <div className="app-shell pt-2 md:pt-4">
      <div className="mx-auto w-full max-w-[1600px] px-4 md:px-8 lg:px-12 pb-10">
        
        {/* Header Section */}
        <section className="relative z-20 mb-8 overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#000000] p-6 shadow-2xl backdrop-blur-2xl md:p-10">
          <div className="pointer-events-none absolute inset-0 -z-10 rounded-[2.5rem] " />
          
          <div className="flex flex-col items-center text-center">
            <span className="inline-block rounded-full border border-zinc-600/20 bg-zinc-700/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-200 shadow-[0_0_20px_rgba(255, 255, 255,0.1)]">
              {t.chapters}
            </span>
            <h1 className="mt-5 bg-gradient-to-br from-white via-white to-zinc-500 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent md:text-5xl lg:text-6xl">
              {bookLabel}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-stone-400 md:text-base">
              {t.selectChapter}
            </p>
            <div className="mt-6 flex items-center justify-center gap-2 rounded-full border border-white/10 bg-black/40 px-5 py-2.5 text-xs font-bold text-stone-300 ring-1 ring-white/5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0a0a0a]/20 text-[10px] text-zinc-200">
                {bookData?.chapters?.length || 0}
              </span>
              {t.chapters} Total
            </div>
          </div>
        </section>

        {/* Chapters Grid */}
        <section className="relative">
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 sm:gap-3 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12">
            {bookData?.chapters.map((ch) => (
              <Link
                key={ch.chapter}
                to={`/${encodeURIComponent(decodedBook)}/${ch.chapter}`}
                className="group relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/5 bg-[#000000] transition-all duration-300 hover:-translate-y-1 hover:border-zinc-700/50 hover:bg-white/[0.04] hover:shadow-[0_15px_30px_rgba(255, 255, 255,0.15)]"
              >
                <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-zinc-800/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <span className="text-xl font-extrabold text-stone-200 transition-colors duration-300 group-hover:text-white sm:text-2xl">
                  {ch.chapter}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
