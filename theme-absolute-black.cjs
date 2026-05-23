const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Remove bright white glows in bg-[radial-gradient...]
    const regex1 = /bg-\[radial-gradient\([^\]]+\)\]/g;
    if (regex1.test(content)) {
        content = content.replace(regex1, '');
        modified = true;
    }

    // Replace gradient cards with just pure black or #0a0a0a
    const regex2 = /bg-\[linear-gradient\([^\]]+\)\]/g;
    if (regex2.test(content)) {
        content = content.replace(regex2, 'bg-[#000000] lg:bg-[#000000]');
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
