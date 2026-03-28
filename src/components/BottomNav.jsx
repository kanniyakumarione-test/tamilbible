import { Link, useLocation } from "react-router-dom";
import useAppSettings from "../hooks/useAppSettings";
import { getUIText } from "../utils/uiText";

function DockGlyph({ active, variant }) {
  const strokeClass = active ? "text-white" : "text-slate-400";
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
  return to === "/" ? pathname === "/" : pathname.startsWith(to);
}

function DesktopDock({ items, pathname }) {
  return (
    <div className="fixed bottom-5 left-1/2 z-40 hidden w-auto -translate-x-1/2 md:block">
      <div className="relative overflow-hidden rounded-full border border-white/10 bg-[linear-gradient(180deg,rgba(20,20,27,0.97),rgba(10,10,16,0.95))] px-3 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.42)] backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        <div className="flex items-center gap-3">
          {items.map((item) => {
            const active = isItemActive(pathname, item.to);

            return (
              <Link
                key={item.to}
                to={item.to}
                aria-label={item.label}
                title={item.label}
                className={`${item.desktopOnly ? "hidden md:flex" : "flex"} group relative min-w-0 items-center justify-center transition-all duration-300 ease-out ${
                  active
                    ? "rounded-full bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.24),rgba(96,165,250,0.18)_28%,rgba(37,99,235,0.92)_70%,rgba(29,78,216,0.98)_100%)] px-4 py-2.5 text-white shadow-[0_12px_24px_rgba(37,99,235,0.3),inset_0_1px_0_rgba(255,255,255,0.22)]"
                    : "h-12 w-12 rounded-full px-0 text-slate-400 hover:bg-white/[0.04] hover:text-slate-100"
                }`}
              >
                <span
                  className={`relative flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 ease-out ${
                    active
                      ? "scale-105 bg-black/45 ring-1 ring-white/10"
                      : "scale-100 bg-transparent"
                  }`}
                >
                  <DockGlyph active={active} variant={item.glyph} />
                </span>
                {active ? (
                  <span className="ml-1.5 hidden pr-1 text-xs font-semibold leading-none tracking-[0.01em] text-white transition-all duration-300 ease-out md:inline">
                    {item.label}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MobileDock({ items, pathname, t }) {
  const mobileItems = items.filter((item) => !item.desktopOnly);
  const primaryItems = mobileItems.filter((item) => item.to !== "/search");
  const searchItem = mobileItems.find((item) => item.to === "/search");
  const searchActive = searchItem ? isItemActive(pathname, searchItem.to) : false;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
      {searchItem ? (
        <Link
          to={searchItem.to}
          aria-label={searchItem.label}
          title={searchItem.label}
          className={`fixed right-4 top-[max(0.9rem,env(safe-area-inset-top))] z-[45] flex h-[3.6rem] w-[3.6rem] items-center justify-center rounded-[1.25rem] border transition-all duration-300 ${
            searchActive
              ? "border-cyan-300/70 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.34),rgba(56,189,248,0.24)_30%,rgba(14,165,233,0.92)_72%,rgba(8,47,73,1)_100%)] shadow-[0_18px_38px_rgba(14,165,233,0.42),inset_0_1px_0_rgba(255,255,255,0.28)]"
              : "border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))] shadow-[0_18px_38px_rgba(0,0,0,0.38)]"
          }`}
        >
          <span className="absolute inset-[1px] rounded-[1.1rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))]" />
          <span className="relative flex h-9 w-9 items-center justify-center rounded-[0.9rem] bg-black/25 text-white">
            <DockGlyph active={searchActive} variant={searchItem.glyph} />
          </span>
        </Link>
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
      <div className="relative mx-auto max-w-md">
        <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(20,20,27,0.97),rgba(10,10,16,0.95))] px-2 py-2 shadow-[0_20px_50px_rgba(0,0,0,0.42)] backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          <div className="grid grid-cols-3 gap-1">
            {primaryItems.map((item) => {
              const active = isItemActive(pathname, item.to);

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-label={item.label}
                  title={item.label}
                  className={`flex min-w-0 flex-col items-center justify-center rounded-[1.1rem] px-2 py-2.5 transition-all duration-300 ${
                    active
                      ? "bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.24),rgba(96,165,250,0.18)_28%,rgba(37,99,235,0.92)_70%,rgba(29,78,216,0.98)_100%)] text-white shadow-[0_12px_24px_rgba(37,99,235,0.3),inset_0_1px_0_rgba(255,255,255,0.22)]"
                      : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-100"
                  }`}
                >
                  <span
                    className={`relative flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 ${
                      active
                        ? "scale-105 bg-black/45 ring-1 ring-white/10"
                        : "scale-100 bg-transparent"
                    }`}
                  >
                    <DockGlyph active={active} variant={item.glyph} />
                  </span>
                  <span className={`mt-1 block text-[10px] font-medium leading-none transition-colors duration-300 ${active ? "text-white" : "text-slate-400"}`}>
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

  const items = [
    { to: "/", label: t.home, glyph: "home" },
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
      <MobileDock items={items} pathname={pathname} t={t} />
      <DesktopDock items={items} pathname={pathname} />
    </>
  );
}
