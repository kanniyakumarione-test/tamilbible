import { Link, useLocation } from "react-router-dom";
import useAppSettings from "../hooks/useAppSettings";
import { getUIText } from "../utils/uiText";

export default function BottomNav() {
  const { pathname } = useLocation();
  const [settings] = useAppSettings();
  const t = getUIText(settings.language);

  const items = [
    { to: "/", label: t.home, icon: settings.language === "en" ? "HM" : "மு" },
    {
      to: "/search",
      label: t.search,
      icon: settings.language === "en" ? "SR" : "தே",
    },
    {
      to: "/settings",
      label: t.settings,
      icon: settings.language === "en" ? "ST" : "அ",
    },
    {
      to: "/advanced-presentation",
      label: t.advancedPresentation,
      icon: settings.language === "en" ? "AP" : "வி",
      desktopOnly: true,
    },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 md:bottom-6">
      <div className="app-surface rounded-[2rem] px-3 py-3">
        <div className="grid grid-cols-3 gap-2 md:grid-cols-4">
          {items.map((item) => {
            const active =
              item.to === "/"
                ? pathname === "/"
                : pathname.startsWith(item.to);

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`${item.desktopOnly ? "hidden md:block" : ""} rounded-2xl px-3 py-2.5 text-center transition ${
                  active
                    ? "bg-gradient-to-br from-indigo-500 to-sky-500 text-white shadow-lg shadow-indigo-950/40"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                }`}
              >
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.22em] opacity-80">
                  {item.icon}
                </span>
                <span className="block text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
