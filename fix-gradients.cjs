const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src', 'pages');

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (/\.(jsx|js)$/.test(file)) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            // Replace gradients[settings.bgIndex] with getCustomGradientString(...)
            if (content.includes('gradients[settings.bgIndex]')) {
                content = content.replace(/gradients\[settings\.bgIndex\]/g, 'getCustomGradientString(settings.customGradientType, settings.customGradientColor1, settings.customGradientColor2)');
                modified = true;
            }

            // Also for the canvas export in Verses.jsx:
            if (file === 'Verses.jsx' && content.includes('const gradientMatches = gradients[settings.bgIndex]?.match(/#[0-9a-fA-F]{6}/g);')) {
                content = content.replace(
                    /const gradientMatches[\s\S]*?gradient\.addColorStop\(1, gradientMatches\[1\]\);\n\s*\}/m,
                    `if (settings.bgType !== "motion") {
        gradient.addColorStop(0, settings.customGradientColor1 || "#000000");
        gradient.addColorStop(1, settings.customGradientColor2 || "#1a1a1a");
      }`
                );
                modified = true;
            }

            if (modified) {
                // Ensure import exists
                if (!content.includes('getCustomGradientString')) {
                    if (content.includes('from "../utils/appearance"')) {
                        content = content.replace(/from "\.\.\/utils\/appearance"/, ', getCustomGradientString } from "../utils/appearance"');
                    } else {
                        content = `import { getCustomGradientString } from "../utils/appearance";\n` + content;
                    }
                }
                
                // Fix possible duplicate imports due to regex
                content = content.replace(/import \{([^}]*)\} from "\.\.\/utils\/appearance";/g, (match, p1) => {
                   const imports = [...new Set(p1.split(',').map(s => s.trim()).filter(Boolean))];
                   return `import { ${imports.join(', ')} } from "../utils/appearance";`;
                });

                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated: ${file}`);
            }
        }
    }
}

processDirectory(directoryPath);
