import books from "../data/Books.json";

const modules = import.meta.glob("../data/oldTestament/*.json", { eager: true });

const map = {};

// store data in map
for (const path in modules) {
  const data = modules[path].default;

  if (!data.book?.english) continue;

  map[data.book.english.trim()] = data;
}

// ✅ sort using Books.json order
const oldBible = books
  .map((b) => map[b.book.english.trim()])
  .filter(Boolean); // remove undefined

export default oldBible;