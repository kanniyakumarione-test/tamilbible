import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import useAppSettings from "../hooks/useAppSettings";
import { getUIText } from "../utils/uiText";
import booksList from "../data/Books.json";
import useBibleBook from "../hooks/useBibleBook";

const getBookName = (data, lang) => {
  if (!data) return null;
  if (lang === "ta") return data.tamilName || data.metadata?.tamilName;
  return data.englishName || data.metadata?.englishName;
};

const CustomSelect = ({ label, value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  
  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="flex flex-col gap-2 relative" ref={ref}>
      <label className="text-xs font-medium text-stone-400">{label}</label>
      <div 
        className="bg-white/5 border border-white/10 hover:border-yellow-500/30 rounded-xl p-3 text-white cursor-pointer flex justify-between items-center transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate pr-2 select-none">{options.find(o => String(o.value) === String(value))?.label || value}</span>
        <svg className={`w-4 h-4 text-stone-400 transition-transform ${isOpen ? 'rotate-180 text-yellow-500' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </div>
      
      {isOpen && (
        <div data-lenis-prevent="true" className="absolute top-full mt-2 left-0 w-full min-w-[160px] bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-50 max-h-[220px] overflow-y-auto overflow-x-hidden custom-scroll animate-in fade-in slide-in-from-top-2 py-1">
          {options.map(opt => (
            <div 
              key={opt.value} 
              className={`px-4 py-2.5 cursor-pointer text-sm transition-colors truncate ${String(opt.value) === String(value) ? 'bg-yellow-500/10 text-yellow-500 font-bold' : 'text-stone-300 hover:bg-white/5 hover:text-white'}`}
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
              title={opt.label}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function SermonBuilder() {
  const [settings] = useAppSettings();
  const t = getUIText(settings.language);
  const isTamil = settings.language === "ta" || settings.language === "ta-en";
  const isBilingual = settings.language === "ta-en";

  // Editor State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [savedSermons, setSavedSermons] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const contentRef = useRef(null);

  // Features State
  const [zenMode, setZenMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Verse Importer State
  const [importerOpen, setImporterOpen] = useState(false);
  const [importBook, setImportBook] = useState("Genesis");
  const [importChapter, setImportChapter] = useState(1);
  const [importVerse, setImportVerse] = useState(1);
  const { bookData } = useBibleBook(importBook, isBilingual ? "ta" : settings.language);
  const { bookData: englishBookData } = useBibleBook(importBook, "en");

  // Load saved sermons on mount
  useEffect(() => {
    const saved = localStorage.getItem("tamil_bible_sermons");
    if (saved) {
      try { setSavedSermons(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const saveSermon = () => {
    const isExisting = currentId !== null;
    const saveId = isExisting ? currentId : Date.now();
    
    const sermonObj = { 
      id: saveId, 
      title: title.trim() || (isTamil ? "தலைப்பில்லாத பிரசங்கம்" : "Untitled Sermon"), 
      content, 
      date: new Date().toISOString() 
    };

    let updated;
    if (isExisting) {
      updated = savedSermons.map(s => s.id === saveId ? sermonObj : s);
    } else {
      updated = [sermonObj, ...savedSermons];
      setCurrentId(saveId); // Set ID so future saves overwrite this one
    }
    
    setSavedSermons(updated);
    localStorage.setItem("tamil_bible_sermons", JSON.stringify(updated));
    
    // Brief toast animation simulation
    const btn = document.getElementById("save-btn");
    if (btn) {
      const orig = btn.innerHTML;
      btn.innerHTML = isTamil ? "சேமிக்கப்பட்டது!" : "Saved!";
      setTimeout(() => btn.innerHTML = orig, 2000);
    }
  };

  const newSermon = () => {
    setTitle("");
    setContent("");
    setCurrentId(null);
    if (contentRef.current) contentRef.current.innerHTML = "";
    setSidebarOpen(false);
  };

  const loadSermon = (s) => {
    setTitle(s.title);
    setContent(s.content);
    setCurrentId(s.id);
    if (contentRef.current) contentRef.current.innerHTML = s.content;
    setSidebarOpen(false);
  };

  const deleteSermon = (id) => {
    const updated = savedSermons.filter(s => s.id !== id);
    setSavedSermons(updated);
    localStorage.setItem("tamil_bible_sermons", JSON.stringify(updated));
    if (currentId === id) newSermon();
  };

  const formatText = (e, command, value = null) => {
    if (e) e.preventDefault(); // Prevents button from stealing focus
    document.execCommand(command, false, value);
    if (contentRef.current) {
      setContent(contentRef.current.innerHTML);
      contentRef.current.focus();
    }
  };

  const handleHighlight = (e) => {
    e.preventDefault();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    // Try queryCommandValue first
    let bgColor = document.queryCommandValue("backColor") || "";
    
    // If it returns transparent, fallback to checking the actual DOM node's computed style
    if (bgColor === "rgba(0, 0, 0, 0)" || bgColor === "transparent" || bgColor === "") {
      const parent = selection.anchorNode.nodeType === 3 ? selection.anchorNode.parentElement : selection.anchorNode;
      if (parent) {
        bgColor = window.getComputedStyle(parent).backgroundColor || "";
      }
    }

    const isHighlighted = bgColor.includes("254, 240, 138") || bgColor.includes("fef08a") || bgColor.includes("yellow");

    if (isHighlighted) {
      document.execCommand("hiliteColor", false, "transparent");
      document.execCommand("foreColor", false, "#ffffff");
    } else {
      document.execCommand("hiliteColor", false, "#fef08a");
      document.execCommand("foreColor", false, "#000000");
    }

    if (contentRef.current) {
      setContent(contentRef.current.innerHTML);
      contentRef.current.focus();
    }
  };

  const insertVerse = () => {
    if (!bookData) return;
    const chData = bookData.chapters.find((c) => String(c.chapter) === String(importChapter));
    if (!chData) return;
    const vData = chData.verses.find((v) => String(v.verse) === String(importVerse));
    if (!vData) return;

    const bookEntry = booksList.find(b => b.book.english === importBook);
    const bookLabelTamil = (bookEntry?.book.tamil || importBook).trim();
    const bookLabelEnglish = importBook;
    
    let verseHtml = "";

    if (isBilingual) {
      const enChData = englishBookData?.chapters.find((c) => String(c.chapter) === String(importChapter));
      const enVData = enChData?.verses.find((v) => String(v.verse) === String(importVerse));
      const englishText = enVData ? enVData.text : "";
      
      verseHtml = `<blockquote><b style="color: #fbbf24;">${bookLabelTamil} / ${bookLabelEnglish} ${importChapter}:${importVerse}</b><br/><i>${vData.text}</i><br/><i style="color: #a8a29e;">${englishText}</i></blockquote><br/>`;
    } else {
      const bookLabel = isTamil ? bookLabelTamil : bookLabelEnglish;
      verseHtml = `<blockquote><b style="color: #fbbf24;">${bookLabel} ${importChapter}:${importVerse}</b> - <i>${vData.text}</i></blockquote><br/>`;
    }
    
    if (contentRef.current) contentRef.current.focus();
    formatText(null, "insertHTML", verseHtml);
    setImporterOpen(false);
  };

  const handlePrint = () => {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);
    const printDoc = iframe.contentWindow.document;
    const printTitle = title ? title.replace(/</g, "&lt;") : (isTamil ? "பிரசங்க குறிப்புகள்" : "Sermon Notes");
    
    printDoc.write("<html><head><title>" + printTitle + "</title>");
    printDoc.write("<style>");
    printDoc.write(`
      @page { margin: 0; } 
      body { font-family: system-ui, sans-serif; color: black; background: white; line-height: 1.8; padding: 2cm; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      h1 { font-size: 28pt; border-bottom: 2px solid #eaeaea; padding-bottom: 12px; margin-bottom: 24px; color: black; }
      .content { font-size: 14pt; white-space: pre-wrap; color: black; }
      blockquote { padding-left: 0; margin: 16px 0; font-style: italic; border: none; }
      ul { padding-left: 24px; list-style-type: disc; margin: 16px 0; }
      ol { padding-left: 24px; list-style-type: decimal; margin: 16px 0; }
      li { margin-bottom: 4px; }
      b { font-weight: bold; }
      i { font-style: italic; }
      .highlight { background-color: #fef08a; padding: 2px 4px; border-radius: 4px; }
    `);
    printDoc.write("</style></head><body>");
    printDoc.write("<h1>" + printTitle + "</h1>");
    printDoc.write('<div class="content">' + content + "</div>");
    printDoc.write("</body></html>");
    printDoc.close();

    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => document.body.removeChild(iframe), 1000);
  };

  return (
    <div className={zenMode ? "fixed inset-0 z-50 bg-[#0a0a0a] overflow-y-auto" : "app-shell app-page pt-2 md:pt-4 pb-24"}>
      <div className={`mx-auto w-full h-full ${zenMode ? '' : 'max-w-[1600px] px-4 md:px-8'}`}>
        
        {/* Editor Wrapper */}
        <div className={`flex flex-col h-full bg-[#0a0a0a] ${zenMode ? 'border-none rounded-none min-h-screen' : 'border border-white/10 rounded-3xl shadow-2xl min-h-[75vh]'} overflow-hidden`}>
          
          {/* Top Bar */}
          <div className="flex flex-wrap items-center justify-between p-3 md:p-4 border-b border-white/10 bg-[#111] sticky top-0 z-10 gap-4">
            
            <div className="flex items-center gap-2">
              <button onClick={() => setSidebarOpen(true)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-stone-300 transition-colors" title="My Sermons">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
              </button>
              <h1 className="text-lg md:text-xl font-bold text-white hidden sm:block">
                {isTamil ? "பிரசங்க குறிப்புகள்" : "Sermon Builder"}
              </h1>
            </div>

            {/* Rich Text Toolbar */}
            <div className="flex items-center gap-1 bg-black/50 p-1 rounded-full border border-white/5">
              <button onMouseDown={(e) => formatText(e, "bold")} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white font-bold transition-colors">B</button>
              <button onMouseDown={(e) => formatText(e, "italic")} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white italic transition-colors">I</button>
              <button onMouseDown={(e) => formatText(e, "underline")} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white underline transition-colors">U</button>
              <div className="w-px h-5 bg-white/20 mx-1"></div>
              <button onMouseDown={(e) => formatText(e, "insertUnorderedList")} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              <button onMouseDown={handleHighlight} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-yellow-400 transition-colors" title="Highlight">
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
              </button>
              <div className="w-px h-5 bg-white/20 mx-1"></div>
              <button onClick={() => setImporterOpen(true)} className="px-3 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-yellow-500 font-medium text-xs md:text-sm transition-colors" title="Insert Verse">
                + {isTamil ? "வசனம்" : "Verse"}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => setZenMode(!zenMode)} className={`p-2 rounded-full transition-colors ${zenMode ? 'bg-yellow-500/20 text-yellow-500' : 'bg-white/5 hover:bg-white/10 text-stone-300'}`} title="Focus Mode">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>
              </button>
              <button onClick={newSermon} className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white font-medium text-sm rounded-full transition-colors">
                {isTamil ? "புதிய" : "New"}
              </button>
              <button id="save-btn" onClick={saveSermon} className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white font-medium text-sm rounded-full transition-colors">
                {isTamil ? "சேமி" : "Save"}
              </button>
              <button onClick={handlePrint} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-full transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                <span className="hidden sm:inline">{isTamil ? "அச்சிடு" : "Print"}</span>
              </button>
            </div>
          </div>
          
          <div className="flex-1 p-6 md:p-12 lg:px-24 bg-[#0a0a0a] text-white">
            <style>{`
              .sermon-editor ul { list-style-type: disc; padding-left: 2rem; margin-top: 0.5rem; margin-bottom: 0.5rem; }
              .sermon-editor ol { list-style-type: decimal; padding-left: 2rem; margin-top: 0.5rem; margin-bottom: 0.5rem; }
              .sermon-editor li { margin-bottom: 0.25rem; }
              .sermon-editor blockquote { border: none; font-style: italic; opacity: 0.9; margin: 1rem 0; padding-left: 0; }
              .sermon-editor b { font-weight: bold; }
              .sermon-editor i { font-style: italic; }
            `}</style>
            <div className="flex flex-col w-full h-full max-w-[900px] mx-auto">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isTamil ? "பிரசங்கத்தின் தலைப்பு..." : "Sermon Title..."}
                className="w-full bg-transparent text-3xl md:text-5xl font-bold outline-none mb-8 border-b border-transparent focus:border-white/10 pb-4 placeholder:text-stone-700 transition-colors"
              />
              <div
                ref={contentRef}
                contentEditable
                onInput={(e) => setContent(e.currentTarget.innerHTML)}
                className="sermon-editor w-full bg-transparent outline-none text-lg md:text-xl leading-loose placeholder:text-stone-700 flex-1 min-h-[50vh]"
                suppressContentEditableWarning={true}
              />
            </div>
          </div>
        </div>

      </div>

      {/* Sidebar: Saved Sermons */}
      {sidebarOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
          <div className="relative w-full max-w-sm bg-[#111] border-l border-white/10 h-full flex flex-col shadow-2xl animate-in slide-in-from-right">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">{isTamil ? "என் பிரசங்கங்கள்" : "My Sermons"}</h2>
              <button onClick={() => setSidebarOpen(false)} className="p-2 text-stone-400 hover:text-white rounded-full bg-white/5"><svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg></button>
            </div>
            <div data-lenis-prevent="true" className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scroll">
              {savedSermons.length === 0 ? (
                <div className="text-stone-500 text-center py-10">{isTamil ? "சேமிக்கப்பட்ட பிரசங்கங்கள் இல்லை" : "No saved sermons"}</div>
              ) : (
                savedSermons.map(s => (
                  <div key={s.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-yellow-500/30 transition-colors group">
                    <h3 className="font-bold text-white text-lg mb-1 truncate">{s.title}</h3>
                    <p className="text-xs text-stone-500 mb-3">{new Date(s.date).toLocaleDateString()}</p>
                    <div className="flex gap-2">
                      <button onClick={() => loadSermon(s)} className="flex-1 bg-yellow-500 text-black font-bold py-1.5 rounded-lg text-sm hover:bg-yellow-400 transition-colors">{isTamil ? "திற" : "Open"}</button>
                      <button onClick={() => deleteSermon(s.id)} className="px-3 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"><svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal: Verse Importer */}
      {importerOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setImporterOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-[#111] border border-white/10 rounded-2xl shadow-2xl p-6 animate-in zoom-in-95">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-yellow-500">📖</span> {isTamil ? "வசனத்தை செருகு" : "Insert Verse"}
            </h2>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <CustomSelect 
                label={isTamil ? "நூல்" : "Book"} 
                value={importBook} 
                onChange={setImportBook} 
                options={booksList.map(b => ({ value: b.book.english, label: isTamil ? b.book.tamil : b.book.english }))} 
              />
              <CustomSelect 
                label={isTamil ? "அதிகாரம்" : "Chapter"} 
                value={importChapter} 
                onChange={setImportChapter} 
                options={(bookData?.chapters || []).map(c => ({ value: c.chapter, label: c.chapter }))} 
              />
              <CustomSelect 
                label={isTamil ? "வசனம்" : "Verse"} 
                value={importVerse} 
                onChange={setImportVerse} 
                options={(bookData?.chapters.find(c => String(c.chapter) === String(importChapter))?.verses || []).map(v => ({ value: v.verse, label: v.verse }))} 
              />
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/5 mb-6 max-h-[150px] overflow-y-auto">
              <p className="text-stone-300 italic">
                "{bookData?.chapters.find(c => String(c.chapter) === String(importChapter))?.verses.find(v => String(v.verse) === String(importVerse))?.text || "..." }"
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setImporterOpen(false)} className="px-5 py-2.5 text-stone-400 hover:text-white font-medium rounded-full transition-colors">{isTamil ? "ரத்து" : "Cancel"}</button>
              <button onClick={insertVerse} className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-full transition-colors shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                {isTamil ? "செருகு" : "Insert"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
