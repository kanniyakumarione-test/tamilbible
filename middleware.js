import { NextResponse } from '@vercel/edge';

export const config = {
  matcher: '/((?!api|assets|bg|data|manifest|favicon|.*\\..*).*)',
};

const booksData = [
  {"english":"Genesis","tamil":"ஆதியாகமம்"},
  {"english":"Exodus","tamil":"யாத்திராகமம்"},
  {"english":"Leviticus","tamil":"லேவியராகமம்"},
  {"english":"Numbers","tamil":"எண்ணாகமம்"},
  {"english":"Deuteronomy","tamil":"உபாகமம்"},
  {"english":"Joshua","tamil":"யோசுவா"},
  {"english":"Judges","tamil":"நியாயாதிபதிகள்"},
  {"english":"Ruth","tamil":"ரூத்"},
  {"english":"1 Samuel","tamil":"1 சாமுவேல்"},
  {"english":"2 Samuel","tamil":"2 சாமுவேல்"},
  {"english":"1 Kings","tamil":"1 இராஜாக்கள்"},
  {"english":"2 Kings","tamil":"2 இராஜாக்கள்"},
  {"english":"1 Chronicles","tamil":"1 நாளாகமம்"},
  {"english":"2 Chronicles","tamil":"2 நாளாகமம்"},
  {"english":"Ezra","tamil":"எஸ்றா"},
  {"english":"Nehemiah","tamil":"நெகேமியா"},
  {"english":"Esther","tamil":"எஸ்தர்"},
  {"english":"Job","tamil":"யோபு"},
  {"english":"Psalms","tamil":"சங்கீதம்"},
  {"english":"Proverbs","tamil":"நீதிமொழிகள்"},
  {"english":"Ecclesiastes","tamil":"பிரசங்கி"},
  {"english":"Song of Songs","tamil":"உன்னதப்பாட்டு"},
  {"english":"Isaiah","tamil":"ஏசாயா"},
  {"english":"Jeremiah","tamil":"எரேமியா"},
  {"english":"Lamentations","tamil":"புலம்பல்"},
  {"english":"Ezekiel","tamil":"எசேக்கியேல்"},
  {"english":"Daniel","tamil":"தானியேல்"},
  {"english":"Hosea","tamil":"ஓசியா"},
  {"english":"Joel","tamil":"யோவேல்"},
  {"english":"Amos","tamil":"ஆமோஸ்"},
  {"english":"Obadiah","tamil":"ஒபதியா"},
  {"english":"Jonah","tamil":"யோனா"},
  {"english":"Micah","tamil":"மீகா"},
  {"english":"Nahum","tamil":"நாகூம்"},
  {"english":"Habakkuk","tamil":"ஆபகூக்"},
  {"english":"Zephaniah","tamil":"செப்பனியா"},
  {"english":"Haggai","tamil":"ஆகாய்"},
  {"english":"Zechariah","tamil":"சகரியா"},
  {"english":"Malachi","tamil":"மல்கியா"},
  {"english":"Matthew","tamil":"மத்தேயு"},
  {"english":"Mark","tamil":"மாற்கு"},
  {"english":"Luke","tamil":"லுூக்கா"},
  {"english":"John","tamil":"யோவான்"},
  {"english":"Acts","tamil":"அப்போஸ்தலருடைய நடபடிகள்"},
  {"english":"Romans","tamil":"ரோமர்"},
  {"english":"1 Corinthians","tamil":"1 கொரிந்தியர்"},
  {"english":"2 Corinthians","tamil":"2 கொரிந்தியர்"},
  {"english":"Galatians","tamil":"கலாத்தியர்"},
  {"english":"Ephesians","tamil":"எபேசியர்"},
  {"english":"Philippians","tamil":"பிலிப்பியர்"},
  {"english":"Colossians","tamil":"கொலோசெயர்"},
  {"english":"1 Thessalonians","tamil":"1 தெசலோனிக்கேயர்"},
  {"english":"2 Thessalonians","tamil":"2 தெசலோனிக்கேயர்"},
  {"english":"1 Timothy","tamil":"1 தீமோத்தேயு"},
  {"english":"2 Timothy","tamil":"2 தீமோத்தேயு"},
  {"english":"Titus","tamil":"தீத்து"},
  {"english":"Philemon","tamil":"பிலேமோன்"},
  {"english":"Hebrews","tamil":"எபிரெயர்"},
  {"english":"James","tamil":"யாக்கோபு"},
  {"english":"1 Peter","tamil":"1 பேதுரு"},
  {"english":"2 Peter","tamil":"2 பேதுரு"},
  {"english":"1 John","tamil":"1 யோவான்"},
  {"english":"2 John","tamil":"2 யோவான்"},
  {"english":"3 John","tamil":"3 யோவான்"},
  {"english":"Jude","tamil":"யூதா"},
  {"english":"Revelation","tamil":"வெளிப்படுத்தின விசேஷம்"}
];

function getTamilName(englishName) {
  const decoded = decodeURIComponent(englishName);
  const book = booksData.find(b => b.english.toLowerCase() === decoded.toLowerCase());
  return book ? book.tamil.trim() : decoded;
}

export default async function middleware(req) {
  const url = new URL(req.url);
  const pathname = url.pathname;

  // Fetch the static index.html
  // Because /index.html has a dot, it bypasses this middleware (due to matcher)
  const indexUrl = new URL('/index.html', req.url);
  let html = '';
  
  try {
    const response = await fetch(indexUrl);
    if (!response.ok) {
      return NextResponse.next();
    }
    html = await response.text();
  } catch (error) {
    return NextResponse.next();
  }

  // Parse route to determine title and description
  let title = "Tamil Bible Premium | Tamil Bible Reading App";
  let description = "100% Offline Tamil Bible reading app and Windows church presentation software. Search verses, prepare sermons, and display live.";
  
  const parts = pathname.split('/').filter(Boolean);
  
  if (parts.length === 0) {
    // Home page
  } else if (parts[0] === 'books') {
    title = "Books | Tamil Bible Premium";
    description = "Browse Tamil Bible books, choose Old Testament or New Testament, and open chapters quickly.";
  } else if (parts[0] === 'search') {
    title = "Search | Tamil Bible Premium";
  } else if (parts[0] === 'settings') {
    title = "Settings | Tamil Bible Premium";
  } else if (parts[0] === 'sermon-mode') {
    title = "Sermon Mode | Tamil Bible Premium";
  } else if (parts[0] === 'reader' && parts.length >= 3) {
    // /reader/Genesis/1/1
    const bookTamil = getTamilName(parts[1]);
    const chapter = parts[2];
    const verse = parts[3] || '';
    title = `${bookTamil} ${chapter}:${verse} | Tamil Bible Premium`;
    description = `Read ${bookTamil} ${chapter}:${verse} in the Tamil Bible.`;
  } else if (parts.length === 2 && !['presentation', 'api'].includes(parts[0])) {
    // /Genesis/1
    const bookTamil = getTamilName(parts[0]);
    const chapter = parts[1];
    title = `${bookTamil} ${chapter} | Tamil Bible Premium`;
    description = `Read ${bookTamil} chapter ${chapter} in the Tamil Bible.`;
  } else if (parts.length === 1 && !['presentation', 'api', 'presentation-remote', 'advanced-presentation', 'privacy', 'about', 'terms'].includes(parts[0])) {
    // /Genesis
    const bookTamil = getTamilName(parts[0]);
    title = `${bookTamil} | Tamil Bible Premium`;
    description = `Browse ${bookTamil} in the Tamil Bible.`;
  }

  // Replace tags in HTML
  html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
  
  // Replace og:title
  html = html.replace(
    /<meta property="og:title" content="[^"]*" \/>/, 
    `<meta property="og:title" content="${title}" />`
  );
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*" \/>/, 
    `<meta name="twitter:title" content="${title}" />`
  );
  
  // Replace description
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/>/, 
    `<meta name="description" content="${description}" />`
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/, 
    `<meta property="og:description" content="${description}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/, 
    `<meta name="twitter:description" content="${description}" />`
  );

  return new Response(html, {
    headers: {
      'content-type': 'text/html;charset=UTF-8'
    }
  });
}
