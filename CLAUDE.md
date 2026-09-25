@AGENTS.md

# Kashi — Varanasi Tourism Website

You are building a premium, cinematic tourism website for Varanasi (Kashi). The site must
feel like *moksha*: dark, glowing, sacred, slow-breathing — not a generic travel template.
Read DESIGN.md before writing any UI. Do not deviate from the design system without asking.

## Project goals
1. Showcase famous places (ghats, temples, Sarnath, heritage) with an interactive map.
2. Present every faith of Kashi equally — Hindu, Buddhist, Jain, Sikh, Muslim, Christian, Bhakti saints.
3. Explain government / upcoming projects with verified status (Completed / Under construction / Announced).
4. Work beautifully in 12 Indian languages + English (north, south, east, west).
5. Stunning scroll-driven animation, yet Lighthouse ≥ 90 on mobile.

## Stack (resolve versions live — see Dependency policy)
- Next.js (App Router, TypeScript, Turbopack), Tailwind CSS
- Animation: GSAP (+ ScrollTrigger, SplitText from `gsap/all`), `motion` (Framer Motion), `lenis` smooth scroll
- 3D: `three` + `@react-three/fiber` + `@react-three/drei` — hero section ONLY
- i18n: `next-intl`
- Map: `leaflet` + `react-leaflet` (dynamic import, `ssr: false`)
- Content: JSON in `/content` (places, projects, festivals, food, itineraries) — never hardcode copy in JSX
- Deploy: Cloudflare Workers via `@opennextjs/cloudflare` (Workers Builds from GitHub)

## Dependency policy (mandatory)
- Scaffold with `npx create-next-app@latest`. Install every package with `@latest`.
- Before adding ANY package: `npm view <pkg> version` and `npm view <pkg> peerDependencies`.
  Confirm compatibility with the installed React/Next major.
- Never install alpha / beta / rc / canary / next tags. If `latest` is a prerelease, pin the last stable.
- `three`, `@react-three/fiber`, `@react-three/drei` must be on mutually compatible majors — check drei's peer range first.
- Detect the installed Tailwind major and use its idiom (v4+: CSS-first `@theme` in globals.css, no tailwind.config.js).
- After install: `npm outdated` and `npm audit`; resolve before writing components.
- Record every resolved version + date in `DEPENDENCIES.md`. Re-run `npm outdated` at the start of every phase.

## Folder structure
```
app/[locale]/            # routes, one layout per locale
components/hero/         # R3F scene + fallback
components/sections/     # DayInKashi, Places, Faiths, Projects, Festivals, Practical
components/ui/           # buttons, cards, modal, language switcher, sound toggle
components/motion/       # reusable GSAP/motion primitives (Reveal, Ripple, SunriseBg)
content/                 # places.json, projects.json, festivals.json, food.json, itineraries.json
messages/                # next-intl JSON per locale (hi, en, ta, te, kn, ml, bn, or, as, mr, gu, pa, sa)
lib/                     # i18n config, helpers
public/media/            # optimized images (AVIF/WebP), lottie, audio
```

## Content rules
- Every place/project entry: `id, name_en, name_hi, faith[], type, lat, lng, summary, bestTime, image, sources[]`.
- Projects additionally: `status` ∈ `completed | under_construction | announced`, `agency`, `timeline`, `sources[]`.
- **Verify before writing:** use web search for every project's current status and date. Cite the source URL
  in `sources[]`. If unverifiable, mark `status: "announced"` and add `"verified": false`.
- Religious content: respectful, factual, no ranking of faiths. Use each faith's own terminology.
- Shlokas / verses shown in original script with transliteration + translation.

## Animation rules
- Every animation respects `prefers-reduced-motion` (fall back to simple fades or static).
- 3D only in the hero; lazy-load with `next/dynamic`, show a video/Lottie fallback on mobile or low-end GPUs.
- GSAP ScrollTrigger for scroll storytelling; `motion` for component enter/exit; Lenis for scroll.
- Kill/clean up all GSAP contexts and ScrollTriggers on unmount (`gsap.context` + `ctx.revert()`).
- Never block LCP with animation: hero text must paint immediately, animations enhance after.

## Performance & a11y
- `next/image` everywhere, AVIF/WebP, explicit sizes, `priority` only on the hero.
- Fonts via `next/font` (Devanagari + Latin + regional scripts subset-loaded per locale).
- Semantic HTML, focus states, alt text (localized), color contrast ≥ 4.5:1 on body text.
- Audio is muted by default with a visible toggle; never autoplay with sound.
- Target: Lighthouse Performance/Accessibility/Best Practices/SEO ≥ 90 mobile.

## Workflow
- Work one phase at a time (see PROMPTS.md). At the end of each phase: `npm run build`, `npm run lint`, fix all errors.
- Commit per phase with a clear message.
- Before any large UI decision, write your plan in a short bullet list and confirm.
- Don't add dependencies not listed above without explaining why.
