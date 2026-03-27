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
      <svg viewBox="0 0 24 24" className={`h-[18px] w-[18px] ${strokeClass} ${fillClass}`} fill="currentColor" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
    <div className="fixed bottom-3 left-1/2 z-40 w-[calc(100%-1rem)] max-w-[56rem] -translate-x-1/2 md:bottom-5 md:w-auto">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(20,20,27,0.97),rgba(10,10,16,0.95))] px-2 py-2 shadow-[0_20px_50px_rgba(0,0,0,0.42)] backdrop-blur-xl md:rounded-full md:px-3 md:py-3">
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        <div className="grid grid-cols-4 gap-1 md:flex md:items-center md:gap-3">
          {items.map((item) => {
            const active =
              item.to === "/"
                ? pathname === "/"
                : pathname.startsWith(item.to);

            return (
              <Link
                key={item.to}
                to={item.to}
                aria-label={item.label}
                title={item.label}
                className={`${item.desktopOnly ? "hidden md:flex" : "flex"} group relative min-w-0 items-center justify-center transition-all duration-300 ease-out ${
                  active
                    ? "rounded-[1.1rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.24),rgba(96,165,250,0.18)_28%,rgba(37,99,235,0.92)_70%,rgba(29,78,216,0.98)_100%)] px-2 py-2.5 text-white shadow-[0_12px_24px_rgba(37,99,235,0.3),inset_0_1px_0_rgba(255,255,255,0.22)] md:rounded-full md:px-4"
                    : "rounded-[1.1rem] px-2 py-2.5 text-slate-400 hover:bg-white/[0.04] hover:text-slate-100 md:h-12 md:w-12 md:rounded-full md:px-0"
                }`}
              >
                <span
                  className={`relative flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 ease-out md:h-8 md:w-8 ${
                    active
                      ? "scale-105 bg-black/45 ring-1 ring-white/10"
                      : "scale-100 bg-transparent"
                  }`}
                >
                  <DockGlyph active={active} variant={item.glyph} />
                </span>
                {active ? (
                  <span className="ml-1.5 hidden pr-1 text-[11px] font-semibold leading-none tracking-[0.01em] text-white transition-all duration-300 ease-out md:inline md:text-xs">
                    {item.label}
                  </span>
                ) : null}
                <span className={`mt-1 block text-[10px] font-medium leading-none transition-colors duration-300 ease-out md:hidden ${active ? "text-white" : "text-slate-400"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
