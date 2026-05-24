const https = require('https');
const fs = require('fs');
const path = require('path');

const URL = 'https://raw.githubusercontent.com/bcbooks/cross_references/master/cross_references.txt';
const OUTPUT_FILE = path.join(__dirname, '..', 'public', 'data', 'cross_references.json');

const BOOK_MAP = {
  "Gen": "Genesis", "Exod": "Exodus", "Lev": "Leviticus", "Num": "Numbers", "Deut": "Deuteronomy",
  "Josh": "Joshua", "Judg": "Judges", "Ruth": "Ruth", "1Sam": "1 Samuel", "2Sam": "2 Samuel",
  "1Kgs": "1 Kings", "2Kgs": "2 Kings", "1Chr": "1 Chronicles", "2Chr": "2 Chronicles",
  "Ezra": "Ezra", "Neh": "Nehemiah", "Esth": "Esther", "Job": "Job", "Ps": "Psalms",
  "Prov": "Proverbs", "Eccl": "Ecclesiastes", "Song": "Song of Solomon", "Isa": "Isaiah",
  "Jer": "Jeremiah", "Lam": "Lamentations", "Ezek": "Ezekiel", "Dan": "Daniel",
  "Hos": "Hosea", "Joel": "Joel", "Amos": "Amos", "Obad": "Obadiah", "Jonah": "Jonah",
  "Mic": "Micah", "Nah": "Nahum", "Hab": "Habakkuk", "Zeph": "Zephaniah", "Hag": "Haggai",
  "Zech": "Zechariah", "Mal": "Malachi",
  "Matt": "Matthew", "Mark": "Mark", "Luke": "Luke", "John": "John", "Acts": "Acts",
  "Rom": "Romans", "1Cor": "1 Corinthians", "2Cor": "2 Corinthians", "Gal": "Galatians",
  "Eph": "Ephesians", "Phil": "Philippians", "Col": "Colossians", "1Thess": "1 Thessalonians",
  "2Thess": "2 Thessalonians", "1Tim": "1 Timothy", "2Tim": "2 Timothy", "Titus": "Titus",
  "Phlm": "Philemon", "Heb": "Hebrews", "Jas": "James", "1Pet": "1 Peter", "2Pet": "2 Peter",
  "1John": "1 John", "2John": "2 John", "3John": "3 John", "Jude": "Jude", "Rev": "Revelation"
};

console.log("Downloading cross references...");

https.get(URL, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log("Downloaded. Parsing...");
    const lines = data.split('\n');
    const result = {};

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = line.split('\t');
      if (parts.length < 3) continue;
      
      const from = parts[0];
      const to = parts[1];
      const votes = parseInt(parts[2], 10) || 0;
      
      if (votes < 1) continue; // Only keep references with at least 1 vote
      
      const fromParts = from.split('.');
      const toParts = to.split('.');
      
      if (fromParts.length !== 3 || toParts.length !== 3) continue;
      
      const fromBook = BOOK_MAP[fromParts[0]];
      const toBook = BOOK_MAP[toParts[0]];
      
      if (!fromBook || !toBook) continue;
      
      const fromKey = `${fromBook} ${fromParts[1]}`;
      const fromVerse = fromParts[2];
      const toStr = `${toBook} ${toParts[1]}:${toParts[2]}`;
      
      if (!result[fromKey]) result[fromKey] = {};
      if (!result[fromKey][fromVerse]) result[fromKey][fromVerse] = [];
      
      result[fromKey][fromVerse].push(toStr);
    }
    
    // Sort array by votes/original order and limit to top 15 references per verse
    // (OpenBible is already sorted by votes descending usually)
    for (const chap in result) {
      for (const v in result[chap]) {
        result[chap][v] = result[chap][v].slice(0, 15);
      }
    }
    
    console.log("Saving to JSON...");
    fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result));
    console.log(`Saved successfully! Size: ${(fs.statSync(OUTPUT_FILE).size / 1024 / 1024).toFixed(2)} MB`);
  });
}).on('error', err => {
  console.error("Error downloading:", err.message);
});
