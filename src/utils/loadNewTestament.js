import books from "../data/Books.json";

const modules = import.meta.glob("../data/newTestament/*.json", { eager: true });

const map = {};

for (const path in modules) {
  const data = modules[path].default;

  if (!data.book?.english) continue;

  map[data.book.english.trim()] = data;
}

// start from Matthew
let isNT = false;

const newBible = books
  .filter((b) => {
    if (b.book.english.trim() === "Matthew") {
      isNT = true;
    }
    return isNT;
  })
  .map((b) => map[b.book.english.trim()])
  .filter(Boolean);

export default newBible;