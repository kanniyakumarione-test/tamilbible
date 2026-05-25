import { getCustomGradientString } from "../utils/appearance";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import booksList from "../data/Books.json";

// Standard chapter counts for every Bible book
const BIBLE_CHAPTER_COUNTS = {
  Genesis: 50, Exodus: 40, Leviticus: 27, Numbers: 36, Deuteronomy: 34,
  Joshua: 24, Judges: 21, Ruth: 4, "1 Samuel": 31, "2 Samuel": 24,
  "1 Kings": 22, "2 Kings": 25, "1 Chronicles": 29, "2 Chronicles": 36,
  Ezra: 10, Nehemiah: 13, Esther: 10, Job: 42, Psalms: 150,
  Proverbs: 31, Ecclesiastes: 12, "Song of Songs": 8, Isaiah: 66,
  Jeremiah: 52, Lamentations: 5, Ezekiel: 48, Daniel: 12, Hosea: 14,
  Joel: 3, Amos: 9, Obadiah: 1, Jonah: 4, Micah: 7, Nahum: 3,
  Habakkuk: 3, Zephaniah: 3, Haggai: 2, Zechariah: 14, Malachi: 4,
  Matthew: 28, Mark: 16, Luke: 24, John: 21, Acts: 28, Romans: 16,
  "1 Corinthians": 16, "2 Corinthians": 13, Galatians: 6, Ephesians: 6,
  Philippians: 4, Colossians: 4, "1 Thessalonians": 5, "2 Thessalonians": 3,
  "1 Timothy": 6, "2 Timothy": 4, Titus: 3, Philemon: 1, Hebrews: 13,
  James: 5, "1 Peter": 5, "2 Peter": 3, "1 John": 5, "2 John": 1,
  "3 John": 1, Jude: 1, Revelation: 22,
};
import { matchBookQuery } from "../utils/bookSearch";
import useAppSettings from "../hooks/useAppSettings";
import useBibleBook from "../hooks/useBibleBook";
import useLibraryData from "../hooks/useLibraryData";
import {
  HIGHLIGHT_COLORS,
  HIGHLIGHT_FOLDERS,
  addSermonQueueItem,
  getChapterId,
  getReadingPlans,
  getVerseId,
  isBookmarked,
  isFavorited,
  recordHistory,
  saveHighlight,
  saveNote,
  savePrayer,
  toggleBookmark,
  toggleFavorite,
  updateReadingPlanProgress,
} from "../utils/libraryData";
import { getUIText } from "../utils/uiText";
import {
  getBookName,
  getBookNameFromEntry,
  isBilingualLanguage,
} from "../utils/bibleContent";
import { openReader } from "../utils/openReader";
import { getBookLabelFromMetadata } from "../utils/bibleData";

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }

      reject(new Error("Unable to export image"));
    }, "image/png");
  });
}

function drawCoverImage(ctx, image, width, height) {
  const scale = Math.max(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  const x = (width - drawWidth) / 2;
  const y = (height - drawHeight) / 2;
  ctx.drawImage(image, x, y, drawWidth, drawHeight);
}

function getWrappedLines(ctx, text, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let currentLine = "";

  words.forEach((word) => {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;

    if (ctx.measureText(nextLine).width <= maxWidth) {
      currentLine = nextLine;
      return;
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    currentLine = word;
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

function drawWrappedText(ctx, lines, x, y, lineHeight) {
  lines.forEach((line, index) => {
    ctx.fillText(line, x, y + index * lineHeight);
  });

  return lines.length;
}

function ChapterNavigator({
  chapter,
  chapterLabel,
  onOpenPicker,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  prevLabel,
  nextLabel,
  compact = false,
  t,
}) {
  const wrapperClass = compact
    ? "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3"
    : "grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]";

  const mobileArrowClass =
    "flex h-11 items-center justify-center rounded-[1.1rem] border border-white/10 bg-[#000000] text-lg text-white transition hover:border-zinc-600/30 hover:bg-[#000000] disabled:cursor-not-allowed disabled:opacity-40 md:hidden";

  const sideClass =
    "group flex items-center gap-2.5 rounded-[1.2rem] border border-white/10 bg-[#000000] px-3 py-3 text-left transition hover:border-zinc-600/30 hover:bg-[#000000] disabled:cursor-not-allowed disabled:opacity-40 sm:gap-3 sm:rounded-[1.4rem] sm:px-4";

  const centerClass = compact
    ? "inline-flex w-full min-w-0 items-center justify-center gap-3 rounded-[1.25rem] border border-zinc-600/20 bg-[#000000] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-950/20 transition hover:border-zinc-500/40 hover:bg-[#000000]"
    : "inline-flex w-full min-w-0 items-center justify-center gap-2 rounded-[1.3rem] border border-zinc-600/20 bg-[#000000] px-3 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-950/20 transition hover:border-zinc-500/40 hover:bg-[#000000] md:col-span-1 md:min-w-[12rem] md:w-auto md:gap-3 md:rounded-[1.45rem] md:px-5 md:py-4 md:text-base md:shadow-xl";

  return (
    <div className={wrapperClass}>
      <button type="button" onClick={onPrev} disabled={!hasPrev} className={mobileArrowClass}>
        &larr;
      </button>

      <button type="button" onClick={onPrev} disabled={!hasPrev} className={`${sideClass} hidden md:flex ${compact ? "sm:col-auto" : ""}`}>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-base text-white sm:h-10 sm:w-10 sm:rounded-2xl sm:text-lg">&larr;</span>
        <span className="min-w-0">
          <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-stone-500">
            {t?.prev || "Previous"}
          </span>
          <span className="block truncate text-xs font-semibold text-slate-100 sm:text-sm">{prevLabel}</span>
        </span>
      </button>

      <button type="button" onClick={onOpenPicker} className={centerClass}>
        <span className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-amber-100/75">
          {chapterLabel}
        </span>
        <span>{chapter}</span>
        <span className="text-sm text-amber-100/80">&#9662;</span>
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={!hasNext}
        className={mobileArrowClass}
      >
        &rarr;
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={!hasNext}
        className={`${sideClass} hidden justify-self-stretch text-right md:flex`}
      >
        <span className="min-w-0 flex-1 md:order-1">
          <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-stone-500">
            {t?.next || "Next"}
          </span>
          <span className="block truncate text-xs font-semibold text-slate-100 sm:text-sm">{nextLabel}</span>
        </span>
        <span className="order-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-base text-white sm:h-10 sm:w-10 sm:rounded-2xl sm:text-lg">&rarr;</span>
      </button>
    </div>
  );
}

export default function Verses() {
  const { book, chapter } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedVerse, setSelectedVerse] = useState(null);
  const [noteEditor, setNoteEditor] = useState(null);
  const [prayerEditor, setPrayerEditor] = useState(null);
  const [highlightEditor, setHighlightEditor] = useState(null);
  const [shareDesigner, setShareDesigner] = useState(null);
  const [sermonSuccess, setSermonSuccess] = useState("");
  const [copiedSuccess, setCopiedSuccess] = useState("");
  const [chapterPickerOpen, setChapterPickerOpen] = useState(false);
  const [crossReferencesViewer, setCrossReferencesViewer] = useState(null);
  const [swipedVerseId, setSwipedVerseId] = useState(null);
  const [favoriteAnimation, setFavoriteAnimation] = useState(null);
  const [crossReferencesData, setCrossReferencesData] = useState({});
  const [autoScrollDirection, setAutoScrollDirection] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playingVerseId, setPlayingVerseId] = useState(null);
  const audioRef = useRef(null);
  const pressTimerRef = useRef(null);
  const hasLongPressed = useRef(false);
  const copiedTimerRef = useRef(null);
  const [settings] = useAppSettings();
  const libraryData = useLibraryData();
  const t = getUIText(settings.language);
  const isBilingual = isBilingualLanguage(settings.language);
  const primaryLanguage = settings.language === "en" ? "en" : "ta";
  const [bookQuery, setBookQuery] = useState("");
  const [isDesktopBookListExpanded, setIsDesktopBookListExpanded] = useState(false);
  const [isDesktopChapterListExpanded, setIsDesktopChapterListExpanded] = useState(false);
  const readingPaneRef = useRef(null);
  const autoScrollFrameRef = useRef(null);
  const lastAutoScrollTimeRef = useRef(null);
  const isMobileView = typeof window !== "undefined" && window.innerWidth < 768;
  const availableHighlightFolders = HIGHLIGHT_FOLDERS.filter((folder) => {
    const isSermon = folder.value === "sermon";
    const isPrayer = folder.value === "prayer";
    
    if (isPrayer && !settings.pastorsMode) return false;
    if (isSermon && !settings.pastorsMode) return false;
    
    return true;
  });

  const decodedBook = decodeURIComponent(book);

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    fetch('/data/cross_references.json')
      .then(res => res.json())
      .then(data => setCrossReferencesData(data))
      .catch(() => setCrossReferencesData({}));
  }, []);


  const backgrounds = [
    "/bg/bg1.jpg",
    "/bg/bg2.jpg",
    "/bg/bg3.jpg",
    "/bg/bg4.jpg",
    "/bg/bg5.jpg",
  ];

  const gradients = [
    "linear-gradient(to right, #000000, #434343)",
    "linear-gradient(to right, #1e3c72, #2a5298)",
    "linear-gradient(to right, #42275a, #734b6d)",
    "linear-gradient(to right, #0f2027, #203a43, #2c5364)",
    "linear-gradient(to right, #000428, #004e92)",
  ];

  const createVerseShareImage = async (verse, design = {}) => {
    const canvas = document.createElement("canvas");
    const width = 1080;
    const height = 1350;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Canvas not available");
    }

    if (settings.bgType === "gradient" || settings.bgType === "motion") {
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, settings.bgType === "motion" ? "#000000" : "#000000");
      gradient.addColorStop(1, settings.bgType === "motion" ? "#ffffff" : "#ffffff");

      const gradientMatches = getCustomGradientString(settings.customGradientType, settings.customGradientColor1, settings.customGradientColor2)?.match(/#[0-9a-fA-F]{6}/g);

      if (settings.bgType !== "motion" && gradientMatches?.[0]) {
        gradient.addColorStop(0, gradientMatches[0]);
      }

      if (settings.bgType !== "motion" && gradientMatches?.[1]) {
        gradient.addColorStop(1, gradientMatches[1]);
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    } else {
      const imageSource =
        settings.bgType === "custom" && settings.customBackground
          ? settings.customBackground
          : backgrounds[settings.bgIndex];

      if (imageSource) {
        const backgroundImage = await loadImage(imageSource);
        drawCoverImage(ctx, backgroundImage, width, height);
      } else {
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, width, height);
      }
    }

    const overlay = ctx.createLinearGradient(0, 0, 0, height);
    overlay.addColorStop(0, "rgba(7, 17, 31, 0.28)");
    overlay.addColorStop(1, "rgba(7, 17, 31, 0.72)");
    ctx.fillStyle = overlay;
    ctx.fillRect(0, 0, width, height);

    const templates = {
      classic: {
        cardX: 84,
        cardY: 160,
        cardWidth: width - 168,
        cardHeight: height - 320,
        accent: "rgba(255, 255, 255, 0.9)",
      },
      social: {
        cardX: 68,
        cardY: 120,
        cardWidth: width - 136,
        cardHeight: height - 240,
        accent: "rgba(253, 224, 71, 0.92)",
      },
      minimal: {
        cardX: 108,
        cardY: 220,
        cardWidth: width - 216,
        cardHeight: height - 420,
        accent: "rgba(226, 232, 240, 0.92)",
      },
    };
    const selectedTemplate = templates[design.template || "classic"];
    const { cardX, cardY, cardWidth, cardHeight, accent } = selectedTemplate;
    const radius = 42;

    ctx.fillStyle = `rgba(0, 0, 0, ${Math.min((settings.cardOpacity ?? 0.5) + 0.18, 0.82)})`;
    ctx.beginPath();
    ctx.moveTo(cardX + radius, cardY);
    ctx.lineTo(cardX + cardWidth - radius, cardY);
    ctx.quadraticCurveTo(cardX + cardWidth, cardY, cardX + cardWidth, cardY + radius);
    ctx.lineTo(cardX + cardWidth, cardY + cardHeight - radius);
    ctx.quadraticCurveTo(
      cardX + cardWidth,
      cardY + cardHeight,
      cardX + cardWidth - radius,
      cardY + cardHeight
    );
    ctx.lineTo(cardX + radius, cardY + cardHeight);
    ctx.quadraticCurveTo(cardX, cardY + cardHeight, cardX, cardY + cardHeight - radius);
    ctx.lineTo(cardX, cardY + radius);
    ctx.quadraticCurveTo(cardX, cardY, cardX + radius, cardY);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = accent;
    ctx.font = "600 26px Arial";
    ctx.fillText(t.verse.toUpperCase(), cardX + 54, cardY + 74);

    ctx.fillStyle = "#ffffff";
    ctx.font = "700 42px Arial";
    ctx.fillText(`${bookLabel} ${chapter}:${verse.verse}`, cardX + 54, cardY + 144);

    const textTop = cardY + 230;
    const textBottom = cardY + cardHeight - 120;
    const availableHeight = textBottom - textTop;
    const textWidth = cardWidth - 108;
    const fontCandidates = [
      design.fontSize || 56,
      52,
      48,
      44,
      40,
      36,
      34,
      32,
      30,
    ].filter((value, index, list) => list.indexOf(value) === index);
    let chosenFontSize = 30;
    let chosenLineHeight = 44;
    let wrappedLines = [];

    for (const fontSize of fontCandidates) {
      ctx.font = `700 ${fontSize}px Arial`;
      const lineHeight = Math.round(fontSize * 1.34);
      const lines = getWrappedLines(ctx, verse.text, textWidth);

      if (lines.length * lineHeight <= availableHeight) {
        chosenFontSize = fontSize;
        chosenLineHeight = lineHeight;
        wrappedLines = lines;
        break;
      }
    }

    if (!wrappedLines.length) {
      ctx.font = "700 30px Arial";
      wrappedLines = getWrappedLines(ctx, verse.text, textWidth);
    }

    ctx.fillStyle = "#f8fafc";
    ctx.font = `700 ${chosenFontSize}px Arial`;
    drawWrappedText(ctx, wrappedLines, cardX + 54, textTop, chosenLineHeight);

    ctx.fillStyle = "rgba(226, 232, 240, 0.82)";
    ctx.font = "600 22px Arial";
    ctx.fillText(
      design.watermark || (["en", "ta-en"].includes(settings.language) ? "Holy Bible KJV" : "Tamil Bible"),
      cardX + 54,
      cardY + cardHeight - 44
    );

    return canvasToBlob(canvas);
  };

  const getScrollMetrics = () => {
    const scrollElement = document.scrollingElement || document.documentElement;

    return {
      currentTop: window.scrollY,
      maxScrollTop: Math.max(
        scrollElement.scrollHeight - window.innerHeight,
        0
      ),
      setTop: (value) => window.scrollTo(0, value),
    };
  };

  const { bookData, loading: bookLoading } = useBibleBook(decodedBook, primaryLanguage);
  const { bookData: englishBookData } = useBibleBook(decodedBook, "en");
  const chapterData = bookData?.chapters.find((ch) => String(ch.chapter) === String(chapter));
  const englishChapterData = englishBookData?.chapters.find(
    (ch) => String(ch.chapter) === String(chapter)
  );
  const bookLabel =
    getBookName(bookData, settings.language) ||
    getBookLabelFromMetadata(decodedBook, settings.language) ||
    decodedBook;
  const englishBookLabel = getBookName(englishBookData, "en") || decodedBook;
  const chapterItem = {
    id: getChapterId(decodedBook, chapter),
    type: "chapter",
    bookEnglish: decodedBook,
    bookTamil: bookLabel,
    chapter,
  };
  const chapterItemId = chapterItem.id;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const verseNum = params.get("verse");
    if (verseNum && bookData) {
      setTimeout(() => {
        const el = document.getElementById(`verse-${verseNum}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.classList.add("ring-2", "ring-fuchsia-500", "bg-[#110011]");
          setTimeout(() => {
            el.classList.remove("ring-2", "ring-fuchsia-500", "bg-[#110011]");
          }, 3000);
        }
      }, 300);
    }
  }, [location.search, bookData]);

  useEffect(() => {
    if (bookData && chapterData) {
      recordHistory({
        id: chapterItemId,
        type: "chapter",
        bookEnglish: decodedBook,
        bookTamil: bookLabel,
        chapter,
      });
    }
  }, [bookData, chapterData, chapter, chapterItemId, decodedBook, bookLabel]);

  useEffect(() => {
    if (!bookData || !chapterData) return;

    void getReadingPlans().then((plans) => {
      plans.forEach((plan) => {
        updateReadingPlanProgress(plan.id, chapterItemId);
      });
    });
  }, [bookData, chapterData, chapter, chapterItemId, decodedBook]);

  useEffect(() => {
    const resetScroll = window.requestAnimationFrame(() => {
      setAutoScrollDirection(null);
    });
    lastAutoScrollTimeRef.current = null;

    if (window.innerWidth < 768) {
      window.scrollTo(0, 0);
    } else if (readingPaneRef.current) {
      readingPaneRef.current.scrollTop = 0;
    }
    return () => window.cancelAnimationFrame(resetScroll);
  }, [decodedBook, chapter]);

  useEffect(() => {
    if (!autoScrollDirection) {
      if (autoScrollFrameRef.current) {
        window.cancelAnimationFrame(autoScrollFrameRef.current);
        autoScrollFrameRef.current = null;
      }
      lastAutoScrollTimeRef.current = null;
      return;
    }

    const step = (timestamp) => {
      const metrics = getScrollMetrics();

      if (!metrics) {
        setAutoScrollDirection(null);
        return;
      }

      if (lastAutoScrollTimeRef.current === null) {
        lastAutoScrollTimeRef.current = timestamp;
      }

      const delta = timestamp - lastAutoScrollTimeRef.current;
      lastAutoScrollTimeRef.current = timestamp;
        const speed = 0.08;
      const direction = autoScrollDirection === "down" ? 1 : -1;
      const nextTop = metrics.currentTop + delta * speed * direction;

      if (nextTop <= 0) {
        metrics.setTop(0);
        setAutoScrollDirection(null);
        return;
      }

      if (nextTop >= metrics.maxScrollTop) {
        metrics.setTop(metrics.maxScrollTop);
        setAutoScrollDirection(null);
        return;
      }

      metrics.setTop(nextTop);
      autoScrollFrameRef.current = window.requestAnimationFrame(step);
    };

    autoScrollFrameRef.current = window.requestAnimationFrame(step);

    return () => {
      if (autoScrollFrameRef.current) {
        window.cancelAnimationFrame(autoScrollFrameRef.current);
        autoScrollFrameRef.current = null;
      }
      lastAutoScrollTimeRef.current = null;
    };
  }, [autoScrollDirection]);

  useEffect(() => {
    return () => {
      if (autoScrollFrameRef.current) {
        window.cancelAnimationFrame(autoScrollFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (
      (!selectedVerse &&
        !noteEditor &&
        !prayerEditor &&
        !highlightEditor &&
        !shareDesigner &&
        !chapterPickerOpen) ||
      window.innerWidth >= 768
    ) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [chapterPickerOpen, highlightEditor, noteEditor, prayerEditor, selectedVerse, shareDesigner]);

  const handleCopy = (text) => {
    const doCopy = () => {
      setCopiedSuccess(settings.language === "ta" ? "நகலெடுக்கப்பட்டது" : "Copied to clipboard");
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = setTimeout(() => setCopiedSuccess(""), 2000);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(doCopy).catch(() => {
        fallbackCopy(text);
        doCopy();
      });
    } else {
      fallbackCopy(text);
      doCopy();
    }
  };

  const fallbackCopy = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
    } catch (err) {}
    document.body.removeChild(textArea);
  };

  const getVerseItem = (verse) => ({
    id: getVerseId(decodedBook, chapter, verse.verse),
    type: "verse",
    bookEnglish: decodedBook,
    bookTamil: bookLabel,
    chapter,
    verse: verse.verse,
    text: verse.text,
  });

  const getEnglishVerseText = (verseNumber) =>
    englishChapterData?.verses.find((item) => String(item.verse) === String(verseNumber))?.text || "";

  const getMobilePopupVerseStyle = (text) => {
    const length = text?.length || 0;

    if (length > 320) {
      return {
        fontSize: "14px",
        lineHeight: 1.42,
      };
    }

    if (length > 220) {
      return {
        fontSize: "15px",
        lineHeight: 1.46,
      };
    }

    if (length > 140) {
      return {
        fontSize: "16px",
        lineHeight: 1.5,
      };
    }

    return {
      fontSize: `${Math.min(Math.max(settings.fontSize - 10, 15), 18)}px`,
      lineHeight: 1.52,
    };
  };

  const handleNote = (item) => {
    const currentNote = libraryData.notes[item.id]?.text || "";
    setNoteEditor({
      item,
      value: currentNote,
    });
  };

  const closeNoteEditor = () => {
    setNoteEditor(null);
  };

  const submitNoteEditor = () => {
    if (!noteEditor) return;
    saveNote(noteEditor.item, noteEditor.value);
    closeNoteEditor();
  };

  const handlePrayer = (item) => {
    const currentPrayer = libraryData.prayers[item.id]?.text || "";
    setPrayerEditor({
      item,
      value: currentPrayer,
    });
  };

  const closePrayerEditor = () => {
    setPrayerEditor(null);
  };

  const submitPrayerEditor = () => {
    if (!prayerEditor) return;
    savePrayer(prayerEditor.item, prayerEditor.value);
    closePrayerEditor();
  };

  const handleHighlight = (item) => {
    const currentHighlight = libraryData.highlights[item.id];
    const defaultFolder = availableHighlightFolders.some(
      (folder) => folder.value === currentHighlight?.folder
    )
      ? currentHighlight?.folder
      : availableHighlightFolders[0].value;

    setHighlightEditor({
      item,
      color: currentHighlight?.color || HIGHLIGHT_COLORS[0],
      folder: defaultFolder,
    });
  };

  const closeHighlightEditor = () => {
    setHighlightEditor(null);
  };

  const submitHighlightEditor = () => {
    if (!highlightEditor) return;
    saveHighlight(highlightEditor.item, {
      color: highlightEditor.color,
      folder: highlightEditor.folder,
    });
    closeHighlightEditor();
  };

  const openChapterPicker = () => {
    setChapterPickerOpen(true);
  };

  const closeChapterPicker = () => {
    setChapterPickerOpen(false);
  };

  const openShareDesigner = (verse) => {
    setShareDesigner({
      verse,
      template: "classic",
      fontSize: 48,
      watermark: ["en", "ta-en"].includes(settings.language) ? "Holy Bible KJV" : isBilingual ? "Tamil Bible + KJV" : "Tamil Bible",
    });
  };

  const closeShareDesigner = () => {
    setShareDesigner(null);
  };

  const handleAddToSermon = (item) => {
    addSermonQueueItem(item);
    setSermonSuccess(`${item.bookTamil} ${item.chapter}:${item.verse} added to Sermon mode`);
    window.setTimeout(() => {
      setSermonSuccess("");
    }, 2200);
  };

  const shareVerseCard = async (verse, destination = "system") => {
    const noteText = libraryData.notes[getVerseId(decodedBook, chapter, verse.verse)]?.text;
    const prayerText = libraryData.prayers[getVerseId(decodedBook, chapter, verse.verse)]?.text;
    const englishVerseText = isBilingual ? getEnglishVerseText(verse.verse) : "";
    const shareText = `${bookLabel} ${chapter}:${verse.verse}\n\n${verse.text}${
      englishVerseText ? `\n\n${englishBookLabel} ${chapter}:${verse.verse}\n${englishVerseText}` : ""
    }${
      noteText ? `\n\nNote: ${noteText}` : ""
    }${prayerText ? `\n\nPrayer: ${prayerText}` : ""}`;
    const design = shareDesigner
      ? {
          template: shareDesigner.template,
          fontSize: Number(shareDesigner.fontSize) || 48,
          watermark:
            shareDesigner.watermark ||
            (["en", "ta-en"].includes(settings.language)
              ? "Holy Bible KJV"
              : isBilingual
              ? "Tamil Bible + KJV"
              : "Tamil Bible"),
        }
      : {};

    try {
      const shareBlob = await createVerseShareImage(verse, design);
      const shareFile = new File(
        [shareBlob],
        `${decodedBook}-${chapter}-${verse.verse}.png`,
        { type: "image/png" }
      );

      if (destination === "whatsapp" || destination === "telegram") {
        const url =
          destination === "whatsapp"
            ? `https://wa.me/?text=${encodeURIComponent(shareText)}`
            : `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(shareText)}`;
        window.open(url, "_blank", "noopener,noreferrer");
      }

      if (
        destination === "system" &&
        navigator.share &&
        (!navigator.canShare || navigator.canShare({ files: [shareFile] }))
      ) {
        await navigator.share({
          title: `${bookLabel} ${chapter}:${verse.verse}`,
          text: shareText,
          files: [shareFile],
        });
        return;
      }

      const downloadUrl = URL.createObjectURL(shareBlob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${decodedBook}-${chapter}-${verse.verse}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);
      return;
    } catch {
      if (destination === "system" && navigator.share) {
        try {
          await navigator.share({
            title: `${bookLabel} ${chapter}:${verse.verse}`,
            text: shareText,
          });
          return;
        } catch {
          return;
        }
      }
    }

    try {
      await navigator.clipboard.writeText(shareText);
    } catch {
      window.prompt(t.share, shareText);
    }
  };

  const openVerse = (verse) => {
    recordHistory(getVerseItem(verse));

    if (window.innerWidth < 768) {
      setSelectedVerse(getVerseItem(verse));
      return;
    }

    openReader(`/reader/${encodeURIComponent(decodedBook)}/${chapter}/${verse.verse}`, navigate);
  };

  const toggleAutoScroll = (direction) => {
    const metrics = getScrollMetrics();

    if (!metrics) return;

    setAutoScrollDirection((current) => {
      if (current === direction) {
        return null;
      }

        const immediateStep = direction === "down" ? 16 : -16;
      const nextTop = Math.min(
        Math.max(metrics.currentTop + immediateStep, 0),
        metrics.maxScrollTop
      );

      metrics.setTop(nextTop);
      return direction;
    });
  };

  const isPlayingAudioRef = useRef(false);

  const toggleAudioPlay = () => {
    if (isPlayingAudioRef.current) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      isPlayingAudioRef.current = false;
      setPlayingVerseId(null);
      return;
    }

    if (!chapterData?.verses?.length) return;

    setIsPlayingAudio(true);
    isPlayingAudioRef.current = true;
    let vIndex = 0;

    const speakNext = () => {
      if (!isPlayingAudioRef.current) {
        window.speechSynthesis.cancel();
        return;
      }

      if (vIndex >= chapterData.verses.length) {
        setIsPlayingAudio(false);
        isPlayingAudioRef.current = false;
        setPlayingVerseId(null);
        return;
      }

      const v = chapterData.verses[vIndex];
      setPlayingVerseId(v.verse);
      
      const el = document.getElementById(`verse-${v.verse}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });

      const isEnglishOnly = settings.language === "en";
      let textToRead = v.text;
      if (isEnglishOnly) {
        textToRead = getEnglishVerseText(v.verse) || "";
      } else if (isBilingual) {
        textToRead = v.text; 
      }

      // Sometimes speech synthesis gets stuck, canceling before speaking helps
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = isEnglishOnly ? "en-US" : "ta-IN";
      utterance.rate = 0.85; // Slow down for better clarity and reverence
      
      const voices = window.speechSynthesis.getVoices();
      
      if (!isEnglishOnly) {
        const taVoice = voices.find(voice => voice.lang.includes("ta") && voice.name.toLowerCase().includes("google")) 
          || voices.find(voice => voice.lang.includes("ta") && voice.name.toLowerCase().includes("online"))
          || voices.find(voice => voice.lang.includes("ta"));
          
        if (taVoice) utterance.voice = taVoice;
      } else {
        const enVoice = voices.find(voice => voice.lang.includes("en") && voice.name.toLowerCase().includes("google") && voice.name.toLowerCase().includes("uk"))
          || voices.find(voice => voice.lang.includes("en") && voice.name.toLowerCase().includes("google"))
          || voices.find(voice => voice.lang.includes("en") && voice.name.toLowerCase().includes("online"))
          || voices.find(voice => voice.lang.includes("en") && voice.name.toLowerCase().includes("natural"))
          || voices.find(voice => voice.lang.includes("en"));
          
        if (enVoice) utterance.voice = enVoice;
      }

      utterance.onend = () => {
        vIndex++;
        speakNext();
      };
      
      utterance.onerror = (e) => {
        console.error("Speech Synthesis Error:", e);
        // Only stop if it wasn't a manual cancellation
        if (isPlayingAudioRef.current) {
          setIsPlayingAudio(false);
          isPlayingAudioRef.current = false;
          setPlayingVerseId(null);
        }
      };

      window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = speakNext;
    } else {
      speakNext();
    }
  };

  const bookIndex = booksList.findIndex(
    (b) => b.book.english.trim() === decodedBook
  );

  let prevChapter = null;
  let nextChapter = null;
  const filteredBooks = booksList.filter((b) => matchBookQuery(b, bookQuery));
  const desktopBookList = bookQuery.trim()
    ? filteredBooks
    : isDesktopBookListExpanded
    ? filteredBooks
    : filteredBooks.filter((b) => b.book.english === decodedBook);

  const desktopChapterList = bookData?.chapters
    ? isDesktopChapterListExpanded
      ? bookData.chapters
      : bookData.chapters.filter((c) => String(c.chapter) === String(chapter))
    : [];

  if (parseInt(chapter) > 1) {
    prevChapter = `/${decodedBook}/${parseInt(chapter) - 1}`;
  } else if (bookIndex > 0) {
    const prevBook = booksList[bookIndex - 1].book.english.trim();
    const lastChapter = BIBLE_CHAPTER_COUNTS[prevBook] || 1;
    prevChapter = `/${prevBook}/${lastChapter}`;
  }

  if (parseInt(chapter) < bookData?.chapters.length) {
    nextChapter = `/${decodedBook}/${parseInt(chapter) + 1}`;
  } else if (bookIndex < booksList.length - 1) {
    const nextBook = booksList[bookIndex + 1].book.english.trim();
    nextChapter = `/${nextBook}/1`;
  }

  const formatChapterTargetLabel = (targetPath, fallback) => {
    if (!targetPath) {
      return fallback;
    }

    const parts = targetPath.split("/").filter(Boolean);
    const targetBook = decodeURIComponent(parts[0] || "");
    const targetChapter = parts[1];
    const isSameBook = targetBook === decodedBook;

    return isSameBook
      ? `${t.chapter} ${targetChapter}`
      : `${targetBook} ${targetChapter}`;
  };

  const prevLabel = formatChapterTargetLabel(prevChapter, "Start");
  const nextLabel = formatChapterTargetLabel(nextChapter, "End");



  if (!bookLoading && bookData && !chapterData) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] px-4 py-6 text-white">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-zinc-500/20 bg-[#000000] p-6 shadow-2xl shadow-black/30">
          <h1 className="text-xl font-bold text-white">{bookLabel}</h1>
          <p className="mt-2 text-sm text-stone-300">
            Chapter {chapter} could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] text-white">
      <div className="md:flex">
        <aside data-lenis-prevent className="hidden w-[300px] shrink-0 border-r border-white/10 bg-[#000000] p-4 custom-scroll md:sticky md:top-28 md:flex md:h-[calc(100vh-7rem)] md:flex-col md:overflow-y-auto">
          <div className="mb-4 rounded-[1.75rem] border border-white/10  p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-400">
              {t.navigator}
            </p>
            <h2 className="mt-3 text-xl font-bold text-white">
              {bookLabel}
            </h2>
            <p className="mt-1 text-sm text-stone-400">{t.chapter} {chapter}</p>
          </div>

          <div className="app-surface rounded-[1.75rem] p-4">
            <div className="mb-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">
                {t.books}
              </p>
              <input
                type="text"
                value={bookQuery}
                onChange={(e) => setBookQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="mb-3 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-stone-500 focus:border-zinc-600/40"
              />
              <div
                className="space-y-2"
                onMouseEnter={() => setIsDesktopBookListExpanded(true)}
                onMouseLeave={() => setIsDesktopBookListExpanded(false)}
              >
                {desktopBookList.map((b) => (
                  <button
                    key={b.book.english}
                    onClick={() =>
                      navigate(`/${encodeURIComponent(b.book.english)}/1`)
                    }
                    className={`block w-full rounded-2xl px-4 py-3 text-left text-sm transition ${
                      b.book.english === decodedBook
                        ? "bg-gradient-to-br from-zinc-800 to-black text-white shadow-lg shadow-indigo-950/35"
                        : "border border-white/10 bg-white/[0.03] text-stone-200 hover:bg-white/[0.07]"
                    }`}
                  >
                    {getBookNameFromEntry(b, settings.language)}
                  </button>
                ))}
              </div>
            </div>

            <div 
              className="mb-5"
              onMouseEnter={() => setIsDesktopChapterListExpanded(true)}
              onMouseLeave={() => setIsDesktopChapterListExpanded(false)}
            >
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">
                {t.chapters}
              </p>
              <div className="grid grid-cols-4 gap-2">
                {desktopChapterList.map((ch) => (
                  <button
                    key={ch.chapter}
                    onClick={() => navigate(`/${decodedBook}/${ch.chapter}`)}
                    className={`rounded-xl py-2 text-sm font-medium transition ${
                      String(ch.chapter) === String(chapter)
                        ? "bg-gradient-to-br from-zinc-800 to-black text-white"
                        : "border border-white/10 bg-white/[0.03] text-stone-300 hover:bg-white/[0.07]"
                    }`}
                  >
                    {ch.chapter}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">
                {t.verses}
              </p>
              <div className="grid grid-cols-4 gap-2">
                {chapterData?.verses.map((v) => (
                  <button
                    key={v.verse}
                    onClick={() =>
                      openReader(
                        `/reader/${encodeURIComponent(decodedBook)}/${chapter}/${v.verse}`
                        ,
                        navigate
                      )
                    }
                    className="rounded-xl border border-white/10 bg-white/[0.03] py-2 text-sm text-stone-300 transition hover:bg-white/[0.07]"
                  >
                    {v.verse}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <main
          ref={readingPaneRef}
          className="app-shell relative flex-1 p-4 pb-6 md:p-6 md:pb-8"
        >
          <div className="mx-auto max-w-5xl">
            <section className="mb-5 overflow-hidden rounded-[2rem] border border-white/10  px-5 py-6 shadow-2xl shadow-black/30 md:px-6">
                            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.32em] text-stone-400">
                      {t.reading}
                    </p>
                    <h1 className="mt-3 text-2xl font-bold text-white md:text-3xl">
                      {isBilingual ? `${getBookName(bookData, "ta")} / ${englishBookLabel}` : bookLabel}
                    </h1>
                    <p className="mt-2 text-sm text-stone-400">{t.chapter} {chapter}</p>
                  </div>
                  <div className="flex gap-2 self-start md:self-auto">
                    <button
                      onClick={toggleAudioPlay}
                      className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                        isPlayingAudio
                          ? "bg-fuchsia-500 text-white shadow-[0_0_15px_rgba(217,70,239,0.5)]"
                          : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                      }`}
                    >
                      {isPlayingAudio ? (t?.stopAudio || "Stop Audio") : (t?.playAudio || "Play Audio")}
                    </button>
                    <button
                      onClick={() => toggleBookmark(chapterItem)}
                      className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                        isBookmarked(libraryData, chapterItem.id)
                          ? "bg-white text-slate-950"
                          : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                      }`}
                    >
                      {t.chapterBookmark}
                    </button>
                  </div>
                </div>

                <ChapterNavigator
                  chapter={chapter}
                  chapterLabel={t.chapter}
                  onOpenPicker={openChapterPicker}
                  onPrev={() => prevChapter && navigate(prevChapter)}
                  onNext={() => nextChapter && navigate(nextChapter)}
                  hasPrev={Boolean(prevChapter)}
                  hasNext={Boolean(nextChapter)}
                  prevLabel={prevLabel}
                  nextLabel={nextLabel}
                  t={t}
                />
              </div>
            </section>

            {chapterData ? (
              <div key={`loaded-${decodedBook}-${chapter}`} className="space-y-3 animate-fade-in">
                {chapterData.verses.map((v) => {
                const verseItem = getVerseItem(v);
                const favorited = isFavorited(libraryData, verseItem.id);
                const highlighted = libraryData.highlights[verseItem.id];
                const note = libraryData.notes[verseItem.id];
                const prayer = libraryData.prayers[verseItem.id];
                const englishVerseText = isBilingual ? getEnglishVerseText(v.verse) : "";

                return (
                  <div
                    id={`verse-${v.verse}`}
                    key={v.verse}
                    onTouchStart={(e) => {
                      e.currentTarget.dataset.touchStartX = e.changedTouches[0].screenX;
                      e.currentTarget.dataset.touchStartY = e.changedTouches[0].screenY;
                    }}
                    onTouchEnd={(e) => {
                      const startX = parseFloat(e.currentTarget.dataset.touchStartX);
                      const startY = parseFloat(e.currentTarget.dataset.touchStartY);
                      const endX = e.changedTouches[0].screenX;
                      const endY = e.changedTouches[0].screenY;
                      
                      // Check if it's mostly a horizontal swipe (prevent accidental swipe while scrolling)
                      if (Math.abs(startX - endX) > 40 && Math.abs(startY - endY) < 40) {
                        if (startX - endX > 40) {
                          // Swiped Left - Show Note & Prayer
                          setSwipedVerseId(swipedVerseId === v.verse ? null : v.verse);
                        } else if (endX - startX > 40) {
                          // Swiped Right - Toggle Favorite with correct animation
                          toggleFavorite(verseItem);
                          setSwipedVerseId(null);
                          setFavoriteAnimation({ id: v.verse, type: favorited ? 'remove' : 'add' });
                          setTimeout(() => setFavoriteAnimation(null), 1000);
                        }
                      }
                    }}
                    className={`relative min-w-0 overflow-hidden rounded-[1.6rem] border p-4 transition duration-700 md:p-5 ${
                      playingVerseId === v.verse 
                        ? "border-fuchsia-500/50 bg-[#110011] shadow-[0_0_20px_rgba(217,70,239,0.1)]" 
                        : "border-white/10 bg-[#000000] hover:border-zinc-600/25 hover:bg-[#0a0a0a]"
                    }`}
                    style={{
                      lineHeight: settings.lineHeight || 1.8,
                      boxShadow: highlighted
                        ? `inset 3px 0 0 ${highlighted.color}`
                        : undefined,
                    }}
                  >
                    <button 
                      onClick={() => openVerse(v)}
                      className="block min-w-0 w-full overflow-hidden text-left"
                    >
                      {/* Note & Prayer Swipe Overlay */}
                      <div 
                        className={`absolute inset-0 z-20 flex items-center justify-end gap-3 bg-gradient-to-l from-[#000000] via-[#000000]/90 to-transparent pr-4 pl-12 transition-all duration-300 ease-out md:hidden ${
                          swipedVerseId === v.verse ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
                        }`}
                        onClick={(e) => { e.stopPropagation(); setSwipedVerseId(null); }}
                      >
                        <button
                          onClick={(e) => { e.stopPropagation(); handleNote(verseItem); setSwipedVerseId(null); }}
                          className="flex flex-col items-center justify-center h-14 w-14 rounded-full bg-zinc-800/90 text-white shadow-xl transition active:scale-95"
                        >
                          <svg className="h-5 w-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span className="text-[10px] font-bold">{t.note}</span>
                        </button>
                        
                        {settings.pastorsMode && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handlePrayer(verseItem); setSwipedVerseId(null); }}
                            className="flex flex-col items-center justify-center h-14 w-14 rounded-full bg-emerald-500/20 text-emerald-400 shadow-xl transition active:scale-95"
                          >
                            <svg className="h-5 w-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span className="text-[10px] font-bold">{["en", "ta-en"].includes(settings.language) ? "Prayer" : "ஜெபம்"}</span>
                          </button>
                        )}
                      </div>

                      {/* Favorite Animation Overlay */}
                      {favoriteAnimation?.id === v.verse && (
                        <div className={`absolute inset-0 z-10 flex items-center justify-start gap-3 bg-gradient-to-r ${
                          favoriteAnimation.type === 'add' ? 'from-rose-500/90 via-rose-500/40' : 'from-zinc-800/90 via-zinc-800/40'
                        } to-transparent pl-8 transition-all duration-300 animate-fade-in-out`}>
                          {favoriteAnimation.type === 'add' ? (
                            <>
                              <svg className="h-8 w-8 text-white drop-shadow-md animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                              </svg>
                              <span className="text-sm font-bold text-white drop-shadow-md tracking-wider uppercase">Favorited</span>
                            </>
                          ) : (
                            <>
                              <svg className="h-8 w-8 text-white/70 drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                <line x1="4" y1="4" x2="20" y2="20" strokeWidth="2" stroke="currentColor" />
                              </svg>
                              <span className="text-sm font-bold text-white/70 drop-shadow-md tracking-wider uppercase">Removed</span>
                            </>
                          )}
                        </div>
                      )}
                      
                      {isBilingual && englishVerseText ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="min-w-0 md:pr-4 md:border-r md:border-white/10">
                            <p className="text-base text-slate-100 md:text-lg">
                              <span className="mr-2 inline text-sm font-bold text-white md:text-base">{v.verse}.</span>
                              <span className="whitespace-normal break-words">{v.text}</span>
                            </p>
                          </div>
                          <div className="min-w-0">
                            <p className="text-base text-stone-300 md:text-lg leading-7 md:leading-[1.8]">
                              <span className="mr-2 inline text-sm font-bold text-stone-500 md:text-base">{v.verse}.</span>
                              <span className="whitespace-normal break-words">{englishVerseText}</span>
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="min-w-0">
                          <p className="text-base text-slate-100 md:text-lg">
                            <span className="mr-2 inline text-sm font-bold text-white md:text-base">
                              {v.verse}.
                            </span>
                            <span className="whitespace-normal break-words">{v.text}</span>
                          </p>
                          {englishVerseText ? (
                            <p className="mt-3 break-words text-sm leading-7 text-stone-300 md:text-base">
                              {englishVerseText}
                            </p>
                          ) : null}
                        </div>
                      )}
                    </button>

                    <div className="mt-4 flex flex-wrap justify-center gap-2 md:mt-5 md:border-t md:border-white/5 md:pt-4">
                      <button
                        onClick={() => toggleFavorite(verseItem)}
                        className={`hidden md:inline-block rounded-full px-3 py-1.5 text-xs font-semibold ${
                          favorited
                            ? "bg-rose-400 text-slate-950"
                            : "border border-white/10 bg-white/5 text-stone-200"
                        }`}
                      >
                        {t.favorite}
                      </button>
                      <button
                        onClick={() => handleHighlight(verseItem)}
                        className="rounded-full px-3 py-1.5 text-xs font-semibold"
                        style={{
                          background: highlighted?.color || "rgba(255,255,255,0.06)",
                          border: highlighted ? "none" : "1px solid rgba(255,255,255,0.1)",
                          color: highlighted && ['#ffffff', '#f472b6', '#fbbf24', '#34d399'].includes(highlighted.color) ? '#000' : '#fff'
                        }}
                      >
                        {t.highlight}
                      </button>
                      <button
                        onClick={() => handleNote(verseItem)}
                        className={`hidden md:inline-block rounded-full px-3 py-1.5 text-xs font-semibold ${
                          note
                            ? "bg-zinc-600 text-slate-950"
                            : "border border-white/10 bg-white/5 text-stone-200"
                        }`}
                      >
                        {t.note}
                      </button>
                      {settings.pastorsMode && (
                        <button
                          onClick={() => handlePrayer(verseItem)}
                          className={`hidden md:inline-block rounded-full px-3 py-1.5 text-xs font-semibold ${
                            prayer
                              ? "bg-emerald-400 text-slate-950"
                              : "border border-white/10 bg-white/5 text-stone-200"
                          }`}
                        >
                          {["en", "ta-en"].includes(settings.language) ? "Prayer" : "ஜெபம்"}
                        </button>
                      )}
                      {settings.presentationMode && (
                        <button
                          onClick={() => handleAddToSermon(verseItem)}
                          className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-stone-200 md:inline-block"
                        >
                          {["en", "ta-en"].includes(settings.language) ? "Sermon" : "பிரசங்கம்"}
                        </button>
                      )}
                      <button
                        onClick={() => {
                          const ref = `${bookLabel} ${chapter}:${v.verse}`;
                          const copyStr = isBilingual && englishVerseText 
                            ? `${ref}\n${v.text}\n${englishVerseText}` 
                            : `${ref} - ${v.text}`;
                          handleCopy(copyStr);
                        }}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-stone-200"
                      >
                        {["en", "ta-en"].includes(settings.language) ? "Copy" : "நகலெடு"}
                      </button>
                      <button
                        onClick={() => openShareDesigner(v)}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-stone-200"
                      >
                        {t.share}
                      </button>
                      {settings.pastorsMode && (
                        <button
                          onClick={() => setCrossReferencesViewer(verseItem)}
                          className="rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-3 py-1.5 text-xs font-semibold text-fuchsia-200"
                        >
                          {["en", "ta-en"].includes(settings.language) ? "Related Verses" : "தொடர்புடைய வசனங்கள்"}
                        </button>
                      )}
                    </div>

                    {note ? (
                      <p className="mt-3 break-words rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm leading-6 text-stone-300">
                        {note.text}
                      </p>
                    ) : null}
                    {prayer ? (
                      <p className="mt-3 break-words rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm leading-6 text-emerald-50">
                        {prayer.text}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
            ) : (
              <div className="min-h-[50vh]" />
            )}

                        <div className="mb-6 mt-6">
              <ChapterNavigator
                chapter={chapter}
                chapterLabel={t.chapter}
                onOpenPicker={openChapterPicker}
                onPrev={() => prevChapter && navigate(prevChapter)}
                onNext={() => nextChapter && navigate(nextChapter)}
                hasPrev={Boolean(prevChapter)}
                hasNext={Boolean(nextChapter)}
                prevLabel={prevLabel}
                nextLabel={nextLabel}
                compact
                t={t}
              />
            </div>

          </div>

          {sermonSuccess ? (
            <div className="pointer-events-none fixed bottom-28 left-4 right-20 z-40 md:bottom-6 md:left-6 md:right-auto md:max-w-md">
              <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/15 px-4 py-3 text-sm font-semibold text-emerald-50 shadow-lg backdrop-blur-md">
                {sermonSuccess}
              </div>
            </div>
          ) : null}

          {copiedSuccess ? createPortal(
            <div className="pointer-events-none fixed top-24 left-1/2 z-[99999] -translate-x-1/2 transform animate-fade-in">
              <div className="flex w-max items-center gap-2 rounded-full border border-white/10 bg-zinc-900/95 px-5 py-2.5 text-sm font-semibold text-white shadow-2xl backdrop-blur-md">
                <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                {copiedSuccess}
              </div>
            </div>,
            document.body
          ) : null}
        </main>

        <div className="pointer-events-none fixed bottom-28 right-4 z-40 flex flex-col gap-3 md:bottom-6 md:right-6">
          <button
            onClick={() => toggleAutoScroll("up")}
            className={`pointer-events-auto h-12 w-12 rounded-full border text-xs font-bold tracking-[0.2em] shadow-lg backdrop-blur-md transition ${
              autoScrollDirection === "up"
                ? "border-zinc-500 bg-zinc-700 text-slate-950"
                : "border-white/10 bg-black/80 text-white"
            }`}
            aria-label="Auto scroll up"
            title="Auto scroll up"
          >
            UP
          </button>
          <button
            onClick={() => toggleAutoScroll("down")}
            className={`pointer-events-auto h-12 w-12 rounded-full border text-xs font-bold tracking-[0.2em] shadow-lg backdrop-blur-md transition ${
              autoScrollDirection === "down"
                ? "border-zinc-500 bg-zinc-700 text-slate-950"
                : "border-white/10 bg-black/80 text-white"
            }`}
            aria-label="Auto scroll down"
            title="Auto scroll down"
          >
            DN
          </button>
        </div>
      </div>

      {selectedVerse ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm md:hidden">
          <button
            type="button"
            aria-label="Close verse preview"
            className="absolute inset-0"
            onClick={() => setSelectedVerse(null)}
          />

          <div
            className="relative z-10 w-full max-w-sm overflow-hidden rounded-[2rem] border border-white/10 p-5 shadow-2xl shadow-black/40"
            style={{
              background:
                settings.bgType === "custom" && settings.customBackground
                  ? `url(${settings.customBackground})`
                  : settings.bgType === "gradient"
                  ? getCustomGradientString(settings.customGradientType, settings.customGradientColor1, settings.customGradientColor2)
                  : `url(${backgrounds[settings.bgIndex]})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(7, 17, 31, 0.42), rgba(7, 17, 31, 0.58))",
                backdropFilter: "blur(1px)",
              }}
            />
            <div className="relative z-10">
            {(() => {
              const selectedEnglishVerseText = isBilingual ? getEnglishVerseText(selectedVerse.verse) : "";

              return (
                <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-stone-400">
                  {t.verse}
                </p>
                <p className="mt-2 text-sm font-bold text-white">
                  {isBilingual ? `${getBookName(bookData, "ta")} / ${englishBookLabel}` : bookLabel} {chapter}:{selectedVerse.verse}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVerse(null)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white"
              >
                X
              </button>
            </div>

            <p
              className="mt-5 break-words text-left font-semibold text-white"
              style={getMobilePopupVerseStyle(selectedVerse.text)}
            >
              {selectedVerse.text}
            </p>

            {selectedEnglishVerseText ? (
              <p
                className="mt-4 break-words text-left text-stone-200"
                style={getMobilePopupVerseStyle(selectedEnglishVerseText)}
              >
                {selectedEnglishVerseText}
              </p>
            ) : null}

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCrossReferencesViewer(selectedVerse)}
                className="w-full rounded-2xl border border-fuchsia-500/30 bg-fuchsia-500/10 px-4 py-3 text-sm font-semibold text-fuchsia-100 shadow-lg"
              >
                {["en", "ta-en"].includes(settings.language) ? "Related" : "தொடர்பு"}
              </button>
              <button
                type="button"
                onClick={() => openShareDesigner(selectedVerse)}
                className="w-full rounded-2xl bg-[#000000] px-4 py-3 text-sm font-semibold text-white shadow-lg"
              >
                {t.share}
              </button>
            </div>
                </>
              );
            })()}
            </div>
          </div>
        </div>
      ) : null}

      {noteEditor ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close note editor"
            className="absolute inset-0"
            onClick={closeNoteEditor}
          />

          <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/10  p-5 shadow-2xl shadow-black/40 md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-pink-200/80">
                  {t.note}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-white">
                  {t.notePrompt}
                </h3>
                <p className="mt-2 text-sm text-stone-400">
                  {noteEditor.item.bookTamil} {noteEditor.item.chapter}:{noteEditor.item.verse}
                </p>
              </div>
              <button
                type="button"
                onClick={closeNoteEditor}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-stone-300 transition hover:bg-white/10 hover:text-white"
                aria-label={t.close}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <textarea
              value={noteEditor.value}
              onChange={(e) =>
                setNoteEditor((current) =>
                  current
                    ? {
                        ...current,
                        value: e.target.value,
                      }
                    : current
                )
              }
              placeholder={t.notePrompt}
              className="mt-5 min-h-40 w-full rounded-[1.5rem] border border-pink-300/40 bg-black/20 px-4 py-4 text-sm leading-7 text-white outline-none placeholder:text-stone-500 focus:border-pink-300 focus:ring-2 focus:ring-pink-300/20"
              autoFocus
            />

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={() => {
                  saveNote(noteEditor.item, "");
                  closeNoteEditor();
                }}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-stone-200 transition hover:bg-white/10"
              >
                {t.removeTitle || "Remove"}
              </button>
              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={closeNoteEditor}
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-stone-200 transition hover:bg-white/10"
                >
                  {t.cancel}
                </button>
                <button
                  type="button"
                  onClick={submitNoteEditor}
                  className="rounded-2xl bg-yellow-500 px-5 py-3 text-sm font-bold text-slate-950 shadow-[0_0_15px_rgba(234,179,8,0.3)] transition hover:bg-yellow-400 active:scale-95"
                >
                  {t.save}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {prayerEditor ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close prayer editor"
            className="absolute inset-0"
            onClick={closePrayerEditor}
          />

          <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/10  p-5 shadow-2xl shadow-black/40 md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-200/80">
                  {["en", "ta-en"].includes(settings.language) ? "Prayer Journal" : "ஜெப குறிப்பேடு"}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-white">
                  {["en", "ta-en"].includes(settings.language) ? "Attach a prayer to this verse" : "இந்த வசனத்திற்கு ஒரு ஜெபத்தை இணைக்கவும்"}
                </h3>
                <p className="mt-2 text-sm text-stone-400">
                  {prayerEditor.item.bookTamil} {prayerEditor.item.chapter}:{prayerEditor.item.verse}
                </p>
              </div>
              <button
                type="button"
                onClick={closePrayerEditor}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-stone-300 transition hover:bg-white/10 hover:text-white"
                aria-label={t.close}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <textarea
              value={prayerEditor.value}
              onChange={(e) =>
                setPrayerEditor((current) =>
                  current
                    ? {
                        ...current,
                        value: e.target.value,
                      }
                    : current
                )
              }
              placeholder="Write a prayer, burden, or answered-prayer reminder"
              className="mt-5 min-h-40 w-full rounded-[1.5rem] border border-emerald-300/30 bg-black/20 px-4 py-4 text-sm leading-7 text-white outline-none placeholder:text-stone-500 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-300/20"
              autoFocus
            />

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={() => {
                  savePrayer(prayerEditor.item, "");
                  closePrayerEditor();
                }}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-stone-200 transition hover:bg-white/10"
              >
                {t.removeTitle || "Remove"}
              </button>
              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={closePrayerEditor}
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-stone-200 transition hover:bg-white/10"
                >
                  {t.cancel}
                </button>
                <button
                  type="button"
                  onClick={submitPrayerEditor}
                  className="rounded-2xl bg-yellow-500 px-5 py-3 text-sm font-bold text-slate-950 shadow-[0_0_15px_rgba(234,179,8,0.3)] transition hover:bg-yellow-400 active:scale-95"
                >
                  {t.save}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {highlightEditor ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close highlight editor"
            className="absolute inset-0"
            onClick={closeHighlightEditor}
          />

          <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/10  p-5 shadow-2xl shadow-black/40 md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-400/80">
                  {t.highlight}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-white">
                  {["en", "ta-en"].includes(settings.language) ? "Choose color and folder" : "நிறமும் அடைவையும் தேர்வுசெய்க"}
                </h3>
                <p className="mt-2 text-sm text-stone-400">
                  {highlightEditor.item.bookTamil} {highlightEditor.item.chapter}:{highlightEditor.item.verse}
                </p>
              </div>
              <button
                type="button"
                onClick={closeHighlightEditor}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-stone-300 transition hover:bg-white/10 hover:text-white"
                aria-label={t.close}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-5">
              <p className="text-sm text-stone-300">{t.colorTitle || "Color"}</p>
              <div className="mt-3 flex flex-wrap gap-3">
                {HIGHLIGHT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() =>
                      setHighlightEditor((current) =>
                        current
                          ? {
                              ...current,
                              color,
                            }
                          : current
                      )
                    }
                    className={`h-11 w-11 rounded-full border-2 ${
                      highlightEditor.color === color ? "border-white" : "border-white/10"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="mt-5">
              <p className="text-sm text-stone-300">{t.folderTitle || "Folder"}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {availableHighlightFolders.map((folder) => (
                  <button
                    key={folder.value}
                    type="button"
                    onClick={() =>
                      setHighlightEditor((current) =>
                        current
                          ? {
                              ...current,
                              folder: folder.value,
                            }
                          : current
                      )
                    }
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      highlightEditor.folder === folder.value
                        ? "bg-white text-black"
                        : "border border-white/10 bg-white/5 text-stone-300 hover:bg-white/10"
                    }`}
                  >
                    {t[folder.value] || folder.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={() => {
                  saveHighlight(highlightEditor.item, {});
                  closeHighlightEditor();
                }}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-stone-200 transition hover:bg-white/10"
              >
                {t.removeTitle || "Remove"}
              </button>
              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={closeHighlightEditor}
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-stone-200 transition hover:bg-white/10"
                >
                  {t.cancel}
                </button>
                <button
                  type="button"
                  onClick={submitHighlightEditor}
                  className="rounded-2xl bg-yellow-500 px-5 py-3 text-sm font-bold text-slate-950 shadow-[0_0_15px_rgba(234,179,8,0.3)] transition hover:bg-yellow-400 active:scale-95"
                >
                  {t.save}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {shareDesigner ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close share designer"
            className="absolute inset-0"
            onClick={closeShareDesigner}
          />

          <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/10  p-5 shadow-2xl shadow-black/40 md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-indigo-200/80">
                  {["en", "ta-en"].includes(settings.language) ? "Verse Designer" : "வசன வடிவமைப்பான்"}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-white">
                  {["en", "ta-en"].includes(settings.language) ? "Share to family, WhatsApp, or Telegram" : "குடும்பத்தாருக்கு, WhatsApp அல்லது Telegram மூலம் பகிரவும்"}
                </h3>
                <p className="mt-2 text-sm text-stone-400">
                  {bookLabel} {chapter}:{shareDesigner.verse.verse}
                </p>
              </div>
              <button
                type="button"
                onClick={closeShareDesigner}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-stone-300 transition hover:bg-white/10 hover:text-white"
                aria-label={t.close}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-5 flex flex-col gap-5">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Template</p>
                <div className="flex gap-2">
                  {["classic", "social", "minimal"].map((tmpl) => (
                    <button
                      key={tmpl}
                      type="button"
                      onClick={() => setShareDesigner((c) => c ? { ...c, template: tmpl } : c)}
                      className={`flex-1 rounded-2xl border px-3 py-2.5 text-sm font-semibold capitalize transition-all ${
                        shareDesigner.template === tmpl
                          ? "border-white/20 bg-white/10 text-white shadow-lg shadow-black/40"
                          : "border-white/[0.06] bg-white/[0.03] text-stone-400 hover:border-white/10 hover:bg-white/[0.06] hover:text-stone-200"
                      }`}
                    >
                      {tmpl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Font Size</p>
                <div className="flex gap-2">
                  {[{ label: "Small", value: 30 }, { label: "Medium", value: 42 }, { label: "Large", value: 56 }].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setShareDesigner((c) => c ? { ...c, fontSize: opt.value } : c)}
                      className={`flex-1 rounded-2xl border px-3 py-2.5 text-sm font-semibold transition-all ${
                        shareDesigner.fontSize === opt.value
                          ? "border-white/20 bg-white/10 text-white shadow-lg shadow-black/40"
                          : "border-white/[0.06] bg-white/[0.03] text-stone-400 hover:border-white/10 hover:bg-white/[0.06] hover:text-stone-200"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Watermark</p>
                <input
                  type="text"
                  value={shareDesigner.watermark}
                  onChange={(e) =>
                    setShareDesigner((current) =>
                      current ? { ...current, watermark: e.target.value } : current
                    )
                  }
                  placeholder="Your church name..."
                  className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-stone-600 outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all"
                />
              </div>

            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={async () => {
                  await shareVerseCard(shareDesigner.verse, "system");
                  closeShareDesigner();
                }}
                className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md px-5 py-3 text-sm font-semibold text-white shadow-xl hover:bg-white/20 transition-all"
              >
                Share Image
              </button>
              <button
                type="button"
                onClick={async () => {
                  await shareVerseCard(shareDesigner.verse, "whatsapp");
                  closeShareDesigner();
                }}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-all"
              >
                WhatsApp
              </button>
              <button
                type="button"
                onClick={async () => {
                  await shareVerseCard(shareDesigner.verse, "telegram");
                  closeShareDesigner();
                }}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-all"
              >
                Telegram
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {chapterPickerOpen ? (
        <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close chapter picker"
            className="absolute inset-0"
            onClick={closeChapterPicker}
          />

          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10  p-5 shadow-2xl shadow-black/40 md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-400/80">
                  {t.chapters}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-white">
                  {bookLabel}
                </h3>
                <p className="mt-2 text-sm text-stone-400">
                  {t.chapter} {chapter}
                </p>
              </div>
              <button
                type="button"
                onClick={closeChapterPicker}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white transition hover:bg-white/10"
              >
                {t.close}
              </button>
            </div>

            <div data-lenis-prevent="true" className="mt-5 grid max-h-[55vh] grid-cols-4 gap-3 overflow-y-auto pr-1 custom-scroll sm:grid-cols-5">
              {bookData?.chapters.map((ch) => (
                <button
                  key={ch.chapter}
                  type="button"
                  onClick={() => {
                    closeChapterPicker();
                    navigate(`/${decodedBook}/${ch.chapter}`);
                  }}
                  className={`rounded-2xl py-3 text-sm font-semibold transition ${
                      String(ch.chapter) === String(chapter)
                      ? "bg-gradient-to-br from-zinc-800 to-black text-white"
                      : "border border-white/10 bg-white/[0.03] text-stone-300 hover:bg-white/[0.07]"
                  }`}
                >
                  {ch.chapter}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {sermonSuccess ? (
        <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-2xl border border-emerald-500/30 bg-black/90 px-6 py-3 text-sm font-semibold text-emerald-400 shadow-xl shadow-black/40 backdrop-blur-md whitespace-nowrap">
          {sermonSuccess}
        </div>
      ) : null}

      {crossReferencesViewer ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close cross references"
            className="absolute inset-0"
            onClick={() => setCrossReferencesViewer(null)}
          />

          <div className="relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a0a0a] shadow-2xl shadow-black/40" style={{ maxHeight: '85vh' }}>
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-white/10 p-5 md:p-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-fuchsia-300">
                  {["en", "ta-en"].includes(settings.language) ? "Cross References" : "தொடர்புடைய வசனங்கள்"}
                </p>
                <h3 className="mt-2 text-lg font-bold text-white">
                  {["en", "ta-en"].includes(settings.language) ? "Related Verses" : "தொடர்புடைய வசனங்கள்"}
                </h3>
                <p className="mt-1 text-sm font-medium text-stone-400">
                  {crossReferencesViewer.bookTamil || (crossReferencesViewer.book ? getBookName(bookData, "ta") : crossReferencesViewer.bookEnglish)} {crossReferencesViewer.chapter}:{crossReferencesViewer.verse}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCrossReferencesViewer(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-stone-300 transition hover:bg-white/10 hover:text-white"
                aria-label={t.close}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div data-lenis-prevent="true" className="flex-1 overflow-y-auto p-5 md:p-6 custom-scroll">
              {(() => {
                const bookKey = `${crossReferencesViewer.bookEnglish} ${crossReferencesViewer.chapter}`;
                const references = crossReferencesData[bookKey]?.[crossReferencesViewer.verse];
                
                if (!references || references.length === 0) {
                  return (
                    <div className="flex min-h-[200px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 p-6 text-center">
                      <p className="text-sm font-medium text-stone-400">
                        {["en", "ta-en"].includes(settings.language) 
                          ? "No related verses found for this verse." 
                          : "இந்த வசனத்திற்கு தொடர்புடைய வசனங்கள் கிடைக்கவில்லை."}
                      </p>
                      {Object.keys(crossReferencesData).length === 0 && (
                        <p className="mt-3 text-xs text-stone-500">
                          (Dataset missing or loading...)
                        </p>
                      )}
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {references.map((ref, idx) => {
                      const match = ref.match(/^(.+?)\s(\d+):(\d+)$/);
                      if (!match) return <div key={idx} className="rounded-2xl bg-white/5 p-4 text-sm text-stone-300">{ref}</div>;
                      
                      const refBook = match[1];
                      const refChap = match[2];
                      const refVerse = match[3];

                      const bookEntry = booksList.find(b => b.book.english === refBook);
                      const displayRefBook = bookEntry && settings.language !== "en" 
                        ? getBookNameFromEntry(bookEntry, "ta") 
                        : refBook;
                      
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setCrossReferencesViewer(null);
                            if (window.innerWidth < 768) setSelectedVerse(null);
                            navigate(`/${encodeURIComponent(refBook)}/${refChap}?verse=${refVerse}`);
                          }}
                          className="flex w-full items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-left transition hover:border-fuchsia-500/30 hover:bg-white/[0.04]"
                        >
                          <div>
                            <p className="text-sm font-bold text-fuchsia-100">{displayRefBook} {refChap}:{refVerse}</p>
                            <p className="mt-1 text-xs text-stone-400">
                              {["en", "ta-en"].includes(settings.language) ? "Tap to open chapter" : "அதிகாரத்தை திறக்க அழுத்தவும்"}
                            </p>
                          </div>
                          <svg className="h-4 w-4 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      ) : null}

    </div>
  );
}
