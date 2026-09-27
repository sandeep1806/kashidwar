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
content/             places.json, projects.json, faiths.json, festivals.json, food.json, itineraries.json,
                     photos.json + credits.json (generated), i18n/ (regional prose and photo alt text)
messages/            <locale>.json — every UI string
lib/                 content.ts (types + localize), i18n/, fonts.ts, gsap.ts, device.ts, ambient.ts, site.ts
public/media/        art/ (fallback scene SVGs), og/ (OpenGraph images), photos/<group>/ (generated AVIF + WebP)
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
3. Add a photo (see **Photos** below). Without one the card shows its drawn placeholder.
4. To list it under a faith tile, add its id to that faith's `sites` in `content/faiths.json`.

### Add a project
Append to `content/projects.json`: `status` ∈ `completed | under_construction | announced`, `agency`, `timeline`, `sources`, `verified` (false when no official source confirms the status) and `lastVerified` (ISO date). Re-verify statuses periodically; the section shows the newest `lastVerified` as its "last verified" date.

### Add a festival / dish / itinerary
Same pattern in `festivals.json` (lunar `when` rule + `months` 1–12), `food.json` (`type` ∈ `breakfast | sweet | drink | street | paan`), `itineraries.json` (stops with `time`, optional `placeId`, and `marker: "sunrise" | "sunset"`).

### Photos
Photos are self-hosted; nothing is hotlinked. Each one is keyed `group/id` (`places/assi-ghat`, `festivals/chhath`, `food/lassi`, `projects/ganga-cruise`, `scenes/dawn`, `hero/hero`).

1. **Your own photo:** put it at `raw/<group>/<id>.jpg` (or .png/.webp). It overrides any Commons pick and needs no credit line.
2. **Wikimedia Commons:** `node scripts/fetch-images.mjs [group]` collects licence-filtered candidates (CC0, CC BY, CC BY-SA, public domain) with review thumbnails in `scripts/.images/`. Check each file's title, description, categories and location on Commons, then add `{ key, title, alt: { en, hi } }` to `scripts/image-picks.json`. Unsplash and Pexels are skipped: no API keys were set when this was built, so those providers are not implemented yet.
3. Regional alt text lives in `content/i18n/alt-<locale>.json` (`{ "group/id": "…" }`).
3b. Photos taken (or artworks made) outside Varanasi get `"elsewhere": "photo"` or `"art"` in the pick; the site then shows a localized chip ("Not taken in Varanasi" / "Artwork, not from Varanasi", texts in `content/i18n/photo-notes.json`).
4. `node scripts/optimize-images.mjs` downloads, grades (dark and warm), resizes (cards 480/960 px ≤ 150 KB; scenes 640/960/1600 px ≤ 140 KB; hero 640 px ≤ 200 KB) and writes AVIF + WebP to `public/media/photos/`, plus `content/photos.json` (sizes, blur placeholder, alt text) and `content/credits.json` (title, author, licence, source), which feeds `/<locale>/credits`. Add `--force` to re-encode.

Sensitivity rules for picks: no cremations or bodies at Manikarnika, nothing from inside the Kashi Vishwanath sanctum, no close-ups of identifiable people bathing, praying or at funerals, and the same care for every faith.

### Detail pages and SEO
- Every place, festival, project and itinerary has a page in all 13 locales: `/[locale]/places/<id>`, `/festivals/<id>`, `/projects/<id>`, `/itineraries/<n>-day`, generated statically from the JSON (`app/[locale]/*/[id]/page.tsx`, helpers in `lib/pages.ts`). Home cards and the place modal link to them; a plain click on a place card still opens the quick view.
- "How to reach" on place/project pages is computed from the coordinates (straight-line distance to Varanasi Junction, the airport and Godowlia) plus Google Maps / OpenStreetMap links; festival pages link their venues (`placeIds` in festivals.json).
- Festival dates live in `content/festival-dates.json` as `{ id: { "2026": {…}, "2027": {…} } }`, each with `verified`, `note` and `sources`. See **Festival dates** below.
- `app/sitemap.ts` lists every page × locale with hreflang alternates (x-default → English); `/sitemap-images.xml` lists each page's photos. Both are in robots.txt.
- `node scripts/check-seo.mjs` (after a build) checks titles, descriptions, canonicals, hreflang and JSON-LD (Google's Event and BreadcrumbList rules) on every prerendered page.
- `npm run build` first runs `scripts/heading-font/check.mjs`, which fails if a heading/name character is missing from the Tiro subset.

### Festival dates (next occurrence)
Pages always feature a festival's **next** occurrence, computed at build time (`lib/festivalDates.ts`, build date in `<meta name="build-date">`): the next verified date (or "On now" while it runs), else "Next: expected <month> <year> — date not yet announced" from an unverified entry or the festival's usual months. The last verified occurrence shows smaller as "Last held". Titles name a year and Event JSON-LD is emitted only for the verified next occurrence. Home festival cards are sorted by what comes next; the first is badged "Coming up next". `node scripts/check-seo.mjs` fails if any featured date is before the build date.

To keep this current without manual edits the site rebuilds weekly: `worker.js` (the Worker entry, wrapping OpenNext's) has a `scheduled` handler, and `wrangler.jsonc` sets `triggers.crons` to Mondays 00:30 UTC. The handler POSTs to a Workers Builds **Deploy Hook**. One-time setup:
1. Connect the repo in Workers Builds if it is not already (Workers & Pages → kashidwar → Settings → Builds: branch `redesign`, build command `npm run cf:build`, deploy command `npx opennextjs-cloudflare deploy`).
2. Settings → Builds → Deploy Hooks → create a hook for `redesign`.
3. `npx wrangler secret put DEPLOY_HOOK_URL` and paste the hook URL. Until then the cron logs a warning and does nothing.

Each year, add the next year's dates (with sources) to `content/festival-dates.json`; anything missing falls back to "expected <month>".

### Indexing a locale
Only the locales in `INDEXED_LOCALES` (`lib/seo.ts`, currently `["hi", "en"]`) are indexable. Pages in the other 11 locales carry `<meta name="robots" content="noindex, follow">`, have no hreflang links, and are left out of `sitemap.xml` and `sitemap-images.xml`; hreflang is exchanged only between indexed locales, with x-default → `/en`.

To index a regional locale after a native speaker has reviewed it:
1. Work through its rows in TRANSLATION_REVIEW.md (UI strings in `messages/<locale>.json`, prose in `content/i18n/<locale>.json` + `node scripts/merge-i18n.mjs`, alt text in `content/i18n/alt-<locale>.json` + `node scripts/optimize-images.mjs`).
2. Add the code to `INDEXED_LOCALES` in `lib/seo.ts`. Nothing else changes: robots, hreflang and both sitemaps follow the list.
3. `npm run build && node scripts/check-seo.mjs`, then deploy, and submit the sitemap again in Search Console.

### Rendering model (performance)
- Text-only sections are server components wrapped in `components/ui/Static.tsx`: their HTML is server-rendered, but React does not hydrate it (an empty `dangerouslySetInnerHTML` on the client keeps the server's children). Only islands hydrate: the 3D hero, the Day-in-Kashi scroller, the places explorer (filters, modal, map; the cards themselves are static and filtered via `hidden`), itinerary tabs, aarti flame animation, header menus, section dots and the sound toggle.
- Never put an interactive component inside `<Static>`: it would render but never hydrate.
- Scroll reveals (`Reveal`, `StaggerCards`, `TextReveal`, `RippleWipe`) only write data attributes; `components/motion/RevealController.tsx` animates them with IntersectionObservers.
- Devanagari display face: `lib/fonts/tiro-devanagari-headings.woff2` is Tiro Devanagari Hindi subset to the glyphs the display text uses (about 20 KB), preloaded. After changing headings, names, verses or switcher labels, rebuild it with the steps at the top of `scripts/heading-font/crawl-corpus.mjs`.

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
| Production branch | `redesign` for the cut-over (see below); `master` still holds the older site |
| Build command | `npm run cf:build` |
| Deploy command | `npx opennextjs-cloudflare deploy` |
| Root directory | `/` |
| Build variable | `NEXT_PUBLIC_SITE_URL=https://kashidwar.com` |
| Node version | 22 (`.node-version`) |

Preview deployments of non-production branches get a `*.workers.dev` URL; their canonical tags still point at kashidwar.com, which is what you want for search engines.

### Domain cut-over (kashidwar.com currently serves the older site)
1. `redesign` has no history in common with `master` (this is a fresh project, not a change to the old site), so a normal merge will not work. Point Workers Builds' production branch at `redesign`. Later, if you want `master` to be the long-term branch, replace it deliberately (for example rename the old `master` to `legacy-site`, then push `redesign` as the new `master`) rather than merging with `--allow-unrelated-histories`.
2. Check the deployment on its `workers.dev` URL: `/hi`, `/en`, `/ta`, `/sitemap.xml`, `/robots.txt`, a wrong path for the 404.
3. In the Worker → Settings → Domains & Routes, add the custom domain `kashidwar.com` (and `www.kashidwar.com`, redirected to the apex). Cloudflare updates DNS automatically when the zone is on the same account.
4. Remove or disable whatever currently serves the old site on that hostname (its Pages project / Worker route) so the new Worker takes the hostname.
5. Confirm `https://kashidwar.com/` redirects to `/hi`, that `<link rel="canonical">` and the sitemap use `https://kashidwar.com`, and resubmit the sitemap in Google Search Console and Bing Webmaster Tools.
6. Optional: enable Cloudflare Images on the zone and set `NEXT_PUBLIC_IMAGE_OPTIMIZATION=on` for resized AVIF/WebP photos.

## Owner placeholders (fill in)
- `lib/site.ts` → `CONTACT_EMAIL` (shown on /about#contact and in Organization JSON-LD). Currently `contact@kashidwar.com`: either create it (Cloudflare → kashidwar.com → Email → Email Routing → add `contact@` forwarding to your inbox) or replace it.
- `lib/site.ts` → `SOCIAL_PROFILES`: add the full URLs of the site's official profiles; they become `Organization.sameAs`.

## Guides
Researched articles live in `content/guides/<slug>.json` (English + Hindi; other locales show English with a note) and are registered in `lib/guides.ts`. Each section cites sources by index and can be flagged `"unconfirmed": true` (shown as "Not officially confirmed"). `related` links them to places/festivals/projects/itineraries, which link back automatically. Bump `updated` whenever a fact changes. After adding Hindi headings, rebuild the heading-font subset (steps at the top of `scripts/heading-font/crawl-corpus.mjs`).

## Cloudflare Web Analytics (cookieless, no consent banner)
1. Cloudflare dashboard → **Analytics & Logs → Web Analytics → Add a site**.
2. Choose **kashidwar.com** from the list (the zone is proxied, so pick **automatic setup** — Cloudflare injects the beacon at the edge; no code change or token needed).
3. Save; data appears within minutes under Web Analytics → kashidwar.com. It sets no cookies and stores no personal data, so no banner is required.
If you ever turn the proxy off, switch to the manual JS snippet and add its `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "…"}'>` to `app/[locale]/layout.tsx`.

## Weekly content review (AI, human-merged)
Anthropic's [Claude Code GitHub Action](https://github.com/anthropics/claude-code-action)
(pinned to v1.0.235 by commit SHA) re-checks the site's facts and opens **one pull request**
per run ("Weekly content review YYYY-MM-DD" / "Monthly content review YYYY-MM-DD"). Nothing is
merged automatically. Both schedules call the same reusable workflow,
`.github/workflows/content-review-run.yml`.

| Workflow | When (IST) | Model | Caps | What it checks |
|---|---|---|---|---|
| `weekly-content-review.yml` | Mondays 05:00, except the first Monday | `claude-sonnet-5` | 40 turns, $3 | week 1 projects · week 2 festivals + dates · week 3 guides' volatile facts · week 4 new developments + broken links + photos · 5th Monday projects |
| `monthly-content-review.yml` | first Monday 05:00 | `claude-opus-5-5` | 150 turns, $15 | everything |

Caps are hard limits (`--max-turns`, `--max-budget-usd`). The agent keeps its PR summary up to
date as it works and stops at ~80% of its turns, so a capped run still opens a PR with what it
checked and what is left. The workflow appends the model, turns used and the cost reported by
Claude Code to the PR's run notes, and records one line per run in `content/review-log.json`.
"Last verified" dates move only for entries checked in that run. Change models, caps or the
rotation in the `with:` block of each workflow and the "Focus" table in the brief.

**What it checks** — defined in [`.claude/content-review.md`](.claude/content-review.md), a plain
Markdown brief you can edit (add or remove checks, change source rules, change the PR format):
project statuses/timelines/sources; newly announced festival dates for the next 12 months;
volatile guide facts (darshan and aarti timings, Sugam fee, ropeway and Sarnath fares and hours);
significant new developments (only with an official or major-news source); broken source links;
Commons photo candidates for places without a photo. It follows CLAUDE.md and DESIGN.md,
writes original summaries (never copied text), updates English and Hindi together and lists
other locales in TRANSLATION_REVIEW.md. If nothing changed it only moves "last verified" dates.

**Guardrails**
- The agent only edits files and writes the PR description; the workflow itself commits,
  pushes and opens the PR. A workflow step fails the run if anything outside
  `content/*.json`, `content/guides/*.json` or `TRANSLATION_REVIEW.md` changed, or if a JSON
  file is invalid.
- The review job's token has only `contents: write` and `pull-requests: write`. The agent's
  tools are limited to reading/editing files, web search/fetch, `curl` (link checks), and the
  build/lint/SEO commands; `git push`, `git commit` and `gh` are denied to it.
- CI (`.github/workflows/ci.yml`: build incl. heading-font gate, lint, `check-seo`) runs on the
  PR branch. PRs opened with the workflow token do not trigger `pull_request` workflows, so the
  review workflow starts CI on the branch explicitly; its result shows on the PR's commit.
  Optional: Settings → Branches → protect `redesign` and require the "CI / check" status.

**Run it manually:** Actions → Weekly content review → Run workflow (pick a focus, or `auto`
for this week's rotation), or `gh workflow run weekly-content-review.yml --ref redesign -f
focus=guides`; the deep review: `gh workflow run monthly-content-review.yml --ref redesign`.
Then `gh run watch`. Each run's step summary lists any denied tool calls and the cost.

**Change the schedule:** the `cron` lines (UTC; `30 23 * * 0` = Monday 05:00 IST; the plan
jobs pick the week of the month in IST).

## Deploy from GitHub
Workers Builds is not connected to this repository, so `.github/workflows/deploy.yml` deploys:
on every push to `redesign` (including merged content-review PRs), every Monday 06:00 IST
(a rebuild so "next festival" dates roll forward — this replaces the Workers Builds deploy hook
described above), and on demand (Actions → Deploy → Run workflow). Until its secrets exist it
logs a warning and skips. A manual run with **check_only** ticked only verifies the Cloudflare
credentials (`wrangler whoami`, `wrangler deployments list`) and deploys nothing:
`gh workflow run deploy.yml --ref redesign -f check_only=true`.

**Repository secrets to add** (Settings → Secrets and variables → Actions → New repository secret,
or `gh secret set NAME`):
| Secret | Value |
|---|---|
| `ANTHROPIC_API_KEY` | An Anthropic API key (console.anthropic.com → API keys). Used only by the weekly review. |
| `CLOUDFLARE_API_TOKEN` | Cloudflare → My Profile → API Tokens → Create token → template **Edit Cloudflare Workers** (account: yours; zone: kashidwar.com). |
| `CLOUDFLARE_ACCOUNT_ID` | The account ID shown by `npx wrangler whoami` (or the dashboard's Workers overview). |
