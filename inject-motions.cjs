const fs = require('fs');
const path = require('path');

const cssFile = path.join(__dirname, 'src', 'index.css');
let css = fs.readFileSync(cssFile, 'utf8');

// We need to completely remove the old motion variants and append new ones.
// The motion variants start at `.motion-bg--stars` and end at `@keyframes`.

const startRegex = /\.motion-bg--stars\s*\{/;
const endRegex = /@keyframes app-page-enter/;

const startIndex = css.search(startRegex);
const endIndex = css.search(endRegex);

if (startIndex !== -1 && endIndex !== -1) {
  const before = css.substring(0, startIndex);
  const after = css.substring(endIndex);

  const newMotions = `
/* ==========================================================
   VIBRANT & DISTINCT MOTION BACKGROUNDS
   ========================================================== */

/* --- STARS: Deep space, twinkling white/blue stars drifting slowly --- */
.motion-bg--stars {
  background: radial-gradient(ellipse at bottom, #0d1d31 0%, #0c0d13 100%);
}
.motion-bg--stars .motion-bg__layer--base {
  background: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.05), transparent 60%);
}
.motion-bg--stars .motion-bg__layer--one {
  background-image: 
    radial-gradient(circle, #ffffff 0 1px, transparent 1.5px),
    radial-gradient(circle, rgba(147, 197, 253, 0.9) 0 1px, transparent 2px);
  background-size: 150px 150px, 200px 200px;
  background-position: 0 0, 50px 50px;
  animation: motion-stars-drift 60s linear infinite;
  opacity: 0.8;
}
.motion-bg--stars .motion-bg__layer--two {
  background-image: 
    radial-gradient(circle, #ffffff 0 2px, transparent 2.5px),
    radial-gradient(circle, rgba(255, 255, 255, 0.5) 0 1px, transparent 2px);
  background-size: 250px 250px, 350px 350px;
  background-position: 20px 20px, 100px 100px;
  animation: motion-stars-drift 40s linear infinite reverse;
  opacity: 0.9;
  filter: blur(0.5px);
}
.motion-bg--stars .motion-bg__layer--three {
  background: radial-gradient(circle at 80% 20%, rgba(56, 189, 248, 0.15), transparent 40%);
  animation: motion-pulse 8s ease-in-out infinite;
}
.motion-bg--stars .motion-bg__layer--four {
  background: transparent;
}

/* --- PARTICLES: Tech/Sci-Fi glowing cyan/emerald orbs --- */
.motion-bg--particles {
  background: linear-gradient(180deg, #022c22 0%, #020617 100%);
}
.motion-bg--particles .motion-bg__layer--base {
  background: radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.15), transparent 60%);
}
.motion-bg--particles .motion-bg__layer--one {
  background-image: 
    radial-gradient(circle, rgba(52, 211, 153, 1) 0 3px, transparent 4px),
    radial-gradient(circle, rgba(45, 212, 191, 0.8) 0 2px, transparent 3px);
  background-size: 120px 120px, 180px 180px;
  animation: motion-particles-rise 15s ease-in-out infinite alternate;
  filter: drop-shadow(0 0 6px rgba(52, 211, 153, 0.8));
  opacity: 0.8;
}
.motion-bg--particles .motion-bg__layer--two {
  background-image: 
    radial-gradient(circle, rgba(16, 185, 129, 0.6) 0 4px, transparent 6px);
  background-size: 220px 220px;
  animation: motion-float 12s ease-in-out infinite alternate;
  filter: blur(2px) drop-shadow(0 0 10px rgba(16, 185, 129, 0.5));
}
.motion-bg--particles .motion-bg__layer--three {
  background: radial-gradient(circle at 20% 80%, rgba(45, 212, 191, 0.2), transparent 40%);
  animation: motion-pulse 6s ease-in-out infinite;
}
.motion-bg--particles .motion-bg__layer--four {
  background: transparent;
}

/* --- EMBERS: Fiery sparks rising rapidly from a burning base --- */
.motion-bg--embers {
  background: linear-gradient(180deg, #1a0500 0%, #3a0a00 100%);
}
.motion-bg--embers .motion-bg__layer--base {
  background: radial-gradient(ellipse at bottom, rgba(239, 68, 68, 0.4), transparent 70%);
}
.motion-bg--embers .motion-bg__layer--one {
  background-image: 
    radial-gradient(circle, #fbbf24 0 2px, transparent 3px),
    radial-gradient(circle, #f97316 0 1.5px, transparent 2.5px),
    radial-gradient(circle, #ef4444 0 3px, transparent 4px);
  background-size: 100px 100px, 150px 150px, 200px 200px;
  animation: motion-embers-rise 8s linear infinite;
  filter: drop-shadow(0 0 4px #fb923c);
  opacity: 0.9;
}
.motion-bg--embers .motion-bg__layer--two {
  background-image: 
    radial-gradient(circle, #fca5a5 0 2px, transparent 4px);
  background-size: 250px 250px;
  animation: motion-embers-rise 12s linear infinite;
  filter: blur(1px) drop-shadow(0 0 8px #ef4444);
  opacity: 0.6;
}
.motion-bg--embers .motion-bg__layer--three {
  background: radial-gradient(circle at 50% 90%, rgba(249, 115, 22, 0.3), transparent 50%);
  animation: motion-pulse 4s ease-in-out infinite;
}
.motion-bg--embers .motion-bg__layer--four {
  background: transparent;
}

/* --- WAVES: Smooth undulating neon curves --- */
.motion-bg--waves {
  background: linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%);
}
.motion-bg--waves .motion-bg__layer--one,
.motion-bg--waves .motion-bg__layer--two,
.motion-bg--waves .motion-bg__layer--three,
.motion-bg--waves .motion-bg__layer--four {
  border-radius: 45%;
}
.motion-bg--waves .motion-bg__layer--one {
  inset: auto -10% -40% -10%;
  height: 80%;
  background: rgba(99, 102, 241, 0.15);
  animation: motion-wave 12s ease-in-out infinite;
  box-shadow: 0 -10px 40px rgba(99, 102, 241, 0.2);
}
.motion-bg--waves .motion-bg__layer--two {
  inset: auto -15% -45% -15%;
  height: 85%;
  background: rgba(139, 92, 246, 0.15);
  animation: motion-wave 18s ease-in-out infinite reverse;
  box-shadow: 0 -10px 50px rgba(139, 92, 246, 0.2);
}
.motion-bg--waves .motion-bg__layer--three {
  inset: auto -5% -35% -5%;
  height: 60%;
  background: rgba(236, 72, 153, 0.15);
  animation: motion-wave-highlight 10s ease-in-out infinite;
  box-shadow: 0 -10px 40px rgba(236, 72, 153, 0.2);
}
.motion-bg--waves .motion-bg__layer--four {
  background: transparent;
}

/* --- AURORA: Majestic Northern Lights --- */
.motion-bg--aurora {
  background: linear-gradient(180deg, #020617 0%, #0f172a 100%);
}
.motion-bg--aurora .motion-bg__layer--one {
  background: linear-gradient(115deg, transparent 20%, rgba(45, 212, 191, 0.3) 40%, rgba(56, 189, 248, 0.3) 60%, transparent 80%);
  filter: blur(40px);
  animation: motion-aurora-sweep 15s ease-in-out infinite alternate;
}
.motion-bg--aurora .motion-bg__layer--two {
  background: linear-gradient(70deg, transparent 10%, rgba(167, 139, 250, 0.2) 30%, rgba(232, 121, 249, 0.2) 50%, transparent 70%);
  filter: blur(50px);
  animation: motion-aurora-sweep 20s ease-in-out infinite alternate-reverse;
}
.motion-bg--aurora .motion-bg__layer--three {
  background: radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.1), transparent 50%);
  animation: motion-pulse 8s ease-in-out infinite;
}
.motion-bg--aurora .motion-bg__layer--four { background: transparent; }

/* --- HALO: Angelic glowing rings --- */
.motion-bg--halo {
  background: radial-gradient(circle at center, #1e1b4b 0%, #020617 100%);
}
.motion-bg--halo .motion-bg__layer--one {
  inset: 10% 20%;
  border-radius: 50%;
  border: 2px solid rgba(192, 132, 252, 0.4);
  box-shadow: 0 0 80px rgba(192, 132, 252, 0.3), inset 0 0 60px rgba(192, 132, 252, 0.2);
  animation: motion-halo-spin 20s linear infinite;
}
.motion-bg--halo .motion-bg__layer--two {
  inset: 20% 30%;
  border-radius: 50%;
  border: 2px solid rgba(56, 189, 248, 0.3);
  box-shadow: 0 0 60px rgba(56, 189, 248, 0.2);
  animation: motion-halo-spin 15s linear infinite reverse;
}
.motion-bg--halo .motion-bg__layer--three {
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.1), transparent 30%);
  animation: motion-pulse 6s ease-in-out infinite;
}
.motion-bg--halo .motion-bg__layer--four { background: transparent; }

/* --- MIST: Moody rolling fog --- */
.motion-bg--mist {
  background: linear-gradient(180deg, #0f172a 0%, #020617 100%);
}
.motion-bg--mist .motion-bg__layer--one {
  background: radial-gradient(circle at 30% 60%, rgba(148, 163, 184, 0.2), transparent 40%),
              radial-gradient(circle at 70% 40%, rgba(100, 116, 139, 0.15), transparent 50%);
  filter: blur(40px);
  animation: motion-mist-drift 25s ease-in-out infinite alternate;
}
.motion-bg--mist .motion-bg__layer--two {
  background: radial-gradient(circle at 80% 80%, rgba(203, 213, 225, 0.1), transparent 50%),
              radial-gradient(circle at 20% 20%, rgba(71, 85, 105, 0.15), transparent 40%);
  filter: blur(50px);
  animation: motion-mist-drift 30s ease-in-out infinite alternate-reverse;
}
.motion-bg--mist .motion-bg__layer--three {
  background: linear-gradient(180deg, transparent 50%, rgba(15, 23, 42, 0.5) 100%);
}
.motion-bg--mist .motion-bg__layer--four { background: transparent; }

`;

  fs.writeFileSync(cssFile, before + newMotions + after, 'utf8');
  console.log("Successfully replaced motion backgrounds with rich, distinct designs.");
} else {
  console.log("Could not find the start or end regex for motion backgrounds.");
}
