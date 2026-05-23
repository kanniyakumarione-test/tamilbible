const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Find all occurrences of settings.language === "en"
    // But be careful NOT to replace const language = settings.language === "en" ? "en" : "ta"
    const regex = /settings\.language\s*===\s*(?:'|")en(?:'|")/g;
    
    let newContent = content.replace(regex, (match, offset, string) => {
        // Look backwards to see if it's `const language = ` or `primaryLanguage = `
        const before = string.substring(Math.max(0, offset - 30), offset);
        if (before.includes('language = ') || before.includes('primaryLanguage = ') || before.includes('loadBibleBooks(')) {
            return match; // Keep as is
        }
        return '["en", "ta-en"].includes(settings.language)';
    });

    if (newContent !== content) {
        fs.writeFileSync(filePath, newContent, 'utf8');
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
