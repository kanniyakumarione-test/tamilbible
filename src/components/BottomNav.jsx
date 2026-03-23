import { Link, useLocation } from "react-router-dom";
import useAppSettings from "../hooks/useAppSettings";
import { getUIText } from "../utils/uiText";

function DockGlyph({ active, variant }) {
  const baseClass = active ? "bg-white" : "bg-slate-500/80";

  if (variant === "home") {
    return (
      <span className="relative block h-4 w-4">
        <span className={`absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rotate-45 rounded-[0.2rem] ${baseClass}`} />
        <span className={`absolute bottom-0 left-1/2 h-2.5 w-3 -translate-x-1/2 rounded-[0.3rem] ${baseClass}`} />
      </span>
    );
  }

  if (variant === "books") {
    return (
      <span className="flex h-4 w-4 items-center justify-between">
        <span className={`h-4 w-[0.34rem] rounded-full ${baseClass}`} />
        <span className={`h-4 w-[0.34rem] rounded-full ${baseClass}`} />
      </span>
    );
  }

  if (variant === "search") {
    return (
      <span className="relative block h-4 w-4">
        <span className={`absolute left-0 top-0 h-3 w-3 rounded-full border-2 ${active ? "border-white" : "border-slate-500/80"}`} />
        <span className={`absolute bottom-0 right-0 h-[0.45rem] w-[0.45rem] rounded-full ${baseClass}`} />
      </span>
    );
  }

  if (variant === "settings") {
    return (
      <span className="relative block h-4 w-4">
        <span className={`absolute inset-[0.18rem] rounded-full ${baseClass}`} />
        <span className={`absolute left-1/2 top-0 h-4 w-[0.18rem] -translate-x-1/2 rounded-full ${baseClass}`} />
        <span className={`absolute left-0 top-1/2 h-[0.18rem] w-4 -translate-y-1/2 rounded-full ${baseClass}`} />
      </span>
    );
  }

  return (
    <span className="grid h-4 w-4 grid-cols-2 gap-[0.18rem]">
      <span className={`rounded-[0.2rem] ${baseClass}`} />
      <span className={`rounded-[0.2rem] ${baseClass}`} />
      <span className={`rounded-[0.2rem] ${baseClass}`} />
      <span className={`rounded-[0.2rem] ${baseClass}`} />
    </span>
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
    <div className="fixed bottom-3 left-1/2 z-40 w-[calc(100%-1.25rem)] max-w-xl -translate-x-1/2 md:bottom-5">
      <div className="relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-[rgba(7,13,24,0.92)] px-2 py-2 shadow-[0_18px_40px_rgba(2,6,23,0.42)] backdrop-blur-xl">
        <div className="grid grid-cols-4 gap-1.5 md:grid-cols-5">
          {items.map((item) => {
            const active =
              item.to === "/"
                ? pathname === "/"
                : pathname.startsWith(item.to);

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`${item.desktopOnly ? "hidden md:flex" : "flex"} group relative min-w-0 flex-col items-center justify-center rounded-[1.1rem] px-1.5 py-1.5 text-center transition duration-200 ${
                  active
                    ? "bg-white/[0.06] text-white"
                    : "text-slate-400 hover:bg-white/[0.03] hover:text-slate-100"
                }`}
              >
                <span
                  className={`absolute inset-x-4 top-0 h-[2px] rounded-full transition ${
                    active
                      ? "bg-gradient-to-r from-sky-300 via-blue-400 to-cyan-300 opacity-100"
                      : "opacity-0"
                  }`}
                />
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-xl border transition ${
                    active
                      ? "border-sky-300/30 bg-[linear-gradient(180deg,rgba(59,130,246,0.9),rgba(37,99,235,0.72))] shadow-[0_8px_18px_rgba(37,99,235,0.24)]"
                      : "border-white/10 bg-white/[0.02] group-hover:border-white/15"
                  }`}
                >
                  <DockGlyph active={active} variant={item.glyph} />
                </span>
                <span className="mt-1.5 line-clamp-2 break-words text-[9px] font-medium leading-[1.05] md:text-[10px]">
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
