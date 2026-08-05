import { useParams, Link } from "react-router-dom";
import { blogPosts } from "../data/blogPosts";
import NotFound from "./NotFound";

export default function BlogPost() {
  const { slug } = useParams();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30 overflow-x-hidden font-sans">
      {/* 0. NAVIGATION BAR */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-black/90 backdrop-blur-2xl border-b border-white/5 py-4">
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden bg-white/5 border border-white/10 transition-transform group-hover:scale-105">
              <img src="/logo.png" alt="Tamil Bible Logo" className="h-full w-full object-cover" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white hidden sm:block">Tamil Bible Premium</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link 
              to="/"
              className="px-5 py-2.5 rounded-full bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-all flex items-center gap-2"
            >
              <span className="transition-transform group-hover:-translate-x-1">←</span> Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* 1. ARTICLE HERO */}
      <section className="relative pt-32 pb-10 md:pt-40 md:pb-12 bg-black border-b border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[400px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10 max-w-[800px] mx-auto px-6 text-center animate-fade-in">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/[0.05] mb-8">
            <span className="text-xs font-bold tracking-[0.1em] text-blue-400 uppercase">Article</span>
          </div>
          <h1 className="mb-6 text-4xl font-black text-white md:text-5xl lg:text-6xl md:leading-[1.1] tracking-tight">
            {post.title}
          </h1>
          <div className="flex items-center justify-center gap-4 text-sm font-medium text-zinc-400 mt-8">
            <span>By {post.author}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-700"></span>
            <span>{post.date}</span>
          </div>
        </div>
      </section>

      {/* 2. ARTICLE CONTENT */}
      <section className="pt-8 pb-16 md:pt-12 md:pb-24 bg-[#020202]">
        <div className="max-w-[800px] mx-auto px-6 animate-slide-up">
          <article 
            className="blog-content text-zinc-300 leading-[1.8]"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </section>

      {/* 3. MEGA BOTTOM CTA */}
      <section className="py-20 relative overflow-hidden bg-black border-t border-white/5">
        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          <div className="rounded-[3rem] border border-white/10 bg-gradient-to-b from-white/5 to-black p-10 md:p-16 text-center relative overflow-hidden shadow-2xl">
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent opacity-60 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-black border border-blue-500/40 mb-8 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                <img src="/logo.png" alt="Logo" className="w-10 h-10" />
              </div>
              
              <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-white">Ready to upgrade your church media?</h2>
              <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">Download the premium suite for Windows or Android today. It's perfectly engineered for live environments.</p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                <a
                  href="https://github.com/kanniyakumarione-test/tamilbible/releases/download/v1.0.0/Tamil.Bible.Premium.Setup.1.0.0.exe"
                  className="group relative flex items-center justify-center gap-3 rounded-full bg-white px-8 py-4 font-bold text-black transition-all hover:scale-105 active:scale-95 w-full sm:w-auto shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                  <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download for Windows
                </a>
                <a
                  href="https://github.com/kanniyakumarione-test/tamilbible/releases/download/v1.0.0/Tamil-Bible.apk"
                  className="group relative flex items-center justify-center gap-3 rounded-full border border-white/20 bg-white/5 px-8 py-4 font-bold text-white transition-all hover:bg-white/10 active:scale-95 w-full sm:w-auto"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4483-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.244 13.8533 7.8512 12 7.8512s-3.5902.3928-5.1367 1.099L4.841 5.447a.416.416 0 00-.5677-.1521.416.416 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396" /></svg>
                  Download for Android
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FOOTER */}
      <footer className="border-t border-white/5 bg-black py-6 mt-auto">
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col items-center justify-center gap-2 text-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden bg-white/5 border border-white/10 opacity-70">
            <img src="/logo.png" alt="Tamil Bible Logo" className="h-full w-full object-cover" />
          </div>
          <p className="text-zinc-600 text-xs font-medium">© {new Date().getFullYear()} Tamil Bible Premium. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
