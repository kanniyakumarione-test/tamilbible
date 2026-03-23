import BookList from "../components/BookList";
import useAppSettings from "../hooks/useAppSettings";
import { getUIText } from "../utils/uiText";

export default function Books() {
  const [settings] = useAppSettings();
  const t = getUIText(settings.language);

  return (
    <div className="app-shell px-4 pb-24 pt-4 md:px-6 md:pt-6">
      <div className="mx-auto max-w-6xl">
        <section className="mb-6 overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.26),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(56,189,248,0.18),_transparent_26%),linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(8,17,32,0.96))] px-5 py-8 shadow-2xl shadow-black/30 md:px-8 md:py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-slate-400">
            {t.library}
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-white md:text-5xl">
            {t.books}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
            {t.chooseStart}
          </p>
        </section>

        <BookList />
      </div>
    </div>
  );
}
