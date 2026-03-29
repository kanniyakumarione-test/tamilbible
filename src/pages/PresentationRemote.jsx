import { useEffect, useMemo, useRef, useState } from "react";
import bible from "../utils/loadBible";
import oldBible from "../utils/loadOldTestament";
import newBible from "../utils/loadNewTestament";
import useLibraryData from "../hooks/useLibraryData";
import useAppSettings from "../hooks/useAppSettings";
import {
  addSermonQueueItem,
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

function RemoteButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
        active
          ? "bg-[linear-gradient(135deg,#2563eb,#38bdf8)] text-white shadow-lg"
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
          ? "border-sky-300/40 bg-[linear-gradient(135deg,#4f46e5,#38bdf8)] text-white shadow-lg"
          : "border-white/10 bg-white/[0.03] text-slate-200"
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

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/70 p-3 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,_rgba(15,23,42,0.98),_rgba(8,17,32,0.98))] shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
              Picker
            </p>
            <h3 className="mt-2 text-lg font-bold text-white">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200"
          >
            {actionLabel || "Done"}
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

export default function PresentationRemote() {
  const [settings] = useAppSettings();
  const libraryData = useLibraryData();
  const queue = libraryData.sermon.queue || [];
  const activeItem = libraryData.sermon.activeItem || queue[0] || null;
  const displayMode = libraryData.sermon.displayMode || "live";
  const initialBook = activeItem?.bookEnglish || oldBible[0]?.book.english?.trim() || "Genesis";
  const [selectedBook, setSelectedBook] = useState(initialBook);
  const initialTestament = useMemo(
    () => (newBible.some((bookData) => bookData.book.english.trim() === initialBook) ? "new" : "old"),
    [initialBook]
  );
  const [selectedTestament, setSelectedTestament] = useState(initialTestament);
  const [pickerModal, setPickerModal] = useState(null);
  const selectedBookData = bible[selectedBook] || Object.values(bible)[0];
  const visibleBooks = selectedTestament === "new" ? newBible : oldBible;
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
    : selectedBook;

  const buildVerseItem = (verse) => ({
    id: `${selectedBook}::${selectedChapterData.chapter}::${verse.verse}`,
    type: "verse",
    bookEnglish: selectedBook,
    bookTamil: selectedBookData?.book.tamil || selectedBook,
    chapter: selectedChapterData.chapter,
    verse: verse.verse,
    text: verse.text,
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
    setPickerModal("verse");
  };

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
    <div className="app-shell app-page min-h-screen pb-24 pt-4 md:pt-6">
      <div className="app-page-inner">
        <section className="app-hero mb-6 overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.2),_transparent_28%),linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(8,17,32,0.96))] px-5 py-8 md:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-slate-400">
            Phone Remote
          </p>
          <h1 className="mt-3 text-3xl font-bold text-white md:text-5xl">
            Live Presentation Remote
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
            Use this page on your phone to switch the live verse, move the queue, and change the display mode instantly.
          </p>
          <div className="mt-5 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100">
            {remoteLabel} connected
          </div>
        </section>

        <section className="mb-6 app-surface rounded-[2rem] p-5">
          <div className="flex flex-wrap gap-3">
            <RemoteButton onClick={() => showPreviousSermonItem()}>Previous</RemoteButton>
            <RemoteButton onClick={() => showNextSermonItem()}>Next</RemoteButton>
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
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
              Now Showing
            </p>
            {activeItem ? (
              <>
                <p className="mt-3 text-xl font-bold text-white">
                  {activeItem.bookTamil} {activeItem.chapter}:{activeItem.verse}
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-300">{activeItem.text}</p>
              </>
            ) : (
              <p className="mt-3 text-sm text-slate-400">No active verse selected yet.</p>
            )}
          </div>
        </section>

        <section className="mb-6 app-surface rounded-[2rem] p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                Verse Picker
              </p>
              <h2 className="mt-2 text-xl font-bold text-white">Choose a verse fast</h2>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300">
              {selectedVerses.length}
            </span>
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                Current Selection
              </p>
              <button
                type="button"
                onClick={() => setPickerModal("book")}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200"
              >
                Change Book
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setPickerModal("book")}
                className="rounded-full bg-[linear-gradient(135deg,#4f46e5,#38bdf8)] px-4 py-2 text-sm font-semibold text-white shadow-lg"
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
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-300">
                {selectedVerses.length} verses
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <RemoteButton onClick={() => setPickerModal("book")}>Book</RemoteButton>
            <RemoteButton onClick={() => setPickerModal("chapter")}>Chapter</RemoteButton>
            <RemoteButton onClick={() => setPickerModal("verse")}>Verse</RemoteButton>
          </div>
        </section>

        <section className="app-surface rounded-[2rem] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                Queue
              </p>
              <h2 className="mt-2 text-xl font-bold text-white">Tap to show live</h2>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300">
              {queue.length}
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {queue.length ? (
              queue.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-[1.5rem] border p-4 ${
                    item.id === activeItem?.id
                      ? "border-sky-400/40 bg-sky-400/10"
                      : "border-white/10 bg-white/[0.03]"
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
                      <p className="mt-2 line-clamp-3 text-sm leading-7 text-slate-300">
                        {item.text}
                      </p>
                    </button>
                    <div className="flex flex-wrap gap-2">
                      <RemoteButton onClick={() => setActiveSermonItem(item)}>Show</RemoteButton>
                      <RemoteButton onClick={() => removeSermonQueueItem(item.id)}>Remove</RemoteButton>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-[1.4rem] border border-dashed border-white/10 px-4 py-5 text-sm text-slate-400">
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
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          Testament
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              setSelectedTestament("old");
              if (!oldBible.some((bookData) => bookData.book.english.trim() === selectedBook)) {
                const firstBook = oldBible[0];
                if (firstBook) {
                  setSelectedBook(firstBook.book.english.trim());
                  setSelectedChapter(String(firstBook.chapters?.[0]?.chapter || 1));
                }
              }
            }}
            className={`rounded-[1.25rem] border px-4 py-4 text-left transition ${
              selectedTestament === "old"
                ? "border-indigo-300/70 bg-[radial-gradient(circle_at_top_left,_rgba(129,140,248,0.45),_transparent_45%),linear-gradient(180deg,_rgba(79,70,229,0.7),_rgba(30,41,59,0.92))] text-white shadow-xl shadow-indigo-950/30"
                : "border-white/10 bg-[linear-gradient(180deg,_rgba(15,23,42,0.92),_rgba(15,23,42,0.74))] text-slate-100"
            }`}
          >
            <span className="block text-sm font-semibold">Old Testament</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedTestament("new");
              if (!newBible.some((bookData) => bookData.book.english.trim() === selectedBook)) {
                const firstBook = newBible[0];
                if (firstBook) {
                  setSelectedBook(firstBook.book.english.trim());
                  setSelectedChapter(String(firstBook.chapters?.[0]?.chapter || 1));
                }
              }
            }}
            className={`rounded-[1.25rem] border px-4 py-4 text-left transition ${
              selectedTestament === "new"
                ? "border-cyan-300/70 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.38),_transparent_45%),linear-gradient(180deg,_rgba(8,145,178,0.58),_rgba(15,23,42,0.92))] text-white shadow-xl shadow-cyan-950/30"
                : "border-white/10 bg-[linear-gradient(180deg,_rgba(15,23,42,0.92),_rgba(15,23,42,0.74))] text-slate-100"
            }`}
          >
            <span className="block text-sm font-semibold">New Testament</span>
          </button>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            Books
          </p>
          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300">
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
                    ? "border-sky-300/40 bg-[linear-gradient(135deg,#4f46e5,#38bdf8)] text-white shadow-lg"
                    : "border-white/10 bg-[linear-gradient(180deg,_rgba(30,41,59,0.92),_rgba(15,23,42,0.86))] text-slate-100"
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

      <PickerModal
        open={pickerModal === "verse"}
        title={`Choose Verse - ${selectedBookLabel} ${selectedChapter}`}
        onClose={() => setPickerModal(null)}
      >
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
          {selectedVerses.map((verse) => {
            const item = buildVerseItem(verse);
            const isActive = item.id === activeItem?.id;

            return (
              <NumberGridButton
                key={verse.verse}
                active={isActive}
                onClick={() => {
                  handleShowVerse(verse);
                  setPickerModal(null);
                }}
              >
                {item.verse}
              </NumberGridButton>
            );
          })}
        </div>
      </PickerModal>
    </div>
  );
}
