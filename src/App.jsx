import { BrowserRouter, Route, Routes, useLocation, useNavigate, Navigate } from "react-router-dom";
import { Suspense, lazy, useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";

import WelcomeScreen from "./components/WelcomeScreen";
import ErrorBoundary from "./components/ErrorBoundary";
import TopNav from "./components/TopNav";
import SeoManager from "./components/SeoManager";
import useAppSettings from "./hooks/useAppSettings";
import {
  FONT_FAMILY_OPTIONS,
  TAMIL_FONT_OPTIONS,
  getFontCss,
  getReaderFontFamily,
} from "./utils/appearance";
import { scheduleLocalNotifications } from "./utils/notifications";
import { LocalNotifications } from "@capacitor/local-notifications";

const Home = lazy(() => import("./pages/Home"));
const Landing = lazy(() => import("./pages/Landing"));
const Books = lazy(() => import("./pages/Books"));
const Chapters = lazy(() => import("./pages/Chapters"));
const Verses = lazy(() => import("./pages/Verses"));
const Search = lazy(() => import("./pages/Search"));
const Reader = lazy(() => import("./pages/Reader"));
const Settings = lazy(() => import("./pages/Settings"));
const AdvancedPresentation = lazy(() => import("./pages/AdvancedPresentation"));
const Songs = lazy(() => import("./pages/Songs"));
const Library = lazy(() => import("./pages/Library"));
const SermonMode = lazy(() => import("./pages/SermonMode"));

const PresentationDisplay = lazy(() => import("./pages/PresentationDisplay"));
const PresentationRemote = lazy(() => import("./pages/PresentationRemote"));
const Memorize = lazy(() => import("./pages/Memorize"));
const SermonBuilder = lazy(() => import("./pages/SermonBuilder"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const Terms = lazy(() => import("./pages/Terms"));
const NotFound = lazy(() => import("./pages/NotFound"));

import Footer from "./components/Footer";

function RouteLoadingScreen() {
  return (
    <div className="app-shell app-page pb-24 pt-4 md:pt-6">
      <div className="app-page-inner">
        <div className="app-surface rounded-[2rem] p-6 md:p-8">
          <div className="flex items-center gap-3 text-stone-300">
            <span className="h-3 w-3 rounded-full bg-zinc-600" />
            <span className="text-sm font-medium">Loading...</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [settings] = useAppSettings();
  const isReader =
    location.pathname.startsWith("/reader") ||
    location.pathname.startsWith("/sermon-mode") ||
    location.pathname.startsWith("/presentation/");
    
  const isDesktopApp = typeof window !== 'undefined' && (window.navigator.userAgent.toLowerCase().includes('electron') || window.matchMedia('(display-mode: standalone)').matches || window.matchMedia('(display-mode: twa)').matches);
  const isLandingPage = location.pathname === "/" && !isDesktopApp;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    // Schedule notifications if native
    scheduleLocalNotifications();

    // Listen for notification taps
    if (window.Capacitor?.isNativePlatform?.()) {
      const listener = LocalNotifications.addListener('localNotificationActionPerformed', (notificationAction) => {
        const route = notificationAction.notification.extra?.route;
        if (route) {
          navigate(route);
        }
      });
      return () => {
        listener.then(l => l.remove()).catch(() => {});
      };
    }
  }, [navigate]);

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
    <div className="flex min-h-screen flex-col bg-black">
      <SeoManager />

      {!isReader && !isLandingPage && <TopNav />}
      
      <main className={`flex-1 ${isReader || isLandingPage ? "" : "pt-24 md:pt-28"}`}>
        <Suspense fallback={<RouteLoadingScreen />}>
          <div key={isReader ? "reader-shell" : location.pathname} className={isReader ? "" : "app-page-transition"}>
            <Routes>
              <Route path="/" element={isDesktopApp ? <Home /> : <Landing />} />
              <Route path="/home" element={<Home />} />
              <Route path="/books" element={<Books />} />
              <Route path="/search" element={<Search />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/library" element={<Library />} />
              <Route path="/advanced-presentation" element={<AdvancedPresentation />} />
              <Route path="/songs" element={<Songs />} />
              <Route path="/presentation/:mode" element={<PresentationDisplay />} />
              <Route path="/presentation-remote" element={<PresentationRemote />} />
              <Route path="/sermon-mode" element={<SermonMode />} />

              <Route path="/memorize" element={<Memorize />} />
              <Route path="/sermon-builder" element={<SermonBuilder />} />
              <Route path="/:book" element={<Chapters />} />
              <Route path="/:book/:chapter" element={<Verses />} />
              <Route path="/reader/:book/:chapter/:verse" element={<Reader />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Suspense>
      </main>

      {!isReader && !isLandingPage && <Footer />}
    </div>
  );
}

function App() {
  const [showWelcome, setShowWelcome] = useState(true);

  return (
    <ErrorBoundary>
      {showWelcome && <WelcomeScreen onComplete={() => setShowWelcome(false)} />}
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
      <Toaster 
        position="bottom-center"
        toastOptions={{
          style: {
            background: '#0a0a0a',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '999px',
            fontSize: '14px',
            fontWeight: '500',
            padding: '12px 24px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#000000',
            },
          },
        }}
      />
    </ErrorBoundary>
  );
}

export default App;
