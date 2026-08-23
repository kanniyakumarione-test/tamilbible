import useAppSettings from "../hooks/useAppSettings";
import { getUIText } from "../utils/uiText";

export default function AboutUs() {
  const [settings] = useAppSettings();
  const t = getUIText(settings.language);

  return (
    <div className="app-shell app-page pb-6 pt-4 md:pt-10">
      <div className="app-page-inner max-w-[1600px]">
        <section className="app-surface rounded-[2rem] p-8 md:p-12">
          <h1 className="text-3xl font-bold text-white md:text-4xl">
            {["en", "ta-en"].includes(settings.language) ? "About Us" : "எங்களைப் பற்றி"}
          </h1>
          
          <div className="mt-8 space-y-6 text-sm leading-relaxed text-stone-300 md:text-base">
            <p>
              Welcome to Tamil Bible Premium. Our mission is to provide a clean, modern, and high-performance digital environment for reading and studying the Tamil Bible. We believe that engaging with scripture should be a distraction-free and deeply enriching experience.
            </p>
            
            <p>
              Built entirely by and for the community, Tamil Bible Premium was designed with the needs of both personal devotion and church presentations in mind. From advanced offline search capabilities to seamless dual-language support, every feature has been carefully crafted to respect the sacred text and honor the Tamil language.
            </p>

            <h2 className="mt-8 text-xl font-bold text-white">Our Vision</h2>
            <p>
              We envision a world where the Tamil Christian community has access to world-class software that bridges the gap between ancient scriptures and modern technology. Whether you are a pastor preparing a sermon, or an individual seeking daily inspiration, this tool was made for you.
            </p>

            <h2 className="mt-8 text-xl font-bold text-white">Contact Us</h2>
            <p>
              We value your feedback, suggestions, and bug reports. You can reach out to us at any time by emailing <strong>softgenzservices@gmail.com</strong>.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
