const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const replacements = [
    // Sky Blue to Amber
    { regex: /rgba\(56,\s*189,\s*248/g, replacement: 'rgba(251, 191, 36' },
    { regex: /rgba\(14,\s*165,\s*233/g, replacement: 'rgba(245, 158, 11' },
    { regex: /rgba\(125,\s*211,\s*252/g, replacement: 'rgba(253, 230, 138' },
    { regex: /rgba\(186,\s*230,\s*253/g, replacement: 'rgba(254, 243, 199' },
    { regex: /rgba\(224,\s*242,\s*254/g, replacement: 'rgba(255, 251, 235' },
    
    // Indigo to Orange
    { regex: /rgba\(99,\s*102,\s*241/g, replacement: 'rgba(249, 115, 22' },
    { regex: /rgba\(129,\s*140,\s*248/g, replacement: 'rgba(251, 146, 60' },

    // Blue to Amber/Orange
    { regex: /rgba\(59,\s*130,\s*246/g, replacement: 'rgba(245, 158, 11' },
    { regex: /rgba\(96,\s*165,\s*250/g, replacement: 'rgba(251, 191, 36' },
    { regex: /rgba\(37,\s*99,\s*235/g, replacement: 'rgba(245, 158, 11' },

    // Emerald to Amber
    { regex: /rgba\(16,\s*185,\s*129/g, replacement: 'rgba(245, 158, 11' },
    { regex: /rgba\(34,\s*197,\s*94/g, replacement: 'rgba(251, 191, 36' },
    { regex: /rgba\(110,\s*231,\s*183/g, replacement: 'rgba(253, 230, 138' },

    // Blue Slate / Dark Navy Surfaces to Zinc (Charcoal)
    { regex: /rgba\(14,\s*23,\s*40/g, replacement: 'rgba(24, 24, 27' },
    { regex: /rgba\(6,\s*11,\s*22/g, replacement: 'rgba(9, 9, 11' },
    { regex: /rgba\(10,\s*17,\s*31/g, replacement: 'rgba(24, 24, 27' },
    { regex: /rgba\(5,\s*9,\s*18/g, replacement: 'rgba(9, 9, 11' },
    { regex: /rgba\(15,\s*24,\s*40/g, replacement: 'rgba(24, 24, 27' },
    { regex: /rgba\(7,\s*12,\s*23/g, replacement: 'rgba(9, 9, 11' },
    { regex: /rgba\(2,\s*6,\s*23/g, replacement: 'rgba(9, 9, 11' },
    { regex: /rgba\(8,\s*15,\s*29/g, replacement: 'rgba(14, 14, 16' },
    { regex: /rgba\(5,\s*10,\s*20/g, replacement: 'rgba(9, 9, 11' },
    { regex: /rgba\(15,\s*23,\s*42/g, replacement: 'rgba(24, 24, 27' },
    { regex: /rgba\(30,\s*41,\s*59/g, replacement: 'rgba(39, 39, 42' },
    
    // Hex Code Sweeps (Replacing cold darks with warm darks, blues with ambers)
    { regex: /#07111f/gi, replacement: '#09090b' },
    { regex: /#010510/gi, replacement: '#050505' },
    { regex: /#020712/gi, replacement: '#000000' },
    { regex: /#03101b/gi, replacement: '#050505' },
    { regex: /#082234/gi, replacement: '#18181b' },
    { regex: /#04111d/gi, replacement: '#09090b' },
    { regex: /#020617/gi, replacement: '#050505' },
    { regex: /#0f172a/gi, replacement: '#18181b' },
    { regex: /#1e293b/gi, replacement: '#27272a' },
    { regex: /#16324f/gi, replacement: '#18181b' },
    { regex: /#1d4ed8/gi, replacement: '#f59e0b' },
    { regex: /#38bdf8/gi, replacement: '#fbbf24' },
    { regex: /#312e81/gi, replacement: '#27272a' },
    { regex: /#6d28d9/gi, replacement: '#f97316' },
    { regex: /#db2777/gi, replacement: '#ea580c' },
    { regex: /#0f766e/gi, replacement: '#fbbf24' },
    { regex: /#22c55e/gi, replacement: '#f59e0b' },
    { regex: /#052e16/gi, replacement: '#18181b' },
    { regex: /#166534/gi, replacement: '#27272a' },
    { regex: /#4ade80/gi, replacement: '#fbbf24' },
    { regex: /#5eead4/gi, replacement: '#fde68a' },
    { regex: /#0ea5e9/gi, replacement: '#f59e0b' },
    { regex: /#08111d/gi, replacement: '#09090b' },
    { regex: /#050b14/gi, replacement: '#050505' }
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
console.log("Deep CSS theme purge complete!");
