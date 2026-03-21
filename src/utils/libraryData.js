import bible from "./loadBible";

const STORAGE_KEY = "appLibraryData";
const EVENT_NAME = "app-library-change";
const HIGHLIGHT_COLORS = ["#f59e0b", "#f472b6", "#38bdf8", "#34d399"];

export const defaultLibraryData = {
  bookmarks: [],
  favorites: [],
  highlights: {},
  notes: {},
  history: [],
};

const verseIndex = Object.values(bible).flatMap((bookData) =>
  bookData.chapters.flatMap((chapter) =>
    chapter.verses.map((verse) => ({
      bookEnglish: bookData.book.english,
      bookTamil: bookData.book.tamil,
      chapter: chapter.chapter,
      verse: verse.verse,
      text: verse.text,
    }))
  )
);

function emitChange(data) {
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: data }));
}

export function getLibraryData() {
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  return {
    ...defaultLibraryData,
    ...(stored || {}),
    highlights: { ...defaultLibraryData.highlights, ...(stored?.highlights || {}) },
    notes: { ...defaultLibraryData.notes, ...(stored?.notes || {}) },
    bookmarks: stored?.bookmarks || [],
    favorites: stored?.favorites || [],
    history: stored?.history || [],
  };
}

export function saveLibraryData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  emitChange(data);
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
    history: [entry, ...deduped].slice(0, 25),
  };
  saveLibraryData(next);
  return next;
}

export function getVerseOfTheDay() {
  const today = new Date();
  const key = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  let hash = 0;

  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) % verseIndex.length;
  }

  return verseIndex[hash];
}

export function getLibraryEventName() {
  return EVENT_NAME;
}
