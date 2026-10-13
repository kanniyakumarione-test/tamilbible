

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

const blogPosts = [
  {
    slug: "how-to-study-tamil-bible-offline",
    title: "தமிழ் வேதாகமத்தை ஆஃப்லைனில் படிப்பது எப்படி? (How to study Offline)",
    excerpt: "இன்டர்நெட் (Internet) இல்லாமல் உங்கள் மொபைல் மற்றும் கம்ப்யூட்டரில் முழு தமிழ் வேதாகமத்தையும் வாசிப்பதற்கான வழிகாட்டி.",
  },
  {
    slug: "best-tamil-bible-presentation-software-for-church",
    title: "சபைகளில் தமிழ் வேதாகம வசனங்களை திரையிடுவது எப்படி?",
    excerpt: "சர்ச் ஆராதனையின் போது தமிழ் மற்றும் ஆங்கில வசனங்களை ஒரே நேரத்தில் புரொஜெக்டரில் (Projector) காண்பிப்பதற்கான சிறந்த மென்பொருள்.",
  },
  {
    slug: "tanglish-search-tamil-bible",
    title: "Tanglish Search: தமிழில் தட்டச்சு செய்யாமல் வேதாகமத்தை தேடுவது எப்படி?",
    excerpt: "தமிழ் கீபோர்டு (Tamil Keyboard) இல்லாமலேயே, Tanglish-ல் டைப் செய்து வசனங்களை நொடிப்பொழுதில் தேடும் வசதி.",
  },
  {
    slug: "how-to-prepare-sermons-digitally",
    title: "பிரசங்கங்களை (Sermons) டிஜிட்டல் முறையில் தயாரிப்பது எப்படி?",
    excerpt: "போதகர்கள் மற்றும் ஊழியர்கள் தங்கள் பிரசங்கங்களை எளிதாக தயாரிப்பதற்கான Sermon Builder பற்றிய முழுமையான வழிகாட்டி.",
  },
  {
    slug: "how-to-memorize-tamil-bible-verses",
    title: "வேதாகம வசனங்களை எளிதாக மனப்பாடம் செய்வது எப்படி?",
    excerpt: "வேதாகம வசனங்களை உங்கள் மனதிலிறுத்த உதவும் எளிய வழிமுறைகள் மற்றும் பிரத்யேக மென்பொருள் வசதிகள்.",
  },
  {
    slug: "benefits-of-dark-mode-bible-reading",
    title: "Dark Mode-ல் வேதாகமம் வாசிப்பதன் நன்மைகள்",
    excerpt: "உங்கள் கண்களை பாதிக்காமல் இரவு நேரங்களில் வேதாகமத்தை வாசிப்பதற்கான நவீன Dark Mode வடிவமைப்பு.",
  }
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
      return new Response(null, { headers: { 'x-middleware-next': '1' } });
    }
    html = await response.text();
  } catch (error) {
    return new Response(null, { headers: { 'x-middleware-next': '1' } });
  }

  // Parse route to determine title and description
  let title = "Tamil Bible Premium | தமிழ் வேதாகமம் - வாசிப்பு & தேடல்";
  let description = "100% Offline Tamil Bible reading app and Windows church presentation software. Search verses in Tanglish, read Old & New Testaments, and display live.";
  let robots = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
  let canonicalUrl = `https://tamilbible.kanniyakumarione.com${pathname}`;
  
  const parts = pathname.split('/').filter(Boolean);
  
  if (parts.length === 0) {
    // Home page
    title = "Tamil Bible Premium | தமிழ் வேதாகமம் - வாசிப்பு, தேடல் & சர்ச் சாப்ட்வேர்";
    description = "முழு தமிழ் வேதாகமம் (Holy Bible in Tamil) ஆஃப்லைனில் வாசியுங்கள். Tanglish Search, பாடல் புத்தகம், பிரசங்க குறிப்புகள் & சர்ச் புரொஜெக்டர் வசதிகளுடன்.";
  } else if (parts[0] === 'books') {
    title = "வேதாகம புத்தகங்கள் (66 Books) | Tamil Bible Premium";
    description = "பழைய ஏற்பாடு மற்றும் புதிய ஏற்பாட்டின் 66 தமிழ் வேதாகம புத்தகங்களின் பட்டியல். எளிதாக தேர்ந்தெடுத்து அதிகாரங்களை வாசியுங்கள்.";
  } else if (parts[0] === 'memorize') {
    title = "வேதாகம வசனங்களை மனப்பாடம் செய்யுங்கள் | Memorize Bible Verses";
    description = "முக்கியமான தமிழ் வேதாகம வசனங்களை எளிதாக நினைவில் நிறுத்த உதவும் பிரத்யேக Memorize Tool.";
  } else if (parts[0] === 'sermon-builder') {
    title = "பிரசங்க குறிப்புகள் தயாரிப்பாளர் | Sermon Builder Tool";
    description = "போதகர்கள் மற்றும் ஊழியர்கள் தங்கள் பிரசங்கங்களை வசன குறிப்புகளோடு எளிதாக தயார் செய்ய உதவும் கருவி.";
  } else if (['presentation', 'presentation-remote', 'advanced-presentation', 'sermon-control'].includes(parts[0])) {
    robots = "noindex, nofollow";
  } else if (parts[0] === 'reader' && parts.length >= 3) {
    // /reader/Genesis/1/1
    const bookTamil = getTamilName(parts[1]);
    const chapter = parts[2];
    const verse = parts[3] || '';
    const bookDecoded = decodeURIComponent(parts[1]);
    title = `${bookTamil} ${chapter}:${verse} (${bookDecoded} ${chapter}:${verse}) - தமிழ் வேதாகமம் | Tamil Bible`;
    description = `பரிசுத்த வேதாகமம் ${bookTamil} ${chapter}:${verse} வசனத்தை தமிழ் மற்றும் ஆங்கிலத்தில் வாசியுங்கள்.`;
  } else if (parts[0] === 'blog') {
    if (parts.length === 1) {
      title = "வலைப்பதிவு & வழிகாட்டிகள் (Blog) | Tamil Bible Premium";
      description = "தமிழ் வேதாகமத்தை ஆஃப்லைனில் படிப்பது, சர்ச் புரொஜெக்ஷன், மற்றும் Tanglish Search பற்றிய பயனுள்ள கட்டுரைகள்.";
    } else {
      const slug = parts[1];
      const post = blogPosts.find((p) => p.slug === slug);
      if (post) {
        title = `${post.title} | Tamil Bible Premium`;
        description = post.excerpt;
      }
    }
  } else if (parts.length === 2 && !['presentation', 'api'].includes(parts[0])) {
    // /Genesis/1
    const bookTamil = getTamilName(parts[0]);
    const chapter = parts[1];
    const bookDecoded = decodeURIComponent(parts[0]);
    title = `${bookTamil} ${chapter} அதிகாரம் (${bookDecoded} ${chapter}) - தமிழ் வேதாகமம் | Tamil Bible`;
    description = `பரிசுத்த வேதாகமம் ${bookTamil} ${chapter} ஆம் அதிகாரம் முழு வசனங்கள். தமிழ் & ஆங்கிலத்தில் ஆன்லைனிலும் ஆஃப்லைனிலும் வாசியுங்கள்.`;
  } else if (parts.length === 1 && !['presentation', 'api', 'presentation-remote', 'advanced-presentation', 'privacy', 'about', 'terms'].includes(parts[0])) {
    // /Genesis
    const bookTamil = getTamilName(parts[0]);
    const bookDecoded = decodeURIComponent(parts[0]);
    title = `${bookTamil} புத்தகம் (${bookDecoded}) - தமிழ் வேதாகமம் | Tamil Bible`;
    description = `பரிசுத்த வேதாகமம் ${bookTamil} (${bookDecoded}) புத்தகத்தில் உள்ள அனைத்து அதிகாரங்களையும் வாசியுங்கள்.`;
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

  // Replace robots
  html = html.replace(
    /<meta\s+name="robots"\s+content="[^"]*"\s*\/>/,
    `<meta name="robots" content="${robots}" />`
  );

  // Add or update canonical link tag
  if (html.includes('<link rel="canonical"')) {
    html = html.replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${canonicalUrl}" />`);
  } else {
    html = html.replace('</head>', `  <link rel="canonical" href="${canonicalUrl}" />\n  </head>`);
  }

  return new Response(html, {
    headers: {
      'content-type': 'text/html;charset=UTF-8',
      'x-robots-tag': robots
    }
  });
}
