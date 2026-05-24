const fs = require('fs');
const https = require('https');
const path = require('path');

const bookMap = {
  "GEN": "Genesis", "EXO": "Exodus", "LEV": "Leviticus", "NUM": "Numbers", "DEU": "Deuteronomy",
  "JOS": "Joshua", "JDG": "Judges", "RUT": "Ruth", "1SA": "1 Samuel", "2SA": "2 Samuel",
  "1KI": "1 Kings", "2KI": "2 Kings", "1CH": "1 Chronicles", "2CH": "2 Chronicles", "EZR": "Ezra",
  "NEH": "Nehemiah", "EST": "Esther", "JOB": "Job", "PSA": "Psalms", "PRO": "Proverbs",
  "ECC": "Ecclesiastes", "SOS": "Song of Solomon", "ISA": "Isaiah", "JER": "Jeremiah", "LAM": "Lamentations",
  "EZE": "Ezekiel", "DAN": "Daniel", "HOS": "Hosea", "JOE": "Joel", "AMO": "Amos", "OBA": "Obadiah",
  "JON": "Jonah", "MIC": "Micah", "NAH": "Nahum", "HAB": "Habakkuk", "ZEP": "Zephaniah",
  "HAG": "Haggai", "ZEC": "Zechariah", "MAL": "Malachi", "MAT": "Matthew", "MAR": "Mark",
  "LUK": "Luke", "JOH": "John", "ACT": "Acts", "ROM": "Romans", "1CO": "1 Corinthians",
  "2CO": "2 Corinthians", "GAL": "Galatians", "EPH": "Ephesians", "PHP": "Philippians",
  "COL": "Colossians", "1TH": "1 Thessalonians", "2TH": "2 Thessalonians", "1TI": "1 Timothy",
  "2TI": "2 Timothy", "TIT": "Titus", "PHM": "Philemon", "HEB": "Hebrews", "JAM": "James",
  "1PE": "1 Peter", "2PE": "2 Peter", "1JO": "1 John", "2JO": "2 John", "3JO": "3 John",
  "JDE": "Jude", "REV": "Revelation"
};

const output = {};

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log("Fetching cross references...");
  // We fetch files from 1 to 66
  for (let i = 1; i <= 66; i++) {
    try {
      console.log(`Fetching book ${i}...`);
      const data = await fetchJson(`https://raw.githubusercontent.com/josephilipraja/bible-cross-reference-json/master/${i}.json`);
      
      for (const key in data) {
        const verseInfo = data[key];
        // v format: "GEN 1 1"
        const parts = verseInfo.v.split(" ");
        if (parts.length >= 3) {
          const abbr = parts[0];
          const chapter = parts[1];
          const verse = parts[2];
          
          const fullBook = bookMap[abbr] || abbr;
          const mapKey = `${fullBook} ${chapter}`;
          
          if (!output[mapKey]) output[mapKey] = {};
          if (!output[mapKey][verse]) output[mapKey][verse] = [];
          
          if (verseInfo.r) {
            for (const rKey in verseInfo.r) {
              const rParts = verseInfo.r[rKey].split(" ");
              if (rParts.length >= 3) {
                const rAbbr = rParts[0];
                const rChapter = rParts[1];
                const rVerse = rParts[2];
                const rFullBook = bookMap[rAbbr] || rAbbr;
                output[mapKey][verse].push(`${rFullBook} ${rChapter}:${rVerse}`);
              }
            }
          }
        }
      }
    } catch (e) {
      console.error(`Failed to fetch or parse ${i}.json`, e.message);
    }
  }

  const outputPath = path.join(__dirname, '../public/data/cross_references.json');
  fs.writeFileSync(outputPath, JSON.stringify(output));
  console.log("Done! Wrote to", outputPath);
}

run();
