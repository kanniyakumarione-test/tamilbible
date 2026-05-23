const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const replacements = {
    // Brand Colors: Sky/Indigo -> Amber/Orange (Premium Gold)
    'sky-500': 'amber-500',
    'sky-400': 'amber-400',
    'sky-300': 'amber-300',
    'sky-200': 'amber-200',
    'sky-100': 'amber-100',
    'sky-50': 'amber-50',
    'indigo-600': 'orange-600',
    'indigo-500': 'orange-500',
    'indigo-400': 'orange-400',
    'indigo-300': 'orange-300',
    
    // RGB replacements for radial/linear gradients (Sky/Indigo -> Amber/Orange)
    'rgba(56,189,248,': 'rgba(251,191,36,', // sky-400
    'rgba(14,165,233,': 'rgba(245,158,11,', // sky-500
    'rgba(99,102,241,': 'rgba(249,115,22,', // indigo-500
    
    // Background Surfaces (Slate/Blue-Dark -> Zinc/Charcoal)
    'bg-[#07111f]': 'bg-[#0a0a0a]',
    'bg-[#0f172a]': 'bg-[#18181b]',
    'rgba(15,23,42,': 'rgba(24,24,27,', // slate-900 to zinc-900
    'rgba(2,6,23,': 'rgba(9,9,11,',     // slate-950 to zinc-950
    'rgba(8,17,32,': 'rgba(14,14,16,',   // custom slate to custom zinc
    'rgba(10,18,30,': 'rgba(18,18,20,',  // custom slate to custom zinc
    
    // Text colors (Slate -> Zinc/Stone)
    'text-slate-200': 'text-stone-200',
    'text-slate-300': 'text-stone-300',
    'text-slate-400': 'text-stone-400',
    'text-slate-500': 'text-stone-500',
    'bg-slate-950': 'bg-zinc-950',
    'bg-slate-900': 'bg-zinc-900',
    'bg-slate-800': 'bg-zinc-800'
};

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
            
            for (const [key, value] of Object.entries(replacements)) {
                if (content.includes(key)) {
                    // Split and join is a fast global replace string method
                    content = content.split(key).join(value);
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
console.log("Theme replacement complete!");
