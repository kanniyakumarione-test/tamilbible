import booksList from "../data/Books.json";

const NEW_TESTAMENT_START_INDEX = 39;

const tamilModules = {
  ...import.meta.glob("../data/oldTestament/*.json"),
  ...import.meta.glob("../data/newTestament/*.json"),
};

const englishModules = {
  ...import.meta.glob("../data/kjv/oldTestament/*.json"),
  ...import.meta.glob("../data/kjv/newTestament/*.json"),
};

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

  if (!metadata) {
    return null;
  }

  const testamentFolder = metadata.testament === "new" ? "newTestament" : "oldTestament";

  if (language === "en") {
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
  const moduleLoader = modulePath ? moduleMaps[language]?.[modulePath] : null;

  if (!moduleLoader) {
    loadedBookCache.set(cacheKey, Promise.resolve(null));
    return null;
  }

  const promise = moduleLoader()
    .then((module) => module.default || module)
    .catch(() => null);

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
