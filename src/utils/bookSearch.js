import booksList from "../data/Books.json";

const independentVowels = {
  அ: "a",
  ஆ: "aa",
  இ: "i",
  ஈ: "ii",
  உ: "u",
  ஊ: "uu",
  எ: "e",
  ஏ: "ee",
  ஐ: "ai",
  ஒ: "o",
  ஓ: "oo",
  ஔ: "au",
};

const consonants = {
  க: "k",
  ங: "ng",
  ச: "ch",
  ஜ: "j",
  ஞ: "ny",
  ட: "t",
  ண: "n",
  த: "th",
  ந: "n",
  ப: "p",
  ம: "m",
  ய: "y",
  ர: "r",
  ல: "l",
  வ: "v",
  ழ: "zh",
  ள: "l",
  ற: "r",
  ன: "n",
  ஷ: "sh",
  ஸ: "s",
  ஹ: "h",
};

const vowelSigns = {
  "ா": "aa",
  "ி": "i",
  "ீ": "ii",
  "ு": "u",
  "ூ": "uu",
  "ெ": "e",
  "ே": "ee",
  "ை": "ai",
  "ொ": "o",
  "ோ": "oo",
  "ௌ": "au",
  "்": "",
};

export function tamilToTanglish(text = "") {
  let out = "";

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (independentVowels[char]) {
      out += independentVowels[char];
      continue;
    }

    if (consonants[char]) {
      if (next && next in vowelSigns) {
        out += consonants[char] + vowelSigns[next];
        i += 1;
      } else {
        out += `${consonants[char]}a`;
      }
      continue;
    }

    out += char;
  }

  return out;
}

export function normalizeRoman(text = "") {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s._-]+/g, "")
    .replace(/aa/g, "a")
    .replace(/ii/g, "i")
    .replace(/uu/g, "u")
    .replace(/ee/g, "e")
    .replace(/oo/g, "o")
    .replace(/zh/g, "l")
    .replace(/th/g, "t")
    .replace(/dh/g, "t")
    .replace(/bh/g, "b")
    .replace(/ph/g, "p")
    .replace(/sh/g, "s")
    .replace(/ch/g, "c")
    .replace(/j/g, "c")
    .replace(/[^a-z0-9]/g, "")
    .replace(/(.)\1+/g, "$1");
}

function splitNormalizedRomanWords(text = "") {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((part) => normalizeRoman(part))
    .filter(Boolean);
}

function containsTamil(text = "") {
  return /[\u0B80-\u0BFF]/.test(text);
}

function normalizeTamil(text = "") {
  return text
    .normalize("NFC")
    .trim()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'[\]\\|]/g, "")
    .replace(/\s+/g, " ");
}

export function consonantKey(text = "") {
  return normalizeRoman(text).replace(/[aeiou]/g, "");
}

export function matchTamilTextQuery(text, query) {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return true;

  const tamilQuery = containsTamil(trimmedQuery);
  const queryLower = trimmedQuery.toLowerCase();
  const queryTamil = normalizeTamil(trimmedQuery);
  const queryRoman = normalizeRoman(trimmedQuery);
  const queryConsonants = consonantKey(trimmedQuery);

  const terms = [
    text || "",
    tamilToTanglish(text || ""),
  ];

  return terms.some((term) => {
    const termLower = term.toLowerCase();
    const termTamil = normalizeTamil(term);
    const termRoman = normalizeRoman(term);
    const termConsonants = consonantKey(term);

    if (tamilQuery) {
      return termLower.includes(queryLower) || termTamil.includes(queryTamil);
    }

    if (queryRoman.length < 5) {
      return termLower.includes(queryLower) || termRoman.includes(queryRoman);
    }

    return (
      termLower.includes(queryLower) ||
      termRoman.includes(queryRoman) ||
      termConsonants.includes(queryConsonants)
    );
  });
}

function matchWordQuery(word, query) {
  const trimmedWord = (word || "").trim();
  const trimmedQuery = (query || "").trim();

  if (!trimmedWord || !trimmedQuery) return false;

  const tamilQuery = containsTamil(trimmedQuery);
  const wordLower = trimmedWord.toLowerCase();
  const queryLower = trimmedQuery.toLowerCase();
  const wordTamil = normalizeTamil(trimmedWord);
  const queryTamil = normalizeTamil(trimmedQuery);
  const wordRoman = normalizeRoman(trimmedWord);
  const queryRoman = normalizeRoman(trimmedQuery);
  const wordTanglishRoman = normalizeRoman(tamilToTanglish(trimmedWord));
  const queryConsonants = consonantKey(trimmedQuery);
  const wordConsonants = consonantKey(trimmedWord);
  const queryWords = splitNormalizedRomanWords(trimmedQuery);

  if (tamilQuery) {
    return wordLower.includes(queryLower) || wordTamil.includes(queryTamil);
  }

  if (queryWords.length === 1) {
    return (
      wordLower === queryLower ||
      wordRoman === queryRoman ||
      wordTanglishRoman === queryRoman
    );
  }

  if (queryWords.length > 1) {
    return queryWords.includes(wordRoman) || queryWords.includes(wordTanglishRoman);
  }

  return (
    wordLower.includes(queryLower) ||
    wordRoman.includes(queryRoman) ||
    wordTanglishRoman.includes(queryRoman) ||
    wordConsonants.includes(queryConsonants)
  );
}

export function getHighlightedTextParts(text, query) {
  if (!query.trim()) {
    return [{ text, match: false }];
  }

  return (text || "")
    .split(/(\s+)/)
    .filter(Boolean)
    .map((part) => ({
      text: part,
      match: /\s+/.test(part) ? false : matchWordQuery(part, query),
    }));
}

function buildBookTerms(book) {
  const tamil = (book.book.tamil || "").trim();
  const english = (book.book.english || "").trim();
  const tanglish = tamilToTanglish(tamil);

  return [
    tamil,
    english,
    tanglish,
    english.replace(/\s+/g, ""),
    tanglish.replace(/\s+/g, ""),
  ];
}

export function matchBookQuery(book, query) {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return true;

  const queryRoman = normalizeRoman(trimmedQuery);
  const queryConsonants = consonantKey(trimmedQuery);

  return buildBookTerms(book).some((term) => {
    const termRoman = normalizeRoman(term);
    const termConsonants = consonantKey(term);

    return (
      term.toLowerCase().includes(trimmedQuery.toLowerCase()) ||
      termRoman.includes(queryRoman) ||
      termConsonants.includes(queryConsonants)
    );
  });
}

export function findMatchingBooks(query) {
  if (!query.trim()) return [];
  return booksList.filter((book) => matchBookQuery(book, query));
}
