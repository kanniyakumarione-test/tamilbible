import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import useAppSettings from "../hooks/useAppSettings";
import { getUIText } from "../utils/uiText";

function NavGlyph({ active, variant }) {
  const strokeClass = active ? "text-zinc-300" : "text-stone-400";
  const fillClass = active ? "fill-amber-500/20" : "fill-transparent";

  if (variant === "home") {
    return (
      <svg viewBox="0 0 24 24" className={`h-5 w-5 transition-colors ${strokeClass} ${fillClass}`} fill="currentColor" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5.5 9.5V20h13V9.5Z" />
        <path d="M10 20v-5h4v5" />
      </svg>
    );
  }

  if (variant === "books") {
    return (
      <svg viewBox="0 0 24 24" className={`h-5 w-5 transition-colors ${strokeClass} ${fillClass}`} fill="currentColor" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 4.5h9.5a2 2 0 0 1 2 2V19H8a2 2 0 0 0-2 2Z" />
        <path d="M6 4.5a2 2 0 0 0-2 2V19a2 2 0 0 0 2 2" />
        <path d="M9 8h6" />
        <path d="M9 11h6" />
      </svg>
    );
  }

  if (variant === "search") {
    return (
      <svg viewBox="0 0 24 24" className={`h-5 w-5 transition-colors ${strokeClass} ${fillClass}`} fill="currentColor" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="6.5" fill={active ? "currentColor" : "none"} className={active ? "opacity-20" : ""} />
        <path d="m16 16 4.5 4.5" />
      </svg>
    );
  }

  if (variant === "settings") {
    return (
      <svg viewBox="0 0 24 24" className={`h-5 w-5 transition-colors ${strokeClass} ${fillClass}`} fill="currentColor" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="3.2" fill={active ? "currentColor" : "none"} className={active ? "opacity-20" : ""} />
        <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 1 1-4 0v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 1 1 0-4h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a2 2 0 1 1 4 0v.2a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6H20a2 2 0 1 1 0 4h-.2a1 1 0 0 0-.9.6Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={`h-5 w-5 transition-colors ${strokeClass} ${fillClass}`} fill="currentColor" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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

export default function TopNav() {
  const { pathname } = useLocation();
  const [settings] = useAppSettings();
  const t = getUIText(settings.language);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu when navigating
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const items = [
    { to: "/", label: t.home, glyph: "home" },
    { to: "/books", label: t.books, glyph: "books" },
    { to: "/search", label: t.search, glyph: "search" },
    { to: "/library", label: t.library || "Library", glyph: "books" },
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
      {/* =========================================
          DESKTOP NAVIGATION (Full Width Header)
          ========================================= */}
      <header
        className={`hidden md:flex fixed inset-x-0 top-0 z-50 w-full items-center justify-between px-8 transition-all duration-300 ${
          scrolled ? "h-16 bg-black/80 backdrop-blur-xl border-b border-white/10" : "h-24 bg-transparent"
        }`}
      >
        {/* Left: Logo */}
        <Link to="/" className="group flex items-center gap-3">
          <div className="flex items-center justify-center rounded-xl bg-white/5 text-zinc-200 border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-all group-hover:bg-white/10 group-hover:scale-105 h-10 w-10">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text font-extrabold tracking-tight text-transparent transition-all group-hover:to-white text-xl">
            {t.tamilBible}
          </span>
        </Link>

        {/* Center: Main Links */}
        <nav className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/5 bg-white/[0.02] p-1 backdrop-blur-md">
          {items
            .filter((item) => !["settings", "advanced-presentation"].includes(item.glyph))
            .map((item) => {
              const active = isItemActive(pathname, item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`group relative flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold transition-all duration-300 ${
                    active
                      ? "bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                      : "text-stone-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="relative z-10 flex items-center justify-center">
                    <NavGlyph active={active} variant={item.glyph} />
                  </span>
                  <span className="relative z-10 whitespace-nowrap tracking-wide">{item.label}</span>
                </Link>
              );
            })}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {items
            .filter((item) => ["settings", "advanced-presentation"].includes(item.glyph))
            .map((item) => {
              const active = isItemActive(pathname, item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`group relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all duration-300 ${
                    active
                      ? "bg-white/10 text-white border border-white/10"
                      : "text-stone-400 hover:bg-white/5 border border-transparent hover:text-white hover:border-white/10"
                  }`}
                >
                  <span className="relative z-10 flex items-center justify-center">
                    <NavGlyph active={active} variant={item.glyph} />
                  </span>
                  <span className="relative z-10 whitespace-nowrap tracking-wide">{item.label}</span>
                </Link>
              );
            })}
        </div>
      </header>

      {/* =========================================
          MOBILE NAVIGATION (Floating Pill)
          ========================================= */}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4 md:hidden">
        <header
          className={`pointer-events-auto flex w-full items-center justify-between rounded-full border transition-all duration-500 ease-in-out ${
            scrolled
              ? "border-white/10 bg-[rgba(0,0,0,0.85)] p-2 pr-4 shadow-[0_20px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl"
              : "border-white/5 bg-[rgba(0,0,0,0.4)] p-3 pr-5 shadow-lg backdrop-blur-md"
          }`}
        >
          {/* Mobile Logo */}
          <Link to="/" className="group flex items-center gap-2.5 pl-2">
            <div className={`flex items-center justify-center rounded-xl bg-white/5 text-zinc-200 border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-all ${scrolled ? "h-9 w-9" : "h-10 w-10"}`}>
              <svg className={`transition-all ${scrolled ? "h-5 w-5" : "h-5 w-5"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className={`bg-gradient-to-r from-white to-slate-300 bg-clip-text font-extrabold tracking-tight text-transparent transition-all sm:block ${scrolled ? "text-lg" : "text-xl"}`}>
              {t.tamilBible}
            </span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            className={`flex items-center justify-center rounded-full transition-colors hover:bg-white/10 ${
              scrolled ? "h-9 w-9 bg-white/5 text-white" : "h-10 w-10 bg-black/20 text-stone-300"
            }`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </header>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/80 backdrop-blur-md transition-opacity duration-300 md:hidden ${
          mobileMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div
          className={`absolute inset-x-0 top-[88px] mx-4 overflow-hidden rounded-[2rem] border border-white/10 bg-[#000000] p-3 shadow-2xl transition-transform duration-300 ease-out ${
            mobileMenuOpen ? "translate-y-0" : "-translate-y-4"
          }`}
        >
          <nav className="flex flex-col gap-1">
            {items
              .filter((item) => !item.desktopOnly)
              .map((item) => {
                const active = isItemActive(pathname, item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-4 rounded-2xl px-5 py-4 font-bold transition-all ${
                      active
                        ? "bg-white/10 text-white ring-1 ring-white/10"
                        : "text-stone-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${active ? "bg-black/20 text-white" : "bg-black/20 text-stone-500"}`}>
                      <NavGlyph active={active} variant={item.glyph} />
                    </div>
                    <span className="whitespace-nowrap text-base tracking-wide">{item.label}</span>
                  </Link>
                );
              })}
          </nav>
        </div>
      </div>
    </>
  );
}
