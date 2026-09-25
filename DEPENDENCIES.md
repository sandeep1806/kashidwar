# DEPENDENCIES.md

Resolved on **2026-09-24** (Phase 1). Policy: CLAUDE.md → Dependency policy.
Runtime: Node v22.20.0 · npm 11.20.0. Re-run `npm outdated` + `npm audit` at the start of every phase.

## Runtime dependencies

| Package | Version | Peer range checked | Notes |
|---|---|---|---|
| next | 16.3.6 | react ^19 | App Router, Turbopack default. Middleware is now `proxy.ts`. |
| react / react-dom | 19.3.0 | — | Bumped from scaffolded 19.2.8 (minor; allowed by every peer below). |
| gsap | 3.15.0 | none | SplitText / ScrollTrigger ship free in 3.13+ via `gsap/all`. |
| lenis | 1.3.26 | react >=17 | `dev` tag is 2.0.0-dev.5 → skipped (prerelease). |
| motion | 13.4.3 | react ^18 \|\| ^19 | `framer-motion` 13.4.3 is now an alias of `motion`; installed `motion`. |
| three | 0.186.1 | none | |
| @react-three/fiber | 9.8.0 | react >=19 <19.4, three >=0.156 | 10.x exists only as alpha/canary → skipped. |
| @react-three/drei | 10.7.8 | react ^19, three >=0.159, fiber ^9 | 11.x alpha → skipped. Compatible with fiber 9 + three 0.186. |
| next-intl | 4.14.7 | next ^16, react ^19 | `createMiddleware` works as Next 16 `proxy`. |
| leaflet | 1.9.4 | none | 2.0.0 is alpha → skipped. |
| react-leaflet | 5.0.0 | leaflet ^1.9, react ^19 | |

## Dev dependencies

| Package | Version | Notes |
|---|---|---|
| typescript | 5.9.3 | 7.0.2 is latest but typescript-eslint peers `<6.1.0`; kept 5.9. |
| eslint | 9.39.5 | Tried 10.11.0: `eslint-config-next`'s bundled `eslint-plugin-react` crashes (`getFilename is not a function`). Reverted to 9. |
| eslint-config-next | 16.3.6 | |
| tailwindcss / @tailwindcss/postcss | 4.3.3 | Tailwind **v4** → CSS-first `@theme` in `app/globals.css`, no `tailwind.config.js`. |
| @types/leaflet | 1.9.22 | |
| @types/three | 0.186.0 | Matches three 0.186. Not in CLAUDE.md's list; added because `three` ships no types. |
| @types/node | 22.20.4 | Pinned to Node 22 line to match the runtime (latest is 26). |
| @types/react / @types/react-dom | 19.3.0 | |

## Checks

- `npm audit` — 0 vulnerabilities (2026-09-24).
- `npm outdated` after resolution — only `typescript` (7.x) and `@types/node` (26.x), both intentionally held.

## Phase 2 check · 2026-09-24
- `npm outdated`: unchanged (typescript 7.x and @types/node 26.x intentionally held). `npm audit`: 0 vulnerabilities.
- No new project dependencies. Lighthouse 13.5.0 and puppeteer-core were installed in the session scratchpad (not in `package.json`) for verification.
- `@react-three/fiber` 9.8.0 logs `THREE.Clock … deprecated` against three 0.186; upstream issue, harmless.

## Phase 9 check · 2026-09-25
- `npm outdated`: `@react-three/fiber` 9.8.0 → **9.8.1** (patch, applied). Held on purpose: `typescript` 5.9.3 (7.x excluded by typescript-eslint peer range), `eslint` 9.39.5 (10.x breaks eslint-config-next's bundled react plugin), `@types/node` 22.x (matches the Node 22 runtime).
- `npm audit`: 0 vulnerabilities.
- Verification tooling used from the session scratchpad only (not in package.json): Lighthouse 13.5.0, puppeteer-core driving system Chrome 154, Vercel CLI 60 via npx.

## Phase 9.2 · 2026-09-25 — Cloudflare Workers
| Package | Version | Peer range checked | Notes |
|---|---|---|---|
| @opennextjs/cloudflare | 1.20.6 | next `>=15.5.24<16 \|\| >=16.3.3` ✓ (16.3.6), wrangler ^4.125 | OpenNext adapter; `opennextjs-cloudflare build/preview/deploy` |
| wrangler (dev) | 4.140.0 | — | local Workers runtime for `npm run preview`, deploys |
- `npm audit`: 0 vulnerabilities after install.

## Deliberately not installed
- `@react-three/postprocessing` — bloom is faked with additive billboards (see PROGRESS.md Phase 2).

- No marker-cluster plugin yet. DESIGN.md asks for clustering at low zoom; Phase 4 will either implement a small grid cluster in-house or ask before adding `leaflet.markercluster`.
- No Lottie runtime yet. If Phase 2's mobile hero fallback needs Lottie, it will be raised then; a static image/video fallback needs nothing extra.
