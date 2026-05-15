import { Link } from "react-router-dom";
import useAppSettings from "../hooks/useAppSettings";
import { getUIText } from "../utils/uiText";

export default function NotFound() {
  const [settings] = useAppSettings();
  const t = getUIText(settings.language);

  return (
    <div className="app-shell app-page flex min-h-[70vh] flex-col items-center justify-center pb-24 pt-4 text-center">
      <div className="app-surface rounded-[3rem] p-12 shadow-2xl">
        <h1 className="text-8xl font-black text-sky-400">404</h1>
        <h2 className="mt-6 text-2xl font-bold text-white md:text-3xl">
          {settings.language === "en" ? "Page Not Found" : "பக்கம் காணப்படவில்லை"}
        </h2>
        <p className="mt-4 max-w-md text-slate-400">
          {settings.language === "en"
            ? "The page you are looking for doesn't exist or has been moved."
            : "நீங்கள் தேடும் பக்கம் இல்லை அல்லது மாற்றப்பட்டுள்ளது."}
        </p>
        <Link
          to="/"
          className="mt-10 inline-block rounded-2xl bg-sky-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:bg-sky-400"
        >
          {settings.language === "en" ? "Back to Home" : "முகப்பிற்குச் செல்க"}
        </Link>
      </div>
    </div>
  );
}
