import { Link } from "react-router-dom";
import useAppSettings from "../hooks/useAppSettings";
import { getUIText } from "../utils/uiText";

export default function Footer() {
  const [settings] = useAppSettings();
  const t = getUIText(settings.language);
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-20 border-t border-white/5 bg-slate-950/40 pb-28 pt-12 md:pb-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-4">
          <div className="col-span-2">
            <h2 className="text-xl font-bold text-white">
              Tamil Bible <span className="text-sky-400">Premium</span>
            </h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-400">
              {settings.language === "en"
                ? "A clean, modern, and high-performance Tamil Bible reading experience. Built for study, devotion, and presentation."
                : "ஒரு சுத்தமான, நவீன மற்றும் உயர் செயல்திறன் கொண்ட தமிழ் வேதாகம வாசிப்பு அனுபவம். படிப்பு, பக்தி மற்றும் பிரசங்கத்திற்காக உருவாக்கப்பட்டது."}
            </p>
            <div className="mt-6 flex items-center gap-4">
              <a
                href="mailto:kanniyakumarione@gmail.com"
                className="text-xs font-medium text-slate-300 hover:text-white"
              >
                kanniyakumarione@gmail.com
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              {settings.language === "en" ? "Navigation" : "வழிகாட்டி"}
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/" className="text-sm text-slate-400 hover:text-sky-400">
                  {t.home}
                </Link>
              </li>
              <li>
                <Link to="/books" className="text-sm text-slate-400 hover:text-sky-400">
                  {t.books}
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-sm text-slate-400 hover:text-sky-400">
                  {t.search}
                </Link>
              </li>
              <li>
                <Link to="/settings" className="text-sm text-slate-400 hover:text-sky-400">
                  {t.settings}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              {settings.language === "en" ? "Legal" : "சட்டம்"}
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/about" className="text-sm text-slate-400 hover:text-sky-400">
                  {settings.language === "en" ? "About Us" : "எங்களைப் பற்றி"}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-slate-400 hover:text-sky-400">
                  {settings.language === "en" ? "Privacy Policy" : "தனியுரிமைக் கொள்கை"}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-slate-400 hover:text-sky-400">
                  {settings.language === "en" ? "Terms of Service" : "சேவை விதிமுறைகள்"}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/5 pt-8">
          <p className="text-xs text-slate-500">
            © {currentYear} Tamil Bible Premium. Built with ❤️ for the community.
          </p>
        </div>
      </div>
    </footer>
  );
}
