import { useEffect, useRef } from "react";
import useLibraryData from "../hooks/useLibraryData";
import {
  removeSermonQueueItem,
  setActiveSermonItem,
  setSermonDisplayMode,
  showNextSermonItem,
  showPreviousSermonItem,
} from "../utils/libraryData";
import {
  removeRemoteDevice,
  upsertRemoteDevice,
} from "../utils/presentationRemotePresence";

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

export default function PresentationRemote() {
  const libraryData = useLibraryData();
  const queue = libraryData.sermon.queue || [];
  const activeItem = libraryData.sermon.activeItem || queue[0] || null;
  const displayMode = libraryData.sermon.displayMode || "live";
  const remoteDeviceRef = useRef(null);
  const isPhone = /iphone|android.+mobile|mobile|phone/i.test(navigator.userAgent);
  const isTablet = /ipad|tablet|android(?!.*mobile)/i.test(navigator.userAgent);
  const platform = isPhone ? "Phone" : isTablet ? "Tablet" : "Desktop Browser";
  const remoteLabel = `${platform} Remote`;

  useEffect(() => {
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
    <div className="app-shell min-h-screen px-4 pb-24 pt-4 md:px-6 md:pt-6">
      <div className="mx-auto max-w-4xl">
        <section className="mb-6 overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.2),_transparent_28%),linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(8,17,32,0.96))] px-5 py-8 shadow-2xl shadow-black/30 md:px-8">
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
    </div>
  );
}
