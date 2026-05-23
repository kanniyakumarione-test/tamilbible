import useAppSettings from "../hooks/useAppSettings";

export default function PrivacyPolicy() {
  const [settings] = useAppSettings();

  return (
    <div className="app-shell app-page pb-6 pt-4 md:pt-10">
      <div className="app-page-inner max-w-4xl">
        <section className="app-surface rounded-[2rem] p-8 md:p-12">
          <h1 className="text-3xl font-bold text-white md:text-4xl">
            {["en", "ta-en"].includes(settings.language) ? "Privacy Policy" : "தனியுரிமைக் கொள்கை"}
          </h1>
          <p className="mt-4 text-stone-400">
            Last Updated: May 15, 2026
          </p>

          <div className="mt-10 space-y-8 text-sm leading-8 text-stone-300 md:text-base">
            <section>
              <h2 className="text-xl font-semibold text-white">1. Introduction</h2>
              <p className="mt-3">
                Tamil Bible Premium ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our application.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">2. Data Collection</h2>
              <p className="mt-3">
                We do not collect any personal identification information (PII) like names, email addresses, or phone numbers unless you explicitly provide them for support. All your reading data (bookmarks, notes, history) is stored **locally** on your device and is not synced to our servers unless you use a backup feature (if available).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">3. Local Storage</h2>
              <p className="mt-3">
                Our application uses your browser's local storage or IndexedDB to save your settings and library data. This data stays on your device.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">4. Analytics</h2>
              <p className="mt-3">
                We may use anonymous analytics to understand how users interact with the app to improve the user experience. This data does not contain any personal information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">5. Contact Us</h2>
              <p className="mt-3">
                If you have any questions about this Privacy Policy, please contact us at kanniyakumarione@gmail.com.
              </p>
            </section>
          </div>
        </section>
      </div>
    </div>
  );
}
