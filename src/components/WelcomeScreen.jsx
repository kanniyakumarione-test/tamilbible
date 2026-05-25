import React, { useEffect, useState } from 'react';

export default function WelcomeScreen({ onComplete }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Stage 0: Initial render (fade in logo)
    const t1 = setTimeout(() => setStage(1), 300); // fade in text
    const t2 = setTimeout(() => setStage(2), 2000); // start fade out
    const t3 = setTimeout(() => {
      if (onComplete) onComplete();
    }, 2500); // unmount

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#0a0a0a] transition-opacity duration-500 ${
        stage === 2 ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div 
        className="relative mb-8 h-32 w-32 transform transition-all duration-1000 ease-out" 
        style={{ 
          opacity: 1, 
          transform: stage >= 0 ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.9)' 
        }}
      >
        <div className="absolute inset-0 rounded-[2.5rem] bg-yellow-500/20 blur-2xl animate-pulse" />
        <img 
          src="/logo.png" 
          alt="Tamil Bible Logo" 
          className="relative h-full w-full rounded-[2.5rem] object-cover shadow-[0_0_40px_rgba(212,175,55,0.15)]" 
        />
      </div>
      
      <div 
        className={`flex flex-col items-center transition-all duration-700 ease-out ${
          stage >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        <h1 className="bg-gradient-to-r from-yellow-100 via-yellow-400 to-yellow-100 bg-clip-text text-3xl font-extrabold tracking-wider text-transparent">
          Tamil Bible
        </h1>
        <p className="mt-3 text-xs font-bold tracking-[0.3em] text-zinc-500 uppercase">
          God Loves You
        </p>
      </div>
    </div>
  );
}
