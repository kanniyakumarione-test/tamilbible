import useAppSettings from "../hooks/useAppSettings";

export default function Terms() {
  const [settings] = useAppSettings();

  return (
    <div className="app-shell app-page pb-6 pt-4 md:pt-10">
      <div className="app-page-inner max-w-[1600px]">
        <section className="app-surface rounded-[2rem] p-8 md:p-12">
          <h1 className="text-3xl font-bold text-white md:text-4xl">
            {["en", "ta-en"].includes(settings.language) ? "Terms of Service" : "சேவை விதிமுறைகள்"}
          </h1>
          
          <div className="mt-8 space-y-6 text-sm leading-relaxed text-stone-300 md:text-base">
            <p>
              Welcome to Tamil Bible Premium. By accessing or using our application, you agree to comply with and be bound by the following terms and conditions.
            </p>

            <h2 className="mt-8 text-xl font-bold text-white">1. Use of the Application</h2>
            <p>
              Tamil Bible Premium is provided for personal, educational, and church use. The content, including the Tamil and English Bible texts, is intended for personal study and presentation purposes.
            </p>

            <h2 className="mt-8 text-xl font-bold text-white">2. Offline Functionality & Local Storage</h2>
            <p>
              Our application relies heavily on your browser's local storage (IndexedDB and LocalStorage) to keep your highlights, notes, and preferences completely private and offline. You are solely responsible for ensuring your browser data is not cleared if you wish to retain your personal data.
            </p>

            <h2 className="mt-8 text-xl font-bold text-white">3. Disclaimers</h2>
            <p>
              The application and its content are provided on an "as-is" basis without warranties of any kind. We do not guarantee that the application will be completely free of errors, uninterrupted, or perfectly accurate in its textual rendering at all times.
            </p>

            <h2 className="mt-8 text-xl font-bold text-white">4. Contact</h2>
            <p>
              If you have any questions or concerns regarding these Terms of Service, please contact us at <strong>kanniyakumarione@gmail.com</strong>.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
