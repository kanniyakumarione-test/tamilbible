import BookList from "../components/BookList";
import useAppSettings from "../hooks/useAppSettings";
import { getUIText } from "../utils/uiText";

export default function Books() {
  const [settings] = useAppSettings();
  const t = getUIText(settings.language);

  return (
    <div className="app-shell pt-2 md:pt-4">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8 lg:px-12">
        <section className="relative z-20 mb-8 overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#000000] p-6 shadow-2xl backdrop-blur-2xl md:p-10">
          <div className="pointer-events-none absolute inset-0 -z-10 rounded-[2.5rem] " />
          
          <div className="text-center">
            <span className="inline-block rounded-full border border-zinc-600/20 bg-zinc-700/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-200 shadow-[0_0_20px_rgba(255, 255, 255,0.1)]">
              {t.library}
            </span>
            <h1 className="mt-5 bg-gradient-to-br from-white via-white to-zinc-500 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent md:text-5xl lg:text-6xl">
              {t.books}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-stone-400 md:text-base">
              {t.chooseStart}
            </p>
          </div>
        </section>

        <BookList />
      </div>
    </div>
  );
}
