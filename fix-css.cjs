const fs = require('fs');
const path = require('path');

let content = fs.readFileSync(path.join(__dirname, 'src', 'index.css'), 'utf8');

// Replace app-surface backgrounds
content = content.replace(/\.app-surface \{\s*background:[^}]+box-shadow:/g, '.app-surface {\n  background: #000000;\n  box-shadow:');
content = content.replace(/\.app-surface-strong \{\s*background:[^}]+border:/g, '.app-surface-strong {\n  background: #000000;\n  border:');

// Let's just forcefully inject pure black backgrounds
content = content.replace(/background:.*radial-gradient[^;]+;/g, 'background: #000000;');
content = content.replace(/background:.*linear-gradient[^;]+;/g, 'background: #000000;');

fs.writeFileSync(path.join(__dirname, 'src', 'index.css'), content, 'utf8');
console.log('index.css updated');
