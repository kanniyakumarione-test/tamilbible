import { LocalNotifications } from '@capacitor/local-notifications';
import { getVerseOfTheDay } from './libraryData';

export const scheduleLocalNotifications = async () => {
  if (typeof window === 'undefined' || !window.Capacitor?.isNativePlatform?.()) return;

  try {
    const permStatus = await LocalNotifications.requestPermissions();
    if (permStatus.display !== 'granted') return;

    // We will clear all old pending notifications and schedule the fresh ones
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel(pending);
    }

    const notifications = [];
    let notifId = 1;

    // Schedule the static daily/weekly notifications
    notifications.push({
      id: notifId++,
      title: "Reading Plan Reminder",
      body: "இன்றைய வேத வாசிப்பைத் தொடரவும் (Don't forget to read today's chapters!)",
      schedule: { on: { hour: 20, minute: 0 } }, // Every day at 8:00 PM
      extra: { route: '/home' },
    });

    notifications.push({
      id: notifId++,
      title: "Sunday Sermon Builder Alert",
      body: "ஆலயத்திற்கு செல்கிறீர்களா? பிரசங்க குறிப்புகளை எடுக்க Sermon Builder ஐ திறக்கவும் (Heading to church?)",
      schedule: { on: { weekday: 1, hour: 5, minute: 30 } }, // Sunday at 5:30 AM
      extra: { route: '/sermon-builder' },
    });

    notifications.push({
      id: notifId++,
      title: "Sunday Sermon Builder Alert",
      body: "ஆலயத்திற்கு செல்கிறீர்களா? பிரசங்க குறிப்புகளை எடுக்க Sermon Builder ஐ திறக்கவும் (Heading to church?)",
      schedule: { on: { weekday: 1, hour: 9, minute: 30 } }, // Sunday at 9:30 AM
      extra: { route: '/sermon-builder' },
    });

    const upliftingBooks = [
      { book: 'Matthew', maxChapter: 28 },
      { book: 'Mark', maxChapter: 16 },
      { book: 'Luke', maxChapter: 24 },
      { book: 'John', maxChapter: 21 },
      { book: 'Acts', maxChapter: 28 },
      { book: 'Romans', maxChapter: 16 },
      { book: '1 Corinthians', maxChapter: 16 },
      { book: '2 Corinthians', maxChapter: 13 },
      { book: 'Galatians', maxChapter: 6 },
      { book: 'Ephesians', maxChapter: 6 },
      { book: 'Philippians', maxChapter: 4 },
      { book: 'Colossians', maxChapter: 4 },
      { book: 'James', maxChapter: 5 },
      { book: '1 Peter', maxChapter: 5 },
      { book: '1 John', maxChapter: 5 },
      { book: 'Psalms', maxChapter: 150 },
      { book: 'Proverbs', maxChapter: 31 },
      { book: 'Isaiah', maxChapter: 66 }
    ];
    const getRandomUpliftingChapter = () => {
      const b = upliftingBooks[Math.floor(Math.random() * upliftingBooks.length)];
      const c = Math.floor(Math.random() * b.maxChapter) + 1;
      return `/${b.book}/${c}`;
    };

    notifications.push({
      id: notifId++,
      title: "Nighttime Peace",
      body: "இன்றைய நாளை கர்த்தருடைய வார்த்தையோடு நிறைவு செய்வோம் (End your day with the Word of God).",
      schedule: { on: { hour: 21, minute: 30 } }, // Daily at 9:30 PM
      extra: { route: `/Psalms/${Math.floor(Math.random() * 150) + 1}` },
    });

    notifications.push({
      id: notifId++,
      title: "Mid-Week Refresh",
      body: "சிறிது நேரம் ஒதுக்கி வேதத்தை வாசியுங்கள் (Take a moment to pause and read the scripture).",
      schedule: { on: { weekday: 4, hour: 12, minute: 0 } }, // Wednesday at 12:00 PM (1=Sun, 4=Wed)
      extra: { route: getRandomUpliftingChapter() },
    });

    notifications.push({
      id: notifId++,
      title: "Tomorrow is Sunday!",
      body: "நாளைய ஆராதனைக்கு உங்களை ஆயத்தப்படுத்துங்கள் (Prepare your heart for tomorrow's worship).",
      schedule: { on: { weekday: 7, hour: 20, minute: 0 } }, // Saturday at 8:00 PM (7=Sat)
      extra: { route: getRandomUpliftingChapter() },
    });

    notifications.push({
      id: notifId++,
      title: "Memory Verse Challenge",
      body: "இந்த வார வசனத்தை மனப்பாடம் செய்தீர்களா? (Have you practiced your memory verses today?)",
      schedule: { on: { weekday: 5, hour: 17, minute: 0 } }, // Thursday at 5:00 PM (5=Thu)
      extra: { route: '/memorize' },
    });

    // Generate Verse of the Day notifications for the next 30 days
    const now = new Date();
    for (let i = 0; i < 30; i++) {
      const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      // Wait until getVerseOfTheDay computes the specific verse
      const verseData = await getVerseOfTheDay("ta", targetDate);
      
      // We set the alarm for exactly 7:00 AM on that specific date
      const scheduleDate = new Date(targetDate);
      scheduleDate.setHours(7, 0, 0, 0);

      // Only schedule if the date hasn't passed today (e.g. today after 7 AM)
      if (scheduleDate > new Date()) {
        const verseTextPreview = verseData.text.length > 80 ? verseData.text.substring(0, 80) + '...' : verseData.text;
        notifications.push({
          id: notifId++,
          title: `Verse of the Day - ${verseData.bookTamil} ${verseData.chapter}:${verseData.verse}`,
          body: verseTextPreview,
          schedule: { at: scheduleDate }, // Fires exactly at this specific date and time
          actionTypeId: "",
          extra: { route: '/home' },
        });
      }
    }

    await LocalNotifications.schedule({ notifications });
  } catch (error) {
    console.error("Error scheduling notifications:", error);
  }
};
