import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const booksPath = path.join(rootDir, "src", "data", "Books.json");
const tamilOldDir = path.join(rootDir, "src", "data", "oldTestament");
const tamilNewDir = path.join(rootDir, "src", "data", "newTestament");
const kjvSourceDir = path.join(rootDir, "temp", "Bible-kjv");
const kjvOldDir = path.join(rootDir, "src", "data", "kjv", "oldTestament");
const kjvNewDir = path.join(rootDir, "src", "data", "kjv", "newTestament");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 3)}\n`, "utf8");
}

function getKjvSourceFileName(bookEnglish) {
  if (bookEnglish === "Song of Songs") {
    return "SongofSolomon.json";
  }

  return `${bookEnglish.replace(/\s+/g, "")}.json`;
}

function importBook(fileName, testamentDir, bookMeta) {
  const sourceFileName = getKjvSourceFileName(bookMeta.book.english.trim());
  const sourcePath = path.join(kjvSourceDir, sourceFileName);

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Missing KJV source for ${bookMeta.book.english}: ${sourceFileName}`);
  }

  const sourceData = readJson(sourcePath);
  const targetData = {
    book: {
      english: bookMeta.book.english.trim(),
      tamil: (bookMeta.book.tamil || "").trim(),
    },
    count: String(sourceData.chapters?.length || 0),
    chapters: Array.isArray(sourceData.chapters)
      ? sourceData.chapters.map((chapter) => ({
          chapter: String(chapter.chapter),
          verses: Array.isArray(chapter.verses)
            ? chapter.verses.map((verse) => ({
                verse: String(verse.verse),
                text: verse.text,
              }))
            : [],
        }))
      : [],
  };

  writeJson(path.join(testamentDir, fileName), targetData);
}

const books = readJson(booksPath);
const tamilBookMeta = new Map(
  books.map((entry) => [entry.book.english.trim(), entry])
);

for (const [sourceDir, targetDir] of [
  [tamilOldDir, kjvOldDir],
  [tamilNewDir, kjvNewDir],
]) {
  fs.mkdirSync(targetDir, { recursive: true });

  for (const fileName of fs.readdirSync(sourceDir)) {
    if (!fileName.endsWith(".json")) {
      continue;
    }

    const tamilData = readJson(path.join(sourceDir, fileName));
    const bookEnglish = tamilData.book?.english?.trim();
    const bookMeta = tamilBookMeta.get(bookEnglish);

    if (!bookEnglish || !bookMeta) {
      throw new Error(`Missing Tamil book metadata for ${fileName}`);
    }

    importBook(fileName, targetDir, bookMeta);
  }
}

console.log("Imported KJV dataset into src/data/kjv");
