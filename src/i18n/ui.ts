/**
 * UI string dictionary for the four supported locales.
 *
 * `en` is the source of truth. `hi` / `ta` / `te` strings here are
 * MACHINE-TRANSLATED for the Phase 3 chrome + map and should be reviewed by a
 * native speaker before heavy promotion (see README › i18n). Long-form article
 * content is NOT translated yet — that is a separate, higher-quality pass.
 */
export const languages = {
  en: 'English',
  hi: 'हिन्दी',
  ta: 'தமிழ்',
  te: 'తెలుగు',
} as const;

export type Lang = keyof typeof languages;
export const defaultLang: Lang = 'en';

export const ui = {
  en: {
    'nav.ghats': 'Ghats',
    'nav.mandir': 'Mandir',
    'nav.khana': 'Khana',
    'nav.festivals': 'Festivals',
    'nav.tips': 'Tips',
    'nav.map': 'Explore Map',
    'footer.tagline': 'Your doorway to the eternal city.',
    'footer.explore': 'Explore',
    'footer.about': 'About',
    'footer.contact': 'Contact',
    'footer.privacy': 'Privacy',
    'footer.rights': 'A labour of love for Kashi. All photographs credited in CREDITS.',
    'map.title': 'Kashi Darshan Map: Interactive Map of Varanasi Ghats & Temples',
    'map.description':
      'An illustrated, interactive map of the Varanasi riverfront — explore the ghats of the Ganga, Kashi Vishwanath and the great temples, with stories and visitor links.',
    'map.heading': 'Kashi Darshan Map',
    'map.intro':
      'The riverfront of Kashi, drawn as a single living crescent. Hover or tap any ghat or temple to learn what it is — then open its full guide.',
    'map.legend': 'Show',
    'map.cat.ghat': 'Ghats',
    'map.cat.mandir': 'Mandir',
    'map.cat.aarti': 'Aarti spots',
    'map.cat.food': 'Food streets',
    'map.all': 'All',
    'map.listHeading': 'All places on the map',
    'map.openGuide': 'Open guide',
    'map.ganga': 'The Ganga',
    'map.hint': 'Drag to pan · pinch or scroll to zoom',
    'map.langLabel': 'Language',
  },
  hi: {
    'nav.ghats': 'घाट',
    'nav.mandir': 'मंदिर',
    'nav.khana': 'खाना',
    'nav.festivals': 'त्योहार',
    'nav.tips': 'सुझाव',
    'nav.map': 'नक्शा देखें',
    'footer.tagline': 'शाश्वत नगरी की ओर आपका द्वार।',
    'footer.explore': 'खोजें',
    'footer.about': 'परिचय',
    'footer.contact': 'संपर्क',
    'footer.privacy': 'गोपनीयता',
    'footer.rights': 'काशी के लिए प्रेम से बनाया गया। सभी चित्रों का श्रेय CREDITS में।',
    'map.title': 'काशी दर्शन नक्शा: वाराणसी के घाट और मंदिरों का इंटरैक्टिव नक्शा',
    'map.description':
      'वाराणसी के घाटों का सचित्र, इंटरैक्टिव नक्शा — गंगा के घाट, काशी विश्वनाथ और प्रमुख मंदिरों को कहानियों और मार्गदर्शिका के साथ देखें।',
    'map.heading': 'काशी दर्शन नक्शा',
    'map.intro':
      'काशी का घाट-तट, एक जीवंत अर्धचंद्र की तरह। किसी भी घाट या मंदिर पर माउस ले जाएँ या स्पर्श करें — फिर उसकी पूरी मार्गदर्शिका खोलें।',
    'map.legend': 'दिखाएँ',
    'map.cat.ghat': 'घाट',
    'map.cat.mandir': 'मंदिर',
    'map.cat.aarti': 'आरती स्थल',
    'map.cat.food': 'खानपान गलियाँ',
    'map.all': 'सभी',
    'map.listHeading': 'नक्शे के सभी स्थान',
    'map.openGuide': 'मार्गदर्शिका खोलें',
    'map.ganga': 'गंगा',
    'map.hint': 'खींचें · ज़ूम के लिए पिंच या स्क्रॉल करें',
    'map.langLabel': 'भाषा',
  },
  ta: {
    'nav.ghats': 'காட்கள்',
    'nav.mandir': 'கோயில்கள்',
    'nav.khana': 'உணவு',
    'nav.festivals': 'திருவிழாக்கள்',
    'nav.tips': 'குறிப்புகள்',
    'nav.map': 'வரைபடம் காண்க',
    'footer.tagline': 'நித்திய நகரத்தை நோக்கிய உங்கள் வாயில்.',
    'footer.explore': 'ஆராயுங்கள்',
    'footer.about': 'பற்றி',
    'footer.contact': 'தொடர்பு',
    'footer.privacy': 'தனியுரிமை',
    'footer.rights': 'காசிக்காக அன்புடன் உருவாக்கப்பட்டது. அனைத்துப் படங்களுக்கும் CREDITS-இல் நன்றி.',
    'map.title': 'காசி தரிசன வரைபடம்: வாரணாசி காட்கள் மற்றும் கோயில்களின் ஊடாடும் வரைபடம்',
    'map.description':
      'வாரணாசி ஆற்றங்கரையின் சித்திர, ஊடாடும் வரைபடம் — கங்கையின் காட்கள், காசி விஸ்வநாத் மற்றும் பெரிய கோயில்களைக் கதைகளுடன் ஆராயுங்கள்.',
    'map.heading': 'காசி தரிசன வரைபடம்',
    'map.intro':
      'காசியின் ஆற்றங்கரை, ஒரே உயிரோட்டமுள்ள பிறையாக வரையப்பட்டுள்ளது. எந்தக் காட் அல்லது கோயிலின் மீதும் சுட்டியை நகர்த்துங்கள் அல்லது தொடுங்கள் — பின் அதன் முழு வழிகாட்டியைத் திறக்கவும்.',
    'map.legend': 'காட்டு',
    'map.cat.ghat': 'காட்கள்',
    'map.cat.mandir': 'கோயில்கள்',
    'map.cat.aarti': 'ஆரத்தி இடங்கள்',
    'map.cat.food': 'உணவுத் தெருக்கள்',
    'map.all': 'அனைத்தும்',
    'map.listHeading': 'வரைபடத்தில் உள்ள அனைத்து இடங்களும்',
    'map.openGuide': 'வழிகாட்டியைத் திற',
    'map.ganga': 'கங்கை',
    'map.hint': 'நகர்த்த இழுக்கவும் · பெரிதாக்க பிஞ்ச் அல்லது ஸ்க்ரோல் செய்யவும்',
    'map.langLabel': 'மொழி',
  },
  te: {
    'nav.ghats': 'ఘాట్‌లు',
    'nav.mandir': 'ఆలయాలు',
    'nav.khana': 'ఆహారం',
    'nav.festivals': 'పండుగలు',
    'nav.tips': 'చిట్కాలు',
    'nav.map': 'మ్యాప్ చూడండి',
    'footer.tagline': 'శాశ్వత నగరానికి మీ ద్వారం.',
    'footer.explore': 'అన్వేషించండి',
    'footer.about': 'గురించి',
    'footer.contact': 'సంప్రదించండి',
    'footer.privacy': 'గోప్యత',
    'footer.rights': 'కాశీ కోసం ప్రేమతో రూపొందించబడింది. అన్ని చిత్రాలకు CREDITS లో కృతజ్ఞతలు.',
    'map.title': 'కాశీ దర్శన్ మ్యాప్: వారణాసి ఘాట్‌లు & ఆలయాల ఇంటరాక్టివ్ మ్యాప్',
    'map.description':
      'వారణాసి నదీతీరం యొక్క చిత్రసహిత, ఇంటరాక్టివ్ మ్యాప్ — గంగా ఘాట్‌లు, కాశీ విశ్వనాథ్ మరియు గొప్ప ఆలయాలను కథలతో అన్వేషించండి.',
    'map.heading': 'కాశీ దర్శన్ మ్యాప్',
    'map.intro':
      'కాశీ నదీతీరం, ఒకే సజీవ నెలవంకగా చిత్రించబడింది. ఏ ఘాట్ లేదా ఆలయంపైనైనా కర్సర్ ఉంచండి లేదా తాకండి — తర్వాత దాని పూర్తి గైడ్‌ను తెరవండి.',
    'map.legend': 'చూపించు',
    'map.cat.ghat': 'ఘాట్‌లు',
    'map.cat.mandir': 'ఆలయాలు',
    'map.cat.aarti': 'ఆరతి స్థలాలు',
    'map.cat.food': 'ఆహార వీధులు',
    'map.all': 'అన్నీ',
    'map.listHeading': 'మ్యాప్‌లోని అన్ని ప్రదేశాలు',
    'map.openGuide': 'గైడ్ తెరవండి',
    'map.ganga': 'గంగా',
    'map.hint': 'జరపడానికి లాగండి · జూమ్ కోసం పించ్ లేదా స్క్రోల్ చేయండి',
    'map.langLabel': 'భాష',
  },
} as const;

export type UiKey = keyof (typeof ui)['en'];
