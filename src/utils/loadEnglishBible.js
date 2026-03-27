const oldModules = import.meta.glob("../data/kjv/oldTestament/*.json", { eager: true });
const newModules = import.meta.glob("../data/kjv/newTestament/*.json", { eager: true });

const bible = {};

for (const path in oldModules) {
  const data = oldModules[path].default;
  if (!data.book?.english) continue;

  bible[data.book.english.trim()] = data;
}

for (const path in newModules) {
  const data = newModules[path].default;
  if (!data.book?.english) continue;

  bible[data.book.english.trim()] = data;
}

export default bible;
