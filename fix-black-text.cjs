const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Change text-slate-950, text-zinc-950, text-zinc-900, text-stone-900 to text-white when bg is black
    const regex = /(bg-\[#000000\]\s*lg:bg-\[#000000\][^"']*)text-(slate|zinc|stone|gray)-(900|950)/g;
    if (regex.test(content)) {
        content = content.replace(regex, '$1text-white');
        modified = true;
    }

    // Also just simplify bg-[#000000] lg:bg-[#000000] to bg-[#000000]
    if (content.includes('bg-[#000000] lg:bg-[#000000]')) {
        content = content.replace(/bg-\[#000000\] lg:bg-\[#000000\]/g, 'bg-[#000000]');
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

function traverseDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverseDir(fullPath);
        } else if (/\.(jsx|js)$/.test(file)) {
            processFile(fullPath);
        }
    }
}

traverseDir(path.join(__dirname, 'src', 'pages'));
traverseDir(path.join(__dirname, 'src', 'components'));
