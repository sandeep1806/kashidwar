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
