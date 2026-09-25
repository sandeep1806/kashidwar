# TRANSLATION_REVIEW.md

All non-English, non-Hindi strings were machine-generated in one pass on 2026-09-25 and have **not** been reviewed by a native speaker. Hindi UI strings were written first-hand but should also be read by a native speaker. Priorities below.

## How the languages are wired
- `messages/<locale>.json` — every UI string (190 keys, identical structure in all 13 files; `lib/i18n/request.ts` deep-merges each locale over English so a missing key never breaks a page).
- `content/*.json` — place / project / festival / food / itinerary prose. English is the base; `i18n.hi` overrides exist for **all** entries. Regional locales have translated place and festival summaries; other prose falls back to English with a localized note (see Priority 3).
- Place, festival and food **names** show the original Devanagari + the Latin transliteration in every non-Devanagari locale (per PROMPTS.md Phase 7). Regional-script transliterations are not provided yet.

## Priority 1 — religious and sacred terms (every locale)
| Key / place | Concern |
|---|---|
| `faiths.tiles.*.translation` | Renderings of the verses: Kāśī Khaṇḍa saying, Tattvārtha Sūtra 5.21, Pāli mettā line, Bismillāh, Kabīr's couplet, Mūl Mantar, John 8:12. A believer of each tradition should confirm tone and terminology. |
| `faiths.tiles.islamic.translation` | "Most Gracious, Most Merciful" wording differs by community; Tamil/Malayalam/Bengali Muslim conventions should be checked. |
| `faiths.tiles.sikh.*`, `places.faiths.sikh` | Use of ਸਿੱਖ / सिख spelling, "Ik Oaṅkār" gloss, honorifics (जी / ਜੀ) — Punjabi file uses honorifics, others do not. |
| `places.types.math`, `monastery` | "Math"/"Vihar" — some locales borrowed the word, some translated; pick one convention per language. |
| `places.faiths.secular` | "Shared heritage" for Bharat Mata Mandir etc.; rendered as साझी विरासत / பொதுப் பாரம்பரியம் / … — check it doesn't read as "secular" in the political sense. |
| `day.scenes.dawn.title` "Subah-e-Banaras" | Transliterated everywhere; confirm spelling conventions per script. |
| Festival names in `content/festivals.json` (`name_hi`) | Dev Deepawali / देव दीपावली, Nag Nathaiya / नाग नथैया etc. — Hindi spellings vary; Ramlila/Ramleela. |

## Priority 2 — whole files needing a native pass
- **Sanskrit (`sa`)**: UI text like "Vande Bharat takes 8 hours" has no idiomatic Sanskrit; several strings are literal. Consider whether Sanskrit should show only the hero, headings and verses with Hindi prose as fallback.
- **Assamese (`as`)**: generated; check ৰ/ৱ usage and vocabulary that may read as Bengali.
- **Odia (`or`)**: generated; check conjuncts and place-name spellings (ଗୋଦୌଲିଆ, ମଣ୍ଡୁଆଡୀହ).
- **Malayalam (`ml`)** and **Tamil (`ta`)**: long words — layout verified visually at 412 px and 1440 px, but chip labels (`places.filters.*`) may wrap; shorter synonyms welcome.
- **Punjabi (`pa`)**: months abbreviations and "ਬੰਗਲੌਰ" vs "ਬੰਗਲੁਰੂ".
- Number formats: Bengali, Odia, Assamese, Gujarati, Marathi and Sanskrit files use native digits in the practical section (২৫ কিমি) while other files use ASCII digits; decide one policy.

## Priority 3 — partly translated
- **Translated (2026-09-25, machine, unreviewed):** place `summary` and festival `summary` / `when` / `where` for all 11 regional locales. The sources are `content/i18n/<locale>.json`, merged into `i18n.<locale>` blocks by `node scripts/merge-i18n.mjs`. Edit the per-locale file, then re-run the script.
- **Still English in regional locales:** place stories, tips and timelines, projects, food, itineraries. These sections show the localized "content shown in English" note (`common.englishNote`).
- Regional-script transliterations of place/festival/food names (e.g. காசி விஸ்வநாத் கோயில்). Add as `name_<locale>` fields if wanted; `Places.tsx` would need to prefer them.
- Photo alt text is written in English and Hindi only.

## Priority 1b — terms flagged by the translators (content prose)
**Every regional locale**
| Term | Concern |
|---|---|
| Ravidas, "a cobbler by caste" | Caste-sensitive. Chosen words: ta சாதியால் காலணி தைப்பவர், te కులరీత్యా చెప్పులు కుట్టే, kn ಜಾತಿಯಿಂದ ಚಮ್ಮಾರ, ml ചെരുപ്പുപണിക്കാരൻ, bn/or চর্মকার / ଚର୍ମକାର, pa ਜਾਤ ਤੋਂ ਮੋਚੀ, sa उपानत्कारः. Ravidassia usage prefers ਗੁਰੂ ਰਵਿਦਾਸ ਜੀ and ਪ੍ਰਕਾਸ਼ ਪੁਰਬ; pa currently says ਸੰਤ ਰਵਿਦਾਸ ਜੀ / ਜਨਮ ਦਿਹਾੜਾ. Consider rewording the English source itself. |
| Lunar month names | Transliterated from Hindi forms (Kartik, Jyeshtha, Shravan, Phalgun). Regional calendars differ: pa ਕੱਤਕ/ਜੇਠ/ਸਾਵਣ/ਫੱਗਣ; ta solar months (கார்த்திகை) not used; gu/mr month naming differs. |
| Jain kalyanakas | Conception / birth / renunciation rendered as garbha / janma / diksha (te, kn, ml, bn, or); ta கருவுறுதல்/பிறப்பு/துறவு; pa ਦੀਖਿਆ (ਤਿਆਗ). Check Shwetambar vs Digambar usage. ta uses ஜைனர் rather than சமணர்; kn uses ಬಸದಿ. |
| Muharram procession | Mourning words chosen deliberately: ml വിലാപയാത്ര, bn মিছিল, or ଜୁଲୁସ, sa शोकयात्रा (not शोभायात्रा). Check spelling of Imam Husain, Ashura, Imambara, Shawwal. |
| Christian terms | Advent (ta திருவருகைக் காலம், te ఆగమన కాలం, kn ಆಗಮನ ಕಾಲ, ml ആഗമനകാലം, bn আগমনকাল, pa ਆਗਮਨ), chaplain (transliterated / pa ਪਾਦਰੀ), congregation (pa ਕਲੀਸਿਯਾ), St. Mary's (ta புனித மரியாள்). Catholic vs Protestant usage. |
| Sikh terms | "Bari Sangat" spelled Badi in ml/bn/or and Bari in ta/te/kn. pa: ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ, ਭੋਗ ਪੈਂਦਾ ਹੈ, ਬੰਦਗੀ ਕੀਤੀ, ਵਿਚਾਰ-ਚਰਚਾ (alt. ਗੋਸ਼ਟੀ). Hymn terms: पद vs शबद/बाणी (mr, gu). Kabir: pa plain ਕਬੀਰ, Sikh usage ਭਗਤ ਕਬੀਰ ਜੀ. |
| Buddhist terms | Mahaparinirvana; relics as धातवः / ధాతువులు / ಧಾತು ಅವಶೇಷಗಳು / புனிதச் சின்னங்கள். |
| Manikarnika, "to die in Kashi" | bn/or use the gentler দেহত্যাগ / ଦେହତ୍ୟାଗ; ml keeps the plain verb. Pick one tone. |
| Transliterations | Visheshwarganj, Nichibagh, Nati Imli, Khidkiya Ghat, Sonwa Mandap, Tap Asthan, Beni Madhav ka Dharahara, Kosetsu Nosu, Lahartara, Rani Bhabani, Kanwariya, Sawan Somvar, thekua, sewaiyan (bn uses সেমাই). Assamese spellings of several names. kn writes ರಾಮ್‌ನಗರ್ to avoid confusion with Ramanagara. |
| Loanwords and coinages | Louvred doors (paraphrased in most files), spire, relief map, ochre, corridor (pa ਕੋਰੀਡੋਰ, sa वीथिकापथः). Sanskrit coinages: मस्जिद्-भवनम्, चर्च-भवनम्, आरक्षिप्रमुखः, हेलिकॉप्टर-अवतरणस्थलम्, ध्वनिविस्तारकयन्त्राणि, सैन्यनिवेशः; "ghat" as घट्टः in compounds. |
| Small meaning shifts | Sarnath "43 metres of brick" became "43 metres tall" in ml/bn/or. "Play through the night for free" is ambiguous in English and kept ambiguous. Bharat Mata "no deity" became "no idol" in te/kn. mr/gu: "million" as ten lakh; अविभाजित used instead of अखंड भारत. |
| Source fix | Bari Sangat's Guru Gobind Singh line now says he came in 1670 as a child, on the way from Patna to the Punjab. Regional files still say only "visited in 1670", which is correct but shorter. |

## Locale ↔ font check
Fonts load per script via `lib/fonts.ts`. Verses in Gurmukhi, Arabic and Greek inside the Faiths tiles render with system fonts on locales that don't load those scripts; if they look wrong on a target device, add `preload: false` subset faces for `gurmukhi` and an Arabic Noto face.
