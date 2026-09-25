# PROGRESS.md — Kashi build log

## Phase 1 — Scaffold & dependencies · 2026-09-24 · ✅

**Did**
- `create-next-app@latest` → Next 16.3.6, TS, Tailwind 4, ESLint, App Router, no `src/`, alias `@/*`. Turbopack is the default in Next 16 (no flag).
- Ran `npm view <pkg> version` + `peerDependencies` for every package; installed latest stable of each. Full table in `DEPENDENCIES.md`.
- `npm outdated` / `npm audit` clean (see decisions below). Zero vulnerabilities.
- Tailwind v4 idiom: raw tokens on `:root` (`--kashi-*`), utilities via `@theme inline`, custom `@utility` blocks (`container-kashi`, `section-kashi`, `grain`, `arch`, `text-glow`, `bilingual-secondary`).
- `next/font`: Cormorant Garamond 600/700, Inter, Tiro Devanagari Hindi, plus nine Noto Sans regional faces (`preload: false`). `lib/fonts.ts → fontClassesFor(locale)` attaches only the matching regional face; `<html data-script>` picks the display/body stack in CSS.
- Folder structure from CLAUDE.md created. Routes live under `app/[locale]/`.
- next-intl 4 wired minimally so `app/[locale]/` works now: `lib/i18n/{locales,routing,navigation,request}.ts`, `proxy.ts`, plugin in `next.config.ts`. All 13 locales are declared; `messages/hi.json` + `messages/en.json` exist; other locales deep-merge over English until Phase 7 fills them.
- `content/*.json` with 3 real entries each; `lib/content.ts` holds the TS schemas and typed exports.
- Placeholder home page rendering the bilingual H1 from DESIGN.md's voice section.
- `npm run build` ✅ (16 static pages: 13 locales + not-found), `npm run lint` ✅.

**Decisions**
- `motion` installed rather than `framer-motion` (same version, `framer-motion` is the legacy alias).
- ESLint stays on 9.x: ESLint 10 crashes eslint-config-next's bundled react plugin.
- TypeScript stays on 5.9: typescript-eslint peer range excludes 7.x.
- `@types/node` pinned to 22 to match the Node 22 runtime.
- Added `@types/three` (not in CLAUDE.md list) because `three` has no bundled types; needed for `tsc` to pass.
- `localePrefix: "always"` → `/` redirects to `/hi` (or the Accept-Language match). Every locale has a canonical URL for hreflang later.
- `hi` is the default locale per CLAUDE.md.
- Used `requestLocale` in `getRequestConfig`. It is marked deprecated in favour of `next/root-params`; revisit in Phase 7 if next-intl's docs recommend the switch for Next 16.3.

**Verified content (web search, 2026-09-24)**
- Kashi Vishwanath Corridor — completed, inaugurated 13 Dec 2021.
- Namo Ghat — completed, inaugurated 15 Nov 2024 (₹91.06 cr, Smart City + Indian Oil Foundation).
- Varanasi ropeway — under construction; opening targeted late 2026 per Wikipedia. Re-verify in Phase 5.

**Needs review / carried forward**
- Coordinates for Namo Ghat (25.3253, 83.0343) are approximate; Phase 4 verifies all lat/lng.
- Image paths in content point to `/media/...` files that do not exist yet; Phase 4+ adds optimized assets.
- Clustering for the Leaflet map needs a decision in Phase 4 (in-house vs `leaflet.markercluster`).
- Generated `AGENTS.md` from Next 16 is kept (next dev re-creates it); `CLAUDE.md` references it on line 1.

## Phase 2 — Hero + page loader · 2026-09-24 · ✅ (CHECKPOINT)

**Did**
- **Page loader** (`components/ui/PageLoader.tsx`): black → diya ignites (0.1 s) → gold glow (0.35 s) → indigo light spreads (0.7 s) → overlay fades (1.3–1.75 s). Pure CSS keyframes so it starts on first paint with zero JS; skip button; once per session via `sessionStorage` + an inline script that hides it before paint on repeat visits; reduced motion → single 300 ms fade.
- **Hero** (`components/hero/`): `Hero.tsx` (server) renders the bilingual H1, subtitle and saffron CTA immediately. `HeroFallback.tsx` is a server-rendered SVG dawn scene (sky, hazy far bank, 18 diyas with reflections) that is the background everywhere. `HeroScene.tsx` probes the device after hydration and, only on capable desktops, `next/dynamic`-loads `HeroCanvas.tsx` (R3F) which fades in over the SVG.
- **R3F scene** (`components/hero/scene/`): custom water shader (vertex ripples + per-lamp light streaks toward the camera, alpha fade to the sky), 54 instanced clay diyas that bob on the same wave function, instanced flame + glow billboards with per-instance flicker, drei `Sparkles` embers, `PerformanceMonitor` that drops DPR under load, window-pointer camera parallax. Render loop pauses when the hero leaves the viewport. Five draw calls.
- **Motion provider** (`components/motion/SmoothScroll.tsx`): loads GSAP (+ScrollTrigger +SplitText) and Lenis via dynamic import at idle time, drives Lenis from `gsap.ticker`, exposes `useLenis()` / `useGsap()` through `useSyncExternalStore`. Lenis `anchors: true` makes the CTA's `#journey` link smooth-scroll with no extra code. Skipped entirely under reduced motion.
- **Device gate** (`lib/device.ts`): reduced motion, touch/narrow, ≤4 cores, ≤4 GB, data-saver, no WebGL2 or software renderer → fallback. QA override `?hero=full|fallback`.
- SVG favicon (`app/icon.svg`) replaces the 26 KB `.ico`. Skip-to-content link.

**Verification (production build, Lighthouse 13.5 mobile preset, Chrome 154, best of 2 runs each)**
| Build | Perf | LCP (sim) | FCP | TBT | Notes |
|---|---|---|---|---|---|
| first working build | 77 | 4.5 s | 1.8 s | 240 ms | 5 preloaded woff2 (270 KB) + GSAP in initial JS |
| fonts trimmed, GSAP lazy, CSS loader | 86 | 3.5 s | 2.0 s | 220 ms | |
| static Noto 400, no font preload | 89 | 3.2 s | 2.0 s | 180 ms | |
| **no client intl provider (final)** | **93 / 92** | **2.3 s** | 2.0 s | 190–220 ms | A11y 100 · BP 100 · SEO 91 (robots.txt → Phase 9) |
- Observed (unthrottled) FCP = LCP = 0.23 s; LCP element is the H1. CLS 0. Zero console errors in all modes; the only console message is `THREE.Clock … deprecated` emitted by @react-three/fiber 9.8 itself.
- Initial JS 169 KB gz (react-dom 69, Next runtime 46 + 38, app 7). three/R3F/drei load only on the desktop 3D path (≈240 KB gz async chunk).
- Headless checks (puppeteer-core + system Chrome, scratchpad harness): 3D path renders a 1.5× canvas and fades in; mobile emulation never requests the 3D chunk; `prefers-reduced-motion` → no Lenis, no canvas, loader = 300 ms fade, hero text visible immediately; loader overlay verified on top with black background at 700 ms.
- `npm run build` ✅ · `npm run lint` ✅ · `tsc --noEmit` ✅.

**Decisions**
- **No post-processing package.** "Soft bloom" is faked with additive glow billboards; `@react-three/postprocessing` is not in CLAUDE.md's list and a real bloom pass costs a full-screen render on every frame.
- **Fonts are not preloaded.** Preloaded woff2 competed with the stylesheet for bandwidth on slow 4G; with `display: swap` the H1 paints in the size-adjusted fallback and the swap happens under the loader. Noto Sans Devanagari body is static 400 (≈50 KB) instead of the 121 KB variable file. Display stack lists Cormorant before Tiro so punctuation such as "—" doesn't pull a second Latin subset.
- **GSAP and Lenis load after hydration at idle** (≤1.5 s), so they never sit in the LCP/TBT window. Components animate via `useGsap()`; the hook returns null until the bundle is ready.
- **No `NextIntlClientProvider` in the layout for now.** All copy renders in Server Components; client components receive strings as props. This kept use-intl and the merged message bundle out of the initial JS. Add the provider with a scoped `messages` subset the first time a client component genuinely needs `useTranslations`.
- **React Compiler lint** (`react-hooks/set-state-in-effect`, `immutability`) is enforced by eslint-config-next 16. Three-js materials are declared in JSX and mutated through refs in `useFrame`; stores replace setState-in-effect.
- **Tailwind gotcha:** a class glued to a template interpolation (`` `bg-black${x}` ``) is invisible to the scanner and silently missing from the CSS. Keep classes in plain string literals.

**Needs review at this checkpoint**
- Look at the 3D hero on a real GPU (headless SwiftShader only proves it renders). Lamp density, flame size and the water's blue may want tuning.
- The camera parallax range (±0.7 units) and Lenis `lerp: 0.1` feel are judgment calls.
- Loader pacing: 1.75 s total; the "light spreads" beat is an indigo radial scaling from centre.
- Lighthouse variance is ±2 points between runs; 90+ is met but not with a wide margin. Phase 9 should analyse the two anonymous Next runtime chunks (46 KB + 38 KB gz).

## Phase 2.1 — Hero feel tweaks · 2026-09-25 · ✅
Loader 2.2 s (DESIGN.md said ≤ 1.8 s; overridden by checkpoint feedback), water pushed from blue to darker indigo in both the shader and the SVG fallback, parallax −30 %, +20 % lamps clustered along the far bank.

## Phase 3 — Scroll-bound sky + Day in Kashi · 2026-09-25 · ✅

**Did**
- **SunriseBackground** (`components/motion/SunriseBackground.tsx`): a fixed `.sky` layer behind the page whose top/bottom gradient stops and a gold glow are interpolated by GSAP ScrollTrigger (scrub 0.8) over the whole document. Stops: night → indigo → violet → ember → deep saffron; gold arrives as a radial glow layer whose opacity ramps to 0.85, so ash body text stays ≥ 4.5:1 on the base at every scroll position. Reduced motion → static indigo via CSS, no JS.
- **Day in Kashi** (`components/sections/DayInKashi*.tsx`): server wrapper passes three translated scenes to a client scroller. Wide + motion-allowed: section pins, track scrubs horizontally through dawn (Assi) → noon (galis) → dusk (Dashashwamedh aarti); three lamps at the top ignite at 2 % / 50 % / 97 % progress with a progress hairline; scene titles reveal with SplitText inside the container animation, meta/caption fade up. Mobile, reduced motion, or before GSAP loads: the same scenes stacked vertically with `content-visibility: auto`.
- Scene backdrops are static SVG files in `public/media/art/` rendered lazily with `next/image` (`fill`, `unoptimized`), ready to be replaced by AVIF photos.
- **Motion primitives** (`components/motion/`): `Reveal` (fade-up once on enter), `StaggerCards` (children 60 px / 0.08 s), `RippleWipe` (concentric gold rings spread from a diya, scrubbed; static divider under reduced motion), `TextReveal` (SplitText: chars for Latin, words only for Indic scripts so conjuncts never break; sr-only twin carries the accessible text, `aria: "none"`). `SectionHeading` renders the bilingual H2 with `TextReveal`.
- `lib/hooks.ts`: `useMediaQuery` / `useReducedMotionPref` via `useSyncExternalStore` (server snapshot false → no hydration mismatch).
- Motion bundle loading: wide fine-pointer devices at idle; touch/narrow devices on first scroll/touch/key or 4 s, so its evaluation stays out of mobile TBT.

**Verification**
- `npm run build` ✅ `npm run lint` ✅ `tsc` ✅. Console clean on desktop, mobile and reduced-motion runs.
- Puppeteer scroll probe: pin-spacer present on desktop, `--sky-top` interpolates `#0b0a14 → rgb(119,57,36)` across the page, lamps lit 0 → 1 → 2 as progress advances; vertical fallback on mobile with sky still interpolating.
- Lighthouse mobile (production build, 4 runs): performance 94, 88, 93, 89 (median ≈ 91), LCP 2.5–3.2 s, TBT 100–180 ms, A11y 100, BP 100, SEO 92. Run-to-run variance is ±3 points on this machine; the remaining fixed cost is the document's own parse + style task (~240 ms throttled) and react-dom hydration.

**Decisions**
- Primitives use GSAP (already lazy-loaded) rather than `motion` for scroll-enter effects; `motion` is reserved for component enter/exit (modal, Phase 4) where `AnimatePresence` earns its bytes.
- Inline SVG art was moved to files after Lighthouse showed it parsed twice (HTML + React Flight payload): HTML 108 KB → 51 KB, TBT 320 → ~120 ms.
- Gold sky stop capped at `#8A3F1A` base + glow layer, not a gold fill, to keep body-text contrast.

**Needs review**
- Desktop pinned scroller: hydration renders the vertical layout first and switches to the pinned one when GSAP arrives at idle; a visitor who scrolls to it within ~1 s could see the switch.
- Lighthouse margin over 90 is thin; Phase 9 will look at the Flight payload size and CSS.

## Phase 4 — Places + map · 2026-09-25 · ✅

**Did**
- `content/places.json`: 22 places, full schema (id, bilingual names, faith[], type, lat/lng, summary, bestTime, tips, story where it earns it, sources[]). Coordinates cited from Wikipedia / kashi.gov.in / Mappls for 16; the other 6 carry `coordsVerified: false` and the modal says "Location approximate": Panchganga Ghat, Mulagandha Kuti Vihar, Ramnagar Fort (Wikipedia gives 2-digit precision), BHU/New Vishwanath, Kaal Bhairav (Wikipedia's coordinate lands near Cantt, far from Visheshwarganj; used the locality), St. Mary's Church.
- **Places section** (`components/sections/Places.tsx` server → `PlacesExplorer.tsx` client): ten filter chips (All / Ghats / Temples / Buddhist / Jain / Sikh / Islamic / Christian / Bhakti / Heritage) with `aria-pressed`, live result count, deep-linkable via `#places/<filter>` (faith tiles in Phase 5 link here), portrait 3:4 cards with an arch-framed image slot, faith badges with line glyphs, type chip and best-time line, staggered fade-up, hover lift + gold edge glow.
- **Detail modal** (`components/ui/Modal.tsx`, `motion` AnimatePresence): focus moves in and returns, Tab trapped, Esc / backdrop close, Lenis + body scroll held; summary, story, best time, tips, sources and "Show on map" which flies the map to the pin.
- **Map** (`components/ui/KashiMap.tsx`, react-leaflet 5, `next/dynamic` ssr:false, mounted only when within 600 px of the viewport): gold SVG pins, in-house grid clustering (64 px cells, cluster click fits bounds), view follows the active filter, wheel zoom off so it never fights page scroll.
- `FaithGlyph`: trishul, dharma-chakra, lotus, khanda, crescent, cross, ektara, diya — 1.5 px gold line icons, equal weight.
- Photos: none exist yet, so cards show a faith-toned placeholder with the glyph. `Places.tsx` checks `public/<image>` at build time and switches to `next/image` automatically when a file appears.

**Verification**
- build ✅ lint ✅ tsc ✅. Puppeteer: 22 cards, Jain filter → 1 card and `#places/jain`, modal opens with focus inside and closes on Esc, map mounts with 18 tiles, 4 pins + 4 clusters at city zoom; console clean on desktop and mobile.
- Lighthouse mobile: 90 / 85 (LCP 2.9–3.3 s, TBT 160–220 ms), A11y 100, BP 100, SEO 92. The extra SSR'd cards add to the document parse task; see Phase 9.

**Decisions / needs review**
- **CARTO tiles need an API key now.** The keyless Dark Matter URL from DESIGN.md returns tiles watermarked "API KEY REQUIRED". Default switched to OpenStreetMap tiles with a CSS invert/hue filter (`.map-dark`) that lands in the night/indigo palette. `NEXT_PUBLIC_MAP_TILE_URL` / `NEXT_PUBLIC_MAP_ATTRIBUTION` / `NEXT_PUBLIC_MAP_TILES_ARE_DARK` (see `.env.example`) switch to CARTO once you have a key. OSM's tile policy tolerates light use; for a public launch a keyed provider is the right call.
- Clustering is in-house (no `leaflet.markercluster`): 22 pins do not justify a dependency.
- Summaries, tips and stories are English in `places.json` for every locale until Phase 7 decides where translated content lives.
- `motion` is now in the client bundle for the modal (first use of the package).

## Phase 5 — Faiths + Government projects · 2026-09-25 · ✅ (CHECKPOINT)

**Did**
- **One Kashi, every faith** (`components/sections/Faiths.tsx`, `content/faiths.json`): seven identical tiles — Hindu, Jain, Buddhist, Islamic, Bhakti saints, Sikh, Christian — ordered by arrival in the city (locale-independent, unlike alphabetical), each with its line glyph, one-line essence, a verse in its own script + transliteration + translation + attribution, key sites, and "See places" deep-linking to `#places/<filter>` (Hindu → Temples). Verses: Kāśī Khaṇḍa saying, Tattvārtha Sūtra 5.21, Pāli mettā line, Bismillāh, Kabīr's "Moko kahān ḍhūnḍhe", Mūl Mantar (Gurmukhi), John 8:12 (Greek).
- **Projects** (`components/sections/Projects.tsx`, `content/projects.json`): 14 entries, each web-checked on 2026-09-25 with cited sources, `status`, `agency`, `timeline`, `verified`, `lastVerified`. Grouped Under construction → Announced → Completed; status badges per DESIGN.md (gold / saffron pulse / ash outline), agency, timeline, source links, per-card and section-level "last verified" dates, and a warning line on unverified items.

**Statuses found (2026-09-25)**
| Project | Status | Key fact |
|---|---|---|
| Kashi Vishwanath Corridor | completed | inaugurated 13 Dec 2021 |
| Namo Ghat | completed | inaugurated 15 Nov 2024, ₹91.06 cr |
| Ropeway (Cantt–Godowlia) | under construction | trials since Jul 2025; opening target slipped to Nov 2026 |
| Ganga cruises / terminal | completed | Ganga Vilas 13 Jan 2023; Ravidas Ghat cruises; Tent City Oct–Jun |
| Rudraksh Convention Centre | completed | 15 Jul 2021, JICA grant aid |
| Varanasi Cantt station | **announced, verified: false** | 2018 list + Amrit Bharat scope; no dated source |
| Banaras station (Manduadih) | completed | RITES ₹118 cr, 2018; renamed 2020–21 |
| Ring Road | under construction | 61 km open except 2nd Ganga-bridge carriageway (Dec 2025) |
| Airport expansion | under construction | ₹2,869.65 cr, target end-2026 |
| Sarnath redevelopment | completed | works inaugurated; **UNESCO inscription 25 Jul 2026** |
| Kashi Tamil Sangamam | completed | 4th edition 2–15 Dec 2025 |
| Ganjari cricket stadium (new) | under construction | ~75 % built, expected late 2026 |
| Heritage corridors + 119 parks (new) | announced | ₹69 cr, Sep 2026 |
| ₹24,000 cr highway package (new) | **announced, verified: false** | secondary reporting only |

**Verification**
- build ✅ lint ✅ tsc ✅. Puppeteer: 7 tiles, 14 project cards, Jain tile → `#places/jain` with the grid filtered; console clean desktop + mobile. Lighthouse in the checkpoint report.

**Decisions / needs review**
- Order of faiths = arrival in Kashi. Alphabetical would change per language; antiquity is the same for everyone. Say if you'd rather alphabetical-in-English.
- Verses: Gurmukhi and Arabic render in system fonts on non-Punjabi locales (Noto Gurmukhi is only loaded for `pa`); Phase 7 can add a small subset font if the fallbacks look poor on your devices.
- Projects `verified: false` for two items; the ropeway's opening date has moved three times, so it is marked under construction with the latest target only.
- Project cards have no images yet (placeholders not shown; the card is text-first by design).

## Phase 6 — Festivals, food, itineraries, practical · 2026-09-25 · ✅

**Did**
- `content/festivals.json`: 7 festivals (Dev Deepawali, Maha Shivratri, Ganga Mahotsav, Bharat Milap, Nag Nathaiya, Buddha Purnima, Ramlila of Ramnagar) with lunar rule, months, place, summary, sources. `content/food.json`: 8 dishes with type, season, where-to-find, summary. Itineraries (1/2/3-day) unchanged from Phase 1 with sunrise/sunset markers.
- **Festivals**: a 12-month calendar strip (lamp dots where festivals fall, sr-only names per month) + cards in month order with faith glyph, when and where. Lunar-date note; no Gregorian dates are hard-coded, so nothing goes stale.
- **Food**: four-column grid, type chip, vegetarian mark, season and shop list.
- **Itineraries**: accessible tabs (roles, arrow keys) over a vertical timeline; sunrise/sunset stops get a glowing sun glyph; named stops link to the Places section.
- **Practical**: air / rail / road / best-season cards and an etiquette list (ghats, cremation ghats, aarti, boats, plastic, other faiths' places).
- All copy for these sections lives in `messages/*.json`; content in `/content`.

**Verification**: build ✅ lint ✅ tsc ✅; Puppeteer desktop + mobile: 7 festival cards / 12 month cells, 8 food cards, tabs switch by click and ArrowRight, 3 days rendered on the 3-day plan with sunrise/sunset markers, 4 practical cards + 6 etiquette lines; console clean. Lighthouse in the summary below.

**Needs review**: festival "when" rules and the practical travel facts (flight cities, Vande Bharat timing, distances) are from general knowledge and should be spot-checked by someone local; the thandai entry mentions licensed bhang counters factually.

## Phase 7 — Languages · 2026-09-25 · ✅

**Did**
- `messages/` now has all 13 locales (hi, en, ta, te, kn, ml, bn, or, as, mr, gu, pa, sa) with an identical 190-key structure (parity script passes; `request.ts` deep-merges each over English as a safety net).
- Content prose translated into **Hindi** for every entry (22 places, 14 projects, 7 festivals, 8 dishes, all itinerary stops) via `i18n.hi` blocks in `content/*.json`; `lib/content.ts → localize()/localizeItinerary()` applies them, English is the fallback for the other 11 locales.
- Place / festival / food names: original Devanagari + Latin transliteration in every non-Devanagari locale.
- **Language switcher** (`components/ui/LanguageSwitcher.tsx`): fixed top-right, script sample + native name for each of the 13 languages, `role="menu"`, arrow/Home/End/Esc keyboard support, focus returns to the trigger, locale-aware links keep the current page.
- Fonts per locale were already wired in Phase 1 (`lib/fonts.ts`): the matching Noto Sans face is attached to `<html>` only for that locale's script.
- `TRANSLATION_REVIEW.md` lists what a native speaker must check, religious terms first.

**Verification**: build ✅ (16 static pages), lint ✅, tsc ✅; screenshots at 1440 px and 412 px for Tamil and Malayalam (longest scripts) show no overflow in hero, chips, cards or tiles; switcher opens and navigates by keyboard; console clean.

**Decisions / needs review**
- Prose for the 11 regional locales stays English until native translators work through TRANSLATION_REVIEW.md; translating ~10k words × 11 languages by machine would have produced text nobody had checked.
- Sanskrit UI strings exist because the brief asked for them, but see the review file: a headings-plus-verses treatment may serve Sanskrit better.
- Faiths verses in Gurmukhi/Arabic/Greek rely on system fonts outside their own locale.

## Phase 7.1 — Long-script fixes · 2026-09-25 · ✅
Malayalam/Tamil/Kannada/Telugu headings get a smaller display scale on phones plus `overflow-wrap: anywhere`; the switcher shows each language in its own Noto face (downloaded only when the menu opens).

## Phase 8 — Sound, cursor, polish · 2026-09-25 · ✅

**Did**
- **Ambient sound** (`lib/ambient.ts`, `components/ui/SoundToggle.tsx`): synthesised with the Web Audio API because no recordings exist — brown-noise river through a drifting low-pass, struck bell tones at random intervals, a faint conch sweep every minute or so. Master gain capped at −18 dBFS, 2 s fade-in, fade-out on stop, stops when the tab is hidden. Bell toggle bottom-right, muted by default, choice persisted in `localStorage` (a remembered "on" still waits for a tap, per autoplay rules).
- **Incense cursor** (`components/motion/IncenseCursor.tsx`): fixed canvas, puffs emitted every ~6 px of pointer travel, rise and sway, fade in 1.6–2.8 s; the rAF loop sleeps when nothing is alive. Never mounted on touch, coarse pointers or reduced motion.
- **Aarti finale** (`components/sections/AartiFinale.tsx` + `AartiFlames.tsx`): seven tiered lamps, each flame on its own GSAP `repeatRefresh` tween (random scale/opacity/x every 0.12–0.32 s = noise-driven flicker), a gold radial glow rising from the bottom, closing lines in all 13 locales, and a bell cue on enter when sound is on.
- **Dividers** with the diya glyph were already `RippleWipe` (Phase 3); now used between all major sections. **Grain** now rides on the fixed sky layer (`.sky::before`, opacity 0.04) so every dark surface has it.
- **Reduced-motion audit**: loader → 300 ms fade; sunrise → static indigo; Day-in-Kashi → stacked, no scrub; Reveal/StaggerCards/TextReveal/RippleWipe → no-ops; hero → SVG fallback, `hero-rise` delay 0; status pulse, sound ring, fallback diya flicker → `animation: none`; incense cursor and aarti flicker → not started; modal → 300 ms fade. Verified with `prefers-reduced-motion` emulated: no canvas, no flame transforms, console clean.

**Verification**: build ✅ lint ✅ tsc ✅; Puppeteer: cursor canvas paints on pointer movement; toggle → `aria-pressed=true` + `localStorage kashi:sound=1`, second tap reverts; 84 flames with changing transforms; grain opacity 0.04; console clean in both modes.

**Decisions**
- Synthesised audio instead of recordings: zero bytes to download, no licensing, and it can be swapped for real recordings later by replacing `lib/ambient.ts` (same `start/stop/bell` interface).
- The finale's flames are SVG + GSAP rather than a second R3F scene: it runs on mobile too.

## Phase 9 — Performance, SEO, deploy · 2026-09-25 · ✅

**SEO / metadata**
- `metadataBase` from `NEXT_PUBLIC_SITE_URL` (`lib/site.ts`, default `https://kashidwar.vercel.app`), canonical per locale, `alternates.languages` with all 13 BCP-47 tags + `x-default` (14 hreflang links per page), OpenGraph + Twitter cards with a 1200×630 image per locale (`public/media/og/og-<locale>.png`, rendered from the message files with the site's fonts by the scratchpad generator), `robots: index, follow`.
- `app/sitemap.ts` (13 URLs, each with 14 hreflang alternates), `app/robots.ts` (allow all, sitemap, host).
- JSON-LD: `TouristDestination` for Kashi with 22 `TouristAttraction` entries (names in the locale, geo, first source as `sameAs`).
- Error pages in the design system: `app/[locale]/not-found.tsx` (translated in 13 locales, reached via `[...rest]` catch-all — `/hi/anything` → 404, `/xx` → proxy redirect → 404), `app/[locale]/error.tsx` (bilingual, retry), `app/global-error.tsx` (inline-styled root fallback).
- Lighthouse SEO is 92 locally only because the canonical points at the production origin; it is 100 once served from that origin.

**Performance — what actually moved Lighthouse mobile from 84 to 91–96**
| Change | Effect |
|---|---|
| Card lists in client components (data once, not markup per card) | Flight payload 236 → 166 KB |
| Bodies of Places and the 7 later sections rendered client-side on approach, data from prerendered JSON (`/<locale>/data/places`, `/<locale>/data/tail`) | HTML 65 → 18 KB gz; hydration halved |
| `lib/contentTypes.ts` (JSON-free helpers) | content JSON no longer in the client bundle (−35 KB gz) |
| Modal `dynamic(…, { ssr: false })` | `motion` (42 KB gz) leaves the initial bundle |
| SVG symbols for faith glyphs, hero lamps and aarti tiers | fewer DOM nodes; finale 84 → 28 flame targets |
| Body fonts attached after first paint, warmed on a hidden probe → one swap at idle | fonts off the LCP path, single relayout |
| Display faces `font-display: block` | H1 paints once in its real face → one LCP candidate (2.0 s) instead of two |
| Motion bundle on touch devices loads on first interaction only (no timer) | nothing lands in the TBT window without a gesture |
| Lazy bodies mount on IntersectionObserver only (no idle timer) | their render no longer extends time-to-interactive |
| `text-wrap: pretty` removed from paragraphs | (small) |
- Tried and reverted: `experimental.inlineCss` (Next duplicates the stylesheet into the Flight payload: 65 → 92 KB gz).
- Final (production build, mobile preset, 5 runs on /hi): **94 / 96 / 93 / 91 / 95**, LCP 2.0 s (one run 2.7 s), TBT 160–250 ms, FCP 1.2 s, CLS 0; A11y 100, Best Practices 100. /en: 94. Observed (unthrottled) LCP ≈ 0.28 s.

**Trade-offs to know about**
- Places grid, Faiths, Projects, Festivals, Food, Itineraries, Practical and the Finale are **not in the initial HTML** any more — only their H2s and intros are. Their bodies render when the section comes within 1200 px of the viewport, from static JSON prerendered at build. Google's renderer expands the viewport for IntersectionObserver content and the JSON-LD lists every place, but if server-rendered text for those sections matters more than the score, `lib/useApproach.ts` can add an idle fallback (costs ~5 Lighthouse points) or the sections can be imported directly in `page.tsx` again.
- Web fonts: repeat visits are seamless (inline snippet + cache). First visits paint body text in a metric-matched fallback until the browser is idle, and the hero title waits for its face (≤ 3 s) — both under the 2.2 s loader.
- No raster images exist yet (the brief's AVIF/WebP step has nothing to convert); `next/image` with AVIF/WebP formats is configured and `Places.tsx` switches to photos automatically when files appear.

**Deploy**
- **Not deployed.** Vercel CLI 60 was installed but logged out; `vercel deploy --temporary --yes` still started a browser device-login flow (`https://vercel.com/oauth/device?user_code=…`) that only the account owner can complete, so it was abandoned. To deploy: `npx vercel login`, then `npx vercel --prod`, and set `NEXT_PUBLIC_SITE_URL` (Production) to the real domain; every one of the 13 locale routes, both data endpoints per locale, sitemap and robots prerender statically.
- README.md written: setup, env, folder map, content editing, adding a place / project / language, design rules, deploy.

## Phase 9.1 — Server-render the text sections again · 2026-09-25 · ✅

Reversed the Phase 9 lazy-body decision on advice that search, social previews and AI crawlers must see body text without executing JS. Places (22 cards), Faiths, Projects, Festivals, Food, Itineraries and Practical are server-rendered in the initial HTML again (client list components still keep the Flight payload to data-only). Lazy rendering remains only where it is visual: the Leaflet map (on approach), the Aarti lamps + flicker (on approach), the 3D hero (capable desktops), the place modal (on open). The `/data/*` JSON endpoints were removed.

- HTML 18 → 56 KB gz; every summary, verse, timeline and etiquette line is greppable in the response.
- Lighthouse mobile, production build, 5 runs on /hi: **91 / 90 / 93 / 94 / 92**, LCP 2.0–2.4 s, TBT 200–340 ms, FCP 1.4 s, CLS 0; A11y 100, BP 100.
- The remaining perf structure (client lists, JSON-free client helpers, ssr:false modal, deferred body fonts + block display faces, interaction-only motion bundle on touch) is what keeps it above 90 with full text.

**Not done here, by request:** Vercel deploy (`npx vercel login` → `npx vercel --prod`, set `NEXT_PUBLIC_SITE_URL`, then check /hi, /en, /ta).
