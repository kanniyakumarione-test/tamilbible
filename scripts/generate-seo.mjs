import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, "public");
const dataDir = path.join(rootDir, "src", "data");

const siteUrl = (process.env.VITE_SITE_URL || "https://example.com").replace(/\/+$/, "");
const now = new Date().toISOString().split("T")[0];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function toAbsoluteUrl(pathname) {
  return `${siteUrl}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

const books = readJson(path.join(dataDir, "Books.json"));
const oldTestamentDir = path.join(dataDir, "oldTestament");
const newTestamentDir = path.join(dataDir, "newTestament");

const routes = new Set([
  "/",
  "/books",
  "/search",
  "/settings",
  "/advanced-presentation",
]);

for (const book of books) {
  const englishName = book.book.english.trim();
  const encodedBook = encodeURIComponent(englishName);
  routes.add(`/${encodedBook}`);
}

for (const directory of [oldTestamentDir, newTestamentDir]) {
  for (const fileName of fs.readdirSync(directory)) {
    if (!fileName.endsWith(".json")) {
      continue;
    }

    const filePath = path.join(directory, fileName);
    const bookData = readJson(filePath);
    const bookEnglish = bookData.book?.english?.trim();

    if (!bookEnglish || !Array.isArray(bookData.chapters)) {
      continue;
    }

    const encodedBook = encodeURIComponent(bookEnglish);

    for (const chapterData of bookData.chapters) {
      const chapter = chapterData.chapter;
      routes.add(`/${encodedBook}/${chapter}`);

      if (!Array.isArray(chapterData.verses)) {
        continue;
      }

      for (const verseData of chapterData.verses) {
        routes.add(`/reader/${encodedBook}/${chapter}/${verseData.verse}`);
      }
    }
  }
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...routes]
  .sort()
  .map(
    (route) => `  <url>
    <loc>${toAbsoluteUrl(route)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${route.startsWith("/reader/") ? "monthly" : "weekly"}</changefreq>
    <priority>${
      route === "/"
        ? "1.0"
        : route === "/books" || route === "/search"
        ? "0.9"
        : route.startsWith("/reader/")
        ? "0.7"
        : "0.8"
    }</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

const robots = `User-agent: *
Allow: /

Sitemap: ${toAbsoluteUrl("/sitemap.xml")}
`;

fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(path.join(publicDir, "sitemap.xml"), sitemap, "utf8");
fs.writeFileSync(path.join(publicDir, "robots.txt"), robots, "utf8");

console.log(`Generated sitemap.xml and robots.txt for ${siteUrl}`);
