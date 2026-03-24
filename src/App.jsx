import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";

import Home from "./pages/Home";
import Books from "./pages/Books";
import Chapters from "./pages/Chapters";
import Verses from "./pages/Verses";
import Search from "./pages/Search";
import Reader from "./pages/Reader";
import Settings from "./pages/Settings";
import AdvancedPresentation from "./pages/AdvancedPresentation";
import SermonMode from "./pages/SermonMode";
import SermonControl from "./pages/SermonControl";
import PresentationDisplay from "./pages/PresentationDisplay";
import PresentationRemote from "./pages/PresentationRemote";
import BottomNav from "./components/BottomNav";
import SeoManager from "./components/SeoManager";

function Layout() {
  const location = useLocation();
  const isReader =
    location.pathname.startsWith("/reader") ||
    location.pathname.startsWith("/sermon-mode") ||
    location.pathname.startsWith("/presentation/");

  return (
    <>
      <SeoManager />

      <div className={isReader ? "" : "pb-16 md:pb-0"}>
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
