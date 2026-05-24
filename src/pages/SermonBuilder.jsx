import { useState } from "react";
import useAppSettings from "../hooks/useAppSettings";
import { getUIText } from "../utils/uiText";

export default function SermonBuilder() {
  const [settings] = useAppSettings();
  const t = getUIText(settings.language);
  const isTamil = settings.language === "ta";

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="app-shell app-page pt-2 md:pt-4 pb-24">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; color: black; background: white; }
          .no-print { display: none !important; }
        }
      `}</style>
      
      <div className="mx-auto w-full max-w-[1600px] px-4 md:px-8">
        
        {/* Editor */}
        <div className="flex flex-col bg-[#000000] border border-white/10 rounded-3xl overflow-hidden shadow-2xl min-h-[75vh]">
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5 no-print sticky top-0 z-10">
            <h1 className="text-xl font-bold text-white">
              {isTamil ? "பிரசங்க குறிப்புகள்" : "Sermon Builder"}
            </h1>
            <button 
              onClick={handlePrint}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-full transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              {isTamil ? "அச்சிடு (Print)" : "Print PDF"}
            </button>
          </div>
          
          <div className="flex-1 p-6 md:p-12 print-area bg-white text-black lg:bg-transparent lg:text-white print:bg-white print:text-black">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isTamil ? "பிரசங்கத்தின் தலைப்பு..." : "Sermon Title..."}
              className="w-full bg-transparent text-3xl md:text-4xl font-bold outline-none mb-8 border-b border-transparent focus:border-stone-500/30 pb-3 placeholder:text-stone-500"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height = e.target.scrollHeight + "px";
              }}
              style={{ minHeight: "50vh", overflow: "hidden", resize: "none" }}
              placeholder={isTamil ? "உங்கள் குறிப்புகளை இங்கே எழுதவும்..." : "Write your sermon notes here..."}
              className="w-full bg-transparent outline-none text-lg md:text-xl leading-loose placeholder:text-stone-500"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
