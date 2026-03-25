import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import useAppSettings from "../hooks/useAppSettings";
import useLibraryData from "../hooks/useLibraryData";
import useInstallPrompt from "../hooks/useInstallPrompt";
import {
  getContinueReading,
  getGroupedHighlights,
  getReadingPlanSummary,
  getRecentPrayers,
  getVerseOfTheDay,
  togglePrayerAnswered,
} from "../utils/libraryData";
import { getUIText } from "../utils/uiText";

function StatCard({ label, value, sublabel }) {
  return (
    <div className="app-surface rounded-[1.75rem] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">
        {label}
      </p>
      <p className="mt-3 text-3xl font-bold text-white">{value}</p>
      {sublabel ? <p className="mt-2 text-sm text-slate-400">{sublabel}</p> : null}
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [settings] = useAppSettings();
  const libraryData = useLibraryData();
  const { canInstall, isInstalled, installInstructions, promptInstall } = useInstallPrompt();
  const [installMessage, setInstallMessage] = useState("");
  const t = getUIText(settings.language);

  const verseOfTheDay = useMemo(() => getVerseOfTheDay(), []);
  const continueReading = getContinueReading(libraryData.history);
  const recentHistory = libraryData.history.slice(0, 4);
  const readingPlans = getReadingPlanSummary(libraryData);
  const groupedHighlights = getGroupedHighlights(libraryData);
  const recentPrayers = getRecentPrayers(libraryData, 4);
  const bookmarkCount = libraryData.bookmarks.length;
  const favoriteCount = libraryData.favorites.length;
  const highlightCount = Object.keys(libraryData.highlights).length;
  const noteCount = Object.keys(libraryData.notes).length;
  const prayerCount = Object.keys(libraryData.prayers).length;

  const goToItem = (item) => {
    if (!item) return;

    navigate(
      item.type === "verse" || item.verse
        ? `/reader/${encodeURIComponent(item.bookEnglish)}/${item.chapter}/${item.verse || 1}`
        : `/${encodeURIComponent(item.bookEnglish)}/${item.chapter}`
    );
  };

  const handleInstallClick = async () => {
    const didPrompt = await promptInstall();

    if (!didPrompt) {
      setInstallMessage(installInstructions || t.installHelp);
      return;
    }

    setInstallMessage("");
  };

  return (
    <div className="app-shell px-4 pb-24 pt-4 md:px-6 md:pt-6">
      <div className="mx-auto max-w-6xl">
        <section className="mb-6 overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.26),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(56,189,248,0.18),_transparent_26%),linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(8,17,32,0.96))] px-5 py-8 shadow-2xl shadow-black/30 md:px-8 md:py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-slate-400">
            {t.tamilBible}
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight text-white md:text-5xl">
            {t.richReader}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
            {t.homeIntro}
          </p>

          <div className="mt-6 flex flex-wrap gap-3 text-xs text-slate-300 md:text-sm">
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
              Reading plans
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
              Prayer journal
            </div>
            <div className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 md:block">
              Sermon mode
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
              Verse designer
            </div>
          </div>
        </section>

        <section className="mb-6 grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="app-surface rounded-[2rem] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Continue Reading
            </p>
            <h2 className="mt-2 text-xl font-bold text-white md:text-2xl">
              {continueReading ? continueReading.bookTamil : t.savedBookmark}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              {continueReading
                ? `${t.chapter} ${continueReading.chapter}${continueReading.verse ? ` • ${t.verse} ${continueReading.verse}` : ""}`
                : "Open any book or verse once and it will appear here for quick return."}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {continueReading ? (
                <button
                  onClick={() => goToItem(continueReading)}
                  className="rounded-2xl bg-[linear-gradient(135deg,#2563eb,#38bdf8)] px-5 py-3 text-sm font-semibold text-white shadow-lg"
                >
                  Resume Now
                </button>
              ) : null}
              <button
                onClick={() => navigate("/books")}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white"
              >
                Browse Books
              </button>
            </div>
          </div>

          {!isInstalled ? (
            <div className="app-surface rounded-[2rem] p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                    {t.installApp}
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-white md:text-2xl">
                    Offline-First App
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
                    Install the app for quicker startup, better offline behavior, and a more native reading experience.
                  </p>
                </div>

                <button
                  onClick={handleInstallClick}
                  className={`rounded-2xl px-5 py-3 text-sm font-semibold shadow-lg ${
                    canInstall
                      ? "bg-gradient-to-br from-indigo-500 to-sky-500 text-white shadow-indigo-950/30"
                      : "border border-white/10 bg-white/5 text-white shadow-none"
                  }`}
                >
                  {canInstall ? t.installNow : "How To Install"}
                </button>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-400">
                {installMessage || installInstructions || t.installHelp}
              </p>
            </div>
          ) : null}
        </section>

        <section className="mb-6 grid gap-4 lg:grid-cols-[1.35fr,0.95fr]">
          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(244,63,94,0.14),_transparent_34%),linear-gradient(180deg,_rgba(15,23,42,0.98),_rgba(8,17,32,0.98))] p-5 shadow-2xl shadow-black/20">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              {t.verseOfDay}
            </p>
            <p className="mt-3 text-sm font-medium text-slate-400">
              {verseOfTheDay.bookTamil} {verseOfTheDay.chapter}:{verseOfTheDay.verse}
            </p>
            <p className="mt-4 text-lg font-semibold leading-8 text-white md:text-2xl md:leading-10">
              {verseOfTheDay.text}
            </p>
            <button
              onClick={() =>
                navigate(
                  `/reader/${encodeURIComponent(verseOfTheDay.bookEnglish)}/${verseOfTheDay.chapter}/${verseOfTheDay.verse}`
                )
              }
              className="mt-5 rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-lg"
              style={{
                background: "linear-gradient(135deg, #2563eb, #38bdf8)",
              }}
            >
              {t.openVerse}
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <StatCard label={t.bookmarksTitle} value={bookmarkCount} />
            <StatCard label={t.favoritesTitle} value={favoriteCount} />
            <StatCard label={t.highlightsTitle} value={highlightCount} sublabel="with colors + folders" />
            <StatCard label={t.notesTitle} value={noteCount} sublabel={`${prayerCount} prayer journal entries`} />
          </div>
        </section>

        <section className="mb-6 app-surface rounded-[2rem] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                Daily Plans
              </p>
              <h2 className="mt-2 text-xl font-bold text-white">Reading Plans</h2>
            </div>
            <button
              type="button"
              onClick={() => continueReading && goToItem(continueReading)}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white"
            >
              Track From Current Chapter
            </button>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {readingPlans.map((plan) => (
              <div
                key={plan.id}
                className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-white">{plan.label}</p>
                    <p className="mt-2 text-sm text-slate-400">
                      {plan.chaptersPerDay} chapter{plan.chaptersPerDay > 1 ? "s" : ""} per day
                    </p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                    {plan.percentage}%
                  </span>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(135deg,#2563eb,#38bdf8)]"
                    style={{ width: `${plan.percentage}%` }}
                  />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-300">
                  <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Done</p>
                    <p className="mt-2 font-semibold text-white">{plan.completedCount}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Today</p>
                    <p className="mt-2 font-semibold text-white">
                      {plan.todayCount}/{plan.chaptersPerDay}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Next chapters
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {plan.nextChapters.slice(0, 3).map((chapter) => (
                      <button
                        key={`${plan.id}-${chapter.id}`}
                        type="button"
                        onClick={() =>
                          navigate(`/${encodeURIComponent(chapter.bookEnglish)}/${chapter.chapter}`)
                        }
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200"
                      >
                        {chapter.bookTamil} {chapter.chapter}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-6 grid gap-4 lg:grid-cols-2">
          <div className="app-surface rounded-[2rem] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Recent Reading
                </p>
                <h2 className="mt-2 text-xl font-bold text-white">Quick Return</h2>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {recentHistory.length ? (
                recentHistory.map((item) => (
                  <button
                    key={`${item.type}-${item.id}`}
                    onClick={() => goToItem(item)}
                    className="flex w-full items-center justify-between rounded-[1.4rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-left transition hover:bg-white/[0.06]"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">{item.bookTamil}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {t.chapter} {item.chapter}
                        {item.verse ? ` • ${t.verse} ${item.verse}` : ""}
                      </p>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {item.type === "verse" ? t.openVerse : t.openChapter}
                    </span>
                  </button>
                ))
              ) : (
                <p className="rounded-[1.4rem] border border-dashed border-white/10 px-4 py-5 text-sm text-slate-400">
                  {t.noItemsYet}
                </p>
              )}
            </div>
          </div>

          <div className="hidden app-surface rounded-[2rem] p-5 md:block">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Prayer Journal
                </p>
                <h2 className="mt-2 text-xl font-bold text-white">Attached prayers</h2>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300">
                {prayerCount}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {recentPrayers.length ? (
                recentPrayers.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <button type="button" onClick={() => goToItem(item)} className="text-left">
                        <p className="text-sm font-semibold text-white">
                          {item.bookTamil} {item.chapter}:{item.verse}
                        </p>
                        <p className="mt-2 line-clamp-2 text-sm leading-7 text-slate-300">
                          {item.text}
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => togglePrayerAnswered(item.id)}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                          item.answered
                            ? "bg-emerald-400 text-slate-950"
                            : "border border-white/10 bg-white/5 text-slate-200"
                        }`}
                      >
                        {item.answered ? "Answered" : "Mark Answered"}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="rounded-[1.4rem] border border-dashed border-white/10 px-4 py-5 text-sm text-slate-400">
                  Add prayers to verses from the chapter screen and revisit them here.
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="mb-6 grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="app-surface rounded-[2rem] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Highlights
                </p>
                <h2 className="mt-2 text-xl font-bold text-white">Highlight folders</h2>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {groupedHighlights.map((folder) => (
                <div
                  key={folder.value}
                  className={`rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4 ${
                    folder.value === "sermon" || folder.value === "prayer" ? "hidden md:block" : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-white">{folder.label}</p>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                      {folder.items.length}
                    </span>
                  </div>
                  <div className="mt-3 space-y-3">
                    {folder.items.slice(0, 2).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => goToItem(item)}
                        className="block w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-left"
                      >
                        <p className="text-sm font-semibold text-white">
                          {item.bookTamil} {item.chapter}:{item.verse}
                        </p>
                        <p className="mt-2 line-clamp-2 text-xs leading-6 text-slate-400">
                          {item.text}
                        </p>
                      </button>
                    ))}
                    {!folder.items.length ? (
                      <p className="text-sm text-slate-400">No highlights in this folder yet.</p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="app-surface rounded-[2rem] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Sharing + Presentation
            </p>
            <h2 className="mt-2 text-xl font-bold text-white">
              <span className="md:hidden">Designer Tools</span>
              <span className="hidden md:inline">Designer and Sermon Tools</span>
            </h2>
            <div className="mt-4 space-y-3">
              <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm font-semibold text-white">Verse image designer</p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  Share verse cards with templates, font size, watermark, and direct export for WhatsApp or Telegram from the reader popup.
                </p>
              </div>
              <div className="hidden rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4 md:block">
                <p className="text-sm font-semibold text-white">Sermon mode</p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  Queue verses during preparation, open the sermon display on another screen, and control the active verse remotely from a second tab.
                </p>
              </div>
            </div>
            <div className="mt-5 hidden flex-wrap gap-3 md:flex">
              <button
                type="button"
                onClick={() => navigate("/sermon-control")}
                className="rounded-2xl bg-[linear-gradient(135deg,#2563eb,#38bdf8)] px-5 py-3 text-sm font-semibold text-white shadow-lg"
              >
                Open Sermon Control
              </button>
              <button
                type="button"
                onClick={() => window.open("/sermon-mode", "_blank", "noopener,noreferrer")}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white"
              >
                Launch Sermon Screen
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
