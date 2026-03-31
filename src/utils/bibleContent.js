import {
  getBookLabelFromMetadata,
  loadBibleBook,
} from "./bibleData";

export function isBilingualLanguage(language = "ta") {
  return language === "ta-en";
}

export function isEnglishLanguage(language = "ta") {
  return language === "en";
}

export function getBibleByLanguage(language = "ta") {
  return {};
}

export function getBookName(bookData, language = "ta") {
  if (!bookData?.book) {
    return "";
  }

  return isEnglishLanguage(language)
    ? (bookData.book.english || "").trim()
    : (bookData.book.tamil || bookData.book.english || "").trim();
}

export function getBookNameFromEntry(bookEntry, language = "ta") {
  if (!bookEntry?.book) {
    return "";
  }

  return isEnglishLanguage(language)
    ? (bookEntry.book.english || "").trim()
    : (bookEntry.book.tamil || bookEntry.book.english || "").trim();
}

export async function getVerseData(bookEnglish, chapter, verse, language = "ta") {
  const bookData = await loadBibleBook(bookEnglish, language);
  const chapterData = bookData?.chapters.find((item) => String(item.chapter) === String(chapter));
  const verseData = chapterData?.verses.find((item) => String(item.verse) === String(verse));

  return { bookData, chapterData, verseData };
}

export async function localizeChapterItem(item, language = "ta") {
  if (!item?.bookEnglish) {
    return item;
  }

  const bookData = await loadBibleBook(item.bookEnglish, language);

  return {
    ...item,
    bookTamil:
      getBookName(bookData, language) ||
      getBookLabelFromMetadata(item.bookEnglish, language) ||
      item.bookTamil ||
      item.bookEnglish,
  };
}

export async function localizeVerseItem(item, language = "ta") {
  if (!item?.bookEnglish || !item?.verse) {
    return localizeChapterItem(item, language);
  }

  const { bookData, verseData } = getVerseData(item.bookEnglish, item.chapter, item.verse, language);

  return {
    ...item,
    bookTamil: getBookName(bookData, language) || item.bookTamil || item.bookEnglish,
    text: verseData?.text || item.text,
  };
}

export function getParallelVerseData(bookEnglish, chapter, verse) {
  const tamil = getVerseData(bookEnglish, chapter, verse, "ta");
  const english = getVerseData(bookEnglish, chapter, verse, "en");

  return Promise.all([tamil, english]).then(([tamilData, englishData]) => ({
    tamilBookData: tamilData.bookData,
    tamilChapterData: tamilData.chapterData,
    tamilVerseData: tamilData.verseData,
    englishBookData: englishData.bookData,
    englishChapterData: englishData.chapterData,
    englishVerseData: englishData.verseData,
  }));
}
