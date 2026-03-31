import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

import booksList from "../data/Books.json";
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
}) {
  const wrapperClass = compact
    ? "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3"
    : "grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]";

  const mobileArrowClass =
    "flex h-11 items-center justify-center rounded-[1.1rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.9),rgba(8,17,32,0.98))] text-lg text-white transition hover:border-sky-400/30 hover:bg-[linear-gradient(180deg,rgba(30,41,59,0.92),rgba(15,23,42,1))] disabled:cursor-not-allowed disabled:opacity-40 md:hidden";

  const sideClass =
    "group flex items-center gap-2.5 rounded-[1.2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.9),rgba(8,17,32,0.98))] px-3 py-3 text-left transition hover:border-sky-400/30 hover:bg-[linear-gradient(180deg,rgba(30,41,59,0.92),rgba(15,23,42,1))] disabled:cursor-not-allowed disabled:opacity-40 sm:gap-3 sm:rounded-[1.4rem] sm:px-4";

  const centerClass = compact
    ? "inline-flex w-full min-w-0 items-center justify-center gap-3 rounded-[1.25rem] border border-sky-400/20 bg-[linear-gradient(135deg,rgba(37,99,235,0.16),rgba(56,189,248,0.22))] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-950/20 transition hover:border-sky-300/40 hover:bg-[linear-gradient(135deg,rgba(37,99,235,0.24),rgba(56,189,248,0.3))]"
    : "inline-flex w-full min-w-0 items-center justify-center gap-2 rounded-[1.3rem] border border-sky-400/20 bg-[linear-gradient(135deg,rgba(37,99,235,0.16),rgba(56,189,248,0.22))] px-3 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-950/20 transition hover:border-sky-300/40 hover:bg-[linear-gradient(135deg,rgba(37,99,235,0.24),rgba(56,189,248,0.3))] md:col-span-1 md:min-w-[12rem] md:w-auto md:gap-3 md:rounded-[1.45rem] md:px-5 md:py-4 md:text-base md:shadow-xl";

  return (
    <div className={wrapperClass}>
      <button type="button" onClick={onPrev} disabled={!hasPrev} className={mobileArrowClass}>
        &larr;
      </button>

      <button type="button" onClick={onPrev} disabled={!hasPrev} className={`${sideClass} hidden md:flex ${compact ? "sm:col-auto" : ""}`}>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-base text-white sm:h-10 sm:w-10 sm:rounded-2xl sm:text-lg">&larr;</span>
        <span className="min-w-0">
          <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-500">
            Previous
          </span>
          <span className="block truncate text-xs font-semibold text-slate-100 sm:text-sm">{prevLabel}</span>
        </span>
      </button>

      <button type="button" onClick={onOpenPicker} className={centerClass}>
        <span className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-sky-100/75">
          {chapterLabel}
        </span>
        <span>{chapter}</span>
        <span className="text-sm text-sky-100/80">&#9662;</span>
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
          <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-500">
            Next
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

  const [selectedVerse, setSelectedVerse] = useState(null);
  const [noteEditor, setNoteEditor] = useState(null);
  const [prayerEditor, setPrayerEditor] = useState(null);
  const [highlightEditor, setHighlightEditor] = useState(null);
  const [shareDesigner, setShareDesigner] = useState(null);
  const [sermonSuccess, setSermonSuccess] = useState("");
  const [chapterPickerOpen, setChapterPickerOpen] = useState(false);
  const [autoScrollDirection, setAutoScrollDirection] = useState(null);
  const [settings] = useAppSettings();
  const libraryData = useLibraryData();
  const t = getUIText(settings.language);
  const isBilingual = isBilingualLanguage(settings.language);
  const primaryLanguage = settings.language === "en" ? "en" : "ta";
  const [bookQuery, setBookQuery] = useState("");
  const [isDesktopBookListExpanded, setIsDesktopBookListExpanded] = useState(false);
  const readingPaneRef = useRef(null);
  const autoScrollFrameRef = useRef(null);
  const lastAutoScrollTimeRef = useRef(null);
  const isMobileView = typeof window !== "undefined" && window.innerWidth < 768;
  const mobileHighlightFolders = HIGHLIGHT_FOLDERS.filter(
    (folder) => folder.value === "promise" || folder.value === "memory"
  );
  const availableHighlightFolders = isMobileView
    ? mobileHighlightFolders
    : HIGHLIGHT_FOLDERS;

  const decodedBook = decodeURIComponent(book);

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
      gradient.addColorStop(0, settings.bgType === "motion" ? "#020617" : "#0f172a");
      gradient.addColorStop(1, settings.bgType === "motion" ? "#0f766e" : "#1d4ed8");

      const gradientMatches = gradients[settings.bgIndex]?.match(/#[0-9a-fA-F]{6}/g);

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
        ctx.fillStyle = "#07111f";
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
        accent: "rgba(191, 219, 254, 0.9)",
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

    ctx.fillStyle = `rgba(5, 10, 20, ${Math.min((settings.cardOpacity ?? 0.5) + 0.18, 0.82)})`;
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
      design.watermark || (settings.language === "en" ? "Holy Bible KJV" : "Tamil Bible"),
      cardX + 54,
      cardY + cardHeight - 44
    );

    return canvasToBlob(canvas);
  };

  const getScrollMetrics = () => {
    if (window.innerWidth < 768) {
      const scrollElement =
        document.scrollingElement || document.documentElement;

      return {
        currentTop: window.scrollY,
        maxScrollTop: Math.max(
          scrollElement.scrollHeight - window.innerHeight,
          0
        ),
        setTop: (value) => window.scrollTo(0, value),
      };
    }

    const container = readingPaneRef.current;

    if (!container) {
      return null;
    }

    return {
      currentTop: container.scrollTop,
      maxScrollTop: Math.max(
        container.scrollHeight - container.clientHeight,
        0
      ),
      setTop: (value) => {
        container.scrollTop = value;
      },
    };
  };

  const { bookData } = useBibleBook(decodedBook, primaryLanguage);
  const { bookData: englishBookData } = useBibleBook(decodedBook, "en");
  const chapterData = bookData?.chapters.find((ch) => ch.chapter === chapter);
  const englishChapterData = englishBookData?.chapters.find((ch) => ch.chapter === chapter);
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
      watermark: settings.language === "en" ? "Holy Bible KJV" : isBilingual ? "Tamil Bible + KJV" : "Tamil Bible",
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
            (settings.language === "en"
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
      setSelectedVerse(verse);
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

  if (parseInt(chapter) > 1) {
    prevChapter = `/${decodedBook}/${parseInt(chapter) - 1}`;
  } else if (bookIndex > 0) {
    const prevBook = booksList[bookIndex - 1].book.english.trim();
    const lastChapter = activeBible[prevBook].chapters.length;
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

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#07111f] text-white md:h-screen md:overflow-hidden">
      <div className="md:flex md:h-screen">
        <aside data-lenis-prevent className="hidden w-[300px] shrink-0 overflow-y-auto border-r border-white/10 bg-[linear-gradient(180deg,_rgba(8,17,32,0.98),_rgba(10,18,30,0.94))] p-4 custom-scroll md:flex md:flex-col">
          <div className="mb-4 rounded-[1.75rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.22),_transparent_34%),linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(10,18,30,0.94))] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              {t.navigator}
            </p>
            <h2 className="mt-3 text-xl font-bold text-white">
              {bookLabel}
            </h2>
            <p className="mt-1 text-sm text-slate-400">{t.chapter} {chapter}</p>
          </div>

          <div className="app-surface rounded-[1.75rem] p-4">
            <div className="mb-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                {t.books}
              </p>
              <input
                type="text"
                value={bookQuery}
                onChange={(e) => setBookQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="mb-3 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-400/40"
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
                        ? "bg-gradient-to-br from-indigo-500 to-sky-500 text-white shadow-lg shadow-indigo-950/35"
                        : "border border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.07]"
                    }`}
                  >
                    {getBookNameFromEntry(b, settings.language)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                {t.chapters}
              </p>
              <div className="grid grid-cols-4 gap-2">
                {bookData?.chapters.map((ch) => (
                  <button
                    key={ch.chapter}
                    onClick={() => navigate(`/${decodedBook}/${ch.chapter}`)}
                    className={`rounded-xl py-2 text-sm font-medium transition ${
                      ch.chapter === chapter
                        ? "bg-gradient-to-br from-indigo-500 to-sky-500 text-white"
                        : "border border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.07]"
                    }`}
                  >
                    {ch.chapter}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
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
                    className="rounded-xl border border-white/10 bg-white/[0.03] py-2 text-sm text-slate-300 transition hover:bg-white/[0.07]"
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
          data-lenis-prevent
          className="app-shell relative flex-1 overflow-x-hidden overflow-y-auto p-4 pb-24 md:h-screen md:p-6 md:pb-32"
        >
          <div className="mx-auto max-w-5xl">
            <section className="mb-5 overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.2),_transparent_28%),linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(8,17,32,0.96))] px-5 py-6 shadow-2xl shadow-black/30 md:px-6">
                            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">
                      {t.reading}
                    </p>
                    <h1 className="mt-3 text-2xl font-bold text-white md:text-3xl">
                      {isBilingual ? `${getBookName(bookData, "ta")} / ${englishBookLabel}` : bookLabel}
                    </h1>
                    <p className="mt-2 text-sm text-slate-400">{t.chapter} {chapter}</p>
                  </div>
                  <button
                    onClick={() => toggleBookmark(chapterItem)}
                    className={`self-start rounded-2xl px-4 py-3 text-sm font-semibold transition md:self-auto ${
                      isBookmarked(libraryData, chapterItem.id)
                        ? "bg-white text-slate-950"
                        : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                    }`}
                  >
                    {t.chapterBookmark}
                  </button>
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
                />
              </div>
            </section>

            <div className="space-y-3">
              {chapterData?.verses.map((v) => {
                const verseItem = getVerseItem(v);
                const favorited = isFavorited(libraryData, verseItem.id);
                const highlighted = libraryData.highlights[verseItem.id];
                const note = libraryData.notes[verseItem.id];
                const prayer = libraryData.prayers[verseItem.id];
                const englishVerseText = isBilingual ? getEnglishVerseText(v.verse) : "";

                return (
                  <div
                    key={v.verse}
                    className="min-w-0 overflow-hidden rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,_rgba(30,41,59,0.88),_rgba(15,23,42,0.86))] p-4 transition hover:border-sky-400/25 hover:bg-slate-800 md:p-5"
                    style={{
                      lineHeight: settings.lineHeight || 1.8,
                      boxShadow: highlighted
                        ? `inset 3px 0 0 ${highlighted.color}`
                        : undefined,
                    }}
                  >
                    <button onClick={() => openVerse(v)} className="block min-w-0 w-full overflow-hidden text-left">
                      <div className="min-w-0">
                        <p className="text-base text-slate-100 md:text-lg">
                          <span className="mr-2 inline text-sm font-bold text-white md:text-base">
                            {v.verse}.
                          </span>
                          <span className="whitespace-normal break-words">{v.text}</span>
                        </p>
                        {englishVerseText ? (
                          <p className="mt-3 break-words text-sm leading-7 text-slate-300 md:text-base">
                            {englishVerseText}
                          </p>
                        ) : null}
                      </div>
                    </button>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => toggleFavorite(verseItem)}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                          favorited
                            ? "bg-rose-400 text-slate-950"
                            : "border border-white/10 bg-white/5 text-slate-200"
                        }`}
                      >
                        {t.favorite}
                      </button>
                      <button
                        onClick={() => handleHighlight(verseItem)}
                        className="rounded-full px-3 py-1.5 text-xs font-semibold text-white"
                        style={{
                          background: highlighted?.color || "rgba(255,255,255,0.06)",
                          border: highlighted ? "none" : "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        {t.highlight}
                      </button>
                      <button
                        onClick={() => handleNote(verseItem)}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                          note
                            ? "bg-amber-300 text-slate-950"
                            : "border border-white/10 bg-white/5 text-slate-200"
                        }`}
                      >
                        {t.note}
                      </button>
                      <button
                        onClick={() => handlePrayer(verseItem)}
                        className={`hidden rounded-full px-3 py-1.5 text-xs font-semibold md:inline-block ${
                          prayer
                            ? "bg-emerald-400 text-slate-950"
                            : "border border-white/10 bg-white/5 text-slate-200"
                        }`}
                      >
                        {settings.language === "en" ? "Prayer" : "ஜெபம்"}
                      </button>
                      <button
                        onClick={() => handleAddToSermon(verseItem)}
                        className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 md:inline-block"
                      >
                        {settings.language === "en" ? "Sermon" : "பிரசங்கம்"}
                      </button>
                      <button
                        onClick={() => openShareDesigner(v)}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200"
                      >
                        {t.share}
                      </button>
                    </div>

                    {note ? (
                      <p className="mt-3 break-words rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm leading-6 text-slate-300">
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

                        <div className="mb-6 mt-6 pr-16 sm:pr-0">
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
        </main>

        <div className="pointer-events-none fixed bottom-28 right-4 z-40 flex flex-col gap-3 md:bottom-6 md:right-6">
          <button
            onClick={() => toggleAutoScroll("up")}
            className={`pointer-events-auto h-12 w-12 rounded-full border text-xs font-bold tracking-[0.2em] shadow-lg backdrop-blur-md transition ${
              autoScrollDirection === "up"
                ? "border-sky-300 bg-sky-400 text-slate-950"
                : "border-white/10 bg-slate-900/80 text-white"
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
                ? "border-sky-300 bg-sky-400 text-slate-950"
                : "border-white/10 bg-slate-900/80 text-white"
            }`}
            aria-label="Auto scroll down"
            title="Auto scroll down"
          >
            DN
          </button>
        </div>
      </div>

      {selectedVerse ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm md:hidden">
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
                  ? gradients[settings.bgIndex]
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
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
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
                className="mt-4 break-words text-left text-slate-200"
                style={getMobilePopupVerseStyle(selectedEnglishVerseText)}
              >
                {selectedEnglishVerseText}
              </p>
            ) : null}

            <button
              type="button"
              onClick={() => openShareDesigner(selectedVerse)}
              className="mt-5 w-full rounded-2xl bg-[linear-gradient(135deg,#2563eb,#38bdf8)] px-4 py-3 text-sm font-semibold text-white shadow-lg"
            >
              {t.share}
            </button>
                </>
              );
            })()}
            </div>
          </div>
        </div>
      ) : null}

      {noteEditor ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/75 px-4 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close note editor"
            className="absolute inset-0"
            onClick={closeNoteEditor}
          />

          <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(244,114,182,0.18),_transparent_35%),linear-gradient(180deg,_rgba(28,20,29,0.98),_rgba(20,16,24,0.98))] p-5 shadow-2xl shadow-black/40 md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-pink-200/80">
                  {t.note}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-white">
                  {t.notePrompt}
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  {noteEditor.item.bookTamil} {noteEditor.item.chapter}:{noteEditor.item.verse}
                </p>
              </div>
              <button
                type="button"
                onClick={closeNoteEditor}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white transition hover:bg-white/10"
              >
                {t.close}
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
              className="mt-5 min-h-40 w-full rounded-[1.5rem] border border-pink-300/40 bg-black/20 px-4 py-4 text-sm leading-7 text-white outline-none placeholder:text-slate-500 focus:border-pink-300 focus:ring-2 focus:ring-pink-300/20"
              autoFocus
            />

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeNoteEditor}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={submitNoteEditor}
                className="rounded-2xl bg-[linear-gradient(135deg,#f0abfc,#f472b6)] px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-pink-950/30 transition hover:brightness-105"
              >
                {t.save}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {prayerEditor ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/75 px-4 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close prayer editor"
            className="absolute inset-0"
            onClick={closePrayerEditor}
          />

          <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_35%),linear-gradient(180deg,_rgba(14,25,22,0.98),_rgba(14,20,18,0.98))] p-5 shadow-2xl shadow-black/40 md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-200/80">
                  {settings.language === "en" ? "Prayer Journal" : "ஜெப குறிப்பேடு"}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-white">
                  {settings.language === "en" ? "Attach a prayer to this verse" : "இந்த வசனத்திற்கு ஒரு ஜெபத்தை இணைக்கவும்"}
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  {prayerEditor.item.bookTamil} {prayerEditor.item.chapter}:{prayerEditor.item.verse}
                </p>
              </div>
              <button
                type="button"
                onClick={closePrayerEditor}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white transition hover:bg-white/10"
              >
                {t.close}
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
              className="mt-5 min-h-40 w-full rounded-[1.5rem] border border-emerald-300/30 bg-black/20 px-4 py-4 text-sm leading-7 text-white outline-none placeholder:text-slate-500 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-300/20"
              autoFocus
            />

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closePrayerEditor}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={submitPrayerEditor}
                className="rounded-2xl bg-[linear-gradient(135deg,#34d399,#10b981)] px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg"
              >
                {t.save}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {highlightEditor ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/75 px-4 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close highlight editor"
            className="absolute inset-0"
            onClick={closeHighlightEditor}
          />

          <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_35%),linear-gradient(180deg,_rgba(15,23,42,0.98),_rgba(8,17,32,0.98))] p-5 shadow-2xl shadow-black/40 md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-200/80">
                  {t.highlight}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-white">
                  {settings.language === "en" ? "Choose color and folder" : "நிறமும் அடைவையும் தேர்வுசெய்க"}
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  {highlightEditor.item.bookTamil} {highlightEditor.item.chapter}:{highlightEditor.item.verse}
                </p>
              </div>
              <button
                type="button"
                onClick={closeHighlightEditor}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white transition hover:bg-white/10"
              >
                {t.close}
              </button>
            </div>

            <div className="mt-5">
              <p className="text-sm text-slate-300">Color</p>
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
              <p className="text-sm text-slate-300">Folder</p>
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
                        ? "bg-[linear-gradient(135deg,#2563eb,#38bdf8)] text-white"
                        : "border border-white/10 bg-white/5 text-slate-200"
                    }`}
                  >
                    {folder.label}
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
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
              >
                Remove
              </button>
              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={closeHighlightEditor}
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
                >
                  {t.cancel}
                </button>
                <button
                  type="button"
                  onClick={submitHighlightEditor}
                  className="rounded-2xl bg-[linear-gradient(135deg,#2563eb,#38bdf8)] px-5 py-3 text-sm font-semibold text-white shadow-lg"
                >
                  {t.save}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {shareDesigner ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/75 px-4 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close share designer"
            className="absolute inset-0"
            onClick={closeShareDesigner}
          />

          <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),_transparent_35%),linear-gradient(180deg,_rgba(15,23,42,0.98),_rgba(8,17,32,0.98))] p-5 shadow-2xl shadow-black/40 md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-indigo-200/80">
                  {settings.language === "en" ? "Verse Designer" : "வசன வடிவமைப்பான்"}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-white">
                  {settings.language === "en" ? "Share to family, WhatsApp, or Telegram" : "குடும்பத்தாருக்கு, WhatsApp அல்லது Telegram மூலம் பகிரவும்"}
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  {bookLabel} {chapter}:{shareDesigner.verse.verse}
                </p>
              </div>
              <button
                type="button"
                onClick={closeShareDesigner}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white transition hover:bg-white/10"
              >
                {t.close}
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <label className="block">
                <p className="mb-2 text-sm text-slate-300">Template</p>
                <select
                  value={shareDesigner.template}
                  onChange={(e) =>
                    setShareDesigner((current) =>
                      current
                        ? {
                            ...current,
                            template: e.target.value,
                          }
                        : current
                    )
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="classic">Classic</option>
                  <option value="social">Social</option>
                  <option value="minimal">Minimal</option>
                </select>
              </label>

              <label className="block">
                <p className="mb-2 text-sm text-slate-300">Font Size</p>
                <input
                  type="number"
                  min={30}
                  max={64}
                  value={shareDesigner.fontSize}
                  onChange={(e) =>
                    setShareDesigner((current) =>
                      current
                        ? {
                            ...current,
                            fontSize: Number(e.target.value) || 48,
                          }
                        : current
                    )
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
                />
              </label>

              <label className="block">
                <p className="mb-2 text-sm text-slate-300">Watermark</p>
                <input
                  type="text"
                  value={shareDesigner.watermark}
                  onChange={(e) =>
                    setShareDesigner((current) =>
                      current
                        ? {
                            ...current,
                            watermark: e.target.value,
                          }
                        : current
                    )
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
                />
              </label>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={async () => {
                  await shareVerseCard(shareDesigner.verse, "system");
                  closeShareDesigner();
                }}
                className="rounded-2xl bg-[linear-gradient(135deg,#2563eb,#38bdf8)] px-5 py-3 text-sm font-semibold text-white shadow-lg"
              >
                Share Image
              </button>
              <button
                type="button"
                onClick={async () => {
                  await shareVerseCard(shareDesigner.verse, "whatsapp");
                  closeShareDesigner();
                }}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white"
              >
                WhatsApp
              </button>
              <button
                type="button"
                onClick={async () => {
                  await shareVerseCard(shareDesigner.verse, "telegram");
                  closeShareDesigner();
                }}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white"
              >
                Telegram
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {chapterPickerOpen ? (
        <div className="fixed inset-0 z-[55] flex items-center justify-center bg-slate-950/75 px-4 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close chapter picker"
            className="absolute inset-0"
            onClick={closeChapterPicker}
          />

          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.2),_transparent_35%),linear-gradient(180deg,_rgba(15,23,42,0.98),_rgba(8,17,32,0.98))] p-5 shadow-2xl shadow-black/40 md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-200/80">
                  {t.chapters}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-white">
                  {bookLabel}
                </h3>
                <p className="mt-2 text-sm text-slate-400">
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

            <div className="mt-5 grid max-h-[55vh] grid-cols-4 gap-3 overflow-y-auto pr-1 custom-scroll sm:grid-cols-5">
              {bookData?.chapters.map((ch) => (
                <button
                  key={ch.chapter}
                  type="button"
                  onClick={() => {
                    closeChapterPicker();
                    navigate(`/${decodedBook}/${ch.chapter}`);
                  }}
                  className={`rounded-2xl py-3 text-sm font-semibold transition ${
                    ch.chapter === chapter
                      ? "bg-gradient-to-br from-indigo-500 to-sky-500 text-white"
                      : "border border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.07]"
                  }`}
                >
                  {ch.chapter}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

    </div>
  );
}
