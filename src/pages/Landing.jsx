import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { blogPosts } from '../data/blogPosts';

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const isMobile = typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(window.navigator.userAgent);

  useEffect(() => {
    // Skip landing page for Native Android (Capacitor) or Desktop (Electron)
    if (window.Capacitor?.isNativePlatform?.() || (window.process && window.process.type)) {
      navigate('/home');
      return;
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30 overflow-x-hidden font-sans">
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 8s ease-in-out infinite 2s;
        }
      `}</style>

      {/* 0. NAVIGATION BAR */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/90 backdrop-blur-2xl border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden bg-white/5 border border-white/10 transition-transform group-hover:scale-105">
              <img src="/logo.png" alt="Tamil Bible Logo" className="h-full w-full object-cover" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Tamil Bible Premium</span>
          </div>
          <div className="hidden lg:flex items-center gap-10 text-sm font-medium text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#sermon" className="hover:text-white transition-colors">Sermon Builder</a>
            <a href="#performance" className="hover:text-white transition-colors">Performance</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              to="/home"
              className="px-6 py-2.5 rounded-full bg-white text-black font-bold text-sm hover:scale-105 transition-all"
            >
              Read Online
            </Link>
          </div>
        </div>
      </nav>

      {/* 1. HERO SECTION */}
      <section className="relative pt-28 pb-16 md:pt-40 md:pb-24 bg-black">
        {/* Subtle Accent Glows (Very Dark) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[400px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/[0.03] to-transparent pointer-events-none" />
        
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 grid xl:grid-cols-2 gap-16 md:gap-24 items-center">
          
          {/* Left: Text & CTA */}
          <div className="flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/5 bg-white/[0.02] mb-8">
              <span className="flex h-2 w-2 rounded-full bg-white animate-pulse" />
              <span className="text-xs font-medium tracking-[0.2em] text-zinc-400 uppercase">Version 1.0 is Live</span>
            </div>
            
            <h1 className="text-6xl md:text-[5.5rem] font-black tracking-tighter mb-8 leading-[1.05] text-white">
              Church Media. <br />
              <span className="text-zinc-500">
                Reimagined.
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-zinc-400 max-w-xl mb-12 leading-[1.6]">
              An entirely new standard for worship presentation. Zero-latency transitions, deeply integrated Tamil & English Bibles, and a native mobile remote. 100% Offline.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
              {isMobile ? (
                <Link
                  to="/home"
                  className="group relative flex items-center justify-center gap-4 overflow-hidden rounded-full bg-white px-10 py-5 font-bold text-black transition-all hover:scale-105 active:scale-95 w-full sm:w-auto shrink-0"
                >
                  <span className="text-lg whitespace-nowrap">Read Online</span>
                  <svg className="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </Link>
              ) : (
                <a
                  href="https://github.com/kanniyakumarione-test/tamilbible/releases/download/v1.0.0/Tamil.Bible.Premium.Setup.1.0.0.exe"
                  className="group relative flex items-center justify-center gap-3 overflow-hidden rounded-full bg-white px-10 py-5 text-lg font-bold text-black transition-all hover:scale-105 active:scale-95 w-full sm:w-auto shrink-0"
                >
                  <span className="text-lg whitespace-nowrap">Download for Windows</span>
                  <svg className="w-6 h-6 opacity-80 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </a>
              )}
              
              <div className="flex items-center gap-4 text-sm font-medium text-zinc-500 w-full justify-center sm:justify-start pl-2">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                  Free Forever
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                  No Internet Needed
                </span>
              </div>
            </div>
          </div>

          {/* Right: Massive Device Composition */}
          <div className="relative w-full h-[500px] md:h-[700px] flex items-center justify-center perspective-[1500px]">
            
            {/* CSS Laptop Mockup (Hero) */}
            <div className="relative w-[130%] max-w-[900px] -translate-x-12 z-10 transition-transform duration-1000 ease-out hover:scale-105 hover:-rotate-1 animate-float rounded-t-[2rem]">
              <div className="relative aspect-[16/10] w-full rounded-t-[2rem] border-[8px] md:border-[12px] border-zinc-900 bg-black overflow-hidden border-b-0">
                {/* Screen Content */}
                <div className="absolute inset-0 flex flex-col">
                  {/* Fake Menu Bar */}
                  <div className="h-6 md:h-8 w-full bg-[#111] border-b border-white/5 flex items-center px-4 gap-2">
                    <div className="h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-zinc-700" />
                    <div className="h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-zinc-700" />
                    <div className="h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-zinc-700" />
                    <div className="ml-4 h-2 w-32 rounded-full bg-white/5" />
                  </div>
                  {/* Presentation Mode Simulation */}
                  <div className="flex-1 flex flex-col items-center justify-center bg-black p-4 md:p-8 relative overflow-hidden">
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-3 md:mb-5 text-center whitespace-nowrap">யோவான் 3:16</h2>
                    <p className="text-lg md:text-2xl text-zinc-400 text-center leading-[1.6] max-w-xl font-medium px-4">தேவன், தம்முடைய ஒரேபேறான குமாரனை விசுவாசிக்கிறவன் எவனோ அவன் கெட்டுப்போகாமல் நித்திய ஜீவனை அடையும்படிக்கு...</p>
                  </div>
                </div>
              </div>
              <div className="relative h-6 md:h-8 w-[114%] -ml-[7%] rounded-b-[1.5rem] bg-zinc-900 flex justify-center border-t border-white/5 shadow-2xl">
                <div className="h-2 md:h-3 w-40 bg-black rounded-b-lg mt-0" />
              </div>
            </div>

            {/* CSS Phone Mockup (Floating Right) */}
            <div className="absolute -bottom-10 right-0 md:-right-16 w-[200px] md:w-[260px] h-[400px] md:h-[520px] rounded-[3rem] border-[10px] md:border-[14px] border-zinc-900 bg-black shadow-2xl z-20 overflow-hidden transform rotate-12 animate-float-delayed">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 md:h-8 w-28 bg-zinc-900 rounded-b-2xl z-30" />
              <div className="absolute inset-0 p-5 pt-12 flex flex-col gap-4 bg-black">
                <div className="flex justify-between items-center mb-2">
                  <div className="h-3 w-1/2 bg-white/10 rounded-full" />
                </div>
                <div className="h-32 w-full rounded-[1.5rem] bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-3">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  <span className="text-xs font-bold text-white uppercase tracking-widest">Next Slide</span>
                </div>
                <div className="flex-1 rounded-[1.5rem] border border-white/5 bg-white/[0.02] p-4 flex flex-col gap-4">
                  <div className="h-3 w-3/4 rounded-full bg-white/10" />
                  <div className="h-2 w-full rounded-full bg-white/5" />
                  <div className="h-2 w-full rounded-full bg-white/5" />
                  <div className="mt-auto flex gap-3">
                    <div className="h-10 flex-1 rounded-xl bg-white/5" />
                    <div className="h-10 flex-1 rounded-xl bg-white/5" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. INFINITE SCROLLING MARQUEE (Colorful Dark Theme) */}
      <div className="w-full bg-white/[0.02] py-6 overflow-hidden flex whitespace-nowrap border-y border-white/5 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black z-10 pointer-events-none" />
        <div className="animate-scroll flex gap-12 items-center w-[200%]">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-12 items-center min-w-full justify-around font-black uppercase tracking-[0.2em] text-sm">
              <span className="bg-gradient-to-r from-emerald-400 to-emerald-200 text-transparent bg-clip-text">100% Offline Capable</span>
              <span className="text-zinc-700 text-xs">✦</span>
              <span className="bg-gradient-to-r from-blue-400 to-cyan-300 text-transparent bg-clip-text">Zero Transition Latency</span>
              <span className="text-zinc-700 text-xs">✦</span>
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">Tamil & English Dual Engine</span>
              <span className="text-zinc-700 text-xs">✦</span>
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 text-transparent bg-clip-text">Auto-Projector Detection</span>
              <span className="text-zinc-700 text-xs">✦</span>
              <span className="bg-gradient-to-r from-rose-400 to-red-400 text-transparent bg-clip-text">WiFi Mobile Remote</span>
            </div>
          ))}
        </div>
      </div>


      {/* 3. SMART SEARCH SECTION */}
      <section className="py-20 md:py-32 relative bg-black border-t border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-black to-black pointer-events-none" />
        <div className="max-w-[1400px] mx-auto px-6 grid lg:grid-cols-2 gap-16 md:gap-24 items-center">
          
          <div className="text-left order-2 lg:order-1 relative z-10">
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 mb-6">
               <span className="text-blue-400 font-bold uppercase tracking-widest text-xs">Tanglish AI Search</span>
             </div>
             <h2 className="text-5xl md:text-6xl font-black mb-8 tracking-tight text-white">Search exactly how you <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">think.</span></h2>
             <p className="text-xl md:text-2xl text-zinc-400 max-w-xl mb-10 leading-[1.6]">
               Stop wasting time hunting for verses. Type in English, Tamil, or Tanglish. Search for "Yovan 3 16", "யோவான் 3:16", or "John 3 16" and instantly jump to the right verse in milliseconds.
             </p>
             <div className="flex items-center gap-4">
               <div className="flex -space-x-4">
                 <div className="w-12 h-12 rounded-full bg-zinc-800 border-2 border-black flex items-center justify-center font-bold text-xs text-white">TA</div>
                 <div className="w-12 h-12 rounded-full bg-zinc-700 border-2 border-black flex items-center justify-center font-bold text-xs text-white">EN</div>
                 <div className="w-12 h-12 rounded-full bg-blue-900 border-2 border-black flex items-center justify-center font-bold text-xs text-blue-200">A/அ</div>
               </div>
               <span className="text-sm font-medium text-zinc-400">Trilingual indexing engine built-in.</span>
             </div>
          </div>

          <div className="relative order-1 lg:order-2 perspective-[1000px] flex justify-center">
            {/* Ambient glow behind card */}
            <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full" />
            
            <div className="relative w-full max-w-lg rounded-[2.5rem] border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl transform rotate-3 transition-transform hover:rotate-0 duration-500 hover:scale-105 z-10">
              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <div className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-xl text-white font-medium flex items-center gap-2">
                  <span>Yovan 3 16</span>
                  <div className="w-0.5 h-6 bg-blue-400 animate-pulse" />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-white font-bold text-lg">யோவான் 3:16</h4>
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full font-bold">100% Match</span>
                  </div>
                  <p className="text-zinc-300 text-sm leading-relaxed">தேவன், தம்முடைய ஒரேபேறான குமாரனை விசுவாசிக்கிறவன் எவனோ அவன் கெட்டுப்போகாமல் நித்திய ஜீவனை அடையும்படிக்கு, அவரைத் தந்தருளி, இவ்வளவாய் உலகத்தில் அன்புகூர்ந்தார்.</p>
                </div>
                
                <div className="p-5 rounded-2xl bg-white/5 border border-white/5 opacity-50">
                  <h4 className="text-white font-bold text-lg mb-2">1 யோவான் 3:16</h4>
                  <p className="text-zinc-400 text-sm leading-relaxed">அவர் தம்முடைய ஜீவனை நமக்காகக் கொடுத்ததினாலே அன்பு இன்னதென்று அறிந்திருக்கிறோம்...</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. MEGA BENTO GRID (ENGINEERED FOR THE ALTAR) */}
      <section id="features" className="py-20 md:py-32 relative bg-black">
        <div className="max-w-[1400px] mx-auto px-6">
          
          <div className="text-center mb-16 md:mb-24">
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 mb-6">
               <span className="text-emerald-400 font-bold uppercase tracking-widest text-xs">Live Environment</span>
             </div>
            <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tight text-white">Engineered for the <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">Altar.</span></h2>
            <p className="text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">Everything a media director needs to deliver a flawless visual experience during service. Designed specifically to prevent embarrassing technical failures.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1 (Large Span) - EMERALD */}
            <div className="md:col-span-2 group rounded-[3rem] border border-emerald-500/20 bg-gradient-to-br from-emerald-950/30 to-black p-12 overflow-hidden relative transition-all duration-500 hover:border-emerald-500/50 hover:shadow-[0_0_80px_rgba(16,185,129,0.15)]">
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="h-20 w-20 rounded-[1.5rem] bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-10 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-4xl font-black mb-6 tracking-tight text-white">Auto-Projector Detection</h3>
                  <p className="text-zinc-400 text-lg leading-[1.8] max-w-lg">Instantly detects secondary monitors and HDMI cables. It automatically launches the presentation fullscreen on the projector while keeping the control dashboard perfectly scaled on your laptop.</p>
                </div>
              </div>
            </div>

            {/* Feature 2 (Square) - BLUE */}
            <div className="group rounded-[3rem] border border-blue-500/20 bg-gradient-to-br from-blue-950/30 to-black p-12 relative transition-all duration-500 hover:border-blue-500/50 hover:shadow-[0_0_50px_rgba(59,130,246,0.15)]">
              <div className="h-20 w-20 rounded-[1.5rem] bg-blue-500/20 text-blue-400 flex items-center justify-center mb-10 border border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-3xl font-black mb-4 tracking-tight text-white">Mobile Remote</h3>
              <p className="text-zinc-400 leading-[1.8]">Control the projector wirelessly over local WiFi. Perfect for pastors who want to change slides directly from the pulpit.</p>
            </div>

            {/* Feature 3 (Square) - AMBER */}
            <div className="group rounded-[3rem] border border-amber-500/20 bg-gradient-to-br from-amber-950/30 to-black p-12 relative transition-all duration-500 hover:border-amber-500/50 hover:shadow-[0_0_50px_rgba(245,158,11,0.15)]">
              <div className="h-20 w-20 rounded-[1.5rem] bg-amber-500/20 text-amber-400 flex items-center justify-center mb-10 border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              </div>
              <h3 className="text-3xl font-black mb-4 tracking-tight text-white">Dual-Language</h3>
              <p className="text-zinc-400 leading-[1.8]">Display Tamil and English side-by-side on the projector simultaneously. An absolute necessity for bilingual congregations.</p>
            </div>

            {/* Feature 4 (Square) - ROSE */}
            <div className="group rounded-[3rem] border border-rose-500/20 bg-gradient-to-br from-rose-950/30 to-black p-12 relative transition-all duration-500 hover:border-rose-500/50 hover:shadow-[0_0_50px_rgba(244,63,94,0.15)]">
              <div className="h-20 w-20 rounded-[1.5rem] bg-rose-500/20 text-rose-400 flex items-center justify-center mb-10 border border-rose-500/30 shadow-[0_0_30px_rgba(244,63,94,0.3)]">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-3xl font-black mb-4 tracking-tight text-white">Anti-Sleep Logic</h3>
              <p className="text-zinc-400 leading-[1.8]">Built-in safeguards automatically prevent your computer from going to sleep or showing a screensaver during a sermon.</p>
            </div>

            {/* Feature 5 (Square) - PURPLE */}
            <div className="group rounded-[3rem] border border-purple-500/20 bg-gradient-to-br from-purple-950/30 to-black p-12 relative transition-all duration-500 hover:border-purple-500/50 hover:shadow-[0_0_50px_rgba(168,85,247,0.15)]">
              <div className="h-20 w-20 rounded-[1.5rem] bg-purple-500/20 text-purple-400 flex items-center justify-center mb-10 border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <h3 className="text-3xl font-black mb-4 tracking-tight text-white">Silent Updates</h3>
              <p className="text-zinc-400 leading-[1.8]">Never worry about updates. The desktop app seamlessly downloads and installs new versions silently in the background.</p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. SERMON BUILDER (3D STACK SECTION) - ROSE THEME */}
      <section id="sermon" className="py-20 md:py-40 relative overflow-hidden bg-black border-t border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 grid lg:grid-cols-2 gap-12 md:gap-20 items-center">
          
          <div className="relative h-[400px] perspective-[2000px] flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center transform-style-3d group">
               {/* Back Slide */}
               <div className="absolute w-[80%] aspect-[16/9] rounded-2xl bg-rose-950/20 border border-rose-500/10 shadow-2xl transform translate-z-[-100px] translate-y-[-40px] opacity-40 transition-transform duration-700 group-hover:translate-y-[-60px]" />
               {/* Middle Slide */}
               <div className="absolute w-[85%] aspect-[16/9] rounded-2xl bg-rose-950/40 border border-rose-500/20 shadow-2xl transform translate-z-[-50px] translate-y-[-20px] opacity-70 transition-transform duration-700 group-hover:translate-y-[-30px]" />
               {/* Front Slide (Main) */}
               <div className="absolute w-[90%] aspect-[16/9] rounded-3xl bg-black border border-rose-500/50 shadow-[0_30px_60px_rgba(244,63,94,0.2)] transform translate-z-[0px] p-8 flex flex-col items-center justify-center transition-transform duration-700 group-hover:scale-105">
                 <h4 className="text-3xl font-black text-white mb-2">My Sunday Sermon</h4>
                 <div className="flex gap-2 mt-4">
                   <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-white">4 Verses</span>
                   <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-white">2 Songs</span>
                   <span className="px-3 py-1 bg-rose-500/20 text-rose-400 rounded-full text-xs font-bold">Ready</span>
                 </div>
               </div>
            </div>
          </div>

          <div className="text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-rose-500/30 bg-rose-500/10 mb-6">
              <span className="text-rose-400 font-bold uppercase tracking-widest text-xs">Sermon Builder</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black mb-8 tracking-tight text-white">Prepare everything. <br/>Present <span className="text-rose-400">anything.</span></h2>
            <p className="text-xl text-zinc-400 mb-10 leading-[1.8]">Stop scrambling to find verses during service. The built-in Sermon Builder lets you prepare entire slide decks—verses, songs, and custom slides—and save them locally. When it's time to preach, just click next.</p>
            <Link to="/home" className="inline-flex items-center justify-center gap-3 rounded-full bg-white text-black px-8 py-4 font-bold transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]">
              Try the Sermon Builder
            </Link>
          </div>
          
        </div>
      </section>

      {/* 6. PERFORMANCE DEEP DIVE - EMERALD/CYAN THEME */}
      <section id="performance" className="py-20 md:py-32 border-t border-white/5 bg-black overflow-hidden relative">
        <div className="max-w-[1400px] mx-auto px-6 grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          
          <div className="text-left order-2 md:order-1">
            <h2 className="text-5xl md:text-6xl font-black mb-8 tracking-tight text-white">Performance is a <br/><span className="text-emerald-400">Feature.</span></h2>
            <p className="text-xl text-zinc-400 mb-10 leading-[1.8]">Built on modern web technologies like React, Vite, and Electron, this software doesn't just look good—it runs incredibly fast. Instantly search thousands of verses with zero buffering, and render highly-animated transitions to the projector seamlessly.</p>
            
            <ul className="space-y-8">
              <li className="flex items-start gap-5">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-white mb-2">Hardware Accelerated</h4>
                  <p className="text-zinc-400 text-lg">All projector transitions and animations utilize your computer's GPU acceleration for perfect 60fps rendering without straining the CPU.</p>
                </div>
              </li>
              <li className="flex items-start gap-5">
                <div className="h-12 w-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-white mb-2">Ultra-Lightweight Engine</h4>
                  <p className="text-zinc-400 text-lg">No bloatware. The entire application runs using a fraction of the memory required by traditional bloated presentation software.</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="relative w-full h-[500px] order-1 md:order-2 flex items-center justify-center perspective-[1000px]">
             {/* Fake Code / Processing box */}
             <div className="relative w-full max-w-[500px] rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#1a1a1a] to-black shadow-[0_30px_80px_rgba(16,185,129,0.15)] z-10 font-mono text-sm overflow-hidden transform rotate-2 transition-transform hover:rotate-0 duration-700 hover:scale-105">
               <div className="flex items-center gap-2 p-4 bg-white/[0.02] border-b border-white/5">
                 <div className="h-3 w-3 rounded-full bg-rose-500" />
                 <div className="h-3 w-3 rounded-full bg-amber-500" />
                 <div className="h-3 w-3 rounded-full bg-emerald-500" />
                 <span className="ml-2 text-zinc-400 font-medium text-xs tracking-wider">engine.log</span>
               </div>
               <div className="p-6 space-y-4">
                 <div className="flex gap-4">
                   <span className="text-zinc-600 shrink-0">08:00:01</span>
                   <span className="text-emerald-400 font-bold shrink-0">INFO</span>
                   <span className="text-zinc-300">Booting Tamil Bible Engine...</span>
                 </div>
                 <div className="flex gap-4">
                   <span className="text-zinc-600 shrink-0">08:00:01</span>
                   <span className="text-emerald-400 font-bold shrink-0">INFO</span>
                   <span className="text-zinc-300">Loading React Core Modules [OK]</span>
                 </div>
                 <div className="flex gap-4">
                   <span className="text-zinc-600 shrink-0">08:00:01</span>
                   <span className="text-cyan-400 font-bold shrink-0">LOAD</span>
                   <span className="text-zinc-300">Indexing 31,102 verses into memory...</span>
                 </div>
                 <div className="flex gap-4">
                   <span className="text-zinc-600 shrink-0">08:00:01</span>
                   <span className="text-emerald-400 font-bold shrink-0">INFO</span>
                   <span className="text-zinc-300">Database Indexed in 0.015s.</span>
                 </div>
                 <div className="flex gap-4">
                   <span className="text-zinc-600 shrink-0">08:00:02</span>
                   <span className="text-purple-400 font-bold shrink-0">GPU</span>
                   <span className="text-zinc-300">Init Hardware Acceleration...</span>
                 </div>
                 <div className="flex gap-4">
                   <span className="text-zinc-600 shrink-0">08:00:02</span>
                   <span className="text-emerald-400 font-bold shrink-0">INFO</span>
                   <span className="text-zinc-300">WebGL Renderer Active.</span>
                 </div>
                 <div className="mt-6 pt-4 border-t border-white/10">
                   <p className="text-emerald-400 font-bold text-base animate-pulse">» Ready for Live Presentation. 🚀</p>
                 </div>
               </div>
             </div>
          </div>
          
        </div>
      </section>

      {/* 7. METRICS / TRUST SECTION */}
      <section className="py-20 md:py-32 border-t border-white/5 bg-black relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-900/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-[1400px] mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-white">Built for <span className="text-emerald-400">Pastors</span>, <br />loved by the <span className="text-cyan-400">Congregation</span>.</h2>
            <p className="text-xl text-zinc-400 leading-[1.8] mb-8">
              We reimagined what church presentation software should feel like. No more clunky menus, expensive subscriptions, or unexpected crashes during worship.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl border border-white/10 bg-white/5">
                <h3 className="text-4xl font-black text-white mb-2">31k+</h3>
                <p className="text-sm font-medium text-zinc-500 uppercase tracking-widest">Indexed Verses</p>
              </div>
              <div className="p-6 rounded-3xl border border-white/10 bg-white/5">
                <h3 className="text-4xl font-black text-white mb-2">0ms</h3>
                <p className="text-sm font-medium text-zinc-500 uppercase tracking-widest">Transition Delay</p>
              </div>
              <div className="p-6 rounded-3xl border border-white/10 bg-white/5">
                <h3 className="text-4xl font-black text-white mb-2">100%</h3>
                <p className="text-sm font-medium text-zinc-500 uppercase tracking-widest">Free Forever</p>
              </div>
              <div className="p-6 rounded-3xl border border-white/10 bg-white/5">
                <h3 className="text-4xl font-black text-white mb-2">Offline</h3>
                <p className="text-sm font-medium text-zinc-500 uppercase tracking-widest">No Internet Needed</p>
              </div>
            </div>
          </div>
          
          <div className="relative">
            {/* Ambient Background for Testimonials */}
            <div className="absolute inset-0 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="grid grid-cols-1 gap-6 relative z-10">
              
              <div className="p-8 md:p-10 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300">
                <div className="flex text-amber-400 mb-6 text-sm gap-1">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                </div>
                <p className="text-white text-lg leading-relaxed mb-8 font-medium">"Finally, a presentation software that just works. The Tanglish search is an absolute lifesaver during fast-paced sermons."</p>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-sm">WP</div>
                  <div>
                    <h5 className="text-white font-bold text-sm">Worship Pastor</h5>
                    <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mt-1">Chennai, TN</p>
                  </div>
                </div>
              </div>

              <div className="p-8 md:p-10 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300">
                <div className="flex text-amber-400 mb-6 text-sm gap-1">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                </div>
                <p className="text-white text-lg leading-relaxed mb-8 font-medium">"The dual-language projector view is perfect for our bilingual church. Our media team loves how lightweight and fast it is."</p>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-sm">MD</div>
                  <div>
                    <h5 className="text-white font-bold text-sm">Media Director</h5>
                    <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mt-1">Coimbatore, TN</p>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </section>

      {/* 8. BLOG / ARTICLES SECTION */}
      <section className="py-20 md:py-32 border-t border-white/5 bg-black">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-white">Latest <span className="text-blue-400">Articles</span></h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Read news, guides, and tips on how to get the most out of Tamil Bible Premium.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1200px] mx-auto">
            {blogPosts.map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="group flex flex-col rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition-all hover:border-white/20 hover:bg-white/[0.04] hover:-translate-y-1"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-full bg-blue-500/10 text-blue-400 px-3 py-1 text-[10px] font-bold tracking-wider uppercase">
                    Guide
                  </span>
                  <span className="text-[11px] text-zinc-500 font-medium">{post.date}</span>
                </div>
                <h3 className="mb-3 text-lg font-bold text-white transition-colors group-hover:text-blue-400 leading-tight">
                  {post.title}
                </h3>
                <p className="mb-6 flex-1 text-sm text-zinc-400 leading-relaxed line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="mt-auto flex items-center text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                  Read Article 
                  <span className="ml-1.5 transition-transform group-hover:translate-x-1">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 9. FAQ SECTION */}
      <section id="faq" className="py-20 md:py-32 border-t border-white/5 bg-black">
        <div className="max-w-[1000px] mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-10 md:mb-16 tracking-tight text-white">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div className="group p-8 md:p-10 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/[0.02] transition-all duration-300 hover:-translate-y-1">
              <div className="h-12 w-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6 border border-blue-500/20 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h4 className="text-xl font-bold text-white mb-4">Do I need the internet to use it?</h4>
              <p className="text-zinc-400 leading-relaxed">No. Once installed, the Windows and Android applications contain the entire Bible database and all premium fonts locally. It works 100% offline.</p>
            </div>
            
            <div className="group p-8 md:p-10 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/[0.02] transition-all duration-300 hover:-translate-y-1">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h4 className="text-xl font-bold text-white mb-4">Is it really completely free?</h4>
              <p className="text-zinc-400 leading-relaxed">Yes. Tamil Bible Premium is an open-source project built to serve the Church. There are no subscriptions, no ads, and no hidden fees.</p>
            </div>
            
            <div className="group p-8 md:p-10 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-purple-500/30 hover:bg-purple-500/[0.02] transition-all duration-300 hover:-translate-y-1">
              <div className="h-12 w-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-6 border border-purple-500/20 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <h4 className="text-xl font-bold text-white mb-4">Does it work on Mac or iOS?</h4>
              <p className="text-zinc-400 leading-relaxed">Currently, we offer native apps for Windows and Android. However, Mac and iOS users can use the fully functional Web App via Safari or Chrome.</p>
            </div>
            
            <div className="group p-8 md:p-10 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-rose-500/30 hover:bg-rose-500/[0.02] transition-all duration-300 hover:-translate-y-1">
              <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-6 border border-rose-500/20 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </div>
              <h4 className="text-xl font-bold text-white mb-4">How do I update the software?</h4>
              <p className="text-zinc-400 leading-relaxed">You don't have to! The Windows application has a built-in auto-updater that silently downloads and applies updates in the background.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. MEGA BOTTOM CTA */}
      <section className="py-20 relative overflow-hidden bg-black border-t border-white/5">
        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          <div className="rounded-[3rem] border border-white/10 bg-gradient-to-b from-white/5 to-black p-10 md:p-16 text-center relative overflow-hidden shadow-2xl">
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent opacity-60 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-black border border-emerald-500/40 mb-8 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
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

      {/* 10. FOOTER */}
      <footer className="border-t border-white/5 bg-black py-6">
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
