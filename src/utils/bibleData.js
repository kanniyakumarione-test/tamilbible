import booksList from "../data/Books.json";

const NEW_TESTAMENT_START_INDEX = 39;

const tamilModules = {
  ...import.meta.glob("../data/oldTestament/*.json", { eager: true }),
  ...import.meta.glob("../data/newTestament/*.json", { eager: true }),
};

const englishModules = {
  ...import.meta.glob("../data/kjv/oldTestament/*.json", { eager: true }),
  ...import.meta.glob("../data/kjv/newTestament/*.json", { eager: true }),
};

console.log("TAMIL MODULES KEYS:", Object.keys(tamilModules));

const bookMetadataList = booksList.map((entry, index) => ({
  ...entry,
  book: {
    ...entry.book,
    english: entry.book.english.trim(),
    tamil: (entry.book.tamil || entry.book.english || "").trim(),
  },
  testament: index >= NEW_TESTAMENT_START_INDEX ? "new" : "old",
}));

const bookMetadataMap = new Map(
  bookMetadataList.map((entry) => [entry.book.english, entry])
);

const moduleMaps = {
  ta: tamilModules,
  en: englishModules,
};

const loadedBookCache = new Map();
const loadedCollectionCache = new Map();

function getModulePath(bookEnglish, language = "ta") {
  const metadata = bookMetadataMap.get(bookEnglish);
  
  // Normalize ta-en to ta for data fetching
  const langKey = language === "ta-en" ? "ta" : language;

  if (!metadata) {
    return null;
  }

  const testamentFolder = metadata.testament === "new" ? "newTestament" : "oldTestament";

  if (langKey === "en") {
    return `../data/kjv/${testamentFolder}/${bookEnglish}.json`;
  }

  return `../data/${testamentFolder}/${bookEnglish}.json`;
}

export function getBookMetadata(bookEnglish) {
  return bookMetadataMap.get(bookEnglish) || null;
}

export function getAllBookMetadata() {
  return bookMetadataList;
}

export function getBooksForTestament(testament = "all") {
  if (testament === "all") {
    return bookMetadataList;
  }

  return bookMetadataList.filter((entry) => entry.testament === testament);
}

export async function loadBibleBook(bookEnglish, language = "ta") {
  const cacheKey = `${language}:${bookEnglish}`;

  if (loadedBookCache.has(cacheKey)) {
    return loadedBookCache.get(cacheKey);
  }

  const modulePath = getModulePath(bookEnglish, language);
  
  // Normalize ta-en to ta for module fetching
  const langKey = language === "ta-en" ? "ta" : language;
  
  // Find the matching key flexibly since Vite may format paths differently (e.g., /src/data/... or ../data/...)
  const map = moduleMaps[langKey] || {};
  let moduleData = map[modulePath];
  
  if (!moduleData) {
    const targetSuffix = modulePath.replace("../data/", "");
    const matchingKey = Object.keys(map).find(key => key.endsWith(targetSuffix) || key.includes(targetSuffix));
    moduleData = matchingKey ? map[matchingKey] : null;
  }

  if (!moduleData) {
    loadedBookCache.set(cacheKey, Promise.resolve(null));
    return null;
  }

  // Resolve the module dynamically depending on whether Vite eagerly loaded it as an object or as a lazy function
  const promise = (async () => {
    try {
      let resolved = moduleData;
      
      // If it's a dynamic import function, call it
      if (typeof resolved === 'function') {
        resolved = await resolved();
      }
      
      // If it has a default export (typical for Vite JSON imports), use that
      return resolved.default || resolved;
    } catch (err) {
      console.error(`Failed to load bible book: ${bookEnglish}`, err);
      return null;
    }
  })();

  loadedBookCache.set(cacheKey, promise);
  return promise;
}

export async function loadBibleBooks(language = "ta", testament = "all") {
  const cacheKey = `${language}:${testament}`;

  if (loadedCollectionCache.has(cacheKey)) {
    return loadedCollectionCache.get(cacheKey);
  }

  const promise = Promise.all(
    getBooksForTestament(testament).map(async (entry) => {
      const bookData = await loadBibleBook(entry.book.english, language);
      return bookData;
    })
  ).then((books) => books.filter(Boolean));

  loadedCollectionCache.set(cacheKey, promise);
  return promise;
}

export async function loadBibleMap(language = "ta", testament = "all") {
  const books = await loadBibleBooks(language, testament);

  return books.reduce((map, bookData) => {
    const bookEnglish = bookData?.book?.english?.trim();

    if (bookEnglish) {
      map[bookEnglish] = bookData;
    }

    return map;
  }, {});
}

export function getBookLabelFromMetadata(bookEnglish, language = "ta") {
  const metadata = getBookMetadata(bookEnglish);

  if (!metadata?.book) {
    return bookEnglish || "";
  }

  return language === "en"
    ? metadata.book.english
    : metadata.book.tamil || metadata.book.english;
}

export { NEW_TESTAMENT_START_INDEX };
