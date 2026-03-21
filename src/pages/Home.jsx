import BookList from "../components/BookList";
import useAppSettings from "../hooks/useAppSettings";
import useLibraryData from "../hooks/useLibraryData";
import useInstallPrompt from "../hooks/useInstallPrompt";
import { getVerseOfTheDay } from "../utils/libraryData";
import { getUIText } from "../utils/uiText";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const [settings] = useAppSettings();
  const libraryData = useLibraryData();
  const { canInstall, isInstalled, promptInstall } = useInstallPrompt();
  const t = getUIText(settings.language);
  const verseOfTheDay = useMemo(() => getVerseOfTheDay(), []);
  const recentHistory = libraryData.history.slice(0, 4);
  const bookmarkCount = libraryData.bookmarks.length;
  const favoriteCount = libraryData.favorites.length;
  const highlightCount = Object.keys(libraryData.highlights).length;
  const noteCount = Object.keys(libraryData.notes).length;

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
              {t.tanglishSearch}
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
              {t.mobileFriendly}
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
              {t.readerSettings}
            </div>
          </div>
        </section>

        <section className="app-surface mb-6 rounded-[2rem] p-4 md:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                {t.installApp}
              </p>
              <h2 className="mt-2 text-xl font-bold text-white md:text-2xl">
                {t.installBannerTitle}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
                {isInstalled ? t.installed : t.installBannerText}
              </p>
            </div>

            <button
              onClick={promptInstall}
              disabled={!canInstall}
              className={`rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-lg ${
                canInstall
                  ? "bg-gradient-to-br from-indigo-500 to-sky-500 shadow-indigo-950/30"
                  : "cursor-not-allowed bg-slate-800 text-slate-400 shadow-none"
              }`}
            >
              {isInstalled ? t.installed : t.installNow}
            </button>
          </div>
        </section>

        <section className="mb-6 grid gap-4 lg:grid-cols-[1.4fr,0.9fr]">
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
            {[
              { label: t.bookmarksTitle, value: bookmarkCount },
              { label: t.favoritesTitle, value: favoriteCount },
              { label: t.highlightsTitle, value: highlightCount },
              { label: t.notesTitle, value: noteCount },
            ].map((item) => (
              <div
                key={item.label}
                className="app-surface rounded-[1.75rem] p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">
                  {item.label}
                </p>
                <p className="mt-3 text-3xl font-bold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-6 grid gap-4 lg:grid-cols-2">
          <div className="app-surface rounded-[2rem] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  {t.recentReading}
                </p>
                <h2 className="mt-2 text-xl font-bold text-white">
                  {t.savedBookmark}
                </h2>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {recentHistory.length ? (
                recentHistory.map((item) => {
                  const path =
                    item.type === "verse"
                      ? `/reader/${encodeURIComponent(item.bookEnglish)}/${item.chapter}/${item.verse}`
                      : `/${encodeURIComponent(item.bookEnglish)}/${item.chapter}`;

                  return (
                    <button
                      key={`${item.type}-${item.id}`}
                      onClick={() => navigate(path)}
                      className="flex w-full items-center justify-between rounded-[1.4rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-left transition hover:bg-white/[0.06]"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {item.bookTamil}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {t.chapter} {item.chapter}
                          {item.verse ? ` • ${t.verse} ${item.verse}` : ""}
                        </p>
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        {item.type === "verse" ? t.openVerse : t.openChapter}
                      </span>
                    </button>
                  );
                })
              ) : (
                <p className="rounded-[1.4rem] border border-dashed border-white/10 px-4 py-5 text-sm text-slate-400">
                  {t.noItemsYet}
                </p>
              )}
            </div>
          </div>

          <div className="app-surface rounded-[2rem] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              {t.library}
            </p>
            <h2 className="mt-2 text-xl font-bold text-white">
              {t.savedHighlight}
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                {
                  label: t.savedFavorite,
                  items: libraryData.favorites.slice(0, 2),
                },
                {
                  label: t.savedNote,
                  items: Object.values(libraryData.notes).slice(0, 2),
                },
              ].map((section) => (
                <div
                  key={section.label}
                  className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    {section.label}
                  </p>
                  <div className="mt-3 space-y-3">
                    {section.items.length ? (
                      section.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() =>
                            navigate(
                              `/reader/${encodeURIComponent(item.bookEnglish)}/${item.chapter}/${item.verse || 1}`
                            )
                          }
                          className="block w-full text-left"
                        >
                          <p className="text-sm font-semibold text-white">
                            {item.bookTamil}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {t.chapter} {item.chapter}
                            {item.verse ? ` • ${t.verse} ${item.verse}` : ""}
                          </p>
                          {"text" in item && item.text ? (
                            <p className="mt-2 line-clamp-2 text-xs leading-6 text-slate-500">
                              {item.text}
                            </p>
                          ) : null}
                        </button>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400">{t.noItemsYet}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <BookList />
      </div>
    </div>
  );
}
