const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'index.css');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/\.motion-bg--aurora \.motion-bg__layer--four \{\s*background: #000000;\s*\}/g, '.motion-bg--aurora .motion-bg__layer--four { background: transparent; }');
content = content.replace(/\.motion-bg--embers \.motion-bg__layer--four \{\s*background: #000000;\s*animation: motion-pulse 6s ease-in-out infinite;\s*\}/g, '.motion-bg--embers .motion-bg__layer--four { background: transparent; animation: motion-pulse 6s ease-in-out infinite; }');
content = content.replace(/\.motion-bg--halo \.motion-bg__layer--four \{\s*background: #000000;\s*\}/g, '.motion-bg--halo .motion-bg__layer--four { background: transparent; }');
content = content.replace(/\.motion-bg--mist \.motion-bg__layer--three \{\s*background: #000000;\s*opacity: 0\.4;\s*animation: motion-shimmer 12s ease-in-out infinite;\s*\}/g, '.motion-bg--mist .motion-bg__layer--three { background: transparent; opacity: 0.4; animation: motion-shimmer 12s ease-in-out infinite; }');
content = content.replace(/\.motion-bg--mist \.motion-bg__layer--four \{\s*background: #000000;\s*animation: motion-pulse 9s ease-in-out infinite;\s*\}/g, '.motion-bg--mist .motion-bg__layer--four { background: transparent; animation: motion-pulse 9s ease-in-out infinite; }');

fs.writeFileSync(file, content, 'utf8');
console.log("Done");
