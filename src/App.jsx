import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";

import BottomNav from "./components/BottomNav";
import SeoManager from "./components/SeoManager";
import useAppSettings from "./hooks/useAppSettings";
import {
  FONT_FAMILY_OPTIONS,
  TAMIL_FONT_OPTIONS,
  getFontCss,
  getReaderFontFamily,
} from "./utils/appearance";

const Home = lazy(() => import("./pages/Home"));
const Books = lazy(() => import("./pages/Books"));
const Chapters = lazy(() => import("./pages/Chapters"));
const Verses = lazy(() => import("./pages/Verses"));
const Search = lazy(() => import("./pages/Search"));
const Reader = lazy(() => import("./pages/Reader"));
const Settings = lazy(() => import("./pages/Settings"));
const AdvancedPresentation = lazy(() => import("./pages/AdvancedPresentation"));
const SermonMode = lazy(() => import("./pages/SermonMode"));
const SermonControl = lazy(() => import("./pages/SermonControl"));
const PresentationDisplay = lazy(() => import("./pages/PresentationDisplay"));
const PresentationRemote = lazy(() => import("./pages/PresentationRemote"));

function RouteLoadingScreen() {
  return (
    <div className="app-shell px-4 pb-24 pt-4 md:px-6 md:pt-6">
      <div className="mx-auto max-w-6xl">
        <div className="app-surface rounded-[2rem] p-6 md:p-8">
          <div className="flex items-center gap-3 text-slate-300">
            <span className="h-3 w-3 animate-pulse rounded-full bg-sky-300" />
            <span className="text-sm font-medium">Loading...</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Layout() {
  const location = useLocation();
  const [settings] = useAppSettings();
  const isReader =
    location.pathname.startsWith("/reader") ||
    location.pathname.startsWith("/sermon-mode") ||
    location.pathname.startsWith("/presentation/");

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const uiFont = getFontCss(settings.fontFamily, FONT_FAMILY_OPTIONS);
    const tamilFont = getFontCss(settings.tamilFontFamily, TAMIL_FONT_OPTIONS);
    const appFont = settings.language === "en" ? uiFont : getReaderFontFamily(settings, settings.language);

    root.style.setProperty("--app-ui-font-family", uiFont);
    root.style.setProperty("--app-tamil-font-family", tamilFont);

    body.style.fontFamily = appFont;
  }, [settings]);

  return (
    <>
      <SeoManager />

      <div className={isReader ? "" : "pb-24 md:pb-0"}>
        <Suspense fallback={<RouteLoadingScreen />}>
          <div key={isReader ? "reader-shell" : location.pathname} className={isReader ? "" : "app-page-transition"}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/books" element={<Books />} />
              <Route path="/search" element={<Search />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/advanced-presentation" element={<AdvancedPresentation />} />
              <Route path="/presentation/:mode" element={<PresentationDisplay />} />
              <Route path="/presentation-remote" element={<PresentationRemote />} />
              <Route path="/sermon-mode" element={<SermonMode />} />
              <Route path="/sermon-control" element={<SermonControl />} />
              <Route path="/:book" element={<Chapters />} />
              <Route path="/:book/:chapter" element={<Verses />} />
              <Route path="/reader/:book/:chapter/:verse" element={<Reader />} />
            </Routes>
          </div>
        </Suspense>
      </div>

      {!isReader && <BottomNav />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;
