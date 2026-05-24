import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useLibraryData from "../hooks/useLibraryData";
import useAppSettings from "../hooks/useAppSettings";
import { getUIText } from "../utils/uiText";
import { getGroupedHighlights } from "../utils/libraryData";
import TopNav from "../components/TopNav";

export default function Memorize() {
  const navigate = useNavigate();
  const [settings] = useAppSettings();
  const libraryData = useLibraryData();
  const t = getUIText(settings.language);
  const isTamil = settings.language === "ta";

  // Get only memory verses
  const memoryVerses = useMemo(() => {
    const folders = getGroupedHighlights(libraryData);
    const memoryFolder = folders.find(f => f.value === "memory");
    return memoryFolder?.items || [];
  }, [libraryData]);

  const [selectedVerse, setSelectedVerse] = useState(null);
  const [difficulty, setDifficulty] = useState(50); // 0 to 100 percentage
  const [revealedWords, setRevealedWords] = useState(new Set());

  // Reset revealed words when verse or difficulty changes
  useEffect(() => {
    setRevealedWords(new Set());
  }, [selectedVerse, difficulty]);

  const processedVerse = useMemo(() => {
    if (!selectedVerse) return [];
    
    // Split by words but keep punctuation attached or separate based on language
    const words = selectedVerse.text.split(/(\s+)/);
    
    // Determine which word indices to hide based on difficulty
    // Exclude purely whitespace tokens
    const wordIndices = words
      .map((w, i) => w.trim() ? i : -1)
      .filter(i => i !== -1);
      
    const numToHide = Math.floor(wordIndices.length * (difficulty / 100));
    
    // Randomly select indices using a seeded approach based on verse ID so it doesn't change on every render unless difficulty changes
    // A simple shuffle
    const shuffled = [...wordIndices].sort(() => 0.5 - Math.random());
    const hiddenSet = new Set(shuffled.slice(0, numToHide));
    
    return words.map((word, index) => {
      if (!word.trim()) return { text: word, isHidden: false, index };
      return {
        text: word,
        isHidden: hiddenSet.has(index),
        index
      };
    });
  }, [selectedVerse, difficulty]);

  const toggleReveal = (index) => {
    setRevealedWords(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const revealAll = () => {
    const allHidden = processedVerse.filter(w => w.isHidden).map(w => w.index);
    setRevealedWords(new Set(allHidden));
  };

  return (
    <div className="app-shell app-page pb-12 pt-4 md:pt-6">
      <div className="app-page-inner">
        <header className="mb-6 flex items-center justify-between px-4 md:px-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
              {isTamil ? "மனப்பாடம்" : "Memorize"}
            </h1>
            <p className="mt-1 text-sm text-stone-400">
              {isTamil 
                ? "உங்கள் மனப்பாட வசனங்களை பயிற்சி செய்யுங்கள்" 
                : "Practice your memory verses with flashcards"}
            </p>
          </div>
          {selectedVerse && (
            <button 
              onClick={() => setSelectedVerse(null)}
              className="rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/20"
            >
              {isTamil ? "பட்டியலுக்கு திரும்பு" : "Back to List"}
            </button>
          )}
        </header>

        <div className="px-4 md:px-8">
          {!selectedVerse ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {memoryVerses.length === 0 ? (
                <div className="col-span-full rounded-2xl border border-white/10 bg-black/20 p-8 text-center text-stone-400">
                  <svg className="mx-auto h-12 w-12 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <p className="mt-4 font-semibold text-white">
                    {isTamil ? "மனப்பாட வசனங்கள் இல்லை" : "No memory verses yet"}
                  </p>
                  <p className="mt-2 text-sm">
                    {isTamil 
                      ? "வாசிக்கும் போது ஒரு வசனத்தை ஹைலைட் செய்து 'Memory Verse' என சேமிக்கவும்." 
                      : "Highlight a verse while reading and save it to the 'Memory Verse' folder."}
                  </p>
                  <button 
                    onClick={() => navigate("/books")}
                    className="mt-6 rounded-full bg-white/10 px-6 py-2.5 text-sm font-bold text-white hover:bg-white/20"
                  >
                    {isTamil ? "வாசிக்கத் தொடங்கு" : "Start Reading"}
                  </button>
                </div>
              ) : (
                memoryVerses.map(verse => (
                  <button
                    key={verse.id}
                    onClick={() => setSelectedVerse(verse)}
                    className="group flex flex-col items-start gap-3 rounded-2xl border border-white/5 bg-[#000000] p-5 text-left shadow-xl transition-all hover:-translate-y-1 hover:border-white/10 hover:bg-white/5 hover:shadow-2xl"
                  >
                    <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-bold text-zinc-300">
                      {verse.bookTamil} {verse.chapter}:{verse.verse}
                    </span>
                    <p className="line-clamp-3 text-sm leading-relaxed text-stone-300 group-hover:text-white">
                      {verse.text}
                    </p>
                  </button>
                ))
              )}
            </div>
          ) : (
            <div className="mx-auto max-w-3xl">
              <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#000000] p-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h2 className="text-lg font-bold text-emerald-400">
                    {selectedVerse.bookTamil} {selectedVerse.chapter}:{selectedVerse.verse}
                  </h2>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-stone-400">
                      {isTamil ? "கடின நிலை" : "Difficulty"}
                    </span>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={difficulty} 
                      onChange={(e) => setDifficulty(Number(e.target.value))}
                      className="w-32 accent-emerald-500"
                    />
                  </div>
                </div>

                <div className="py-6 text-center leading-loose sm:text-lg md:text-xl md:leading-loose">
                  {processedVerse.map((word, i) => {
                    if (!word.isHidden) {
                      return <span key={i} className="text-white">{word.text}</span>;
                    }
                    
                    const isRevealed = revealedWords.has(word.index);
                    
                    return (
                      <span key={i} className="whitespace-pre">
                        <button
                          onClick={() => toggleReveal(word.index)}
                          className={`mx-1 inline-block min-w-[3rem] rounded-md border-b-2 px-2 text-center font-bold transition-all ${
                            isRevealed 
                              ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400" 
                              : "border-stone-600 bg-stone-800 text-transparent hover:bg-stone-700"
                          }`}
                        >
                          {isRevealed ? word.text.trim() : " ? "}
                        </button>
                        {word.text.match(/\s+$/)?.[0]}
                      </span>
                    );
                  })}
                </div>

                <div className="flex justify-center border-t border-white/10 pt-6">
                  <button 
                    onClick={revealAll}
                    className="rounded-full bg-white/10 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/20"
                  >
                    {isTamil ? "அனைத்தையும் காட்டு" : "Reveal All"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
