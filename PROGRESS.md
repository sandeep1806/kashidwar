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

## Phase 9.2 — Cloudflare Workers deploy · 2026-09-25 · ✅

**Did**
- Deploy target changed from Vercel to **Cloudflare Workers via OpenNext** (`@opennextjs/cloudflare` 1.20.6, `wrangler` 4.140.0). `wrangler.jsonc`: worker `kashidwar`, `nodejs_compat` + `global_fetch_strictly_public`, assets binding for the prerendered pages, self service binding, Images binding, observability, `vars.NEXT_PUBLIC_SITE_URL = https://kashidwar.com` and `NEXT_PUBLIC_IMAGE_OPTIMIZATION = off`. `open-next.config.ts` with the default (no R2) config since nothing is dynamic. `image-loader.ts` (Cloudflare Images URL loader, passthrough until enabled). `public/_headers` immutable cache for `/_next/static`. `scripts/cf-build.mjs` exposes the wrangler vars to `next build` so the prerendered canonical/hreflang/sitemap/OG URLs are right; a Workers Builds environment variable of the same name overrides it.
- `package.json` scripts: `cf:build`, `preview`, `deploy`, `upload`, `cf-typegen`. `.node-version` = 22.
- Vercel-specific bits removed (`.vercel` ignore, `_vercel` in the proxy matcher, Vercel URLs in docs and defaults). CLAUDE.md deploy line updated.
- README: Workers Builds settings (build `npm run cf:build`, deploy `npx opennextjs-cloudflare deploy`, env `NEXT_PUBLIC_SITE_URL=https://kashidwar.com`) and the kashidwar.com cut-over steps.
- Repo: remote `origin` = github.com/sandeep1806/kashidwar; this project pushed on branch **`redesign`**, `main` untouched. Secrets scan before push: no `.env` files tracked (`.env*` ignored, only the placeholder `.env.example` kept), no keys/tokens in tracked files.

**OpenGraph images.** They are per-locale PNGs in `public/media/og/`, served as static assets — not `ImageResponse` routes. `ImageResponse` renders with Satori, which cannot shape Indic scripts (conjuncts and matras come out wrong; vercel/satori#516), so a Hindi/Tamil/Bengali title would be broken. The PNGs are rendered by Chrome from the same message files; regenerate with the scratchpad `og.mjs` (or any headless Chrome) when titles change.

**Verified under `npm run preview` (wrangler dev, local Workers runtime)** — see the checkpoint report for the exact results of: 13 locale routes, `/` redirect, 404 for unknown paths, `sitemap.xml` + `robots.txt`, hreflang + canonical + OG image URLs pointing at kashidwar.com, OG PNGs served, JSON-LD present, and the interactive smoke test (filters, modal, map, finale).

## Phase 9.3 — Domain cut-over · 2026-09-25 · ✅
- kashidwar.com removed from the old Pages project (by the owner, in the dashboard) and attached to the `kashidwar` Worker as a custom domain (`routes: [{ pattern: "kashidwar.com", custom_domain: true }]`), deployed as version 7b0af293.
- www.kashidwar.com stays a proxied DNS record handled by a zone Redirect Rule (301 → apex, query string preserved); it is intentionally not attached to the Worker.
- Verified live: `/` → 307 `/hi`; `/hi`, `/en`, `/ta` 200 with canonical `https://kashidwar.com/<locale>`; `www.kashidwar.com/en` → 301 `https://kashidwar.com/en` → 200; unknown path 404; sitemap 200; robots points at kashidwar.com; TLS valid.
- Wrangler now disables the workers.dev URL and per-branch preview URLs, since `workers_dev` is not set. Add `"workers_dev": true, "preview_urls": true` to wrangler.jsonc if you want them back (for example for Workers Builds previews of branches).
- Still open: pause the old Pages project's Git builds (it rebuilds every push, and its `redesign` preview builds fail).

## QA pass — content · 2026-09-25 · ✅
- Festivals: 7 → 19 entries, one or more for every faith and every month. Added Shravan, Ganga Dussehra, Rangbhari/Masaan Holi, Chhath, Ravidas Jayanti, Kabir Jayanti, Guru Nanak Jayanti, Parshvanath Janma Kalyanak, Eid al-Fitr, Muharram, Christmas and Kashi Tamil Sangamam. Each has cited sources and Hindi text.
- Places: Guru Ka Bagh (Guru Nanak, 1507) and Bari Sangat (Guru Tegh Bahadur, 1666) are separate gurudwaras and are now split into two entries. Sarnath uses UNESCO's inscription wording and source.
- Projects: every entry re-checked on 2026-09-25 and weak sources replaced with PIB, AAI, kashi.gov.in, UNESCO, Business Standard and DD India. The ropeway is under construction with a November 2026 target. Only the Cantt station redevelopment stays unverified.
- Regional locales: place and festival summaries translated for all 11 regional locales (`content/i18n/*.json`, merged by `scripts/merge-i18n.mjs`). Sections still in English show a localized note. TRANSLATION_REVIEW.md lists the terms the translators flagged.

## Photos · 2026-09-25 · ✅ (performance gate still open, see below)
- 58 self-hosted photographs replace the glyph placeholders: 19 of 23 places, 17 of 19 festivals, all 8 dishes, 10 of 13 projects, the three Day-in-Kashi scenes and the mobile hero. No `raw/` photos were supplied and no Unsplash/Pexels keys were set, so all come from Wikimedia Commons (CC0, CC BY, CC BY-SA or public domain), each checked by title, description, categories and location.
- Pipeline: `scripts/fetch-images.mjs` (candidates) → `scripts/image-picks.json` (picks, alt text, crops) → `scripts/optimize-images.mjs` (download, dark/warm grade, AVIF + WebP, blur placeholder, `content/photos.json`, `content/credits.json`). Credits page lists author, licence link and source for every photo and notes the edits.
- Sensitivity: no pyres or bodies (Manikarnika is shown by the Ratneshwar temple from the river), no Kashi Vishwanath sanctum, no close-ups of people bathing, praying or at funerals.
- Illustrative, not taken in Varanasi: Guru Nanak Jayanti (Goindwal fresco), Parshvanath Janma Kalyanak (Multan mural), Kabir Jayanti (Amber painting), Muharram (Delhi), Jalebi (Delhi), Launglata (Bengal). Alt text names the real place.
- Still without a photo: places Kaal Bhairav, Kabir Chaura Math, Gurudwara Guru Ka Bagh, Gurudwara Bari Sangat; festivals Ganga Mahotsav, Bharat Milap; projects Varanasi Ropeway, Rudraksh Convention Centre, Ganjari stadium, heritage corridors and parks.
- Performance work in the same pass: every web font deferred to one swap at idle (via `document.fonts.load`, no probe layout); scroll reveals moved to IntersectionObservers (no forced layout of `content-visibility` sections when GSAP loads); place-modal prose moved to prerendered `/<locale>/places.json`; unused fields dropped from card payloads; Day-in-Kashi photos mount on approach; hero SVG not laid out on phones.
- Lighthouse mobile, local `next start`, /hi, 3–5 runs: before photos 84–86 / 97 / 100 / 92; after 82–87 / 100 / 100 / 92 (SEO 92 is the localhost canonical check). Live numbers are in the deploy notes.
- Deployed 2026-09-25 as Worker version 1b2761ff. Live checks: `/` → 307 `/hi`; `/hi`, `/en`, `/ta`, `/hi/credits`, `/ta/places.json` and photos 200; unknown path 404; `www.kashidwar.com/en` → 301 apex.
- Lighthouse mobile against https://kashidwar.com/hi from this machine (3 runs): performance 63–87 (network-bound, TTFB 176–732 ms here), accessibility 100, best practices 81, SEO 100. Best practices loses points only to Cloudflare's injected bot-detection script (`/cdn-cgi/challenge-platform/scripts/jsd/main.js`, deprecated APIs); turning off JavaScript Detections / Bot Fight Mode for the zone removes it.
- Open: performance is below the 90 target (local median 85). What remains is structural: ~2,500 DOM nodes hydrated and ~300 KB of HTML parsed on load, because every section's text is server-rendered by request. Mounting the below-fold section bodies on approach would be the next lever.

## Islands, heading font, Sikh photos · 2026-09-25 · ✅
- **Hydration:** text-only sections are server components inside `<Static>` (server HTML, not hydrated). Hydrated elements on /hi went from 2,464 of 2,470 to 275 of 2,500. What still hydrates: header menus (17), hero scene (3), Day-in-Kashi scroller (90), places explorer controls (19; the 23 cards are static and filtered via `hidden`), itinerary tabs (76), aarti flame island (6), section dots, sound toggle, cursor and loader (64). All section text stays in the HTML.
- Scroll reveals, heading splits and ripple dividers moved to one `RevealController` island driven by data attributes.
- **content-visibility:** every below-fold section already had it; intrinsic sizes are now measured per section (mobile and desktop) instead of one 120vh guess.
- **Heading font:** Tiro Devanagari Hindi subset to the 208 glyphs the display text uses (HarfBuzz trace + fontTools, verified by re-shaping all 193 corpus lines with zero differences): 20.6 KB instead of 62 KB, preloaded and applied at first paint. Pipeline in `scripts/heading-font/`.
- **Lighthouse mobile /hi, local, 5 runs:** 94 / 96 / 94 / 94 / 94, median 94 (accessibility 100, best practices 100, SEO 92 = localhost canonical). Before this pass: median 85. /en and /ta single runs: 94.
- **Photos:** Commons searched again in Hindi, Punjabi and alternate spellings, plus geosearch within 300 m. Nothing usable for Kaal Bhairav (only Kathmandu, Ujjain, Udaipur shrines) or Kabir Chaura Math (only Kabir's samadhi at Maghar). The gurudwaras now use Takht Sri Patna Sahib (Bari Sangat) and a Nishan Sahib at Amritsar (Guru Ka Bagh).
- Photos from outside Varanasi now carry a visible, localized chip ("Not taken in Varanasi" / "Artwork, not from Varanasi"): both gurudwaras, Muharram, the Kashi Tamil Sangamam coach (Chennai), jalebi (Delhi), and the Guru Nanak, Parshvanath and Kabir artworks.
- Indic uppercase labels no longer get Latin letter-spacing.
- Deployed as Worker version 6fe07da6 and pushed. Live https://kashidwar.com/hi from this machine (3 runs): performance 74 / 88 / 88 (LCP follows this network's 270–580 ms TTFB), accessibility 100, SEO 100, best practices 77–81 (Cloudflare Bot Fight Mode script, left on by decision). Compressed /hi is 72 KB (Brotli), up from 61 KB: unhydrated sections ship their markup in the RSC payload instead of compact props.

## SEO structure · 2026-09-25 · ✅
- 59 detail pages × 13 locales (23 places, 19 festivals, 14 projects, 3 itineraries) = 767 new static pages, 793 HTML pages in all. Each has photo, full text, "how to reach", related places, prev/next and breadcrumb; places and festival venues have a lazy map. Home cards, festival/project cards, itinerary tabs and the place modal link to them; the modal's share link is the page URL.
- Unique localized titles and descriptions per page (templates in `messages/*/meta`); home title "Kashi (Varanasi) — Ghats, Temples, Sarnath & Travel Guide" in 13 languages.
- JSON-LD: WebSite + TouristDestination on home; TouristAttraction with geo per place; Event per festival with verified 2026 dates (16 of 19; Ganga Mahotsav only proposed 20–23 Nov, Parshvanath Janma Kalyanak has no 2026 date, Kashi Tamil Sangamam 2026 not announced — these show "dates not yet announced" and emit no Event); TouristTrip per itinerary; BreadcrumbList everywhere. `scripts/check-seo.mjs`: all 793 pages pass.
- hreflang x-default → /en. Sitemap: every page in every locale with alternates; image sitemap at /sitemap-images.xml.
- Heading-font gate in `npm run build`; the subset was rebuilt with the new sub-page headings (224 glyphs, 21.8 KB, 263 corpus lines verified).
- Lighthouse mobile, local, 5 runs: home 94 (all five), /hi/places/sarnath 95 median (92–95); accessibility and best practices 100; SEO 92 only for the localhost canonical.
- Date notes: Ramnagar Ramlila's end (25 Oct) is computed as Sharad Purnima; Nag Nathaiya's date is from the Varanasi panchang, not an organiser announcement.

## Live QA + SEO pass · 2026-09-25 · ✅
- **Indexing:** only `INDEXED_LOCALES = ["hi","en"]` (lib/seo.ts) are indexable; the 11 regional locales carry `noindex, follow`, no hreflang, and are out of both sitemaps (sitemap.xml now 122 URLs). README → "Indexing a locale".
- **Festival dates** shown under every festival heading and on the home cards (localized), "dates not yet announced" otherwise; titles mention the year only when a verified date is shown; check-seo enforces title/date/Event agreement (mutation-tested).
- **Photo fallbacks:** `ArtFallback` everywhere a photo can be missing; check-seo scans 4,277 arch frames and fails on any empty one.
- **Sources:** 19 of 21 blog/aggregator citations replaced (UP and DoPT holiday-list PDFs, Amar Ujala, Aaj Tak, DD India); Ganga Mahotsav's two local-blog citations removed (still unverified, no official 2026 dates). Ganga Dussehra set to 26 May 2026 (observed in Varanasi per Amar Ujala) instead of the panchang's 25 May.
- **Design:** per-script language-name fonts (10 subsets, 23 KB total, shaping verified); plain-case larger English line under H1s below 640px; 44×44 hit areas (sub-44px targets on /en, a place page and a festival page: 196 → 0); section dots fixed (the "footer" match was a project card's `<footer>`); distances say "in a straight line" in all 13 locales.

## Festival dates roll over · 2026-09-25 · ✅
- `content/festival-dates.json` holds every year per festival (2026 + 2027, plus a second 2027 Posh Dashami and unverified 2028 estimates for Eid and Muharram, which drift ~11 days a year). 2027: 13 verified from Drik Panchang (Varanasi) and the DoPT 2027 list; Eid, Muharram and Ramnagar Ramlila 2027 are unverified (DoPT OM not directly readable; Ramlila schedule not published); Ganga Mahotsav and Kashi Tamil Sangamam 2027 not announced.
- `festivalTiming()` compares against the build date: pages feature the next verified occurrence ("Next" / "On now"), else "Next: expected <month> <year> — date not yet announced"; "Last held" shows smaller. Titles and Event JSON-LD use the verified next occurrence only. Home cards sort by what comes next; the first confirmed one is badged "Coming up next".
- Weekly rebuild: `worker.js` wraps the OpenNext worker with a `scheduled` handler (Mondays 00:30 UTC via `triggers.crons`) that POSTs to a Workers Builds Deploy Hook (`DEPLOY_HOOK_URL` secret — one-time setup in README).
- check-seo: featured dates never before the page's `<meta name="build-date">`, Event only for the featured verified occurrence, title year = featured year, "last held" in the past. Verified with builds dated 2026-12-30 and 2027-06-15 (all pass) and a stale-date mutation (fails).
- Ganga Dussehra 2026 stays 26 May (Varanasi observance).

## QA + visual upgrade pass · 2026-09-27 · ✅ (Lighthouse gate not met locally, see below)
- **A — functional:** `#section/arg` deep links handled by `HashLinks` (faith tiles scroll and filter every time, same-hash included, before Lenis); new Hindu chip; language switch keeps the current section or deep hash; "View on map" centres the whole map and marks the pin (pulse + label); the place filter survives modal open/close; festival months filter the cards (`#festivals/<n>`).
- **B — mobile length:** below lg Festivals/Projects/Food are snap carousels of compact cards (same DOM as the desktop grid, text stays in HTML) with See all → new listing pages `/<locale>/festivals|projects|food`; Places capped at 8 with Show all. Mobile /en home 53,495 → 21,202 px; /hi 20,159 px.
- **C — photos:** new Kashi Vishwanath spire, noon gali, dawn boats, Assi riverfront (heritage corridors), La Paz ropeway (labelled elsewhere). St. Mary's verified as the CNI church. No free photo exists for Kaal Bhairav, Kabir Chaura Math, Bharat Milap, Ganga Mahotsav, Ganjari stadium, Rudraksh (Commons + Openverse searched; the one "Kaal Bhairav Temple" Commons upload has been deleted). Cards 360/720/1280 w with cover-aware `sizes`; scenes to 2400 w; blur-up fade.
- **D — motion:** Day-in-Kashi sky crossfade, backdrop parallax + Ken Burns, lamp bursts (desktop pinned); phone version with parallax, sky warm-in and per-scene lamps; arch clip-path reveal on photo frames; drifting CSS diyas and outward line wipe on dividers; aarti lamps ignite centre-out with glow build-up and rising embers; one `card-lift` hover. Reduced motion verified: static stacked panels, lamps lit, no embers, no clipping.
- **Lighthouse mobile, local `next start`** (Chrome 154, Lighthouse 13.5, `--headless=new`): /hi 83–89 (pre-QA build 7ff3550 on the same setup: 86–89), /hi/places/sarnath 88–89 (baseline 86–88), /hi/festivals 76–81; accessibility 100, best practices 100, SEO 92 (localhost canonical), CLS 0 everywhere. With `--use-angle=swiftshader` both builds drop to ~75–84: Chrome's cold start delays the observed first paint to ~2 s, and Lantern then charges every script fetched before it to LCP. The 94 of 2026-09-25 does not reproduce for the untouched baseline either.
- Perf fixes found on the way: the festival-month island no longer touches the section on load (a carousel `scrollTo` forced layout of a content-visibility-skipped section, ~185 ms); divider diyas are CSS-only (−500 DOM nodes); card srcsets 5 → 3 widths and AVIF-only sources (HTML 116 → 107 KB gz).

## LCP pass · 2026-09-27
- **Loader hypothesis rejected:** a build without the page loader measured the same (5 runs: /hi LCP 3.2 s vs 3.1 s, /en 2.9 s vs 3.1 s). The earlier "loader holds first paint" reading was a cold-start artifact of the first navigation in a fresh headless Chrome. The loader is unchanged.
- **Heading fonts:** Cormorant Garamond is now a 22 KB static-600 subset (`scripts/heading-font/subset-latin.py`, from the OFL source) instead of Google's 38 KB variable file deferred to idle; both heading subsets (Cormorant, Tiro Devanagari) are preloaded and applied at first paint with `font-display: optional`. `block` hid the text; `swap` re-painted the H1 in the real face and registered a second LCP at 1.26 s on /hi.
- **/<locale>/festivals:** compact cards (photo, name, next date, two-line summary → festival page); the first card's photo is the page's LCP element and loads with priority; the month filter (home and festivals page) is only loaded when a month is picked or named in the URL (`LazyMonthFilter`). HTML 34.5 → 30.5 KB gz.
- **Lighthouse mobile, 5 runs each, local `next start`, previous build aa7ce70 vs this one** (medians): /hi 86 → 87 (LCP 3.0 → 3.2–3.3 s), /en 88 → 90–94 (LCP 3.1 → 2.6–3.3 s), /hi/festivals 80 → 86 (LCP 3.9 → 3.5 s). Accessibility/BP 100, CLS 0.
- **What still sets LCP (~3 s simulated, 0.25 s observed):** Lantern charges every request made before first paint: the 106 KB (gz) document, half of it the RSC copy of the server-rendered text, and 163 KB of framework JS (React 72 KB, Next runtime 42 KB). Getting under 2.5 s needs roughly 100 KB less HTML on the home page (e.g. drop the long card details from home and keep them on the sub-pages).

## Home trim + one copy of static text · 2026-09-27
- **Home cards** (festivals, projects, food, every viewport): photo, name, status or next date, a two-line summary, and a link (festival/project page, or the dish's entry on /food). Agency, timeline, sources and last-verified (projects), when/where (festivals) and season/where (food) are only on the listing and detail pages now.
- **`<Static>` no longer ships its text twice.** It is now a server component: it resolves its (hook-free) server-component children to host elements, renders them to an HTML string once (react-dom/server via Node's require, in the server-component pass), and hands the string to the client `<StaticSlot>` through a per-process, reference-counted map (`lib/staticHtml.ts`). The RSC payload carries only a 16-character key; in the browser the slot keeps the server markup unhydrated, as before. If rendering to a string is impossible (a client component inside, or a runtime without react-dom/server such as a Worker rendering a 404 on demand) it falls back to the old behaviour (`StaticChildren`). `DiyaGlyph` got a hook-free `StaticDiyaGlyph` for use inside it. The credits page is now wrapped in `<Static>` too.
- **Home HTML (gzipped):** /hi 105.5 → 53.9 KB (RSC payload 58.4 → ~13 KB), /en → 50.7 KB; /hi/places/sarnath 13.8 KB, /hi/festivals 30.5 → 18.2 KB.
- **Lighthouse mobile, 5 runs, previous build 96a725c vs this one** (medians): /hi 85 → 92 (FCP 1.5 → 1.2 s, LCP 3.4 → 3.1 s; two runs at 2.4 s), /en 90 → 90 (LCP 3.0 → 3.1 s). Accessibility and best practices 100, CLS 0. Mobile home height 21,256 px.

## SEO reach pass · 2026-09-27
- **Trust:** /about (who runs the site, mission, verification method, update and corrections policy) with /about#contact; hi + en text, others English with a note and noindex. Organization JSON-LD (Kashidwar, logo, sameAs from `SOCIAL_PROFILES`) on home and About; WebSite is "Kashidwar" with the Organization as publisher. Footer: Guides / About / Contact links; "© 2026 Kashidwar" in all 13 locales.
- **Robots:** indexed pages send `index, follow, max-image-preview:large` (check-seo enforces it).
- **Guides:** /[locale]/guides and six guides, all researched on 2026-09-27 with cited sources and per-section "not officially confirmed" flags: Dev Deepawali 2026 (published first), Kashi Vishwanath darshan, Ganga Aarti, Varanasi ropeway, Varanasi → Sarnath, Varanasi in 2 days. Article + FAQPage + BreadcrumbList JSON-LD; guides ↔ places/festivals/projects/itineraries links both ways; sitemap (with lastmod) and a "Plan your visit" strip on home. 936 pages pass check-seo.
- **Reconciled across guides:** Sugam Darshan is ₹300 per the trust's booking list (one agent had ₹250/300/400 from a 2025 news report). Ropeway project re-verified (not open; trials; November 2026 target) with two 2026 sources.
- **Heading font:** Tiro subset rebuilt for the new Hindi headings (341 corpus lines, 0 shaping differences, 23.6 KB).
- **Lighthouse mobile, local, 3 runs (median):** /hi 89, /en/guides/ganga-aarti-varanasi 95, /hi/guides/kashi-vishwanath-darshan 91, /en/about 94; accessibility/BP 100, CLS 0.

## Weekly pipeline live + Search Console pass · 2026-10-07
- **Review pipeline:** both review workflows had been disabled and the API key had died on 27 Sep (spend limit, then revoked). New key set, workflows re-enabled, Actions allowed to open PRs. First real run (Sonnet, projects): 41 turns, $1.93, hit the 40-turn cap before its summary → cap raised to 60 turns / $4. Its edits were re-verified against official inspections (ropeway 28 Sep, stadium 16 Aug) and weaker sources replaced; airport "six-month target" reverted (no PIB/AAI source). Merged as PR #14 and deployed. Dependabot #13 (wrangler 4.146, undici) merged; sharp 0.35.5 (override for miniflare's copy) and source-map-js 1.2.2 bumped → 0 open GitHub security alerts.
- **Search Console** (`scripts/gsc-report.py`, service account from the Pnr-Status toolkit, property is the URL-prefix `https://kashidwar.com/`): 28 days 1,919 impressions / 19 clicks, avg position 18.4; sitemaps read 1–2 Oct (144 + 430 URLs). Core pages indexed; `/en/food`, `/hi/guides` "discovered, not indexed"; the 27 Sep guides still unknown. Google picks `/` as canonical for `/hi` (the root 307s there) — left as is for now.
- **Legacy URLs:** 60 old-site URLs (Astro `master`) still earn 1,236 impressions in 90 days and most 404ed (`/ghats/manikarnika/` 345, `/ghats/` 300, `/map/` 198, `/mandir/kashi-vishwanath/` 134 …). `next.config.ts` now 308-redirects every old route to its `/en` equivalent (ghats/temples without a page → the places explorer with the matching filter). Verified locally on `next start`.

## SEO pass 1: old-site content recovered · 2026-10-08
- **Nine new places** from the old site's ranking URLs: Chet Singh, Tulsi, Scindia, Lalita, Harishchandra, Kedar, Man Mandir and Darbhanga ghats, and the Annapurna Devi Mandir — English + Hindi prose, coordinates verified against OpenStreetMap/Wikipedia, sources cited; 32 places now (13 ghats, 9 temples). Harishchandra is written respectfully (no photography of rites; seen from a boat). Nag Nathaiya's venue set to Tulsi Ghat.
- **Listing pages** `/[locale]/ghats` and `/[locale]/temples` (`components/pages/PlacesListing.tsx`, static card grid in `ListingShell`), linked from the home places section ("All ghats →", "All temples →"), in the sitemap, titles in all 13 locales (intro en/hi, others fall back). Legacy `/ghats/`, `/mandir/` and every old ghat/temple slug now 308 straight to these pages.
- Heading-font subset rebuilt for the new Hindi names (356 corpus lines, 241 glyphs, 23.5 KB). 1,097 pages build; check-seo passes (166 sitemap URLs).
- Note: the local `next start` 404s for the two new routes turned out to be a stale `next-server` process from an earlier test still bound to port 3999, serving the previous build. Kill by PID (check `/proc/<pid>/cwd`) before measuring.
- **Photos** for seven of the nine: Chet Singh (fort from the river, 2014), Tulsi (steps and arches), Scindia (leaning Ratneshwar Mahadev, 2019), Lalita (a CC0 19th-century photograph of the Nepali temple, cropped out of its album mount; alt text says so), Kedar (striped steps and temple), Man Mandir (palace lit at night), Darbhanga (palace in Diwali lights). All Commons CC BY / CC BY-SA / CC0, credited on /credits. No photo for Harishchandra Ghat (every usable Commons image shows pyres or smoke; the drawn placeholder stays) or Annapurna Mandir (no free exterior photo; nothing from inside a sanctum).
- Dev Deepawali guide title now carries the "Dev Diwali" spelling and the date, matching the two biggest query clusters in Search Console.
- **Internal links:** footer now links every page to the five listing pages (ghats, temples, festivals, projects, food), and ghat/temple place pages breadcrumb through their listing page (BreadcrumbList too). Decided against moving Hindi to the root URL for the `/` canonical warning: it would 308 every `/hi/…` URL two weeks after first indexing for a cosmetic gain.

## Mobile LCP: the page loader no longer hides the title · 2026-10-08
- PageSpeed Insights (mobile, slow 4G, Moto G Power) scored the home 75: LCP 4.2 s with the H1 as the element and an "element render delay" of 2.3 s — the opaque page loader covered the title for its whole 2.2 s run, so Google counted the paint only when the overlay faded. Desktop scored 97.
- Fix: the loader now renders inside the hero *below* the title (z-5 under the text container's z-10) and only on the home page; the H1 is visible from the first frame over the dark screen and the lamp lights beneath it (68% down). Loader shortened to 1.8 s (DESIGN.md's limit), hero-rise delays follow; header, sound toggle and section dots stay hidden by CSS until `data-loader="done"` (no-JS fallback reveals them at 2 s). Detail pages have no loader at all, so search landings get their content immediately.
- Local Lighthouse mobile on `next start` (stale-server bug fixed first): observed FCP = LCP = 0.29 s on /hi and 0.25 s on a festival page; simulated score 93 / 92, SI 2.8 s. Re-measure on PSI after deploy.
- **Result (PageSpeed Insights, mobile, two runs after deploy):** 82–84 (was 75). LCP 3.3 s (was 4.2 s), FCP 2.4 s (was 2.8 s), TBT 20 ms, CLS 0, Speed Index 6.1–7.6 s (the dark loader by design). Desktop unchanged at 97. Lighthouse with devtools throttling against the live page: LCP within 0.18 s of first paint; the "element render delay" PSI still reports (~2.2 s) is simply the throttled time to first render on slow 4G (TTFB 1.35 s + CSS + the two preloaded heading subsets + layout), not a late repaint. The follow-up change that removed `--font-regional` from the Devanagari heading stack was therefore not needed for LCP, but is kept: a heading must never change face after first paint.
- What would move mobile further: fewer bytes before first paint (the two heading-font preloads, 46 KB, compete with the 19 KB of render-blocking CSS on slow links) and a shorter loader (Speed Index). Both are design trade-offs, left as they are.

## Page loader removed · 2026-10-08
- Owner's call (asked: loader vs fonts vs Cloudflare scripts): the black → diya → reveal intro is gone on every page. It was the single largest cost on mobile (Speed Index 6–7 s) and desktop (SI 1.7 s). The hero paints at once; subtitle, CTA and the thin line rise 0.1/0.25/0.45 s after the title; the inline snippet now only pre-applies cached body-font classes on repeat visits (`kashi:fonts`). DESIGN.md's motion table records the removal. Heading fonts and Cloudflare's scripts stay.
- Local Lighthouse mobile (`next start`): /hi 94, /en 90; Speed Index 1.2 s (was 2.8 s); observed FCP = LCP ≈ 0.25–0.29 s.
- PageSpeed mobile after the loader removal: 86 (SI 6.1 → 4.4 s; FCP 2.4 s and LCP 3.3 s unchanged — the slow-4G first-paint path with the preloaded heading fonts, kept by the owner's choice). Follow-up for Speed Index: the hero photo's Ken Burns zoom starts 6 s in (a continuously moving viewport never "settles"), hero entrance fades 1 s → 0.7 s.

## Cloudflare: kashidwar.in redirect loop fixed, real traffic read · 2026-10-11
- The account's Web Traffic chart showed kashidwar.in (a redirect-only domain) at 25–55K requests/day, more than kashidwar.com. Cause: `always_use_https` was off on that zone and its redirect rule's pattern matched only `https://*kashidwar.in/*`, so every `http://kashidwar.in/…` request matched nothing and was 301-redirected to itself (an infinite loop for anyone on an old http link; ~40–200 unique clients bouncing thousands of times a day). Fixed via the API: Always Use HTTPS on, rule pattern now `http*://*kashidwar.in/*` → `https://kashidwar.com/${3}`. Verified: http and https, apex and www, all land on the .com page in one hop.
- Human traffic (Cloudflare Web Analytics, sampled): 30 days 170 visits / 240 page views; last 7 days 80 visits / 100 page views; India 47 visits, Taiwan 22 (looks automated), US 6; mobile 49 / desktop 34; referrers: direct 52, Google 29. Zone HTTP for kashidwar.com: 5–32K requests/day, 230–880 unique IPs/day, 230–3,900 threats blocked/day (Bot Fight Mode working) — the request volume is crawlers.
- Cloudflare API access for this kind of check: a scoped token in `~/.cloudflare_env` (`CLOUDFLARE_API_TOKEN`), sourced into the shell, never printed. Google Analytics: deliberately not on the redesign (owner, 2026-10-11).

## Cloudflare audit · 2026-10-11
Read every zone setting, ruleset, bot setting and DNS record on kashidwar.com and kashidwar.in through the API (scoped token in `~/.cloudflare_env`). Changed, all reversible in the dashboard:
- **CAA records**: both zones allowed only `letsencrypt.org`, but the live edge certificate is issued by Google Trust Services (`pki.goog`, valid to 24 Dec 2026). Renewal would have failed. Added `issue pki.goog` and `issue ssl.com` on both zones.
- **TLS**: minimum TLS 1.0 → 1.2 on both zones. **HSTS** on kashidwar.com: 6 months, no subdomains, no preload, nosniff.
- **Security headers** via a Response Header Transform rule on kashidwar.com: Referrer-Policy strict-origin-when-cross-origin, X-Frame-Options SAMEORIGIN, X-Content-Type-Options nosniff, Permissions-Policy (camera, microphone, geolocation, payment, usb, interest-cohort off), Cross-Origin-Opener-Policy same-origin. No CSP: Next's inline scripts would need nonces; left for later.
- **Bot settings**: Bot Fight Mode was already OFF, yet "JavaScript Detections" was ON — the injected `/cdn-cgi/challenge-platform` script (~12 KB, 2 requests on every page) served nothing. Turned off. "Block AI bots" was ON, contradicting the project's aim of being readable by AI crawlers; set to allow. (The 230–3,900 "threats"/day are Browser Integrity Check and security level, unaffected.)
- **Email obfuscation** off (it injected a script wherever an address appears, e.g. /about). **Browser Cache TTL** 4 h → "respect existing headers" (Next sets its own).
- **Not possible / not done**: the Cloudflare Free Managed WAF ruleset cannot be deployed through the API on this plan ("not entitled"); check Security → WAF → Managed rules in the dashboard. Smart Tiered Cache is off (irrelevant: Workers Assets have no origin). Rocket Loader is off and must stay off. Email Routing: contact@kashidwar.com → owner's inbox, status ready.
- kashidwar.in: redirect-only zone; has a stray TXT record `kashidwar.com.kashidwar.in` (harmless typo) and a "Leaked credential check" rate-limit rule (harmless).

## Google Analytics 4 re-enabled · 2026-10-11
- Owner reversed the morning's decision: GA4 `G-G6VN84753L` is back, as `components/ui/Analytics.tsx` — injected only after window `load` and the next idle period (timeout 4 s), production only, ID from `NEXT_PUBLIC_GA_ID` in wrangler vars. Cloudflare Web Analytics stays. No consent banner (owner's call). Expect a small PageSpeed cost from the extra ~100 KB script after load.

## Worker errors · 2026-10-11
- Workers analytics, last 7 days: 90,792 successful invocations, 1,494 `exceededResources` (1.6%), 141 client disconnects, 0 exceptions. CPU p50 ≈ 10 ms, p99 250–360 ms; wall p50 25–60 ms. The Workers Free plan allows 10 ms CPU per request.
- Stored logs show every non-ok outcome is `exceededCpu` on vulnerability-scanner paths (`/.env`, `/id_rsa`, `/cgi-bin/php…`, `/userfiles?path=../`), and the 404 stream is the same scanners: unknown paths make the Worker render a React 404 (10–230 ms CPU). Real page requests are unaffected. Fix: a WAF custom rule on kashidwar.com blocks dotfiles, PHP/ASP/CGI probes, WordPress paths, key/dump extensions and path traversal before the Worker runs (verified 403; `/en/places.json`, `/manifest.webmanifest`, pages and photos unaffected).
- Structural note: every page view still runs the Worker (prerendered HTML lives in `cdn-cgi/_next_cache`, not as `.html` assets), costing 13–67 ms CPU — at the Free-plan ceiling. If traffic grows and `exceededResources` appears on real pages, copy `.next/server/app/**/*.html` into `.open-next/assets/` at build so Workers Assets serves pages with zero Worker CPU (costs the per-page `NEXT_LOCALE` cookie and the hreflang `Link` header, both duplicated in the HTML).

## Live QA regression · 2026-10-11
- **Crawl** of 221 live pages (sitemap + regional samples), 1,079 internal links, 136 images: every page 200, every link and image resolves, canonicals match, hi/en indexable and the 11 regional locales noindex, one H1 per page, no leaked placeholders. Only noise: identical Dev Deepawali guide titles across locale pairs that fall back to the same language (noindex pages).
- **Functional pass in the browser (desktop 1024 px and 375 px mobile):** header Sections menu and 13-language switcher (open, Escape, keyboard focus), language switch keeps the deep hash (`/en#festivals/11` → `/hi#festivals/11`, month filter re-applied), hero CTA, section dots on scroll, header auto-hide, place filters by hash (`#places/ghats` → 13 of 32), place modal (dialog semantics, focus inside, URL `?place=`, Escape closes and clears it), "Show on map" (Leaflet, 16 tiles, 12 markers + pulse), Share (copies the page URL), festival month strip (`#festivals/11` → 5 festivals, aria-current), itinerary tabs, sound toggle (off → on → off, persisted), footer links, mobile: no horizontal overflow, carousels, hit areas via the ::after expansion, Tamil page loads Noto Sans Tamil. Console: no errors on any page.
- **Fixed:** (1) `.leaflet-container` painted Leaflet's default light grey until tiles arrived because leaflet.css loads after globals — now `!important` night background. (2) The locale 404 page carried the home page's `<title>` (not-found.tsx cannot export metadata); the tab title is now set on the client (`DocumentTitle`) with a `noindex` meta — the server HTML still carries the layout title, which is fine for a 404 response.
- **Fixed (3), found in the Chrome re-run:** a hash change on the same document (URL bar, back/forward, `/en` → `/en#festivals/11`) applied the filter but never scrolled; `HashLinks` now re-aims on `hashchange`.
- **Noted, not changed:** deep-link arrivals (`#section/arg`) jump after hydration (~1–3 s) and the pane shows a dark frame while the content-visibility section lays out; the Workers Free CPU ceiling (see Worker errors above).

## Visual redesign, phase 1 — place pages · 2026-10-11
Owner's brief: "more visual, less reading, more detail per place". Decisions: photo-led; new researched "at a glance" data; places first, then home, then festivals/projects/listings. Plan in `.claude/plans/giggly-riding-meteor.md`.
- **New data**: `glance` on all 32 places (timings, entry, duration, season in en + hi; crowd, photography, dress enums; `verified`; sources). Researched 2026-10-11 from trust/ASI/government pages where they exist: verified for Kashi Vishwanath (trust rituals page + FAQ), Assi (Subah-e-Banaras), Ramnagar Fort (Museums of India: ₹50/₹200, 10–17, closed Dussehra/Muharram), Annapurna (trust site), and the public ghats; everything else `verified: false` with a "check before you go" note on the page. Corrections found on the way: Mulagandha Kuti relics are shown on Buddha Purnima and Kartik Purnima (not every evening); Subah-e-Banaras site is `.net`; the "₹5 Manas Darshan" fee quoted online belongs to Chitrakoot, not Tulsi Manas; St. Mary's (CNI, 1810) has a Sunday service and a collapsed roof, the "Mass 08:30" online is the Catholic cathedral in Cantt.
- **Galleries**: photo keys `places/<id>#2…` (files `id-2-<w>.<ext>`), `getGallery`, `getGalleryCredits`; 58 extra Commons photos picked from the cached candidates under the sensitivity rules (no pyres, sanctums or close-ups of worshippers), plus a first photo for Harishchandra Ghat. Kaal Bhairav, Kabir Math, Ravidas, both gurudwaras, St. Mary's, Kedar and Annapurna had no usable second candidate (search noise) — they keep one photo or the drawn placeholder.
- **UI** (all static markup except the gallery island): `PageShell variant="visual"` (photo hero, title over gradient, arch top from lg), `FactStrip`, `GlanceGrid`, `DistanceCards` (km + rough minutes: walk ≤2 km at 4.5 km/h ×1.3, else auto at 22 km/h ×1.4), `Gallery` + `GalleryLightbox` (loaded on first click, `Modal size="wide"`), photo `PrevNext` tiles, `LinkCards` meta icons, shared `Icon` sprite (25 line icons). Long prose moved behind a native `<details>` "Read the full story" (still in the HTML). Lead = first sentence (`leadOf`).
- **i18n**: `page.glance.*`, `page.gallery.*`, `page.readStory` in all 13 locales (logged in TRANSLATION_REVIEW.md). Weekly review brief gained section 1b (re-check glance timings/fees).
- **Performance finding:** local mobile Lighthouse first came in at 85–89 (old-layout festival page on the same server: 92). The filmstrip was blank until ~3.7 s: in software-rendered headless Chrome (what Lighthouse and PSI use) every GPU effect in the first viewport costs raster time before *any* pixel appears. Stripping rules from the stylesheet in flight measured it: first paint 3.3 s → 2.8 s without `filter: drop-shadow` (icon glows), 2.8 s without `text-shadow`, 3.0 s without the grain SVG, 3.1 s without `.ken-burns`, 1.0 s with all of them off. Removed the *new* costs (icon drop-shadows, chip `backdrop-blur`, ken-burns on the hero); the site-wide grain and heading glow stay (design decision for the owner). Result: 92 / 91 / 90 on `/hi/places/dashashwamedh-ghat`, `/en/places/sarnath`, `/hi/places/harishchandra-ghat`; accessibility 100 after switching the fact strip and glance tiles from `<dl>` to lists.
- Deployed as commit f43ecc1 (GitHub Actions → Cloudflare Workers).
- **Live PageSpeed (mobile), `/hi/places/dashashwamedh-ghat`, 2026-10-11 19:55:** Performance 93 · Accessibility 100 · Best Practices 100 · SEO 100 (FCP 1.7 s, LCP 2.8 s, TBT 130 ms, CLS 0.006, SI 3.1 s). The home page's last PSI mobile was 86. Live checks: hero, fact strip, glance tiles, distance cards, gallery + lightbox (open, arrow keys, Escape, credit line), prev/next tiles on en + hi, 375 px and desktop; no console errors; image sitemap 688 photo entries.

## Visual redesign, phase 2 — home page · 2026-10-11
- Section intros on the home page replaced by one-line `lead` strings (≤ 14 words, 13 locales); the longer `intro` strings stay on the listing pages and as meta descriptions.
- Place cards: the "best time" sentence became two glance chips (time needed, crowd) from the new `glance` data; best time is still in the quick-view modal and on the page.
- Project cards (home and `/projects`): sourced `cost` chip (7 projects, figures already in the summaries/sources) and a thin saffron `progress` bar (100 completed; ropeway 94 % and stadium 80 % from the dated inspections; announced projects show no bar).
- Festival cards: the next date now sits first, under the photo; one-line summary; venue line with a pin icon.
- Food cards: typical street price chip (`price`, `priceBand`) researched 2026-10-11 from dated 2025–26 Varanasi food guides and, for launglata, the shop's own listing (`priceVerified` true only there); sources in `priceSources`.

## Visual redesign, phase 3 — festival and project pages, listings · 2026-10-11
- Festival pages: `PageShell variant="visual"` with the date line in the hero, fact strip (lunar date, months, where, last held), one-sentence lead with the rest behind "Read the full story", venue chips, "Reaching Varanasi" as plane/train lines, venue cards showing each place's timings, photo prev/next.
- Project pages: fact strip (status, cost, progress, last verified), the `timeline` string split on " · " into a milestone list under the progress bar, agency with a shield icon, the project as the focused pin on a map with nearby places (new; the page had coordinates but no map), distance cards.
- Listing pages (`/ghats`, `/temples`, `/festivals`, `/projects`, `/food`): a photo band of four arch tiles under the H1 (`components/pages/PhotoBand.tsx`); `/projects` now uses the compact cards (details live on the project pages).
- **Live PageSpeed (mobile) after all three phases, 2026-10-11:** `/hi` Performance 92 · Accessibility 100 · Best Practices 100 · SEO 100 (FCP 2.1 s, LCP 2.9 s, TBT 130 ms, CLS 0, SI 2.1 s) — up from 86 before the redesign; `/hi/places/dashashwamedh-ghat` 93/100/100/100. Live checks on en + hi: project page facts, milestones, progress bar, map and distance cards; festival hero date line and fact strip; home chips, progress bars and prices; listing photo bands; no console errors.

## SEO pass after the redesign · 2026-10-11
- Search Console, 28 days to 9 Oct: 47 clicks / 3,293 impressions, average position 13.7. The top-clicking URL is the locale-less `/festivals/ramnagar-ramlila` (position 3.3), which the locale middleware answered with a temporary 307 to `/hi/…`, so Google kept the old URL as canonical. `next.config.ts` now 308-redirects every locale-less content URL (`/festivals/:id`, `/places/:id`, `/projects[/:id]`, `/guides[/:slug]`, `/itineraries/:slug`, `/temples`, `/food`, `/credits`, `/ghats/:slug`) to the English page (the hreflang x-default). The root `/` keeps its locale-detecting 307 (owner's earlier decision).
- Place meta descriptions now lead with timings and entry (`meta.placeDescriptionFacts`, 13 locales): the queries with impressions but poor positions were "<ghat> aarti timings" style (positions 50–88), which the pages did not answer before the `glance` data.
- Removed the free-text `openingHours` from the TouristAttraction JSON-LD (not a valid schema.org value); timings stay in the visible fact strip and description.
- Sitemaps resubmitted after the deploy. Still open for the owner: regional locales stay `noindex` until a native review (11 languages of content Google does not see), and the 114 "discovered, not indexed" URLs can be nudged with "Request indexing" in the Search Console UI.

## Live QA regression after the redesign · 2026-10-11
- **Crawl** (scratchpad `crawl.mjs`, extended with JSON-LD parsing, alt text, AVIF source candidates and empty-arch checks): 221 pages (every sitemap URL + 5 pages in each of the 11 noindexed locales), 1,079 internal links, 205 images incl. the new gallery AVIFs. All 200; canonicals, hreflang, robots, descriptions, single H1, no leaked placeholders. Only finding: identical `<title>` on the regional (noindexed) copies of the Dev Deepawali guide (as = bn, sa = mr) because guides exist in English and Hindi only — harmless, left as is.
- **Functional, desktop (Chrome + the app browser pane):** header Sections menu (open, Escape, outside click, focus returns to the trigger), language switcher (13 entries, deep-links to the same page in each locale, Escape), places filters + hash (`#places/ghats` → 13 cards), quick-view modal (open, URL `?place=`, Show on map → 45 markers, Escape/close), festival month filter (`#festivals/11` → 5 cards, "All" resets), itinerary tabs, sound toggle (persists), place page: details toggle, gallery + lightbox (open, arrows, counter, Escape, credit link), map on approach, prev/next, map links, breadcrumbs, skip link; festival and project pages: fact strips, milestones, progress bar, map; listings: photo bands; 404 page (status 404, title); legacy and locale-less redirects (308).
- **Functional, 375 px:** no horizontal overflow on home or place pages, menu tap targets ≥ 44 px, places "Show all 32", festival carousel scroll-snap, fact strip 2 columns, gallery strip scrollable, glance tiles 2 columns.
- **Also checked:** security headers (HSTS, nosniff, frame, referrer), robots.txt, sitemaps, console (no errors), PageSpeed mobile 92–93.
- **Test-harness notes:** in a hidden tab `requestAnimationFrame` is paused, so the `motion` exit animation of the places modal never completes until the tab is shown again — the dialog stays in the DOM at opacity 0 and DOM-based "closed" checks fail. Verified with screenshots instead; not a user-facing defect. IntersectionObserver-mounted islands (map, gallery photos) also mount late in hidden tabs.
- **Known cosmetic, not changed:** the 404 page carries two `robots` metas (the layout's `index` plus its own `noindex`); the HTTP 404 status already keeps it out of the index.
- No functional defects found; nothing to deploy from this pass.

## Keyword-led SEO pass · 2026-10-12
Evidence: Search Console 90 days (400 queries) and a keyword map of ~100 English + Hindi queries built from Google autocomplete, People-also-ask and competitor structure (scratchpad `keywords.json`; no public tool exposed India volumes, so demand is tiered T1–T3). The biggest head terms had no landing page: "places to visit in varanasi" / "वाराणसी में घूमने की जगह", "varanasi tourist places", "varanasi ghats list / map", and "best time to visit varanasi". Timing queries ("kashi vishwanath darshan timing", "sankat mochan timing", "dashashwamedh ghat aarti time") had impressions at positions 40–75 on the old URLs.
- **New pages:** `/places` "Places to visit in Varanasi" (32 places grouped by type, FAQ), `/map` "Varanasi tourist map" (all pins + distance table from Godowlia and the station), guide "Best time to visit Varanasi: weather by month, festivals, crowds" (IMD normals, 2026–27 festival dates, flood/fog/heat evidence, 24 sources).
- **Ghats page:** the ordered index of all 84 ghats (Assi → Adi Keshav, plus Namo) with Hindi names and links to the 13 covered; FAQ (how many ghats, aarti ghat and time, sunrise ghat, cremation ghats, open at night).
- **Temples page:** FAQ (Kashi Vishwanath darshan timings, other temples, dress code, opening hours).
- **Titles:** place pages "{name}, Varanasi: timings, history & guide" (13 locales); listing titles carry the query words ("all 84 ghats, Ganga Aarti timings & map", "darshan timings, list & how to reach"); the Ganga Aarti guide names Dashashwamedh Ghat and "aarti time".
- **Links:** home "All places" button, footer links to /places and /map; the old `/map` redirect now lands on the new map page.
- **More guides for keyword gaps (2026-10-12):** "Varanasi trip cost: a 2-day budget" (boat, auto, ropeway, ticket, food, hotel bands and three sample budgets; sections touching the Sarnath ASI fee and transport fares are marked unconfirmed until the ropeway opens and the ASI draft window closes) and "Varanasi at night" (aarti, boats, night aartis at Vishwanath, food lanes, Dev Deepawali, respectful notes). Each guide was researched by a background agent with dated sources and reviewed for schema and claims before registering in `lib/guides.ts`.

## Competitor gap pages (vs kashibanaras.com) · 2026-10-12
kashibanaras.com (WordPress/Elementor, ~89 URLs) is missing `<title>` on its main pages but ranks for topics this site lacked. Added, each researched with dated sources by a background agent and reviewed before registering:
- **Guides:** "Kashi Vishwanath aarti timings" (five aartis, ticket prices ₹500 Mangala / ₹300 others, official booking only; the trust's rituals page and FAQ disagree on several times, so those sections are marked unconfirmed), "Boat ride in Varanasi" (2023 official per-person fares, Water Police 20:30 limit, monsoon levels; a 9 Oct 2026 police order allows only motorboats 06:00–17:00 for now, which the night guide now mentions too), "Banarasi saree" (GI, types, handloom vs powerloom, Silk Mark / Handloom Mark / QR, buying areas only, no shops; prices marked approximate).
- **Places (now 35):** Vishalakshi Temple, Nepali Mandir (Samrajeshwar Pashupatinath), Ganga Mahal Ghat (southern, by Assi). OSM coordinates, glance data (all `verified: false`), 9 Commons photos. Linked from the 84-ghats index. Lalita Ghat text softened ("completed decades later": sources disagree on who finished the Nepali Mandir) and its Nepali Mandir timing aligned with the new page.
- Place counts in titles/intros/FAQ updated 32 → 35; the English and Hindi listing titles now read "35 places to visit in Varanasi …".
- Open: Vishalakshi has only one weak photo (gateway inscription, cropped) — an owner photo would help. Regional summaries for the 3 new places fall back to English.

## Guides go visual · 2026-10-12
Owner: the guides still read like essays (2,000–2,350 words, no hero, no icons). All 12 guides now use `PageShell variant="visual"` (photo hero, smaller H1 for long titles), a six-item icon **fact strip** (`facts` in each guide JSON, en + hi, every value taken from the guide's own sourced sections — e.g. boat: official fare, shared seat, private boat, where to board, 20:30 limit, current order), **jump chips** to every section, sections as **cards** with an icon, the first paragraph visible and the rest behind "Read more", lists as **tile grids**, FAQ accordion, and the sticky contents + sources sidebar on desktop. All text stays in the HTML for search. Local mobile Lighthouse: boat guide 92, aarti guide (hi) 89; accessibility and best practices 100.

## Keyword audit of every page + itineraries and About go visual · 2026-10-12
- **Audit:** every page type's `<title>`, H1 and description compared with the keyword map (Search Console + autocomplete). Place, ghat, temple, map and guide pages already carried the searched words. Fixed: home ("Kashidwar: Varanasi travel guide — places to visit, ghats, Ganga Aarti"; the brand query "kashi dwar" ranks), festivals / projects / food / guides listings (keyword titles and descriptions on indexed locales via `meta.*ListTitle|Desc`), festival pages ("… 2026 in Varanasi: date, time and guide" / "… कब है: तिथि, समय"), project pages ("…: status, opening date and cost" / "कब तक बनेगा"), itineraries ("Varanasi 2-day itinerary: …, day-by-day plan" / "बनारस 2 दिन में कैसे घूमें").
- **New pages:** `/itineraries` hub ("Varanasi itinerary: 1, 2 and 3 day plans", photo cards, FAQ), home-page FAQ ("What is Varanasi famous for?", Kashi/Banaras/Varanasi, days needed, best time, aarti time) with FAQPage JSON-LD.
- **Itinerary pages:** visual hero (each plan's own lead place), fact strip (days, places, start, end, paid entries from glance data, getting around), day jump chips, day cards with a time rail, place thumbnails and glance chips per stop, a route map; breadcrumb and "back" now point to the hub.
- **About page:** stats strip (places, ghats, guides, festivals, projects, languages), icon cards, tile lists.
- **Guide "How to reach Varanasi" (2026-10-12):** stations (BSB, BSBS, DDU), two Delhi Vande Bharat pairs (~8 h), Mumbai/Kolkata/Lucknow trains, VNS airport (26 km, 45–75 min, ₹600–1,000 cab), road distances, Cantt→Godowlia prepaid auto ₹100–150, walking to the ghats and Vishwanath gates, ropeway marked unconfirmed. 43 sources. Covers the T1 searches "how to reach varanasi" / "वाराणसी कैसे पहुंचे".

## Guide photos fixed · 2026-10-12
Owner spotted Dev Deepawali lamps on the boat-ride guide. Cause: `guidePhoto` took the first related festival's photo, so six guides (boat ride, Ganga Aarti, best time, night, 2 days, darshan/aarti via Mahashivratri) showed festival photos. Each guide now has an explicit `photo` key matched to its topic: boat ride → a boatman rowing on the Ganga (new, Commons CC BY 4.0), saree → Banarasi sarees on display blocks in Varanasi (new, Commons CC BY-SA 4.0, geotagged 25.328, 83.005), Ganga Aarti → night aarti at Dashashwamedh, KV aarti → the gold spire, darshan → pilgrims at the gateway, night → evening riverfront from Panchganga, how to reach → Cantt station, best time → sunrise at Assi, 2 days → boats at dawn, Sarnath → Dhamek Stupa, trip cost → Assi aerial, Dev Deepawali → lamps, ropeway → the labelled illustrative gondola (no Varanasi ropeway photo on Commons yet). `optimize-images.mjs` gained a `guides` group. Also: photo bands on listing pages now skip photos taken outside Varanasi (the projects band showed the La Paz gondola without its label).

## Every page in all 13 languages · 2026-10-12
Owner: "every language page version should be there". Extracted every untranslated string per regional locale (`scripts/check-i18n.mjs`), 11 translator agents (one per language, some splitting into helpers) translated ≈1,486 strings / 28,000 English words each, merged with `scripts/merge-translations.mjs`; coverage now complete for ta, te, kn, ml, bn, or, as, mr, gu, pa, sa. Guides load their locale file on demand (`guideTranslations`), FAQs/About read the locale's own text, the English-fallback note is gone everywhere. A translator caught an English inconsistency: the trip-cost guide called the ropeway fare "notified" while the ropeway guide says it is not — fixed in all 13 languages. Regional locales remain noindex pending native review (owner decision).
- **Own-script names (2026-10-12):** 79 entries × 9 non-Devanagari locales (711 names) added as `names`/`titles`; one shared `displayName()` replaced 15 hard-coded Hindi/English choices (detail pages, cards, explorer, map labels, JSON-LD, itineraries, faith tiles). Titles and H1s now read e.g. "கேதார் காட், வாரணாசி…", "ਗੁਰਦੁਆਰਾ ਬੜੀ ਸੰਗਤ…".
- **Per-locale entry files (2026-10-12):** regional text for places, festivals, projects, food and itineraries moved from the shared content JSON into `content/i18n/entries/<locale>.json`, loaded on demand by `loadEntryTranslations` (`lib/content.ts`). places.json 940 KB → 167 KB, Worker upload 7.3 → 6.2 MB gzip. Two deploys before it failed with Cloudflare 504s on the version upload (the size was not the limit: the last good deploy was 7.2 MB); the next push deployed. Scripts read and write the new files through `scripts/lib/entry-i18n.mjs`. Live checks passed in ta, te, bn, ml, pa, kn, gu, or, as, sa, mr; sitemaps resubmitted.
