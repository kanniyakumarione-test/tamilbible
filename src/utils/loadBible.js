const oldModules = import.meta.glob("../data/oldTestament/*.json", { eager: true });
const newModules = import.meta.glob("../data/newTestament/*.json", { eager: true });

const bible = {};

// Load Old Testament
for (const path in oldModules) {
  const data = oldModules[path].default;
  if (!data.book?.english) continue;

  bible[data.book.english.trim()] = data;
}

// Load New Testament
for (const path in newModules) {
  const data = newModules[path].default;
  if (!data.book?.english) continue;

  bible[data.book.english.trim()] = data;
}

export default bible;