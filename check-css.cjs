const fs = require('fs');
const lines = fs.readFileSync('src/index.css', 'utf8').split('\n');
lines.forEach((line, i) => {
  if (line.includes('background: #000000')) {
    console.log(`Line ${i+1}: ${line}`);
  }
});
