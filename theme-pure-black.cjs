const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const replacements = [
    // RGBA Charcoal to Pure Black
    { regex: /rgba\(9,\s*9,\s*11/g, replacement: 'rgba(0, 0, 0' },
    { regex: /rgba\(24,\s*24,\s*27/g, replacement: 'rgba(0, 0, 0' },
    { regex: /rgba\(14,\s*14,\s*16/g, replacement: 'rgba(0, 0, 0' },
    { regex: /rgba\(5,\s*5,\s*5/g, replacement: 'rgba(0, 0, 0' },
    { regex: /rgba\(39,\s*39,\s*42/g, replacement: 'rgba(10, 10, 10' },

    // Hex Charcoal to Pure Black
    { regex: /#09090b/gi, replacement: '#000000' },
    { regex: /#18181b/gi, replacement: '#000000' },
    { regex: /#050505/gi, replacement: '#000000' },
    { regex: /#141416/gi, replacement: '#000000' },
    { regex: /#27272a/gi, replacement: '#0a0a0a' },

    // Tailwind Classes: Zinc to Black
    { regex: /bg-zinc-950/g, replacement: 'bg-black' },
    { regex: /bg-zinc-900/g, replacement: 'bg-black' },
    { regex: /bg-zinc-800/g, replacement: 'bg-[#0a0a0a]' },
    { regex: /to-zinc-950/g, replacement: 'to-black' },
    { regex: /to-zinc-900/g, replacement: 'to-black' },
    { regex: /from-zinc-950/g, replacement: 'from-black' },
    { regex: /from-zinc-900/g, replacement: 'from-black' },
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

// Also do index.html
const indexPath = path.join(__dirname, 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');
if (/#09090b/.test(indexContent)) {
    indexContent = indexContent.replace(/#09090b/g, '#000000');
    fs.writeFileSync(indexPath, indexContent, 'utf8');
    console.log('Updated: index.html');
}

console.log("Pure Black OLED theme purge complete!");
