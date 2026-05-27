import { Link, useNavigate, useLocation } from "react-router-dom";

import useLibraryData from "../hooks/useLibraryData";
import {
  removeSermonQueueItem,
  setActiveSermonItem,
} from "../utils/libraryData";
import { openReader } from "../utils/openReader";
import { openPresentationWindow } from "../utils/screens";
import useAppSettings from "../hooks/useAppSettings";
import { getUIText } from "../utils/uiText";

export default function SermonControl() {
  const [settings] = useAppSettings();
  const t = getUIText(settings.language);
  const navigate = useNavigate();
  const location = useLocation();
  const libraryData = useLibraryData();
  const queue = libraryData.sermon.queue || [];
  const activeId = libraryData.sermon.activeItem?.id;

  return (
    <div className="app-shell app-page pb-6 pt-4 md:pt-6">
      <div className="app-page-inner">
        <section className="app-hero mb-6 overflow-hidden  px-5 py-8 md:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-stone-400">
            {t.presentation || "Presentation"}
          </p>
          <h1 className="mt-3 text-3xl font-bold text-white md:text-5xl">
            {t.sermonControlTitle || "Sermon Control"}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-300 md:text-base">
            {t.sermonControlDesc || "Manage the projector queue, switch the active verse, and open the full-screen sermon display."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => openPresentationWindow("/presentation/main", settings.mainPresentationScreen, "tamil-bible-presentation-main")}
              className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black shadow-lg shadow-white/20 transition hover:bg-stone-200"
            >
              {t.openMainDisplay || "Open Main Display"}
            </button>
            <button
              type="button"
              onClick={() => openPresentationWindow("/presentation/stage", settings.stagePresentationScreen, "tamil-bible-presentation-stage")}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {t.openStageDisplay || "Open Stage Display"}
            </button>
            {libraryData.sermon.activeItem ? (
              <button
                type="button"
                onClick={() =>
                  openReader(
                    `/reader/${encodeURIComponent(libraryData.sermon.activeItem.bookEnglish)}/${libraryData.sermon.activeItem.chapter}/${libraryData.sermon.activeItem.verse}`,
                    navigate,
                    { state: { returnTo: location.pathname } }
                  )
                }
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white"
              >
                {t.openActiveVerse || "Open Active Verse"}
              </button>
            ) : null}
          </div>
        </section>

        <section className="app-surface rounded-[2rem] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-400">
                {t.queueTitle || "Queue"}
              </p>
              <h2 className="mt-2 text-xl font-bold text-white">{t.upcomingSermonVerses || "Upcoming Sermon Verses"}</h2>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-stone-300">
              {queue.length}
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {queue.length ? (
              queue.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-[1.5rem] border px-4 py-4 ${
                    item.id === activeId
                      ? "border-zinc-600/40 bg-zinc-700/10"
                      : "border-white/10 bg-white/[0.03]"
                  }`}
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-base font-semibold text-white">
                        {item.isSong ? item.bookTamil : `${item.bookTamil} ${item.chapter}:${item.verse}`}
                      </p>
                      <p className="mt-2 line-clamp-3 text-sm leading-7 text-stone-300 whitespace-pre-wrap">
                        {item.text}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveSermonItem(item)}
                        className="rounded-xl bg-[#000000] px-4 py-2.5 text-sm font-semibold text-white"
                      >
                        {t.showNow || "Show Now"}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSermonQueueItem(item.id)}
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white"
                      >
                        {t.remove || "Remove"}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-[1.4rem] border border-dashed border-white/10 px-4 py-5 text-sm text-stone-400">
                {t.addVersesToStart || "Add verses from the chapter screen to start building a sermon queue."}
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
