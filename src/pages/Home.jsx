import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

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

function StatCard({ label, value, sublabel, icon }) {
  return (
    <div className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.02] p-5 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:bg-white/[0.04] hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:border-zinc-700/30">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#0a0a0a]/10 blur-2xl transition-all duration-500 group-hover:bg-zinc-700/20 group-hover:blur-3xl" />
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-stone-400 transition-colors group-hover:text-zinc-300">
            {label}
          </p>
          <p className="mt-3 bg-gradient-to-br from-white to-slate-400 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent transition-all group-hover:from-white group-hover:to-zinc-500">
            {value}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-xl shadow-inner ring-1 ring-white/10 transition-all group-hover:bg-[#0a0a0a]/20 group-hover:text-zinc-300 group-hover:ring-zinc-600/30">
          {icon}
        </div>
      </div>
      {sublabel ? (
        <p className="relative z-10 mt-3 text-xs font-medium text-stone-500 transition-colors group-hover:text-stone-300">
          {sublabel}
        </p>
      ) : null}
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [settings] = useAppSettings();
  const libraryData = useLibraryData();
  const { canInstall, isInstalled, installInstructions, promptInstall } = useInstallPrompt();
  const [installMessage, setInstallMessage] = useState("");
  const [installPopupOpen, setInstallPopupOpen] = useState(false);
  const [verseOfDayPopupOpen, setVerseOfDayPopupOpen] = useState(false);
  const [shareFeedback, setShareFeedback] = useState("");
  const [verseOfTheDay, setVerseOfTheDay] = useState(null);
  const [localizedSummary, setLocalizedSummary] = useState({
    continueReading: null,
    recentHistory: [],
    readingPlans: [],
    groupedHighlights: [],
    recentPrayers: [],
  });
  const t = getUIText(settings.language);

  const {
    bookmarkCount,
    favoriteCount,
    highlightCount,
    noteCount,
    prayerCount,
  } = useMemo(() => {
    return {
      bookmarkCount: libraryData.bookmarks.length,
      favoriteCount: libraryData.favorites.length,
      highlightCount: Object.keys(libraryData.highlights).length,
      noteCount: Object.keys(libraryData.notes).length,
      prayerCount: Object.keys(libraryData.prayers).length,
    };
  }, [libraryData]);

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      const continueReadingRaw = getContinueReading(libraryData.history);
      try {
        const [verseOfDayItem, continueReading, recentHistory, readingPlans, groupedHighlights, recentPrayers] =
          await Promise.all([
            getVerseOfTheDay(settings.language),
            continueReadingRaw
              ? continueReadingRaw.verse
                ? localizeVerseItem(continueReadingRaw, settings.language)
                : localizeChapterItem(continueReadingRaw, settings.language)
              : Promise.resolve(null),
            Promise.all(
              libraryData.history.slice(0, 4).map((item) =>
                item.verse ? localizeVerseItem(item, settings.language) : localizeChapterItem(item, settings.language)
              )
            ),
            getReadingPlanSummary(libraryData),
            Promise.all(
              getGroupedHighlights(libraryData).map(async (folder) => ({
                ...folder,
                items: await Promise.all(
                  folder.items.map((item) => localizeVerseItem(item, settings.language))
                ),
              }))
            ),
            Promise.all(
              getRecentPrayers(libraryData, 4).map((item) =>
                localizeChapterItem(item, settings.language)
              )
            ),
          ]);

        if (cancelled) return;

        setVerseOfTheDay(verseOfDayItem);
        setLocalizedSummary({
          continueReading,
          recentHistory,
          readingPlans,
          groupedHighlights,
          recentPrayers,
        });
      } catch (err) {
        console.error("Dashboard failed to load:", err);
        alert("ERROR: " + err.message + "\nStack: " + err.stack.substring(0, 200));
        if (cancelled) return;
        setVerseOfTheDay({ bookEnglish: "Genesis", bookTamil: "ஆதியாகமம்", chapter: 1, verse: 1, text: "ஆதியிலே தேவன் வானத்தையும் பூமியையும் சிருஷ்டித்தார்." });
      }
    };

    void loadDashboard();
    return () => { cancelled = true; };
  }, [libraryData, settings.language]);

  const { continueReading, recentHistory, readingPlans, groupedHighlights, recentPrayers } = localizedSummary;

  const goToItem = (item) => {
    if (!item) return;
    if (item.type === "verse" || item.verse) {
      navigate(`/${encodeURIComponent(item.bookEnglish)}/${item.chapter}?verse=${item.verse || 1}`);
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

  const shareVerseOfDay = async () => {
    if (!verseOfTheDay) return;
    const shareText = `${verseOfTheDay.bookTamil} ${verseOfTheDay.chapter}:${verseOfTheDay.verse}\n\n${verseOfTheDay.text}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${verseOfTheDay.bookTamil} ${verseOfTheDay.chapter}:${verseOfTheDay.verse}`, text: shareText });
        return;
      } catch { return; }
    }
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareText);
      setShareFeedback(["en", "ta-en"].includes(settings.language) ? "Verse copied for sharing." : "பகிர்வதற்காக வசனம் நகலெடுக்கப்பட்டது.");
    }
  };

  return (
    <div className="home-shell pt-2 md:pt-4">
      <div className="mx-auto grid w-full max-w-[1600px] gap-6 px-4 md:px-8 lg:px-12">
        
        {/* Hero Section */}
        <section className="group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#000000] p-8 shadow-2xl backdrop-blur-2xl md:p-12 lg:p-16">
          <div className="pointer-events-none absolute inset-0 -z-10 rounded-[2.5rem]  opacity-80 transition-opacity duration-700 group-hover:opacity-100" />
          <div className="absolute right-0 top-0 -z-10 h-64 w-64 translate-x-1/3 -translate-y-1/3 rounded-full bg-[#0a0a0a]/20 blur-[80px]" />
          
          <div className="relative z-10">
            <span className="inline-block rounded-full border border-zinc-600/20 bg-zinc-700/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-200 shadow-[0_0_20px_rgba(255, 255, 255,0.1)]">
              {t.tamilBible}
            </span>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-stone-300 md:text-lg">
              {t.homeIntro}
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <button
                onClick={() => continueReading ? goToItem(continueReading) : navigate("/books")}
                className="group relative flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-zinc-800 to-black px-8 py-4 font-bold text-white shadow-[0_0_30px_rgba(255, 255, 255,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255, 255, 255,0.5)] active:scale-95"
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
                <span className="relative z-10">{continueReading ? (["en", "ta-en"].includes(settings.language) ? "Resume Reading" : "தொடர்ந்து வாசிக்க") : (["en", "ta-en"].includes(settings.language) ? "Start Reading" : "வாசிக்கத் தொடங்கு")}</span>
                <svg className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
              
              <a
                href="https://github.com/kanniyakumarione-test/tamilbible/releases/download/v1.0.0/Tamil.Bible.Premium.Setup.0.0.0.exe"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center gap-2 overflow-hidden rounded-full border border-white/10 bg-white/5 px-8 py-4 font-bold text-white transition-all hover:scale-105 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95"
              >
                <span className="relative z-10">{["en", "ta-en"].includes(settings.language) ? "Download for Windows" : "Windows செயலி"}</span>
                <svg className="relative z-10 h-5 w-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </a>
            </div>
          </div>
        </section>

        {/* Verse of the Day & Stats */}
        <section className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#000000] p-8 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:border-rose-500/30 hover:shadow-[0_20px_60px_rgba(244,63,94,0.15)]">
            <div className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-rose-500/10 blur-[80px] transition-all duration-500 group-hover:bg-rose-500/20" />
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-rose-400">
                  {t.verseOfDay}
                </p>
              </div>
              
              {verseOfTheDay ? (
                <div className="mt-6">
                  <h3 className="mb-4 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-stone-300">
                    {settings.language === "en" ? verseOfTheDay.bookEnglish : verseOfTheDay.bookTamil} {verseOfTheDay.chapter}:{verseOfTheDay.verse}
                  </h3>
                  <p className="text-2xl font-semibold leading-relaxed text-white md:text-3xl md:leading-tight">
                    "{verseOfTheDay.text}"
                  </p>
                </div>
              ) : (
                <div className="mt-6 flex h-32 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-400 border-t-transparent" />
                </div>
              )}
            </div>

            <div className="relative z-10 mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => {
                  if (typeof window !== "undefined" && window.innerWidth < 768) {
                    setVerseOfDayPopupOpen(true);
                  } else if (verseOfTheDay) {
                    openReader(`/reader/${encodeURIComponent(verseOfTheDay.bookEnglish)}/${verseOfTheDay.chapter}/${verseOfTheDay.verse}`, navigate, { state: { returnTo: location.pathname + location.search } });
                  }
                }}
                disabled={!verseOfTheDay}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              >
                {t.openVerse}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <StatCard label={t.bookmarksTitle} value={bookmarkCount} icon="🔖" />
            <StatCard label={t.favoritesTitle} value={favoriteCount} icon="❤️" />
            <StatCard label={t.highlightsTitle} value={highlightCount} sublabel={["en", "ta-en"].includes(settings.language) ? "Color coded" : "வண்ண குறியீடு"} icon="🖍️" />
            <StatCard label={t.notesTitle} value={noteCount} sublabel={["en", "ta-en"].includes(settings.language) ? `${prayerCount} prayers` : `${prayerCount} ஜெபங்கள்`} icon="📝" />
          </div>
        </section>

        {/* Reading Plans */}
        <section className="overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#000000] p-8 shadow-xl backdrop-blur-xl md:p-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-400">
                {["en", "ta-en"].includes(settings.language) ? "Daily Plans" : "தினசரி திட்டங்கள்"}
              </p>
              <h2 className="mt-2 text-3xl font-extrabold text-white">
                {["en", "ta-en"].includes(settings.language) ? "Reading Plans" : "வாசிப்பு திட்டங்கள்"}
              </h2>
            </div>
            {continueReading && (
              <button
                onClick={() => goToItem(continueReading)}
                className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-stone-200 transition-all hover:bg-white/10 hover:text-white"
              >
                {["en", "ta-en"].includes(settings.language) ? "Track Current" : "தற்போதையதை தொடர்"}
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            )}
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {readingPlans.map((plan) => (
              <div key={plan.id} className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.02] p-6 transition-all duration-300 hover:border-emerald-500/30 hover:bg-white/[0.04]">
                <div className="absolute right-0 top-0 -z-10 h-32 w-32 translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-[40px] transition-all duration-300 group-hover:bg-emerald-500/20" />
                
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-emerald-100">{t[plan.id] || plan.label}</h3>
                    <p className="mt-1 text-sm font-medium text-stone-400">
                      {["en", "ta-en"].includes(settings.language) ? `${plan.chaptersPerDay} chapter${plan.chaptersPerDay > 1 ? "s" : ""}/day` : `தினமும் ${plan.chaptersPerDay} அதிகாரம்${plan.chaptersPerDay > 1 ? "கள்" : ""}`}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-sm font-bold text-emerald-400 ring-1 ring-emerald-500/20">
                    {plan.percentage}%
                  </div>
                </div>

                <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-1000 ease-out" style={{ width: `${plan.percentage}%` }} />
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500">{["en", "ta-en"].includes(settings.language) ? "Done" : "முடிந்தது"}</p>
                    <p className="mt-1 text-xl font-bold text-white">{plan.completedCount}</p>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500">{["en", "ta-en"].includes(settings.language) ? "Today" : "இன்று"}</p>
                    <p className="mt-1 text-xl font-bold text-emerald-400">{plan.todayCount} <span className="text-sm font-medium text-stone-500">/ {plan.chaptersPerDay}</span></p>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-stone-500">{["en", "ta-en"].includes(settings.language) ? "Next Up" : "அடுத்தது"}</p>
                  <div className="flex flex-wrap gap-2">
                    {plan.nextChapters.slice(0, 3).map((chapter) => (
                      <button
                        key={`${plan.id}-${chapter.id}`}
                        onClick={() => navigate(`/${encodeURIComponent(chapter.bookEnglish)}/${chapter.chapter}`)}
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-stone-300 transition-colors hover:bg-emerald-500/20 hover:text-emerald-300"
                      >
                        {settings.language === "en" ? chapter.bookEnglish : chapter.bookTamil} {chapter.chapter}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Return & Prayers */}
        <section className={`grid gap-6 ${settings.pastorsMode ? "lg:grid-cols-2" : "grid-cols-1"}`}>
          <div className="rounded-[2.5rem] border border-white/5 bg-[#000000] p-8 shadow-xl backdrop-blur-xl">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-400">{t.recentReading}</p>
                <h2 className="mt-2 text-2xl font-extrabold text-white">{["en", "ta-en"].includes(settings.language) ? "Quick Return" : "விரைவான திரும்பல்"}</h2>
              </div>
            </div>
            <div className="space-y-3">
              {recentHistory.length ? (
                recentHistory.map((item, i) => (
                  <button
                    key={`${item.type}-${item.id}`}
                    onClick={() => goToItem(item)}
                    className="group flex w-full items-center justify-between rounded-[1.5rem] border border-white/5 bg-white/[0.02] p-4 text-left transition-all hover:-translate-y-0.5 hover:border-zinc-700/30 hover:bg-white/[0.04] hover:shadow-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-stone-400 group-hover:bg-black/20 group-hover:text-orange-300">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-base font-bold text-white group-hover:text-indigo-100">{settings.language === "en" ? item.bookEnglish : item.bookTamil}</p>
                        <p className="text-xs font-medium text-stone-400">
                          {t.chapter} {item.chapter}{item.verse ? ` • ${t.verse} ${item.verse}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-stone-500 opacity-0 transition-opacity group-hover:opacity-100">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))
              ) : (
                <div className="flex min-h-[200px] flex-col items-center justify-center rounded-[2rem] border border-dashed border-white/10 p-6 text-center">
                  <div className="mb-3 rounded-full bg-white/5 p-3 text-stone-400">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-stone-400">{t.noItemsYet}</p>
                </div>
              )}
            </div>
          </div>

          {settings.pastorsMode && (
            <div className="block rounded-[2.5rem] border border-white/5 bg-[#000000] p-8 shadow-xl backdrop-blur-xl">
              <div className="mb-6 flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-200">{["en", "ta-en"].includes(settings.language) ? "Prayer Journal" : "ஜெப குறிப்பேடு"}</p>
                  <h2 className="mt-2 text-2xl font-extrabold text-white">{["en", "ta-en"].includes(settings.language) ? "Recent Prayers" : "சமீபத்திய ஜெபங்கள்"}</h2>
                </div>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0a0a0a]/10 text-xs font-bold text-zinc-200 ring-1 ring-zinc-700/20">{prayerCount}</span>
              </div>
              <div className="space-y-4">
                {recentPrayers.length ? (
                  recentPrayers.map((item) => (
                    <div key={item.id} className="group relative overflow-hidden rounded-[1.5rem] border border-white/5 bg-white/[0.02] p-5 transition-all hover:border-zinc-700/30 hover:bg-white/[0.04]">
                      <div className="flex items-start justify-between gap-4">
                        <button type="button" onClick={() => goToItem(item)} className="flex-1 text-left">
                          <p className="inline-flex items-center gap-2 rounded-full bg-black/40 px-3 py-1 text-xs font-bold text-zinc-300 ring-1 ring-white/10">
                            <span className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
                            {settings.language === "en" ? item.bookEnglish : item.bookTamil} {item.chapter}:{item.verse}
                          </p>
                          <p className="mt-3 line-clamp-2 text-sm font-medium leading-relaxed text-stone-300">{item.text}</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => togglePrayerAnswered(item.id)}
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all ${
                            item.answered
                              ? "bg-zinc-700 text-black shadow-[0_0_15px_rgba(255, 255, 255,0.4)] hover:bg-zinc-600"
                              : "bg-white/5 text-stone-400 ring-1 ring-white/10 hover:bg-white/10 hover:text-white"
                          }`}
                          title={item.answered ? "Answered" : "Mark as answered"}
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex min-h-[200px] flex-col items-center justify-center rounded-[2rem] border border-dashed border-white/10 p-6 text-center">
                    <p className="text-sm font-medium text-stone-400">{["en", "ta-en"].includes(settings.language) ? "Add prayers to verses to see them here." : "இங்கு காண வசனங்களுக்கு ஜெபங்களை சேர்க்கவும்."}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Highlight Folders */}
        <section className="rounded-[2.5rem] border border-white/5 bg-[#000000] p-8 shadow-xl backdrop-blur-xl">
          <div className="mb-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-fuchsia-400">{t.highlightsTitle}</p>
            <h2 className="mt-2 text-2xl font-extrabold text-white">{["en", "ta-en"].includes(settings.language) ? "Highlight Folders" : "ஹைலைட் அடைவுகள்"}</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {groupedHighlights.filter(f => {
              if (f.value === 'prayer' && !settings.pastorsMode) return false;
              if (f.value === 'sermon' && !settings.pastorsMode) return false;
              return true;
            }).map((folder) => (
              <div key={folder.value} className="group relative overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.02] p-5 transition-all hover:-translate-y-1 hover:border-fuchsia-500/30 hover:bg-white/[0.04] hover:shadow-lg">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">{t[folder.value] || folder.label}</h3>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-stone-300">{folder.items.length}</span>
                </div>
                <div className="space-y-2">
                  {folder.items.slice(0, 2).map((item) => (
                    <button key={item.id} onClick={() => goToItem(item)} className="block w-full rounded-xl bg-black/40 p-3 text-left transition-colors hover:bg-black/60">
                      <p className="text-xs font-bold text-fuchsia-300">{settings.language === "en" ? item.bookEnglish : item.bookTamil} {item.chapter}:{item.verse}</p>
                      <p className="mt-1 line-clamp-1 text-xs text-stone-400">{item.text}</p>
                    </button>
                  ))}
                  {!folder.items.length && <p className="py-4 text-center text-xs text-stone-500">{t.emptyFolder}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Popups */}
        {verseOfDayPopupOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 backdrop-blur-md md:hidden">
            <div className="absolute inset-0" onClick={() => setVerseOfDayPopupOpen(false)} />
            <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#000000] p-8 shadow-2xl animate-in zoom-in-95 fade-in duration-300">
              <div className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400">{t.verseOfDay}</p>
                {verseOfTheDay ? (
                  <>
                    <h3 className="mt-4 inline-flex items-center rounded-full bg-white/5 px-4 py-1.5 text-sm font-bold text-white ring-1 ring-white/10">
                      {verseOfTheDay.bookTamil} {verseOfTheDay.chapter}:{verseOfTheDay.verse}
                    </h3>
                    <p className="mt-6 text-xl font-bold leading-relaxed text-white">"{verseOfTheDay.text}"</p>
                  </>
                ) : (
                  <div className="mt-6 flex justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-400 border-t-transparent" /></div>
                )}
                <div className="mt-8 flex flex-col gap-3">
                  <button onClick={shareVerseOfDay} disabled={!verseOfTheDay} className="rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 py-3.5 font-bold text-white shadow-lg active:scale-95">
                    {t.share}
                  </button>
                  <button onClick={() => setVerseOfDayPopupOpen(false)} className="rounded-2xl bg-white/5 py-3.5 font-bold text-stone-300 active:scale-95">
                    {t.close}
                  </button>
                </div>
                {shareFeedback && <p className="mt-4 text-xs font-medium text-emerald-400">{shareFeedback}</p>}
              </div>
            </div>
          </div>
        )}



      </div>
    </div>
  );
}
