import { useState } from "react";
import { Link } from "react-router-dom";
import useAppSettings from "../hooks/useAppSettings";
import { getUIText } from "../utils/uiText";
import { getBooksForTestament } from "../utils/bibleData";
import { getBookNameFromEntry } from "../utils/bibleContent";

export default function BookList() {
  const [activeTab, setActiveTab] = useState("old");
  const [settings] = useAppSettings();
  const t = getUIText(settings.language);

  const oldBooks = getBooksForTestament("old");
  const newBooks = getBooksForTestament("new");

  const displayedBooks = activeTab === "old" ? oldBooks : newBooks;

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Sleek Segment Control */}
      <div className="sticky top-[88px] z-30 mx-auto flex w-full max-w-sm justify-center rounded-full bg-black/80 p-1.5 shadow-2xl ring-1 ring-white/10 backdrop-blur-2xl">
        <button
          onClick={() => setActiveTab("old")}
          className={`relative flex-1 rounded-full px-4 py-3 text-sm font-bold transition-all duration-500 ${
            activeTab === "old" ? "text-white" : "text-stone-400 hover:text-stone-200"
          }`}
        >
          {activeTab === "old" && (
            <span className="absolute inset-0 rounded-full bg-gradient-to-r from-zinc-800 to-orange-600 shadow-[0_0_15px_rgba(255, 255, 255,0.4)]" />
          )}
          <span className="relative z-10">{t.oldTestament}</span>
        </button>
        <button
          onClick={() => setActiveTab("new")}
          className={`relative flex-1 rounded-full px-4 py-3 text-sm font-bold transition-all duration-500 ${
            activeTab === "new" ? "text-white" : "text-stone-400 hover:text-stone-200"
          }`}
        >
          {activeTab === "new" && (
            <span className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 shadow-[0_0_15px_rgba(255, 255, 255,0.4)]" />
          )}
          <span className="relative z-10">{t.newTestament}</span>
        </button>
      </div>

      {/* Books Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {displayedBooks.map((b, i) => (
          <Link
            key={i}
            to={`/${encodeURIComponent(b.book.english)}`}
            className={`group relative overflow-hidden rounded-[2rem] border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
              activeTab === "old"
                ? "border-zinc-700/20 bg-[#000000] hover:border-zinc-700/50 hover:bg-white/[0.04] hover:shadow-[0_20px_40px_rgba(255, 255, 255,0.15)]"
                : "border-emerald-500/20 bg-[#000000] hover:border-emerald-500/50 hover:bg-white/[0.04] hover:shadow-[0_20px_40px_rgba(255, 255, 255,0.15)]"
            }`}
          >
            <div
              className={`absolute -right-10 -top-10 h-32 w-32 rounded-full blur-[50px] transition-all duration-500 ${
                activeTab === "old" ? "bg-[#0a0a0a]/20 group-hover:bg-[#0a0a0a]/30" : "bg-emerald-500/20 group-hover:bg-emerald-500/30"
              }`}
            />
            
            <div className="relative z-10 flex items-center gap-4">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold shadow-inner ring-1 ${
                  activeTab === "old"
                    ? "bg-[#0a0a0a]/10 text-zinc-200 ring-zinc-700/20 group-hover:bg-[#0a0a0a]/20"
                    : "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20 group-hover:bg-emerald-500/20"
                }`}
              >
                {i + 1}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100 transition-colors group-hover:text-white">
                  {getBookNameFromEntry(b, settings.language)}
                </h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
