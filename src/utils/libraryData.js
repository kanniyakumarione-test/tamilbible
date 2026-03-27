import bible from "./loadBible";
import englishBible from "./loadEnglishBible";
import {
  getCachedRemoteSermon,
  pushPresentationSermonState,
} from "./presentationBackend";

const STORAGE_KEY = "appLibraryData";
const EVENT_NAME = "app-library-change";

export const HIGHLIGHT_COLORS = [
  "#f59e0b",
  "#f472b6",
  "#38bdf8",
  "#34d399",
  "#c084fc",
];

export const HIGHLIGHT_FOLDERS = [
  { value: "promise", label: "Promise" },
  { value: "prayer", label: "Prayer" },
  { value: "sermon", label: "Sermon" },
  { value: "memory", label: "Memory Verse" },
];

export const READING_PLAN_PRESETS = [
  { id: "30-days", label: "30 Days", days: 30 },
  { id: "90-days", label: "90 Days", days: 90 },
  { id: "1-year", label: "Bible in 1 Year", days: 365 },
];

const books = Object.values(bible);
const chapterIndex = books.flatMap((bookData) =>
  bookData.chapters.map((chapter) => ({
    id: `${bookData.book.english.trim()}::${chapter.chapter}`,
    bookEnglish: bookData.book.english.trim(),
    bookTamil: bookData.book.tamil,
    chapter: chapter.chapter,
    verses: chapter.verses.length,
  }))
);

const verseIndex = books.flatMap((bookData) =>
  bookData.chapters.flatMap((chapter) =>
    chapter.verses.map((verse) => ({
      id: `${bookData.book.english.trim()}::${chapter.chapter}::${verse.verse}`,
      bookEnglish: bookData.book.english.trim(),
      bookTamil: bookData.book.tamil,
      chapter: chapter.chapter,
      verse: verse.verse,
      text: verse.text,
    }))
  )
);

const englishVerseIndex = Object.values(englishBible).flatMap((bookData) =>
  bookData.chapters.flatMap((chapter) =>
    chapter.verses.map((verse) => ({
      id: `${bookData.book.english.trim()}::${chapter.chapter}::${verse.verse}`,
      bookEnglish: bookData.book.english.trim(),
      bookTamil: bookData.book.english.trim(),
      chapter: chapter.chapter,
      verse: verse.verse,
      text: verse.text,
    }))
  )
);

export const defaultLibraryData = {
  bookmarks: [],
  favorites: [],
  highlights: {},
  notes: {},
  prayers: {},
  history: [],
  readingPlans: {},
  sermon: {
    queue: [],
    activeItem: null,
    displayMode: "live",
    updatedAt: null,
  },
};

function emitChange(data) {
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: data }));
}

function normalizeLibraryData(stored) {
  const remoteSermon = getCachedRemoteSermon();
  const localSermon = {
    ...defaultLibraryData.sermon,
    ...(stored?.sermon || {}),
    queue: stored?.sermon?.queue || [],
  };
  const sermon =
    (remoteSermon?.updatedAt || 0) > (localSermon?.updatedAt || 0)
      ? {
          ...defaultLibraryData.sermon,
          ...remoteSermon,
          queue: remoteSermon?.queue || [],
        }
      : localSermon;

  return {
    ...defaultLibraryData,
    ...(stored || {}),
    highlights: { ...defaultLibraryData.highlights, ...(stored?.highlights || {}) },
    notes: { ...defaultLibraryData.notes, ...(stored?.notes || {}) },
    prayers: { ...defaultLibraryData.prayers, ...(stored?.prayers || {}) },
    readingPlans: { ...defaultLibraryData.readingPlans, ...(stored?.readingPlans || {}) },
    sermon,
    bookmarks: stored?.bookmarks || [],
    favorites: stored?.favorites || [],
    history: stored?.history || [],
  };
}

export function getLibraryData() {
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  return normalizeLibraryData(stored);
}

export function saveLibraryData(data) {
  const normalized = normalizeLibraryData(data);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  emitChange(normalized);
}

export function getVerseId(bookEnglish, chapter, verse) {
  return `${bookEnglish}::${chapter}::${verse}`;
}

export function getChapterId(bookEnglish, chapter) {
  return `${bookEnglish}::${chapter}`;
}

export function isBookmarked(data, id) {
  return data.bookmarks.some((item) => item.id === id);
}

export function isFavorited(data, id) {
  return data.favorites.some((item) => item.id === id);
}

function toggleInList(list, item) {
  return list.some((entry) => entry.id === item.id)
    ? list.filter((entry) => entry.id !== item.id)
    : [item, ...list];
}

export function toggleBookmark(item) {
  const data = getLibraryData();
  const next = {
    ...data,
    bookmarks: toggleInList(data.bookmarks, item),
  };
  saveLibraryData(next);
  return next;
}

export function toggleFavorite(item) {
  const data = getLibraryData();
  const next = {
    ...data,
    favorites: toggleInList(data.favorites, item),
  };
  saveLibraryData(next);
  return next;
}

export function cycleHighlight(item) {
  const data = getLibraryData();
  const current = data.highlights[item.id];
  const currentIndex = current ? HIGHLIGHT_COLORS.indexOf(current.color) : -1;
  const nextIndex = currentIndex + 1;
  const nextHighlights = { ...data.highlights };

  if (nextIndex >= HIGHLIGHT_COLORS.length) {
    delete nextHighlights[item.id];
  } else {
    nextHighlights[item.id] = {
      ...item,
      color: HIGHLIGHT_COLORS[nextIndex],
      folder: current?.folder || "promise",
      updatedAt: Date.now(),
    };
  }

  const next = {
    ...data,
    highlights: nextHighlights,
  };
  saveLibraryData(next);
  return next;
}

export function saveHighlight(item, options = {}) {
  const data = getLibraryData();
  const nextHighlights = { ...data.highlights };

  if (!options.color) {
    delete nextHighlights[item.id];
  } else {
    nextHighlights[item.id] = {
      ...item,
      color: options.color,
      folder: options.folder || "promise",
      updatedAt: Date.now(),
    };
  }

  const next = {
    ...data,
    highlights: nextHighlights,
  };
  saveLibraryData(next);
  return next;
}

export function saveNote(item, text) {
  const data = getLibraryData();
  const nextNotes = { ...data.notes };

  if (!text.trim()) {
    delete nextNotes[item.id];
  } else {
    nextNotes[item.id] = {
      ...item,
      text: text.trim(),
      updatedAt: Date.now(),
    };
  }

  const next = {
    ...data,
    notes: nextNotes,
  };
  saveLibraryData(next);
  return next;
}

export function savePrayer(item, text) {
  const data = getLibraryData();
  const nextPrayers = { ...data.prayers };

  if (!text.trim()) {
    delete nextPrayers[item.id];
  } else {
    nextPrayers[item.id] = {
      ...(nextPrayers[item.id] || item),
      ...item,
      text: text.trim(),
      answered: nextPrayers[item.id]?.answered || false,
      updatedAt: Date.now(),
    };
  }

  const next = {
    ...data,
    prayers: nextPrayers,
  };
  saveLibraryData(next);
  return next;
}

export function togglePrayerAnswered(itemId) {
  const data = getLibraryData();
  const prayer = data.prayers[itemId];

  if (!prayer) {
    return data;
  }

  const next = {
    ...data,
    prayers: {
      ...data.prayers,
      [itemId]: {
        ...prayer,
        answered: !prayer.answered,
        updatedAt: Date.now(),
      },
    },
  };

  saveLibraryData(next);
  return next;
}

export function recordHistory(item) {
  const data = getLibraryData();
  const entry = {
    ...item,
    viewedAt: Date.now(),
  };

  const deduped = data.history.filter(
    (historyItem) => !(historyItem.id === entry.id && historyItem.type === entry.type)
  );

  const next = {
    ...data,
    history: [entry, ...deduped].slice(0, 40),
  };
  saveLibraryData(next);
  return next;
}

export function getContinueReading(history = getLibraryData().history) {
  return history[0] || null;
}

function getDayKey(date = new Date()) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export function getReadingPlans() {
  return READING_PLAN_PRESETS.map((plan) => {
    const chaptersPerDay = Math.ceil(chapterIndex.length / plan.days);
    return {
      ...plan,
      chaptersPerDay,
      totalChapters: chapterIndex.length,
    };
  });
}

export function updateReadingPlanProgress(planId, chapterId) {
  const data = getLibraryData();
  const currentPlan = data.readingPlans[planId] || {
    completedChapterIds: [],
    completedDays: {},
    startedAt: Date.now(),
  };
  const completed = new Set(currentPlan.completedChapterIds || []);
  const dayKey = getDayKey();
  const alreadyCompleted = completed.has(chapterId);
  completed.add(chapterId);

  const next = {
    ...data,
    readingPlans: {
      ...data.readingPlans,
      [planId]: {
        ...currentPlan,
        completedChapterIds: Array.from(completed),
        completedDays: {
          ...(currentPlan.completedDays || {}),
          [dayKey]: alreadyCompleted
            ? (currentPlan.completedDays || {})[dayKey] || 0
            : ((currentPlan.completedDays || {})[dayKey] || 0) + 1,
        },
        updatedAt: Date.now(),
      },
    },
  };

  saveLibraryData(next);
  return next;
}

export function getReadingPlanSummary(data = getLibraryData()) {
  return getReadingPlans().map((plan) => {
    const progress = data.readingPlans[plan.id] || {
      completedChapterIds: [],
      completedDays: {},
    };
    const completedCount = (progress.completedChapterIds || []).length;
    const todayCount = (progress.completedDays || {})[getDayKey()] || 0;
    const percentage = Math.min(
      100,
      Math.round((completedCount / plan.totalChapters) * 100)
    );

    return {
      ...plan,
      completedCount,
      todayCount,
      percentage,
      remainingCount: Math.max(plan.totalChapters - completedCount, 0),
      nextChapters: chapterIndex.filter(
        (chapter) => !(progress.completedChapterIds || []).includes(chapter.id)
      ).slice(0, plan.chaptersPerDay),
    };
  });
}

export function setSermonQueue(queue, activeItem = null) {
  const data = getLibraryData();
  const next = {
    ...data,
    sermon: {
      ...data.sermon,
      queue,
      activeItem: activeItem || queue[0] || null,
      updatedAt: Date.now(),
    },
  };

  saveLibraryData(next);
  void pushPresentationSermonState(next.sermon);
  return next;
}

export function setActiveSermonItem(item) {
  const data = getLibraryData();
  const next = {
    ...data,
    sermon: {
      ...data.sermon,
      activeItem: item,
      updatedAt: Date.now(),
    },
  };

  saveLibraryData(next);
  void pushPresentationSermonState(next.sermon);
  return next;
}

export function setSermonDisplayMode(displayMode) {
  const data = getLibraryData();
  const next = {
    ...data,
    sermon: {
      ...data.sermon,
      displayMode,
      updatedAt: Date.now(),
    },
  };

  saveLibraryData(next);
  void pushPresentationSermonState(next.sermon);
  return next;
}

export function addSermonQueueItem(item) {
  const data = getLibraryData();
  const exists = data.sermon.queue.some((entry) => entry.id === item.id);
  const queue = exists ? data.sermon.queue : [item, ...data.sermon.queue];
  return setSermonQueue(queue, data.sermon.activeItem || item);
}

export function removeSermonQueueItem(itemId) {
  const data = getLibraryData();
  const queue = data.sermon.queue.filter((entry) => entry.id !== itemId);
  const activeItem =
    data.sermon.activeItem?.id === itemId ? queue[0] || null : data.sermon.activeItem;
  return setSermonQueue(queue, activeItem);
}

export function showNextSermonItem() {
  const data = getLibraryData();
  const queue = data.sermon.queue || [];

  if (!queue.length) {
    return data;
  }

  const currentId = data.sermon.activeItem?.id;
  const currentIndex = queue.findIndex((item) => item.id === currentId);
  const nextIndex = currentIndex >= 0 ? Math.min(currentIndex + 1, queue.length - 1) : 0;
  return setActiveSermonItem(queue[nextIndex]);
}

export function showPreviousSermonItem() {
  const data = getLibraryData();
  const queue = data.sermon.queue || [];

  if (!queue.length) {
    return data;
  }

  const currentId = data.sermon.activeItem?.id;
  const currentIndex = queue.findIndex((item) => item.id === currentId);
  const prevIndex = currentIndex >= 0 ? Math.max(currentIndex - 1, 0) : 0;
  return setActiveSermonItem(queue[prevIndex]);
}

export function getGroupedHighlights(data = getLibraryData()) {
  return HIGHLIGHT_FOLDERS.map((folder) => ({
    ...folder,
    items: Object.values(data.highlights)
      .filter((item) => (item.folder || "promise") === folder.value)
      .sort((left, right) => (right.updatedAt || 0) - (left.updatedAt || 0)),
  }));
}

export function getRecentPrayers(data = getLibraryData(), limit = 4) {
  return Object.values(data.prayers)
    .sort((left, right) => (right.updatedAt || 0) - (left.updatedAt || 0))
    .slice(0, limit);
}

export function getVerseOfTheDay(language = "ta") {
  const activeVerseIndex = language === "en" ? englishVerseIndex : verseIndex;
  const today = new Date();
  const key = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  let hash = 0;

  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) % activeVerseIndex.length;
  }

  return activeVerseIndex[hash];
}

export function getLibraryEventName() {
  return EVENT_NAME;
}
