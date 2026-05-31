import { Link, useLocation } from "react-router-dom";
import useAppSettings from "../hooks/useAppSettings";
import { getUIText } from "../utils/uiText";

function DockGlyph({ active, variant }) {
  const strokeClass = active ? "text-white" : "text-stone-400";
  const fillClass = active ? "fill-white/20" : "fill-transparent";

  if (variant === "home") {
    return (
      <svg viewBox="0 0 24 24" className={`h-[18px] w-[18px] ${strokeClass} ${fillClass}`} fill="currentColor" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5.5 9.5V20h13V9.5Z" />
        <path d="M10 20v-5h4v5" />
      </svg>
    );
  }

  if (variant === "books") {
    return (
      <svg viewBox="0 0 24 24" className={`h-[18px] w-[18px] ${strokeClass} ${fillClass}`} fill="currentColor" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 4.5h9.5a2 2 0 0 1 2 2V19H8a2 2 0 0 0-2 2Z" />
        <path d="M6 4.5a2 2 0 0 0-2 2V19a2 2 0 0 0 2 2" />
        <path d="M9 8h6" />
        <path d="M9 11h6" />
      </svg>
    );
  }

  if (variant === "search") {
    return (
      <svg viewBox="0 0 24 24" className={`h-[19px] w-[19px] ${strokeClass} ${fillClass}`} fill="currentColor" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="6.5" fill={active ? "currentColor" : "none"} className={active ? "opacity-20" : ""} />
        <path d="m16 16 4.5 4.5" />
      </svg>
    );
  }

  if (variant === "settings") {
    return (
      <svg viewBox="0 0 24 24" className={`h-[18px] w-[18px] ${strokeClass} ${fillClass}`} fill="currentColor" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="3.2" fill={active ? "currentColor" : "none"} className={active ? "opacity-20" : ""} />
        <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 1 1-4 0v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 1 1 0-4h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a2 2 0 1 1 4 0v.2a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6H20a2 2 0 1 1 0 4h-.2a1 1 0 0 0-.9.6Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={`h-[18px] w-[18px] ${strokeClass} ${fillClass}`} fill="currentColor" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="5" width="7" height="6" rx="1.9" fill={active ? "currentColor" : "none"} className={active ? "opacity-20" : ""} />
      <rect x="13" y="5" width="7" height="6" rx="1.9" fill={active ? "currentColor" : "none"} className={active ? "opacity-20" : ""} />
      <rect x="4" y="13" width="7" height="6" rx="1.9" fill={active ? "currentColor" : "none"} className={active ? "opacity-20" : ""} />
      <rect x="13" y="13" width="7" height="6" rx="1.9" fill={active ? "currentColor" : "none"} className={active ? "opacity-20" : ""} />
    </svg>
  );
}

function isItemActive(pathname, to) {
  if (to === "/" || to === "/home") {
    return pathname === "/" || pathname === "/home";
  }
  return pathname.startsWith(to);
}

function DesktopDock({ items, pathname }) {
  return (
    <div className="fixed bottom-6 left-1/2 z-40 hidden w-auto -translate-x-1/2 md:block">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-[#000000] p-2 shadow-[0_30px_60px_rgba(0,0,0,0.5)] backdrop-blur-3xl before:absolute before:inset-0 before:-z-10 before:rounded-[2rem] before:bg-white/[0.02]">
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="flex items-center gap-2">
          {items.map((item) => {
            const active = isItemActive(pathname, item.to);

            return (
              <Link
                key={item.to}
                to={item.to}
                aria-label={item.label}
                className={`${item.desktopOnly ? "hidden md:flex" : "flex"} group relative min-w-0 items-center justify-center transition-all duration-500 ease-out ${
                  active
                    ? "rounded-[1.5rem] bg-gradient-to-r from-zinc-800/20 to-black/20 px-5 py-3 text-zinc-300 shadow-[0_0_20px_rgba(255, 255, 255,0.15),inset_0_1px_0_rgba(255,255,255,0.1)] ring-1 ring-zinc-700/30"
                    : "h-14 w-14 rounded-full px-0 text-stone-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span
                  className={`relative flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-500 ease-out ${
                    active ? "scale-110" : "scale-100 group-hover:scale-110"
                  }`}
                >
                  <DockGlyph active={active} variant={item.glyph} />
                </span>
                {active && (
                  <span className="ml-2 hidden text-[13px] font-bold tracking-wide text-zinc-400 transition-all duration-500 ease-out md:inline">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MobileDock({ items, pathname }) {
  const mobileItems = items.filter((item) => !item.desktopOnly);
  const primaryItems = mobileItems.filter((item) => item.to !== "/search");
  const searchItem = mobileItems.find((item) => item.to === "/search");
  const searchActive = searchItem ? isItemActive(pathname, searchItem.to) : false;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden">
      {searchItem && (
        <Link
          to={searchItem.to}
          aria-label={searchItem.label}
          className={`fixed right-5 top-[max(1rem,env(safe-area-inset-top))] z-[45] flex h-14 w-14 items-center justify-center rounded-[1.5rem] border transition-all duration-500 hover:scale-105 active:scale-95 ${
            searchActive
              ? "border-zinc-600/40 bg-gradient-to-br from-zinc-800 to-orange-600 shadow-[0_0_25px_rgba(255, 255, 255,0.5)]"
              : "border-white/10 bg-[#000000] shadow-[0_20px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl"
          }`}
        >
          <span className={`relative flex h-10 w-10 items-center justify-center rounded-[1.2rem] ${searchActive ? "text-white" : "bg-white/5 text-stone-300"}`}>
            <DockGlyph active={searchActive} variant={searchItem.glyph} />
          </span>
        </Link>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
      <div className="relative mx-auto max-w-sm">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-[#000000] p-2.5 shadow-[0_30px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="grid grid-cols-3 gap-2">
            {primaryItems.map((item) => {
              const active = isItemActive(pathname, item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-label={item.label}
                  className={`flex min-w-0 flex-col items-center justify-center rounded-[1.5rem] py-3 transition-all duration-500 ${
                    active
                      ? "bg-gradient-to-b from-zinc-800/20 to-black/10 text-zinc-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] ring-1 ring-zinc-700/30"
                      : "text-stone-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span
                    className={`relative flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-500 ${
                      active ? "scale-110" : "scale-100"
                    }`}
                  >
                    <DockGlyph active={active} variant={item.glyph} />
                  </span>
                  <span className={`mt-1.5 block text-[10px] font-bold uppercase tracking-wider transition-colors duration-500 ${active ? "text-zinc-300" : "text-stone-500"}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BottomNav() {
  const { pathname } = useLocation();
  const [settings] = useAppSettings();
  const t = getUIText(settings.language);

  const isDesktopApp = typeof window !== 'undefined' && (window.navigator.userAgent.toLowerCase().includes('electron') || window.matchMedia('(display-mode: standalone)').matches || window.matchMedia('(display-mode: twa)').matches);

  const items = [
    { to: isDesktopApp ? "/" : "/home", label: t.home, glyph: "home" },
    { to: "/books", label: t.books, glyph: "books" },
    { to: "/search", label: t.search, glyph: "search" },
    { to: "/settings", label: t.settings, glyph: "settings" },
    {
      to: "/advanced-presentation",
      label: t.advancedPresentation,
      glyph: "grid",
      desktopOnly: true,
    },
  ];

  return (
    <>
      <MobileDock items={items} pathname={pathname} />
      <DesktopDock items={items} pathname={pathname} />
    </>
  );
}
