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
import { localizeChapterItem, localizeVerseItem } from "../utils/bibleContent";
import { openReader } from "../utils/openReader";

function StatCard({ label, value, sublabel }) {
  return (
    <div className="overflow-hidden rounded-[1.85rem] border border-white/10 bg-[linear-gradient(180deg,rgba(18,26,45,0.92),rgba(8,14,27,0.98))] p-5 shadow-[0_20px_50px_rgba(2,6,23,0.28)]">
      <div className="mb-4 h-px w-16 bg-gradient-to-r from-sky-300/70 to-transparent" />
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
        {label}
      </p>
      <p className="mt-4 text-3xl font-bold tracking-tight text-white">{value}</p>
      {sublabel ? <p className="mt-2 text-sm leading-6 text-slate-400">{sublabel}</p> : null}
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [settings] = useAppSettings();
  const libraryData = useLibraryData();
  const { canInstall, isInstalled, installInstructions, promptInstall } = useInstallPrompt();
  const [installMessage, setInstallMessage] = useState("");
  const [verseOfDayPopupOpen, setVerseOfDayPopupOpen] = useState(false);
  const [shareFeedback, setShareFeedback] = useState("");
  const t = getUIText(settings.language);

  const verseOfTheDay = useMemo(() => getVerseOfTheDay(settings.language), [settings.language]);
  const {
    continueReading,
    recentHistory,
    readingPlans,
    groupedHighlights,
    recentPrayers,
    bookmarkCount,
    favoriteCount,
    highlightCount,
    noteCount,
    prayerCount,
  } = useMemo(() => {
    const continueReadingRaw = getContinueReading(libraryData.history);

    return {
      continueReading: continueReadingRaw
        ? continueReadingRaw.verse
          ? localizeVerseItem(continueReadingRaw, settings.language)
          : localizeChapterItem(continueReadingRaw, settings.language)
        : null,
      recentHistory: libraryData.history.slice(0, 4).map((item) =>
        item.verse ? localizeVerseItem(item, settings.language) : localizeChapterItem(item, settings.language)
      ),
      readingPlans: getReadingPlanSummary(libraryData),
      groupedHighlights: getGroupedHighlights(libraryData).map((folder) => ({
        ...folder,
        items: folder.items.map((item) => localizeVerseItem(item, settings.language)),
      })),
      recentPrayers: getRecentPrayers(libraryData, 4).map((item) =>
        localizeChapterItem(item, settings.language)
      ),
      bookmarkCount: libraryData.bookmarks.length,
      favoriteCount: libraryData.favorites.length,
      highlightCount: Object.keys(libraryData.highlights).length,
      noteCount: Object.keys(libraryData.notes).length,
      prayerCount: Object.keys(libraryData.prayers).length,
    };
  }, [libraryData, settings.language]);

  const goToItem = (item) => {
    if (!item) return;

    if (item.type === "verse" || item.verse) {
      openReader(
        `/reader/${encodeURIComponent(item.bookEnglish)}/${item.chapter}/${item.verse || 1}`,
        navigate
      );
      return;
    }

    navigate(`/${encodeURIComponent(item.bookEnglish)}/${item.chapter}`);
  };

  const handleInstallClick = async () => {
    const didPrompt = await promptInstall();

    if (!didPrompt) {
      setInstallMessage(installInstructions || t.installHelp);
      return;
    }

    setInstallMessage("");
  };

  const handleOpenVerseOfDay = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setVerseOfDayPopupOpen(true);
      setShareFeedback("");
      return;
    }

    openReader(
      `/reader/${encodeURIComponent(verseOfTheDay.bookEnglish)}/${verseOfTheDay.chapter}/${verseOfTheDay.verse}`,
      navigate
    );
  };

  const shareVerseOfDay = async () => {
    const shareText = `${verseOfTheDay.bookTamil} ${verseOfTheDay.chapter}:${verseOfTheDay.verse}\n\n${verseOfTheDay.text}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${verseOfTheDay.bookTamil} ${verseOfTheDay.chapter}:${verseOfTheDay.verse}`,
          text: shareText,
        });
        return;
      } catch {
        return;
      }
    }

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareText);
      setShareFeedback(
        settings.language === "en" ? "Verse copied for sharing." : "பகிர்வதற்காக வசனம் நகலெடுக்கப்பட்டது."
      );
    }
  };

  return (
    <div className="home-shell app-shell px-4 pb-24 pt-4 md:px-6 md:pt-6">
      <div className="mx-auto max-w-6xl">
        <section className="relative mb-6 overflow-hidden rounded-[2.35rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.18),_transparent_24%),radial-gradient(circle_at_85%_20%,_rgba(56,189,248,0.22),_transparent_22%),radial-gradient(circle_at_bottom_left,_rgba(14,165,233,0.16),_transparent_26%),linear-gradient(135deg,_rgba(8,15,29,0.98),_rgba(5,10,20,0.99))] px-5 py-8 shadow-[0_28px_90px_rgba(2,6,23,0.42)] md:px-8 md:py-10">
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
              {settings.language === "en" ? "Reading plans" : "வாசிப்பு திட்டங்கள்"}
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
              {settings.language === "en" ? "Prayer journal" : "ஜெப குறிப்பேடு"}
            </div>
            <div className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 md:block">
              {settings.language === "en" ? "Sermon mode" : "பிரசங்க முறை"}
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
              {settings.language === "en" ? "Verse designer" : "வசன வடிவமைப்பான்"}
            </div>
          </div>
        </section>

        <section className="mb-6 grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="app-surface rounded-[2rem] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              {settings.language === "en" ? "Continue Reading" : "தொடர் வாசிப்பு"}
            </p>
            <h2 className="mt-2 text-xl font-bold text-white md:text-2xl">
              {continueReading ? continueReading.bookTamil : t.savedBookmark}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              {continueReading
                ? `${t.chapter} ${continueReading.chapter}${continueReading.verse ? ` • ${t.verse} ${continueReading.verse}` : ""}`
                : settings.language === "en"
                ? "Open any book or verse once and it will appear here for quick return."
                : "எந்த புத்தகம் அல்லது வசனத்தை ஒரு முறை திறந்தாலும், இங்கு விரைவாக மீண்டும் திறக்க காணப்படும்."}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {continueReading ? (
                <button
                  onClick={() => goToItem(continueReading)}
                  className="rounded-2xl bg-[linear-gradient(135deg,#2563eb,#38bdf8)] px-5 py-3 text-sm font-semibold text-white shadow-lg"
                >
                  {settings.language === "en" ? "Resume Now" : "இப்போது தொடரு"}
                </button>
              ) : null}
              <button
                onClick={() => navigate("/books")}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white"
              >
                {settings.language === "en" ? "Browse Books" : "புத்தகங்களை பார்"}
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
                    {settings.language === "en" ? "Offline-First App" : "ஆஃப்லைன் ஆப்"}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
                    {settings.language === "en"
                      ? "Install the app for quicker startup, better offline behavior, and a more native reading experience."
                      : "விரைவான தொடக்கம், சிறந்த offline பயன்பாடு, மற்றும் native போன்ற வாசிப்பு அனுபவத்திற்காக ஆப்பை நிறுவுங்கள்."}
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
                  {canInstall ? t.installNow : settings.language === "en" ? "How To Install" : "நிறுவுவது எப்படி"}
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
              onClick={handleOpenVerseOfDay}
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
            <StatCard
              label={t.highlightsTitle}
              value={highlightCount}
              sublabel={settings.language === "en" ? "with colors + folders" : "நிறங்களும் அடைவுகளும் உடன்"}
            />
            <StatCard
              label={t.notesTitle}
              value={noteCount}
              sublabel={settings.language === "en" ? `${prayerCount} prayer journal entries` : `${prayerCount} ஜெப குறிப்புகள்`}
            />
          </div>
        </section>

        <section className="mb-6 app-surface rounded-[2rem] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                {settings.language === "en" ? "Daily Plans" : "தினசரி திட்டங்கள்"}
              </p>
              <h2 className="mt-2 text-xl font-bold text-white">
                {settings.language === "en" ? "Reading Plans" : "வாசிப்பு திட்டங்கள்"}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => continueReading && goToItem(continueReading)}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white"
            >
              {settings.language === "en" ? "Track From Current Chapter" : "தற்போது அதிகாரத்திலிருந்து தொடர்"}
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
                      {settings.language === "en"
                        ? `${plan.chaptersPerDay} chapter${plan.chaptersPerDay > 1 ? "s" : ""} per day`
                        : `ஒரு நாளுக்கு ${plan.chaptersPerDay} அதிகாரம்${plan.chaptersPerDay > 1 ? "கள்" : ""}`}
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
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      {settings.language === "en" ? "Done" : "முடிந்தது"}
                    </p>
                    <p className="mt-2 font-semibold text-white">{plan.completedCount}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      {settings.language === "en" ? "Today" : "இன்று"}
                    </p>
                    <p className="mt-2 font-semibold text-white">
                      {plan.todayCount}/{plan.chaptersPerDay}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    {settings.language === "en" ? "Next chapters" : "அடுத்த அதிகாரங்கள்"}
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
                        {localizeChapterItem(chapter, settings.language).bookTamil} {chapter.chapter}
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
                  {t.recentReading}
                </p>
                <h2 className="mt-2 text-xl font-bold text-white">
                  {settings.language === "en" ? "Quick Return" : "விரைவான திரும்பல்"}
                </h2>
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
                  {settings.language === "en" ? "Prayer Journal" : "ஜெப குறிப்பேடு"}
                </p>
                <h2 className="mt-2 text-xl font-bold text-white">
                  {settings.language === "en" ? "Attached prayers" : "இணைக்கப்பட்ட ஜெபங்கள்"}
                </h2>
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
                        {item.answered
                          ? settings.language === "en"
                            ? "Answered"
                            : "பதிலளிக்கப்பட்டது"
                          : settings.language === "en"
                          ? "Mark Answered"
                          : "பதிலாக குறி"}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="rounded-[1.4rem] border border-dashed border-white/10 px-4 py-5 text-sm text-slate-400">
                  {settings.language === "en"
                    ? "Add prayers to verses from the chapter screen and revisit them here."
                    : "அதிகார திரையிலிருந்து வசனங்களுக்கு ஜெபங்களை சேர்த்து, இங்கு மீண்டும் பார்க்கலாம்."}
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
                  {t.highlightsTitle}
                </p>
                <h2 className="mt-2 text-xl font-bold text-white">
                  {settings.language === "en" ? "Highlight folders" : "ஹைலைட் அடைவுகள்"}
                </h2>
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
                      <p className="text-sm text-slate-400">
                        {settings.language === "en"
                          ? "No highlights in this folder yet."
                          : "இந்த அடைவில் இன்னும் ஹைலைட்கள் இல்லை."}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="app-surface rounded-[2rem] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              {settings.language === "en" ? "Sharing + Presentation" : "பகிரல் + பிரசென்டேஷன்"}
            </p>
            <h2 className="mt-2 text-xl font-bold text-white">
              <span className="md:hidden">
                {settings.language === "en" ? "Designer Tools" : "வடிவமைப்பு கருவிகள்"}
              </span>
              <span className="hidden md:inline">
                {settings.language === "en"
                  ? "Designer and Sermon Tools"
                  : "வடிவமைப்பு மற்றும் பிரசங்க கருவிகள்"}
              </span>
            </h2>
            <div className="mt-4 space-y-3">
              <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm font-semibold text-white">
                  {settings.language === "en" ? "Verse image designer" : "வசன பட வடிவமைப்பான்"}
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  {settings.language === "en"
                    ? "Share verse cards with templates, font size, watermark, and direct export for WhatsApp or Telegram from the reader popup."
                    : "Reader popup-இலிருந்து template, font size, watermark, WhatsApp அல்லது Telegram export உடன் வசன கார்டுகளை பகிரலாம்."}
                </p>
              </div>
              <div className="hidden rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4 md:block">
                <p className="text-sm font-semibold text-white">
                  {settings.language === "en" ? "Sermon mode" : "பிரசங்க முறை"}
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  {settings.language === "en"
                    ? "Queue verses during preparation, open the sermon display on another screen, and control the active verse remotely from a second tab."
                    : "தயாரிப்பில் வசனங்களை queue செய்து, மற்றொரு screen-இல் sermon display-ஐ திறந்து, இரண்டாம் tab-இலிருந்து active verse-ஐ control செய்யலாம்."}
                </p>
              </div>
            </div>
            <div className="mt-5 hidden flex-wrap gap-3 md:flex">
              <button
                type="button"
                onClick={() => navigate("/sermon-control")}
                className="rounded-2xl bg-[linear-gradient(135deg,#2563eb,#38bdf8)] px-5 py-3 text-sm font-semibold text-white shadow-lg"
              >
                {settings.language === "en" ? "Open Sermon Control" : "பிரசங்க கட்டுப்பாட்டை திற"}
              </button>
              <button
                type="button"
                onClick={() => window.open("/sermon-mode", "_blank", "noopener,noreferrer")}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white"
              >
                {settings.language === "en" ? "Launch Sermon Screen" : "பிரசங்க திரையை தொடங்கு"}
              </button>
            </div>
          </div>
        </section>

        {verseOfDayPopupOpen ? (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-sm md:hidden">
            <button
              type="button"
              aria-label="Close verse of day popup"
              className="absolute inset-0"
              onClick={() => setVerseOfDayPopupOpen(false)}
            />

            <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.26),_transparent_32%),linear-gradient(180deg,_rgba(15,23,42,0.98),_rgba(8,17,32,0.98))] p-5 shadow-2xl shadow-black/40">
              <p className="text-center text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                {t.verseOfDay}
              </p>
              <p className="mt-3 text-center text-sm font-semibold text-white">
                {verseOfTheDay.bookTamil} {verseOfTheDay.chapter}:{verseOfTheDay.verse}
              </p>
              <p className="mt-5 text-center text-lg font-semibold leading-9 text-white">
                {verseOfTheDay.text}
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={shareVerseOfDay}
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white"
                >
                  {t.share}
                </button>
                <button
                  type="button"
                  onClick={() => setVerseOfDayPopupOpen(false)}
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white"
                >
                  {t.close}
                </button>
              </div>

              {shareFeedback ? (
                <p className="mt-4 text-center text-sm text-slate-300">{shareFeedback}</p>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
