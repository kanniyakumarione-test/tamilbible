const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src', 'pages');

function addImport(file) {
    const fullPath = path.join(directoryPath, file);
    let content = fs.readFileSync(fullPath, 'utf8');
    
    if (content.includes('getCustomGradientString') && !content.includes('../utils/appearance')) {
        content = `import { getCustomGradientString } from "../utils/appearance";\n` + content;
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Added import to ${file}`);
    } else if (content.includes('getCustomGradientString') && content.includes('../utils/appearance') && !content.includes('getCustomGradientString }')) {
        content = content.replace(/import \{([^}]*)\} from "\.\.\/utils\/appearance";/, (match, p1) => {
            return `import { ${p1.trim()}, getCustomGradientString } from "../utils/appearance";`;
        });
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated import in ${file}`);
    }
}

['AdvancedPresentation.jsx', 'PresentationDisplay.jsx', 'Reader.jsx', 'SermonMode.jsx', 'Verses.jsx'].forEach(addImport);
