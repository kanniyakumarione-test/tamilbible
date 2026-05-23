const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const replacements = [
    // RGBA Glows and Backgrounds (Orange/Amber to White/Dark)
    { regex: /rgba\(251,\s*191,\s*36/g, replacement: 'rgba(255, 255, 255' },
    { regex: /rgba\(245,\s*158,\s*11/g, replacement: 'rgba(255, 255, 255' },
    { regex: /rgba\(249,\s*115,\s*22/g, replacement: 'rgba(255, 255, 255' },
    { regex: /rgba\(251,\s*146,\s*60/g, replacement: 'rgba(255, 255, 255' },
    { regex: /rgba\(253,\s*230,\s*138/g, replacement: 'rgba(255, 255, 255' },
    { regex: /rgba\(254,\s*243,\s*199/g, replacement: 'rgba(255, 255, 255' },
    { regex: /rgba\(255,\s*251,\s*235/g, replacement: 'rgba(255, 255, 255' },

    // Hex Sweeps (Orange/Amber to Zinc)
    { regex: /#f59e0b/gi, replacement: '#ffffff' },
    { regex: /#fbbf24/gi, replacement: '#ffffff' },
    { regex: /#f97316/gi, replacement: '#27272a' },
    { regex: /#ea580c/gi, replacement: '#27272a' },
    { regex: /#fde68a/gi, replacement: '#ffffff' },

    // Tailwind Specifics
    // Text colors: to white/light gray
    { regex: /text-amber-500/g, replacement: 'text-white' },
    { regex: /text-amber-400/g, replacement: 'text-zinc-200' },
    { regex: /text-amber-300/g, replacement: 'text-zinc-300' },
    { regex: /text-amber-200/g, replacement: 'text-zinc-400' },
    { regex: /text-orange-500/g, replacement: 'text-zinc-300' },
    { regex: /text-orange-400/g, replacement: 'text-zinc-400' },

    // Background colors: to dark black/zinc
    { regex: /bg-amber-500/g, replacement: 'bg-zinc-800' },
    { regex: /bg-amber-400/g, replacement: 'bg-zinc-700' },
    { regex: /bg-orange-600/g, replacement: 'bg-zinc-950' },
    { regex: /bg-orange-500/g, replacement: 'bg-zinc-900' },
    { regex: /bg-orange-400/g, replacement: 'bg-zinc-800' },
    { regex: /bg-amber-300/g, replacement: 'bg-zinc-600' },

    // Background gradients (for buttons and cards)
    { regex: /from-amber-500/g, replacement: 'from-zinc-800' },
    { regex: /to-orange-500/g, replacement: 'to-zinc-900' },
    { regex: /to-amber-500/g, replacement: 'to-zinc-900' },
    { regex: /from-orange-500/g, replacement: 'from-zinc-800' },
    
    // Gradient text (like the logo)
    { regex: /to-amber-200/g, replacement: 'to-zinc-500' },

    // Borders
    { regex: /border-amber-500/g, replacement: 'border-zinc-700' },
    { regex: /border-amber-400/g, replacement: 'border-zinc-600' },
    { regex: /border-amber-300/g, replacement: 'border-zinc-500' },
    { regex: /border-orange-500/g, replacement: 'border-zinc-700' },

    // Rings and Shadows
    { regex: /ring-amber-500/g, replacement: 'ring-zinc-700' },
    { regex: /ring-amber-400/g, replacement: 'ring-zinc-600' },
    { regex: /shadow-amber-500/g, replacement: 'shadow-zinc-800' },
    { regex: /shadow-[a-zA-Z0-9_/]+rgba\(245,158,11[a-zA-Z0-9_,.)]+/g, replacement: 'shadow-black/50' }
];

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (stat.isFile() && /\.(jsx|js|css)$/.test(file)) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;
            
            for (const { regex, replacement } of replacements) {
                if (regex.test(content)) {
                    content = content.replace(regex, replacement);
                    modified = true;
                }
            }
            
            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated: ${fullPath}`);
            }
        }
    }
}

processDirectory(directoryPath);
console.log("Blackout theme purge complete!");
