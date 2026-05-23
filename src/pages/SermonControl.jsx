import { Link, useNavigate } from "react-router-dom";

import useLibraryData from "../hooks/useLibraryData";
import {
  removeSermonQueueItem,
  setActiveSermonItem,
} from "../utils/libraryData";
import { openReader } from "../utils/openReader";

export default function SermonControl() {
  const navigate = useNavigate();
  const libraryData = useLibraryData();
  const queue = libraryData.sermon.queue || [];
  const activeId = libraryData.sermon.activeItem?.id;

  return (
    <div className="app-shell app-page pb-6 pt-4 md:pt-6">
      <div className="app-page-inner">
        <section className="app-hero mb-6 overflow-hidden  px-5 py-8 md:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-stone-400">
            Presentation
          </p>
          <h1 className="mt-3 text-3xl font-bold text-white md:text-5xl">
            Sermon Control
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-300 md:text-base">
            Manage the projector queue, switch the active verse, and open the full-screen sermon display.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/sermon-mode"
              className="rounded-2xl bg-[#000000] px-5 py-3 text-sm font-semibold text-white shadow-lg"
              target="_blank"
              rel="noreferrer"
            >
              Open Display
            </Link>
            {libraryData.sermon.activeItem ? (
              <button
                type="button"
                onClick={() =>
                  openReader(
                    `/reader/${encodeURIComponent(libraryData.sermon.activeItem.bookEnglish)}/${libraryData.sermon.activeItem.chapter}/${libraryData.sermon.activeItem.verse}`,
                    navigate
                  )
                }
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white"
              >
                Open Active Verse
              </button>
            ) : null}
          </div>
        </section>

        <section className="app-surface rounded-[2rem] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-400">
                Queue
              </p>
              <h2 className="mt-2 text-xl font-bold text-white">Upcoming Sermon Verses</h2>
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
                        {item.bookTamil} {item.chapter}:{item.verse}
                      </p>
                      <p className="mt-2 line-clamp-3 text-sm leading-7 text-stone-300">
                        {item.text}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveSermonItem(item)}
                        className="rounded-xl bg-[#000000] px-4 py-2.5 text-sm font-semibold text-white"
                      >
                        Show Now
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSermonQueueItem(item.id)}
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-[1.4rem] border border-dashed border-white/10 px-4 py-5 text-sm text-stone-400">
                Add verses from the chapter screen to start building a sermon queue.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
