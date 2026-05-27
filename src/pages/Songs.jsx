import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import { getUIText } from "../utils/uiText";
import useAppSettings from "../hooks/useAppSettings";
import { addSermonQueueItem, setSermonDisplayMode } from "../utils/libraryData";

export default function Songs() {
  const [settings] = useAppSettings();
  const t = getUIText(settings.language);

  const [songTitle, setSongTitle] = useState("");
  const [lyricsText, setLyricsText] = useState("");
  const [slides, setSlides] = useState([]);

  const handleProcessLyrics = () => {
    if (!lyricsText.trim()) return;

    // Split lyrics by blank lines to create slides
    const stanzas = lyricsText.split(/\n\s*\n/).filter(s => s.trim());
    setSlides(stanzas);
  };

  const handleSendToPresentation = (text, index) => {
    const item = {
      id: `song-${Date.now()}-${index}`,
      bookTamil: songTitle.trim(),
      chapter: "",
      verse: "",
      isSong: true,
      text: text.trim(),
    };
    
    addSermonQueueItem(item);
    setSermonDisplayMode("live");
    toast.success("Sent to Presentation!");
  };

  const handleSendAll = () => {
    if (slides.length === 0) return;
    
    // Add in reverse so the first slide ends up active in the queue
    for (let i = slides.length - 1; i >= 0; i--) {
      const item = {
        id: `song-${Date.now()}-${i}`,
        bookTamil: songTitle.trim(),
        chapter: "",
        verse: "",
        isSong: true,
        text: slides[i].trim(),
      };
      addSermonQueueItem(item);
    }
    setSermonDisplayMode("live");
    toast.success("Added all slides to Presentation!");
  };

  return (
    <div className="app-shell app-page pb-24 pt-4 md:pt-6">
      <div className="app-page-inner">
        
        <section className="app-hero p-6 md:p-10 mb-8 flex flex-col justify-center items-center text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-400">
            Worship Mode
          </p>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-white md:text-5xl">
            Custom Song Lyrics
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-stone-300 md:text-xl">
            Paste your worship lyrics below. Separate stanzas with a blank line to automatically generate slides.
          </p>
        </section>

        <div className="grid gap-8 md:grid-cols-2">
          
          <div className="app-surface rounded-[2rem] p-6 md:p-8">
            <h2 className="mb-6 text-xl font-bold uppercase tracking-widest text-stone-300">
              Song Editor
            </h2>
            
            <input
              type="text"
              placeholder="Song Title (e.g. How Great is Our God)"
              value={songTitle}
              onChange={(e) => setSongTitle(e.target.value)}
              className="mb-4 w-full rounded-xl border border-white/10 bg-black/40 px-5 py-4 text-white placeholder-stone-500 outline-none focus:border-amber-500/50"
            />

            <textarea
              placeholder="Paste your lyrics here...&#10;&#10;Verse 1&#10;How great is our God&#10;Sing with me...&#10;&#10;Chorus&#10;Name above all names..."
              value={lyricsText}
              onChange={(e) => setLyricsText(e.target.value)}
              rows={12}
              className="w-full resize-y rounded-xl border border-white/10 bg-black/40 px-5 py-4 text-white placeholder-stone-500 outline-none focus:border-amber-500/50"
            ></textarea>
            
            <button
              onClick={handleProcessLyrics}
              className="mt-6 w-full rounded-xl bg-amber-500 px-6 py-4 font-bold tracking-wide text-black transition hover:bg-amber-400 active:scale-[0.98]"
            >
              Generate Slides
            </button>
          </div>

          <div className="app-surface rounded-[2rem] p-6 md:p-8 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold uppercase tracking-widest text-stone-300">
                Live Slides ({slides.length})
              </h2>
              {slides.length > 0 && (
                <button
                  onClick={handleSendAll}
                  className="rounded-lg bg-emerald-500/20 px-4 py-2 text-xs font-bold uppercase tracking-wider text-emerald-400 hover:bg-emerald-500/30"
                >
                  Add All to Queue
                </button>
              )}
            </div>

            {slides.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
                <svg className="h-16 w-16 mb-4 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p className="text-lg text-stone-400">No slides generated yet.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto custom-scroll space-y-4 pr-2">
                {slides.map((slide, index) => (
                  <div key={index} className="group relative rounded-xl border border-white/5 bg-black/40 p-5 transition hover:border-amber-500/30">
                    <div className="absolute left-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-stone-400">
                      {index + 1}
                    </div>
                    <p className="pl-6 whitespace-pre-wrap text-lg leading-relaxed text-stone-200">
                      {slide}
                    </p>
                    <button
                      onClick={() => handleSendToPresentation(slide, index)}
                      className="absolute right-4 top-4 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white opacity-0 transition group-hover:opacity-100 hover:bg-white/20"
                    >
                      Project
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
