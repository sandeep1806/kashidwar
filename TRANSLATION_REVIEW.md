# TRANSLATION_REVIEW.md

All non-English, non-Hindi strings were machine-generated in one pass on 2026-09-25 and have **not** been reviewed by a native speaker. Hindi UI strings were written first-hand but should also be read by a native speaker. Priorities below.

## How the languages are wired
- `messages/<locale>.json` — every UI string (190 keys, identical structure in all 13 files; `lib/i18n/request.ts` deep-merges each locale over English so a missing key never breaks a page).
- `content/*.json` — place / project / festival / food / itinerary prose. English is the base; `i18n.hi` overrides exist for **all** entries. Other locales fall back to English prose with the UI in their language (see "Not yet translated").
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

## Priority 3 — not yet translated
- Prose in `content/*.json` for every locale except Hindi and English (summaries, tips, timelines, agency names). Add `i18n.<locale>` blocks to translate; `lib/content.ts → localize()` picks them up automatically.
- Regional-script transliterations of place/festival/food names (e.g. காசி விஸ்வநாத் கோயில்). Add as `name_<locale>` fields if wanted; `Places.tsx` would need to prefer them.
- Alt text for photos (none exist yet).

## Locale ↔ font check
Fonts load per script via `lib/fonts.ts`. Verses in Gurmukhi, Arabic and Greek inside the Faiths tiles render with system fonts on locales that don't load those scripts; if they look wrong on a target device, add `preload: false` subset faces for `gurmukhi` and an Arabic Noto face.
