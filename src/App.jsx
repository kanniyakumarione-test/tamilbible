import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Home from "./pages/Home";
import Books from "./pages/Books";
import Chapters from "./pages/Chapters";
import Verses from "./pages/Verses";
import Search from "./pages/Search";
import Reader from "./pages/Reader";
import Settings from "./pages/Settings";
import AdvancedPresentation from "./pages/AdvancedPresentation";
import BottomNav from "./components/BottomNav";

// 🔥 Layout wrapper
function Layout() {
  const location = useLocation();

  const isReader = location.pathname.startsWith("/reader");

  return (
    <>
      {/* ✅ Remove padding in reader */}
      <div className={isReader ? "" : "pb-16 md:pb-0"}>
        <Routes>
          {/* Main */}
          <Route path="/" element={<Home />} />
          <Route path="/books" element={<Books />} />
          <Route path="/search" element={<Search />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/advanced-presentation" element={<AdvancedPresentation />} />

          {/* Bible navigation */}
          <Route path="/:book" element={<Chapters />} />
          <Route path="/:book/:chapter" element={<Verses />} />

          {/* 🔥 Fullscreen Reader */}
          <Route
            path="/reader/:book/:chapter/:verse"
            element={<Reader />}
          />
        </Routes>
      </div>

      {/* ❌ Hide dock in reader */}
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
