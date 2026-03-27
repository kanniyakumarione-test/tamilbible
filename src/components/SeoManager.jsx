import { useEffect, useMemo } from "react";
import { matchPath, useLocation } from "react-router-dom";

import bible from "../utils/loadBible";
import useAppSettings from "../hooks/useAppSettings";
import { getUIText } from "../utils/uiText";
import { toAbsoluteUrl } from "../utils/siteUrl";

function upsertMeta(selector, attributes) {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
}

function upsertLink(selector, attributes) {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement("link");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
}

function upsertJsonLd(id, payload) {
  let element = document.head.querySelector(`#${id}`);

  if (!element) {
    element = document.createElement("script");
    element.type = "application/ld+json";
    element.id = id;
    document.head.appendChild(element);
  }

  element.textContent = JSON.stringify(payload);
}

function normalizeText(value) {
  return value?.replace(/\s+/g, " ").trim() || "";
}

export default function SeoManager() {
  const location = useLocation();
  const [settings] = useAppSettings();
  const t = getUIText(settings.language);

  const seo = useMemo(() => {
    const pathname = location.pathname;
    const defaultImage = toAbsoluteUrl("/icon-512.png");
    const breadcrumbItems = [
      {
        "@type": "ListItem",
        position: 1,
        name: t.home,
        item: toAbsoluteUrl("/"),
      },
    ];

    let title = "Tamil Bible Premium";
    let description =
      "Tamil Bible reading app with books, chapters, verses, Tanglish search, and mobile-friendly reading tools.";
    let type = "website";
    let canonicalUrl = toAbsoluteUrl(pathname);
    let robots = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

    const bookMatch = matchPath("/:book", pathname);
    const chapterMatch = matchPath("/:book/:chapter", pathname);
    const readerMatch = matchPath("/reader/:book/:chapter/:verse", pathname);

    if (pathname === "/") {
      title = "Tamil Bible Premium | Tamil Bible Reading App";
      description =
        "Read the Tamil Bible with chapter navigation, verse popups, Tanglish search, bookmarks, notes, and mobile-friendly reading.";
    } else if (pathname === "/books") {
      title = `${t.books} | Tamil Bible Premium`;
      description =
        "Browse Tamil Bible books, choose Old Testament or New Testament, and open chapters quickly.";
      breadcrumbItems.push({
        "@type": "ListItem",
        position: 2,
        name: t.books,
        item: canonicalUrl,
      });
    } else if (pathname === "/search") {
      title = `${t.search} | Tamil Bible Premium`;
      description =
        "Search Tamil Bible books and verses using Tamil, English, or Tanglish spellings.";
      robots = "noindex, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
      breadcrumbItems.push({
        "@type": "ListItem",
        position: 2,
        name: t.search,
        item: canonicalUrl,
      });
    } else if (pathname === "/settings") {
      title = `${t.settings} | Tamil Bible Premium`;
      description =
        "Adjust Tamil Bible reading settings like font size, spacing, background, and layout for mobile and desktop.";
      robots = "noindex, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
      breadcrumbItems.push({
        "@type": "ListItem",
        position: 2,
        name: t.settings,
        item: canonicalUrl,
      });
    } else if (pathname === "/advanced-presentation") {
      title = `${t.advancedPresentation} | Tamil Bible Premium`;
      description =
        "Configure advanced Tamil Bible presentation settings for church display, stage view, and screen layouts.";
      robots = "noindex, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
      breadcrumbItems.push({
        "@type": "ListItem",
        position: 2,
        name: t.advancedPresentation,
        item: canonicalUrl,
      });
    }

    if (readerMatch?.params) {
      const bookEnglish = decodeURIComponent(readerMatch.params.book);
      const chapter = readerMatch.params.chapter;
      const verse = readerMatch.params.verse;
      const bookData = bible[bookEnglish];
      const chapterData = bookData?.chapters.find((item) => item.chapter === chapter);
      const verseData = chapterData?.verses.find((item) => item.verse === verse);
      const bookTamil = normalizeText(bookData?.book?.tamil || bookEnglish);
      const verseText = normalizeText(verseData?.text);

      title = `${bookTamil} ${chapter}:${verse} | Tamil Bible Premium`;
      description = verseText
        ? `${bookTamil} ${chapter}:${verse} - ${verseText.slice(0, 150)}`
        : `Read ${bookTamil} ${chapter}:${verse} in the Tamil Bible.`;
      type = "article";
      canonicalUrl = toAbsoluteUrl(`/${encodeURIComponent(bookEnglish)}/${chapter}`);
      robots = "noindex, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
      breadcrumbItems.push(
        {
          "@type": "ListItem",
          position: 2,
          name: bookTamil,
          item: toAbsoluteUrl(`/${encodeURIComponent(bookEnglish)}`),
        },
        {
          "@type": "ListItem",
          position: 3,
          name: `${bookTamil} ${chapter}`,
          item: toAbsoluteUrl(`/${encodeURIComponent(bookEnglish)}/${chapter}`),
        },
        {
          "@type": "ListItem",
          position: 4,
          name: `${bookTamil} ${chapter}:${verse}`,
          item: toAbsoluteUrl(pathname),
        }
      );
    } else if (chapterMatch?.params) {
      const bookEnglish = decodeURIComponent(chapterMatch.params.book);
      const chapter = chapterMatch.params.chapter;
      const bookData = bible[bookEnglish];
      const chapterData = bookData?.chapters.find((item) => item.chapter === chapter);
      const bookTamil = normalizeText(bookData?.book?.tamil || bookEnglish);
      const verseCount = chapterData?.verses?.length || 0;

      title = `${bookTamil} ${chapter} | Tamil Bible Premium`;
      description = verseCount
        ? `Read ${bookTamil} chapter ${chapter} with ${verseCount} verses in the Tamil Bible.`
        : `Read ${bookTamil} chapter ${chapter} in the Tamil Bible.`;
      type = "article";
      breadcrumbItems.push(
        {
          "@type": "ListItem",
          position: 2,
          name: bookTamil,
          item: toAbsoluteUrl(`/${encodeURIComponent(bookEnglish)}`),
        },
        {
          "@type": "ListItem",
          position: 3,
          name: `${bookTamil} ${chapter}`,
          item: canonicalUrl,
        }
      );
    } else if (bookMatch?.params) {
      const bookEnglish = decodeURIComponent(bookMatch.params.book);
      const bookData = bible[bookEnglish];
      const bookTamil = normalizeText(bookData?.book?.tamil || bookEnglish);
      const chapterCount = bookData?.chapters?.length || 0;

      title = `${bookTamil} | Tamil Bible Premium`;
      description = chapterCount
        ? `Browse ${bookTamil} in the Tamil Bible with ${chapterCount} chapters.`
        : `Browse ${bookTamil} in the Tamil Bible.`;
      breadcrumbItems.push({
        "@type": "ListItem",
        position: 2,
        name: bookTamil,
        item: canonicalUrl,
      });
    } else if (
      pathname.startsWith("/presentation/") ||
      pathname === "/presentation-remote" ||
      pathname === "/sermon-mode" ||
      pathname === "/sermon-control"
    ) {
      robots = "noindex, nofollow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
    }

    return {
      title,
      description,
      type,
      absoluteUrl: toAbsoluteUrl(pathname),
      canonicalUrl,
      robots,
      defaultImage,
      breadcrumbItems,
    };
  }, [location.pathname, settings.language, t]);

  useEffect(() => {
    document.documentElement.lang = settings.language === "ta" ? "ta" : "en";
    document.title = seo.title;

    upsertMeta('meta[name="description"]', {
      name: "description",
      content: seo.description,
    });
    upsertMeta('meta[name="robots"]', {
      name: "robots",
      content: seo.robots,
    });
    upsertMeta('meta[property="og:title"]', {
      property: "og:title",
      content: seo.title,
    });
    upsertMeta('meta[property="og:description"]', {
      property: "og:description",
      content: seo.description,
    });
    upsertMeta('meta[property="og:type"]', {
      property: "og:type",
      content: seo.type,
    });
    upsertMeta('meta[property="og:url"]', {
      property: "og:url",
      content: seo.absoluteUrl,
    });
    upsertMeta('meta[property="og:image"]', {
      property: "og:image",
      content: seo.defaultImage,
    });
    upsertMeta('meta[property="og:site_name"]', {
      property: "og:site_name",
      content: "Tamil Bible Premium",
    });
    upsertMeta('meta[name="twitter:card"]', {
      name: "twitter:card",
      content: "summary_large_image",
    });
    upsertMeta('meta[name="twitter:title"]', {
      name: "twitter:title",
      content: seo.title,
    });
    upsertMeta('meta[name="twitter:description"]', {
      name: "twitter:description",
      content: seo.description,
    });
    upsertMeta('meta[name="twitter:image"]', {
      name: "twitter:image",
      content: seo.defaultImage,
    });

    upsertLink('link[rel="canonical"]', {
      rel: "canonical",
      href: seo.canonicalUrl,
    });

    upsertJsonLd("seo-website-schema", {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Tamil Bible Premium",
      url: toAbsoluteUrl("/"),
      inLanguage: ["ta", "en"],
      potentialAction: {
        "@type": "SearchAction",
        target: `${toAbsoluteUrl("/search")}?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    });

    upsertJsonLd("seo-breadcrumb-schema", {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: seo.breadcrumbItems,
    });
  }, [seo, settings.language]);

  return null;
}
