import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import useLibraryData from "../hooks/useLibraryData";
import useAppSettings from "../hooks/useAppSettings";
import {
  addSermonQueueItem,
  clearSermonQueue,
  removeSermonQueueItem,
  setActiveSermonItem,
  setSermonDisplayMode,
  showNextSermonItem,
  showPreviousSermonItem,
} from "../utils/libraryData";
import {
  removeRemoteDevice,
  startRemotePresenceStream,
  syncRemoteDevicesFromBackend,
  upsertRemoteDevice,
} from "../utils/presentationRemotePresence";
import { getBookNameFromEntry } from "../utils/bibleContent";
import {
  getBookMetadata,
  getBookLabelFromMetadata,
  getBooksForTestament,
  loadBibleBook,
} from "../utils/bibleData";

function RemoteButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
        active
          ? "bg-white text-black shadow-lg"
          : "border border-white/10 bg-white/[0.04] text-slate-100"
      }`}
    >
      {children}
    </button>
  );
}

function NumberGridButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-14 items-center justify-center rounded-2xl border text-lg font-semibold transition ${
        active
          ? "border-zinc-500/40 bg-white text-black shadow-lg"
          : "border-white/10 bg-white/[0.03] text-stone-200"
      }`}
    >
      {children}
    </button>
  );
}

function PickerModal({ open, title, actionLabel, onClose, children }) {
  if (!open) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm">
      <div className="flex w-full max-w-2xl max-h-[85vh] flex-col rounded-[2rem] border border-white/10 bg-[#000000] shadow-2xl shadow-black/40">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-400">
              Picker
            </p>
            <h3 className="mt-2 text-lg font-bold text-white">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-stone-200 transition hover:bg-white/10"
          >
            {actionLabel || "Done"}
          </button>
        </div>
        <div data-lenis-prevent="true" className="flex-1 overflow-y-auto p-5 custom-scroll">{children}</div>
      </div>
    </div>,
    document.body
  );
}

export default function PresentationRemote() {
  const [settings] = useAppSettings();
  const libraryData = useLibraryData();
  const queue = libraryData.sermon.queue || [];
  const activeItem = libraryData.sermon.activeItem || queue[0] || null;
  const displayMode = libraryData.sermon.displayMode || "live";
  const oldBooks = getBooksForTestament("old");
  const newBooks = getBooksForTestament("new");
  const initialBook = activeItem?.bookEnglish || oldBooks[0]?.book.english?.trim() || "Genesis";
  const [selectedBook, setSelectedBook] = useState(initialBook);
  const initialTestament = useMemo(
    () => (getBookMetadata(initialBook)?.testament === "new" ? "new" : "old"),
    [initialBook]
  );
  const [selectedTestament, setSelectedTestament] = useState(initialTestament);
  const [pickerModal, setPickerModal] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [selectedBookData, setSelectedBookData] = useState(null);
  const [englishBookData, setEnglishBookData] = useState(null);
  const visibleBooks = selectedTestament === "new" ? newBooks : oldBooks;
  const chapterOptions = useMemo(
    () =>
      (selectedBookData?.chapters || []).map((chapterData) => ({
        value: String(chapterData.chapter),
        label: `Chapter ${chapterData.chapter}`,
      })),
    [selectedBookData]
  );
  const initialChapter =
    activeItem?.bookEnglish === selectedBook
      ? String(activeItem.chapter)
      : chapterOptions[0]?.value || "1";
  const [selectedChapter, setSelectedChapter] = useState(initialChapter);
  const remoteDeviceRef = useRef(null);
  const isPhone = /iphone|android.+mobile|mobile|phone/i.test(navigator.userAgent);
  const isTablet = /ipad|tablet|android(?!.*mobile)/i.test(navigator.userAgent);
  const platform = isPhone ? "Phone" : isTablet ? "Tablet" : "Desktop Browser";
  const remoteLabel = `${platform} Remote`;
  const selectedChapterData = useMemo(
    () =>
      selectedBookData?.chapters.find(
        (chapterData) => String(chapterData.chapter) === String(selectedChapter)
      ) || selectedBookData?.chapters?.[0],
    [selectedBookData, selectedChapter]
  );
  const selectedVerses = selectedChapterData?.verses || [];
  const selectedBookLabel = selectedBookData
    ? getBookNameFromEntry(selectedBookData, settings.language)
    : getBookLabelFromMetadata(selectedBook, settings.language) || selectedBook;

  const buildVerseItem = (verse) => ({
    id: `${selectedBook}::${selectedChapterData.chapter}::${verse.verse}`,
    type: "verse",
    bookEnglish: selectedBook,
    bookTamil: selectedBookLabel || selectedBook,
    chapter: selectedChapterData.chapter,
    verse: verse.verse,
    text: (() => {
      let t = verse.text;
      if (settings.language === "ta-en" && englishBookData && !t.includes('\n')) {
        const engCh = englishBookData?.chapters?.find(c => String(c.chapter) === String(selectedChapterData.chapter));
        const engV = engCh?.verses?.find(v => String(v.verse) === String(verse.verse));
        if (engV?.text) {
          t = `${t}\n${engV.text}`;
        }
      }
      return t;
    })(),
  });

  const handleShowVerse = (verse) => {
    const item = buildVerseItem(verse);
    addSermonQueueItem(item);
    setActiveSermonItem(item);
  };

  const handleSelectBook = (bookData) => {
    const bookEnglish = bookData.book.english.trim();
    setSelectedBook(bookEnglish);
    setSelectedChapter(String(bookData.chapters?.[0]?.chapter || 1));
    setPickerModal("chapter");
  };

  const handleSelectChapter = (chapterValue) => {
    setSelectedChapter(chapterValue);
    setPickerModal(null);
  };

  useEffect(() => {
    if (activeItem && activeItem.type === "verse") {
      if (activeItem.bookEnglish !== selectedBook) {
        setSelectedBook(activeItem.bookEnglish);
        setSelectedTestament(getBookMetadata(activeItem.bookEnglish)?.testament === "new" ? "new" : "old");
      }
      if (String(activeItem.chapter) !== String(selectedChapter)) {
        setSelectedChapter(String(activeItem.chapter));
      }
    }
  }, [activeItem?.id]); // Only trigger when activeItem ID changes

  const handleNextAction = () => {
    if (activeItem && activeItem.type === "verse" && activeItem.bookEnglish === selectedBook && String(activeItem.chapter) === String(selectedChapterData?.chapter)) {
      const currentIndex = selectedVerses.findIndex(v => String(v.verse) === String(activeItem.verse));
      if (currentIndex >= 0 && currentIndex < selectedVerses.length - 1) {
        handleShowVerse(selectedVerses[currentIndex + 1]);
        return;
      }
    }
    showNextSermonItem();
  };

  const handlePreviousAction = () => {
    if (activeItem && activeItem.type === "verse" && activeItem.bookEnglish === selectedBook && String(activeItem.chapter) === String(selectedChapterData?.chapter)) {
      const currentIndex = selectedVerses.findIndex(v => String(v.verse) === String(activeItem.verse));
      if (currentIndex > 0) {
        handleShowVerse(selectedVerses[currentIndex - 1]);
        return;
      }
    }
    showPreviousSermonItem();
  };

  useEffect(() => {
    let cancelled = false;

    void loadBibleBook(selectedBook, settings.language).then((bookData) => {
      if (cancelled) return;
      setSelectedBookData(bookData);
    });

    if (settings.language === "ta-en") {
      void loadBibleBook(selectedBook, "en").then((engData) => {
        if (cancelled) return;
        setEnglishBookData(engData);
      });
    } else {
      setEnglishBookData(null);
    }

    return () => {
      cancelled = true;
    };
  }, [selectedBook, settings.language]);

  useEffect(() => {
    startRemotePresenceStream();
    void syncRemoteDevicesFromBackend();

    let remoteDevice = remoteDeviceRef.current;

    if (!remoteDevice) {
      const storedId = sessionStorage.getItem("presentationRemoteDeviceId");
      const deviceId =
        storedId ||
        `remote-${window.crypto?.randomUUID?.() || `${Date.now()}-${performance.now()}`}`;

      if (!storedId) {
        sessionStorage.setItem("presentationRemoteDeviceId", deviceId);
      }

      remoteDevice = {
        id: deviceId,
        label: remoteLabel,
        platform,
        userAgent: navigator.userAgent,
      };
      remoteDeviceRef.current = remoteDevice;
    }

    upsertRemoteDevice(remoteDevice);

    const heartbeatId = window.setInterval(() => {
      upsertRemoteDevice(remoteDevice);
    }, 5000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        upsertRemoteDevice(remoteDevice);
      }
    };

    const handleBeforeUnload = () => {
      removeRemoteDevice(remoteDevice.id);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.clearInterval(heartbeatId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      removeRemoteDevice(remoteDevice.id);
    };
  }, [platform, remoteLabel]);

  return (
    <div className="app-shell app-page pb-6 pt-4 md:pt-6">
      <div className="app-page-inner">
        <section className="app-hero mb-6 overflow-hidden  px-5 py-8 md:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-stone-400">
            Phone Remote
          </p>
          <h1 className="mt-3 text-3xl font-bold text-white md:text-5xl">
            Live Presentation Remote
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-300 md:text-base">
            Use this page on your phone to switch the live verse, move the queue, and change the display mode instantly.
          </p>
          <div className="mt-5 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100">
            {remoteLabel} connected
          </div>
        </section>

        <section className="mb-6 app-surface rounded-[2rem] p-5">
          <div className="flex flex-wrap gap-3">
            <RemoteButton onClick={handlePreviousAction}>Previous</RemoteButton>
            <RemoteButton onClick={handleNextAction}>Next</RemoteButton>
            <RemoteButton active={displayMode === "live"} onClick={() => setSermonDisplayMode("live")}>
              Live
            </RemoteButton>
            <RemoteButton active={displayMode === "title"} onClick={() => setSermonDisplayMode("title")}>
              Title
            </RemoteButton>
            <RemoteButton active={displayMode === "logo"} onClick={() => setSermonDisplayMode("logo")}>
              Logo
            </RemoteButton>
            <RemoteButton active={displayMode === "announcement"} onClick={() => setSermonDisplayMode("announcement")}>
              Announcement
            </RemoteButton>
            <RemoteButton active={displayMode === "black"} onClick={() => setSermonDisplayMode("black")}>
              Black
            </RemoteButton>
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-400">
              Now Showing
            </p>
            {activeItem ? (
              <>
                <p className="mt-3 text-xl font-bold text-white">
                  {activeItem.bookTamil} {activeItem.chapter}:{activeItem.verse}
                </p>
                <p className="mt-3 text-sm leading-7 text-stone-300">{activeItem.text}</p>
              </>
            ) : (
              <p className="mt-3 text-sm text-stone-400">No active verse selected yet.</p>
            )}
          </div>
        </section>

        <section className="mb-6 app-surface rounded-[2rem] p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-400">
                Verse Picker
              </p>
              <h2 className="mt-2 text-xl font-bold text-white">Choose a verse fast</h2>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-stone-300">
              {selectedVerses.length}
            </span>
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-400">
                Current Selection
              </p>
              <button
                type="button"
                onClick={() => setPickerModal("book")}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-stone-200"
              >
                Change Book
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setPickerModal("book")}
                className="rounded-full bg-[#000000] px-4 py-2 text-sm font-semibold text-white shadow-lg"
              >
                {selectedBookLabel}
              </button>
              <button
                type="button"
                onClick={() => setPickerModal("chapter")}
                className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-100"
              >
                Chapter {selectedChapter}
              </button>
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-stone-300">
                {selectedVerses.length} verses
              </div>
            </div>
          </div>

          <div className="mt-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-stone-400">
              Select Verse to Project
            </p>
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-8">
              {selectedVerses.map((verse) => (
                <button
                  key={verse.verse}
                  type="button"
                  onClick={() => handleShowVerse(verse)}
                  className="flex h-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-sm font-semibold text-stone-200 transition hover:bg-white/[0.1] active:bg-white/20"
                >
                  {verse.verse}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="app-surface rounded-[2rem] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-400">
                Queue
              </p>
              <h2 className="mt-2 text-xl font-bold text-white">Tap to show live</h2>
            </div>
            <div className="flex items-center gap-2">
              {queue.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400"
                >
                  Clear All
                </button>
              )}
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-stone-300">
                {queue.length}
              </span>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {queue.length ? (
              queue.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-[1.5rem] border p-4 transition-all ${
                    item.id === activeItem?.id
                      ? "border-green-500/40 bg-green-900/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]"
                      : "border-white/10 bg-white/[0.03] opacity-60 hover:opacity-100"
                  }`}
                >
                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveSermonItem(item)}
                      className="text-left"
                    >
                      <p className="text-base font-semibold text-white">
                        {item.bookTamil} {item.chapter}:{item.verse}
                      </p>
                      <p className="mt-2 line-clamp-3 text-sm leading-7 text-stone-300">
                        {item.text}
                      </p>
                    </button>
                    <div className="flex flex-wrap gap-2">
                      {item.id === activeItem?.id ? (
                        <div className="flex items-center rounded-xl bg-green-500/20 border border-green-500/30 px-4 py-2 text-xs font-bold text-green-400">
                          <span className="mr-2 h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
                          LIVE NOW
                        </div>
                      ) : (
                        <RemoteButton onClick={() => setActiveSermonItem(item)}>Show</RemoteButton>
                      )}
                      <RemoteButton onClick={() => removeSermonQueueItem(item.id)}>Remove</RemoteButton>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-[1.4rem] border border-dashed border-white/10 px-4 py-5 text-sm text-stone-400">
                Add verses from the chapter screen using the `Sermon` button first.
              </p>
            )}
          </div>
        </section>
      </div>

      <PickerModal
        open={pickerModal === "book"}
        title="Choose Book"
        onClose={() => setPickerModal(null)}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-400">
          Testament
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              setSelectedTestament("old");
              if (!oldBooks.some((bookData) => bookData.book.english.trim() === selectedBook)) {
                const firstBook = oldBooks[0];
                if (firstBook) {
                  setSelectedBook(firstBook.book.english.trim());
                  setSelectedChapter(String(firstBook.chapters?.[0]?.chapter || 1));
                }
              }
            }}
            className={`rounded-[1.25rem] border px-4 py-4 text-left transition ${
              selectedTestament === "old"
                ? "border-orange-300/70  text-white shadow-xl shadow-indigo-950/30"
                : "border-white/10 bg-[#000000] text-slate-100"
            }`}
          >
            <span className="block text-sm font-semibold">Old Testament</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedTestament("new");
              if (!newBooks.some((bookData) => bookData.book.english.trim() === selectedBook)) {
                const firstBook = newBooks[0];
                if (firstBook) {
                  setSelectedBook(firstBook.book.english.trim());
                  setSelectedChapter(String(firstBook.chapters?.[0]?.chapter || 1));
                }
              }
            }}
            className={`rounded-[1.25rem] border px-4 py-4 text-left transition ${
              selectedTestament === "new"
                ? "border-cyan-300/70  text-white shadow-xl shadow-cyan-950/30"
                : "border-white/10 bg-[#000000] text-slate-100"
            }`}
          >
            <span className="block text-sm font-semibold">New Testament</span>
          </button>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-400">
            Books
          </p>
          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-stone-300">
            {visibleBooks.length}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {visibleBooks.map((bookData) => {
            const bookEnglish = bookData.book.english.trim();
            const isActive = selectedBook === bookEnglish;

            return (
              <button
                key={bookEnglish}
                type="button"
                onClick={() => handleSelectBook(bookData)}
                className={`rounded-2xl border px-4 py-3 text-left transition ${
                  isActive
                    ? "border-zinc-500/40 bg-white text-black shadow-lg"
                    : "border-white/10 bg-[#000000] text-slate-100"
                }`}
              >
                <span className="block text-sm font-semibold">
                  {getBookNameFromEntry(bookData, settings.language)}
                </span>
              </button>
            );
          })}
        </div>
      </PickerModal>

      <PickerModal
        open={pickerModal === "chapter"}
        title={`Choose Chapter - ${selectedBookLabel}`}
        onClose={() => setPickerModal(null)}
      >
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
          {chapterOptions.map((chapterOption) => (
            <NumberGridButton
              key={chapterOption.value}
              active={String(selectedChapter) === String(chapterOption.value)}
              onClick={() => handleSelectChapter(chapterOption.value)}
            >
              {chapterOption.value}
            </NumberGridButton>
          ))}
        </div>
      </PickerModal>



      {showClearConfirm && createPortal(
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[2rem] border border-white/10 bg-[#000000] p-6 shadow-2xl shadow-black/40 text-center">
            <h3 className="text-xl font-bold text-white mb-2">Clear Queue</h3>
            <p className="text-sm text-stone-300 mb-8">Are you sure you want to remove all other items from the live queue? The currently active item will remain.</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  clearSermonQueue();
                  setShowClearConfirm(false);
                }}
                className="flex-1 rounded-xl bg-red-500/20 px-4 py-3 text-sm font-semibold text-red-400 border border-red-500/30 transition hover:bg-red-500/30"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
