import tamilBible from "./loadBible";
import englishBible from "./loadEnglishBible";

export function isBilingualLanguage(language = "ta") {
  return language === "ta-en";
}

export function isEnglishLanguage(language = "ta") {
  return language === "en";
}

export function getBibleByLanguage(language = "ta") {
  return isEnglishLanguage(language) ? englishBible : tamilBible;
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

export function getVerseData(bookEnglish, chapter, verse, language = "ta") {
  const bible = getBibleByLanguage(language);
  const bookData = bible[bookEnglish];
  const chapterData = bookData?.chapters.find((item) => String(item.chapter) === String(chapter));
  const verseData = chapterData?.verses.find((item) => String(item.verse) === String(verse));

  return { bookData, chapterData, verseData };
}

export function localizeChapterItem(item, language = "ta") {
  if (!item?.bookEnglish) {
    return item;
  }

  const bookData = getBibleByLanguage(language)[item.bookEnglish];

  return {
    ...item,
    bookTamil: getBookName(bookData, language) || item.bookTamil || item.bookEnglish,
  };
}

export function localizeVerseItem(item, language = "ta") {
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

  return {
    tamilBookData: tamil.bookData,
    tamilChapterData: tamil.chapterData,
    tamilVerseData: tamil.verseData,
    englishBookData: english.bookData,
    englishChapterData: english.chapterData,
    englishVerseData: english.verseData,
  };
}
