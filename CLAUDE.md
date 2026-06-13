# Kashi Dwar — kashidwar.com

## Project Vision

**Kashi Dwar — world-class spiritual guide to Varanasi, premium cinematic design with Banarasi soul, SEO-first, future AdSense monetization.**

The visitor should *feel* Kashi the moment the page loads: dawn on the Ganga, diyas floating, temple bells. Apple-level polish with Banarasi soul. Never a generic travel-blog look. Content is warm, accurate, slightly poetic — like a local friend showing you around. English with natural Hindi flavor.

## Phase Roadmap

| Phase | Scope | Status |
|-------|-------|--------|
| **1** | Static guide site (this build) — ghats, mandir, khana, festivals, tips | ✅ Built |
| **2** | "Aaj Kashi Mein" live widget — panchang, Ganga aarti countdown, weather | Planned |
| **3** | Kashi Darshan Map — interactive, illustrated, 4-language (en/hi/ta/te). **Data-driven from the ghats/mandirs collections.** | ✅ Built |
| **4** | Kashi AI Guide chatbot (Anthropic API on Cloudflare Workers) | Planned |
| **5** | AI Yatra Planner (itinerary generator) | Planned |

## Tech Decisions

- **Astro** (static output, `output: 'static'`) + **Tailwind CSS v4** (via `@tailwindcss/vite`, theme tokens in `src/styles/global.css` under `@theme`)
- **Content collections** (`src/content/`) for ALL data — ghats, mandirs, khana, festivals. Markdown body = the 400+ word article; frontmatter = structured data (names, timings, lat/lng, related links). Phase 3's map and Phase 5's planner consume the same collections. **Never hardcode ghat/mandir data in pages.**
- **No backend, no database.** Deploy: **Cloudflare Pages** (build `npm run build`, output `dist/`)
- **No heavy JS.** Total JS < 50KB. No animation libraries. Vanilla JS only (`src/scripts/`), CSS transforms/opacity for all animation
- `@astrojs/sitemap` generates sitemap.xml; `public/robots.txt` points to it
- **Gotcha:** `vite@^7` is pinned as a devDependency so `@tailwindcss/vite` dedupes onto Astro 6's Vite 7 — without it the plugin installs its own Vite 8 and the build fails (`Missing field tsconfigPaths`)
- Site URL is `https://kashidwar.com` (set in `astro.config.mjs` — required for canonical URLs & sitemap)

## i18n & the Kashi Darshan Map (Phase 3 — done)

- **i18n foundation** (`astro.config.mjs` → `i18n`): `defaultLocale: 'en'`, locales `en/hi/ta/te`, `prefixDefaultLocale: false`. English stays at the root; Hindi/Tamil/Telugu are path-prefixed (`/hi`, `/ta`, `/te`).
- **Strings live in `src/i18n/ui.ts`** (`ui[lang][key]`); helpers in `src/i18n/utils.ts` (`useTranslations`, `getLangFromUrl`, `localizedPath`, `alternatesFor`). No i18n library — vanilla TS.
- **Scope so far:** only the **map experience + chrome** (nav, footer, legend, chips, place names, descriptors, titles/meta) is localized. hi/ta/te strings are **machine-translated → flag for native review**. The 25+ long-form articles are still English; map hotspots link to those English pages. **Translating the long-form articles is the next task** (would add `/hi/ghats/[slug]` etc.).
- **`BaseLayout` / `Nav` / `Footer` / `Seo` take an optional `lang` prop.** `Seo` accepts `alternates` → real hreflang set (en/hi/ta/te + x-default); without it, pages keep the single-language self-reference. Tamil/Telugu webfonts (`Noto Sans Tamil/Telugu`) load only on those locales' pages.
- **The map is 100% data-driven.** Hotspots come from the `ghats`/`mandirs` collections via the optional `mapX/mapY/mapCategories/shortDescriptor/nameLocalized` fields (see `content.config.ts`). Non-collection points (food streets) live in `src/data/mapMarkers.ts`. **Adding ghats toward "84" = new content entries + coords, NO code changes.**
- Map art is original inline SVG (`src/components/MapExperience.astro`, viewBox `1200×680`); pan/zoom + legend filter in `src/scripts/mapPanZoom.js` (vanilla, ~3KB). Hotspot names are real `<text>` (crawlable); a tooltip (foreignObject) and a tappable list below add detail + the mobile fallback. Routes: `src/pages/map.astro` + `src/pages/{hi,ta,te}/map.astro` (thin wrappers over the component). Homepage has a teaser linking to `/map/`.

## Design Rules

### Palette (defined as Tailwind tokens in global.css)
- Deep maroon `#6B1F2A` (`maroon`)
- Saffron `#E8861C` (`saffron`)
- Temple gold `#D4A017` (`gold`)
- Cream `#FAF3E3` (`cream`)
- Pre-dawn indigo `#1A1A3E` (`indigo-night`)
- Ganga blue accents `#2E5E73` (`ganga`)

### Language rule (English-first — IMPORTANT)
Many visitors (South India, international) do not read Devanagari. Therefore:
- **Devanagari is decoration, never the sole carrier of information.** Every Hindi-script element must be paired with English or Roman transliteration (e.g. "हर हर महादेव · Har Har Mahadev").
- Nav labels, buttons, headings: always English/Roman script.
- Mark Devanagari elements `lang="hi"`; mark purely decorative ones `aria-hidden="true"`.
- A real language selector ships only when translated content exists (Hindi `/hi/`, possibly Tamil/Telugu later — hreflang structure is ready). Never ship a selector with no content behind it.

### Typography
- Devanagari display: **Tiro Devanagari Hindi** (Google Font) — treated as ART: large decorative headings with gold gradient (`.devanagari-gold` utility)
- Body/headings: Inter / system stack; serif display: Cormorant Garamond
- "ॐ नमः शिवाय" / "हर हर महादेव" as slow-pulsing watermark motifs in footer/dividers

### Animation Principles
- Cinematic but sacred. Animations enhance, never block — content readable instantly, LCP < 2s
- Hero: layered SVG/CSS dawn scene (indigo → saffron → gold sky shift ~4-5s on load), ghat silhouettes, water shimmer, floating diyas (CSS keyframe loops). No video.
- Scroll reveals: IntersectionObserver + CSS transitions (fade-up + slight scale), `.reveal` class
- Cards: hover = soft golden glow border + slow zoom ("light from a diya")
- Golden "Ganga flow" line draws down the page (scroll-linked, `src/scripts/ganga-flow.js`)
- Astro view transitions: soft fade + saffron sweep
- Ambient 🔔 bell toggle: user-initiated ONLY, never autoplay
- **`prefers-reduced-motion`: every animation must have a static graceful fallback** (handled globally in global.css)
- GPU-friendly only: transform + opacity. No layout-thrashing animations.
- Alternate dark sections (night aarti feel) with light sections (morning ghat feel)

### Performance Guardrails (non-negotiable)
- Lighthouse 95+ all four metrics (Core Web Vitals affect ranking AND AdSense)
- Images: WebP/AVIF, responsive sizes, `loading="lazy"` below the fold, explicit width/height (no CLS)
- Subtle paper/silk textures via tiny CSS/SVG, not image files

## SEO Rules (every new page MUST have)

1. **Unique `<title>` (50–60 chars)** and **meta description (150–160 chars)** — keyword-targeted ("varanasi ghats guide", "kashi vishwanath darshan timing", "dev deepawali varanasi", "banarasi food guide")
2. **One `<h1>` per page**, proper h2/h3 hierarchy, semantic HTML
3. **JSON-LD**: WebSite + BreadcrumbList sitewide (in `BaseLayout`/`Seo` component); `TouristAttraction` on ghat/mandir pages; `Event` on festival pages; `FAQPage` on tips page
4. **Internal links** to related pages (ghat ↔ nearby mandir ↔ festival held there) — use `related*` frontmatter fields
5. **400+ words minimum** on individual pages — thin content hurts SEO and AdSense approval
6. Canonical URL + Open Graph + Twitter card on every page (via `Seo.astro` — always pass props, never skip)
7. Descriptive alt text on all images
8. Clean URL slugs; hreflang-ready structure (Hindi versions later under `/hi/`)

## AdSense Readiness

- `/privacy` has cookie/ads disclosure placeholder — REQUIRED before applying
- Ad slots are the `AdSlot.astro` component: empty placeholders marked `<!-- AD SLOT -->`, space reserved via CSS `aspect-ratio` (no CLS when real ads drop in). Positions: header-below, in-content, sidebar (desktop)
- Content-first: ads must never dominate (AdSense policy)
- Pre-application checklist lives in README

## Images Strategy

1. **Preferred: real Varanasi photos from Unsplash / Pexels / Pixabay ONLY** (free commercial licenses, AdSense-safe). Log EVERY image in `CREDITS.md` (source URL, photographer, license, date)
2. Custom SVG art as supporting layers — dividers, patterns, icons, diya animations — ON TOP of photos
3. Optimize: WebP/AVIF, responsive, lazy below fold

## Project Structure

```
kashidwar/
├── src/
│   ├── components/    # Seo, AdSlot, Hero, Cards, Dividers, Footer, Nav...
│   ├── content/       # collections: ghats/ mandirs/ khana/ festivals/
│   ├── layouts/       # BaseLayout.astro (SEO, nav, footer, JSON-LD)
│   ├── pages/         # routes incl. [slug].astro dynamic pages
│   ├── scripts/       # tiny vanilla JS (reveal, ganga-flow, bell)
│   └── styles/        # global.css (Tailwind v4 @theme tokens)
├── public/            # robots.txt, favicon, audio, images
└── astro.config.mjs
```

## Maintenance Rule

**Keep this file updated whenever architecture or design decisions change**, so every future session picks up full context automatically. When starting Phase 2+, add decisions here before coding.
