import { Link } from "react-router-dom";
import useAppSettings from "../hooks/useAppSettings";
import { getUIText } from "../utils/uiText";

export default function Footer() {
  const [settings] = useAppSettings();
  const t = getUIText(settings.language);
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/5 bg-black/40 pb-28 pt-12 md:pb-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-4">
          <div className="col-span-2">
            <h2 className="text-xl font-bold text-white">
              Tamil Bible <span className="text-zinc-200">Premium</span>
            </h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-stone-400">
              {["en", "ta-en"].includes(settings.language)
                ? "A clean, modern, and high-performance Tamil Bible reading experience. Built for study, devotion, and presentation."
                : "ஒரு சுத்தமான, நவீன மற்றும் உயர் செயல்திறன் கொண்ட தமிழ் வேதாகம வாசிப்பு அனுபவம். படிப்பு, பக்தி மற்றும் பிரசங்கத்திற்காக உருவாக்கப்பட்டது."}
            </p>
            <div className="mt-6 flex items-center gap-4">
              <a
                href="mailto:softgenzservices@gmail.com"
                className="text-xs font-medium text-stone-300 hover:text-white"
              >
                softgenzservices@gmail.com
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              {["en", "ta-en"].includes(settings.language) ? "Navigation" : "வழிகாட்டி"}
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/" className="text-sm text-stone-400 hover:text-zinc-200">
                  {t.home}
                </Link>
              </li>
              <li>
                <Link to="/books" className="text-sm text-stone-400 hover:text-zinc-200">
                  {t.books}
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-sm text-stone-400 hover:text-zinc-200">
                  {t.search}
                </Link>
              </li>
              <li>
                <Link to="/settings" className="text-sm text-stone-400 hover:text-zinc-200">
                  {t.settings}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              {["en", "ta-en"].includes(settings.language) ? "Legal" : "சட்டம்"}
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/about" className="text-sm text-stone-400 hover:text-zinc-200">
                  {["en", "ta-en"].includes(settings.language) ? "About Us" : "எங்களைப் பற்றி"}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-stone-400 hover:text-zinc-200">
                  {["en", "ta-en"].includes(settings.language) ? "Privacy Policy" : "தனியுரிமைக் கொள்கை"}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-stone-400 hover:text-zinc-200">
                  {["en", "ta-en"].includes(settings.language) ? "Terms of Service" : "சேவை விதிமுறைகள்"}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/5 pt-8">
          <p className="text-xs text-stone-500">
            © {currentYear} Tamil Bible Premium. Built with ❤️ for the community.
          </p>
        </div>
      </div>
    </footer>
  );
}
