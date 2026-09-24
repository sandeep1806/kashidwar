# PROMPTS.md — Phased prompts for Claude Code

Run one phase per session. Paste the prompt as-is. Claude Code reads CLAUDE.md automatically;
say "read DESIGN.md" whenever UI is involved.

---

## Phase 0 — Kickoff
```
Read CLAUDE.md and DESIGN.md fully. Summarize the design system and the dependency policy back
to me in 10 bullets, then list any questions or risks before we scaffold. Do not write code yet.
```

## Phase 1 — Scaffold & dependencies
```
Scaffold the project with `npx create-next-app@latest` (TypeScript, Tailwind, App Router, Turbopack,
src dir OFF, import alias @/*). Then, for each of: gsap, lenis, motion (or framer-motion — check which is
the current maintained package), three, @react-three/fiber, @react-three/drei, next-intl, leaflet,
react-leaflet, @types/leaflet — run `npm view <pkg> version` and `npm view <pkg> peerDependencies`,
confirm compatibility with the installed Next/React major, and install the latest STABLE (no rc/beta).
Detect the Tailwind major and configure it in its idiom. Run `npm outdated` and `npm audit`.
Create DEPENDENCIES.md with every resolved version and today's date.
Create the folder structure from CLAUDE.md, define the design tokens from DESIGN.md as CSS variables,
set up next/font for Cormorant Garamond, Inter, Tiro Devanagari Hindi (+ placeholders for regional
Noto fonts). Create content/*.json files with the schemas from CLAUDE.md and 3 sample entries each
(use real Varanasi places). Confirm `npm run build` passes. Commit.
```

## Phase 2 — Hero + page loader
```
Read DESIGN.md. Build:
1. Page loader: black → single diya flame ignites → light spreads → reveal (≤1.8s, skip button,
   respects prefers-reduced-motion, runs once per session).
2. Hero: React Three Fiber scene of floating diyas on gently rippling water with soft bloom and mouse
   parallax. Lazy-load via next/dynamic; on mobile, low-end GPU, or reduced-motion show a static
   image/Lottie fallback. Hero H1/H2 must render immediately (no waiting for 3D).
3. Bilingual title per DESIGN.md voice section, saffron CTA "Begin the journey" that smooth-scrolls.
4. Lenis smooth scroll provider at the layout level; register GSAP + ScrollTrigger once.
Verify: no console errors, LCP < 2.5s on mobile emulation, clean GSAP cleanup on unmount. Commit.
```

## Phase 3 — Scroll-bound sky + Day-in-Kashi timeline
```
Read DESIGN.md Motion section. Build:
1. SunriseBackground: body gradient interpolates night→indigo→violet→saffron→gold bound to page
   scroll progress via GSAP ScrollTrigger scrub. Disabled under reduced-motion (static indigo).
2. Day-in-Kashi section: pinned horizontal scrub through 3 scenes — dawn at Assi Ghat (Subah-e-Banaras),
   midday in the galis, dusk Ganga Aarti at Dashashwamedh. Lamps ignite at progress marks. Captions use
   SplitText reveal. Provide a vertical stacked fallback for mobile & reduced-motion.
3. Reusable motion primitives in components/motion: <Reveal>, <StaggerCards>, <RippleWipe>.
Commit.
```

## Phase 4 — Places + map
```
Populate content/places.json with at least these, fully filled per the schema (verify lat/lng):
Kashi Vishwanath Temple, Dashashwamedh Ghat, Assi Ghat, Manikarnika Ghat, Namo Ghat, Panchganga Ghat,
Sarnath (Dhamek Stupa, Mulagandha Kuti Vihar), Ramnagar Fort, BHU & New Vishwanath Temple, Durga Kund
Temple, Sankat Mochan Temple, Kaal Bhairav Temple, Tulsi Manas Temple, Bharat Mata Mandir, Alamgir
Mosque, Kabir Math (Kabir Chaura), Shri Guru Ravidas Janmasthan (Seer Govardhanpur), Bhelupur Jain
Temple (Parshvanath birthplace), Gurudwara Guru Bagh, St. Mary's Church, Chunar Fort (day trip).
Build the Places section: filter chips (All / Ghats / Temples / Buddhist / Jain / Sikh / Islamic /
Christian / Bhakti / Heritage), portrait cards with arch frame per DESIGN.md, detail modal, and a
Leaflet map (dark tiles, gold pins, clustering, dynamic import ssr:false) synced with the filter.
Commit.
```

## Phase 5 — Faiths + Government projects
```
1. Build "One Kashi, Every Faith": 7 equal tiles (Hindu, Buddhist, Jain, Sikh, Islamic, Christian,
   Bhakti saints — Kabir, Ravidas, Tulsidas) per DESIGN.md. Equal visual weight. Each links to its
   places via the filter.
2. Projects: use web search to verify the CURRENT status and dates of: Kashi Vishwanath Corridor,
   Namo Ghat, Varanasi urban ropeway (Cantt–Godowlia), Ganga cruise / cruise terminal, Rudraksh
   International Convention Centre, Varanasi Cantt station redevelopment, Banaras station, Varanasi
   Ring Road, airport expansion, Sarnath redevelopment, Kashi Tamil Sangamam, and any newer announced
   project you find. Fill content/projects.json with status, agency, timeline, and source URLs. Mark
   anything unverifiable as announced + verified:false.
3. Build the Projects section with status badges per DESIGN.md and a "last verified" date.
Commit.
```

## Phase 6 — Festivals, food, itineraries, practical
```
Fill content/festivals.json (Dev Deepawali, Maha Shivratri, Ganga Mahotsav, Bharat Milap, Nag Nathaiya,
Buddha Purnima, Ramlila of Ramnagar), food.json (kachori-sabzi, jalebi, Banarasi paan, malaiyo, thandai,
lassi, tamatar chaat, launglata), itineraries.json (1/2/3-day). Build: Festivals calendar strip,
Food grid, Itinerary tabs with sunrise/sunset markers, Practical section (how to reach by air/rail/road,
best season, etiquette at ghats & temples). Commit.
```

## Phase 7 — Languages
```
Set up next-intl with locales: hi (default), en, ta, te, kn, ml, bn, or, as, mr, gu, pa, sa.
Extract every string into messages/<locale>.json. Generate translations for all locales; keep
place names in original script + transliteration; flag in a TRANSLATION_REVIEW.md every string that
needs native-speaker review (religious terms especially). Build the language switcher per DESIGN.md
showing a script sample for each language. Load the matching Noto font per locale via next/font.
Verify layout doesn't break with longer scripts (Malayalam, Tamil). Commit.
```

## Phase 8 — Sound, cursor, polish
```
Add the optional ambient sound layer (muted by default, bell toggle, fade-in, localStorage persist),
the desktop-only incense-smoke cursor trail (canvas, disabled on touch/reduced-motion), section
dividers with diya glyph, grain overlay, and the Aarti flame flicker finale. Audit every animation
against prefers-reduced-motion. Commit.
```

## Phase 9 — Performance, SEO, deploy
```
Run `npm outdated` and update any stable minor/patch. Optimize all images to AVIF/WebP with next/image.
Add metadata, OpenGraph, sitemap, robots, JSON-LD (TouristDestination / TouristAttraction) per locale
with hreflang. Run Lighthouse mobile — fix until Performance/Accessibility/Best Practices/SEO ≥ 90.
Add error and not-found pages in the design system. Deploy to Vercel, confirm all locales work.
Write README.md with setup, content editing guide, and how to add a new place/project/language.
```

---

### Handy follow-ups
- "Show me a before/after screenshot plan for this component."
- "This animation feels fast — slow all entrances 20% and re-check reduced-motion."
- "Re-verify project statuses via web search and update 'last verified'."
