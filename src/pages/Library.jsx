import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAppSettings from "../hooks/useAppSettings";
import { getUIText } from "../utils/uiText";
import { getLibraryData, HIGHLIGHT_COLORS } from "../utils/libraryData";
import { getBookMetadata } from "../utils/bibleData";

export default function Library() {
  const [settings] = useAppSettings();
  const t = getUIText(settings.language);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("favorites");
  const [data, setData] = useState(null);

  useEffect(() => {
    setData(getLibraryData());
    const handleStorage = () => setData(getLibraryData());
    window.addEventListener("app-library-change", handleStorage);
    return () => window.removeEventListener("app-library-change", handleStorage);
  }, []);

  if (!data) return null;

  const tabs = [
    { id: "favorites", label: "Favorites", icon: "♥" },
    { id: "notes", label: "Notes", icon: "✎" },
    { id: "highlights", label: "Highlights", icon: "✧" },
    { id: "prayers", label: "Prayers", icon: "🙏" },
  ];

  const getItems = () => {
    if (activeTab === "favorites") return Object.values(data.favorites).sort((a, b) => b.timestamp - a.timestamp);
    if (activeTab === "notes") return Object.values(data.notes).sort((a, b) => b.timestamp - a.timestamp);
    if (activeTab === "highlights") return Object.values(data.highlights).sort((a, b) => b.timestamp - a.timestamp);
    if (activeTab === "prayers") return data.prayers.queue || [];
    return [];
  };

  const items = getItems();

  const handleItemClick = (item) => {
    if (item.verse) {
      navigate(`/reader/${encodeURIComponent(item.bookEnglish)}/${item.chapter}/${item.verse}`);
    } else {
      navigate(`/${encodeURIComponent(item.bookEnglish)}/${item.chapter}`);
    }
  };

  const formatVerseRef = (item) => {
    const meta = getBookMetadata(item.bookEnglish);
    const bookName = meta ? meta.book.tamil : item.bookEnglish;
    if (item.verse) return `${bookName} ${item.chapter}:${item.verse}`;
    return `${bookName} ${item.chapter}`;
  };

  return (
    <div className="min-h-screen pt-4 md:pt-8 pb-32">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-white md:text-4xl">Library</h1>
          <p className="mt-2 text-stone-400">Your saved verses, notes, and highlights.</p>
        </header>

        {/* Tabs */}
        <div className="mb-8 flex overflow-x-auto rounded-2xl bg-white/5 p-1 backdrop-blur-sm">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 whitespace-nowrap rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                activeTab === tab.id 
                  ? "bg-white/10 text-white shadow-sm" 
                  : "text-stone-400 hover:bg-white/5 hover:text-stone-200"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 h-16 w-16 rounded-full bg-white/5 flex items-center justify-center text-stone-500">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-stone-300">Nothing here yet</h3>
              <p className="mt-1 text-sm text-stone-500">Items you save will appear here.</p>
            </div>
          ) : (
            items.map((item, index) => (
              <div 
                key={item.id || index}
                onClick={() => handleItemClick(item)}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition-all hover:bg-white/[0.04] hover:border-white/10"
              >
                <div className="mb-3 flex items-start justify-between">
                  <span className="inline-flex rounded-md bg-white/5 px-2.5 py-1 text-xs font-semibold text-stone-300 ring-1 ring-inset ring-white/10">
                    {formatVerseRef(item)}
                  </span>
                  <span className="text-xs text-stone-500">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </span>
                </div>
                
                {activeTab === "notes" && (
                  <p className="mb-3 text-sm text-amber-200/90 leading-relaxed italic">
                    "{item.note}"
                  </p>
                )}

                {item.text && (
                  <p className={`text-base leading-relaxed ${activeTab === 'highlights' ? 'text-white' : 'text-stone-400'}`}>
                    <span 
                      style={activeTab === 'highlights' ? {
                        backgroundColor: item.color, 
                        color: ['#ffffff', '#f472b6', '#34d399'].includes(item.color) ? '#000' : 'inherit',
                        padding: '2px 4px',
                        borderRadius: '4px'
                      } : {}}
                    >
                      {item.text}
                    </span>
                  </p>
                )}
              </div>
            ))
          )}
        </div>
        
      </div>
    </div>
  );
}
