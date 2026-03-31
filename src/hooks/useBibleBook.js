import { useEffect, useState } from "react";

import { loadBibleBook } from "../utils/bibleData";

export default function useBibleBook(bookEnglish, language = "ta") {
  const [bookData, setBookData] = useState(null);
  const [loading, setLoading] = useState(Boolean(bookEnglish));

  useEffect(() => {
    let cancelled = false;

    if (!bookEnglish) {
      setBookData(null);
      setLoading(false);
      return undefined;
    }

    setLoading(true);

    void loadBibleBook(bookEnglish, language).then((nextBookData) => {
      if (cancelled) {
        return;
      }

      setBookData(nextBookData);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [bookEnglish, language]);

  return { bookData, loading };
}
