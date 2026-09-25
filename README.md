# Kashi — काशी · The City of Light

A cinematic, multilingual tourism site for Varanasi. One scroll is one night-to-dawn on the Ganga: a diya is lit, the sky warms from night to saffron, and the journey ends at the Ganga Aarti.

Built with Next.js 16 (App Router, Turbopack), Tailwind CSS 4, GSAP + Lenis, React Three Fiber (hero only), react-leaflet and next-intl. Thirteen languages: Hindi (default), English, Tamil, Telugu, Kannada, Malayalam, Bengali, Odia, Assamese, Marathi, Gujarati, Punjabi, Sanskrit.

## Setup

```bash
npm install
npm run dev        # http://localhost:3000/hi
npm run build && npm start
npm run lint
```

Node ≥ 20.9 (developed on 22). Copy `.env.example` to `.env.local` if you want CARTO map tiles or a custom site URL:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for metadata, sitemap, robots, JSON-LD. Set in `wrangler.jsonc` → `vars` (and in Workers Builds) to `https://kashidwar.com` |
| `NEXT_PUBLIC_IMAGE_OPTIMIZATION` | `on` once Cloudflare Images is enabled on the zone; `off` (default) serves photos unchanged |
| `NEXT_PUBLIC_MAP_TILE_URL` / `NEXT_PUBLIC_MAP_ATTRIBUTION` / `NEXT_PUBLIC_MAP_TILES_ARE_DARK` | Map tile provider (default: OpenStreetMap darkened with CSS) |

Docs that steer the work: `CLAUDE.md` (rules), `DESIGN.md` (design system), `PROMPTS.md` (phases), `PROGRESS.md` (what was built and why), `DEPENDENCIES.md` (versions), `TRANSLATION_REVIEW.md` (what native speakers should check).

## Where things live

```
app/[locale]/        layout (fonts, sky, loader, switcher, sound), page, error, not-found
app/sitemap.ts       app/robots.ts   app/icon.svg
components/hero/     SVG fallback + lazy R3F scene (Water, Diyas, Rig)
components/sections/ DayInKashi, Places, Faiths, Projects, Festivals, Food, Itineraries, Practical, AartiFinale
components/motion/   SmoothScroll (GSAP + Lenis provider), SunriseBackground, Reveal, StaggerCards, RippleWipe, TextReveal, IncenseCursor
components/ui/       PlaceCard, Modal, KashiMap, FaithGlyph, DiyaGlyph, LanguageSwitcher, SoundToggle, PageLoader, SectionHeading, JsonLd
content/             places.json, projects.json, faiths.json, festivals.json, food.json, itineraries.json
messages/            <locale>.json — every UI string
lib/                 content.ts (types + localize), i18n/, fonts.ts, gsap.ts, device.ts, ambient.ts, site.ts
public/media/        art/ (scene SVGs), og/ (OpenGraph images), places/ projects/ festivals/ food/ (photos, when you add them)
```

## Editing content

Copy never lives in JSX. UI strings are in `messages/<locale>.json`; descriptive content is in `content/*.json` and is typed in `lib/content.ts`.

Every entry has English prose plus an optional `i18n` block for per-locale overrides:

```json
{
  "id": "assi-ghat",
  "name_en": "Assi Ghat", "name_hi": "अस्सी घाट",
  "faith": ["hindu"], "type": "ghat",
  "lat": 25.2883, "lng": 83.0064, "coordsVerified": true,
  "summary": "...", "bestTime": "...", "tips": ["..."],
  "image": "/media/places/assi-ghat.jpg",
  "sources": [{ "title": "...", "url": "https://...", "accessed": "2026-09-25" }],
  "i18n": { "hi": { "summary": "...", "bestTime": "...", "tips": ["..."] } }
}
```

`localize(entry, locale)` applies the override and falls back to English field by field, so partial translations are fine.

### Add a place
1. Append to `content/places.json` with the schema above. `type` is one of `ghat | temple | stupa | monastery | mosque | church | gurudwara | math | fort | museum | university | heritage`; `faith` uses `hindu | buddhist | jain | sikh | islamic | christian | bhakti | secular`.
2. Cite the coordinate source in `sources`; set `coordsVerified: false` if you placed it by locality.
3. Drop a photo at the `image` path (AVIF or WebP, ≥ 1200 px tall, portrait). `Places.tsx` detects the file at build time and switches from the glyph placeholder to `next/image` automatically.
4. To list it under a faith tile, add its id to that faith's `sites` in `content/faiths.json`.

### Add a project
Append to `content/projects.json`: `status` ∈ `completed | under_construction | announced`, `agency`, `timeline`, `sources`, `verified` (false when no official source confirms the status) and `lastVerified` (ISO date). Re-verify statuses periodically; the section shows the newest `lastVerified` as its "last verified" date.

### Add a festival / dish / itinerary
Same pattern in `festivals.json` (lunar `when` rule + `months` 1–12), `food.json` (`type` ∈ `breakfast | sweet | drink | street | paan`), `itineraries.json` (stops with `time`, optional `placeId`, and `marker: "sunrise" | "sunset"`).

### Add a language
1. Add the code to `locales` and its metadata (`nativeName`, `sample`, `script`, `bcp47`) to `LOCALES` in `lib/i18n/locales.ts`.
2. If it is a new script, add its Noto face in `lib/fonts.ts` (`preload: false`) and map it in `regionalByScript`.
3. Create `messages/<code>.json` by copying `messages/en.json` and translating every value (keep keys). Missing keys fall back to English at runtime, but the parity check in this repo's history (`node -e` snippet in PROGRESS.md Phase 7) will tell you what is missing.
4. Optionally add `i18n.<code>` blocks in `content/*.json` and `og-<code>.png` in `public/media/og/` (see `scratchpad` note in PROGRESS.md for the generator).
5. `npm run build` prerenders the new locale; the switcher, sitemap and hreflang pick it up automatically.

## How the page loads
Every section's text is server-rendered into the initial HTML (search engines, social previews and AI crawlers need no JavaScript to read it). Only visual heavyweights load on approach: the Leaflet map, the Aarti lamps, the 3D hero (capable desktops only) and the place modal (on open). Section data is prepared on the server in `lib/sectionProps.ts` and rendered by small client list components so filtering, tabs and animations work without duplicating markup in the hydration payload. Lighthouse mobile: 90–94.

## Design rules that the code enforces
- Tokens are CSS variables in `app/globals.css` (`--kashi-*`), exposed to Tailwind via `@theme inline`. Gold is glow, not fill.
- Every animation respects `prefers-reduced-motion`; GSAP/Lenis load lazily and never touch the first paint.
- 3D only in the hero, only on capable desktops (`lib/device.ts`); mobile gets the SVG fallback.
- Faiths are presented equally and ordered by arrival in Kashi.

## Deploy — Cloudflare Workers (OpenNext)

The site runs on Cloudflare Workers through `@opennextjs/cloudflare`. Every page, the sitemap, robots and the OpenGraph images are prerendered at build time and served as static assets; the Worker only runs the locale redirect proxy and the 404/error fallbacks. Config: `wrangler.jsonc` (worker `kashidwar`, `nodejs_compat`, assets binding, vars), `open-next.config.ts`, `image-loader.ts`.

```bash
npm run preview   # build with OpenNext and serve on the local Workers runtime (wrangler dev)
npm run deploy    # build and deploy with your own Cloudflare login (npx wrangler login)
npm run cf:build  # build only → .open-next/
```

`scripts/cf-build.mjs` reads `vars` from `wrangler.jsonc` and exposes them to `next build`, because `NEXT_PUBLIC_*` values are inlined into the prerendered pages. A variable already set in the environment (for example by Workers Builds) wins.

### Workers Builds (deploy from GitHub)
In the Cloudflare dashboard → Workers & Pages → the `kashidwar` Worker → Settings → Builds, connect `sandeep1806/kashidwar` and use:

| Setting | Value |
|---|---|
| Production branch | `master` (the repo's default; merge `redesign` into it when ready — preview builds run for other branches) |
| Build command | `npm run cf:build` |
| Deploy command | `npx opennextjs-cloudflare deploy` |
| Root directory | `/` |
| Build variable | `NEXT_PUBLIC_SITE_URL=https://kashidwar.com` |
| Node version | 22 (`.node-version`) |

Preview deployments of non-production branches get a `*.workers.dev` URL; their canonical tags still point at kashidwar.com, which is what you want for search engines.

### Domain cut-over (kashidwar.com currently serves the older site)
1. Merge `redesign` into `master` (or set `redesign` as the production branch temporarily) so Workers Builds deploys this project to the `kashidwar` Worker.
2. Check the deployment on its `workers.dev` URL: `/hi`, `/en`, `/ta`, `/sitemap.xml`, `/robots.txt`, a wrong path for the 404.
3. In the Worker → Settings → Domains & Routes, add the custom domain `kashidwar.com` (and `www.kashidwar.com`, redirected to the apex). Cloudflare updates DNS automatically when the zone is on the same account.
4. Remove or disable whatever currently serves the old site on that hostname (its Pages project / Worker route) so the new Worker takes the hostname.
5. Confirm `https://kashidwar.com/` redirects to `/hi`, that `<link rel="canonical">` and the sitemap use `https://kashidwar.com`, and resubmit the sitemap in Google Search Console and Bing Webmaster Tools.
6. Optional: enable Cloudflare Images on the zone and set `NEXT_PUBLIC_IMAGE_OPTIMIZATION=on` for resized AVIF/WebP photos.
