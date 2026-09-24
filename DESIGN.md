# DESIGN.md — Kashi: The City of Light

## Concept
A single night-to-dawn on the Ganga. The visitor arrives in pre-dawn darkness (hero),
lights a diya, and as they scroll the sky warms — indigo → violet → saffron → gold — until
the Ganga Aarti blazes at the end. Every section is a step toward light. Slow, reverent, alive.

Mood words: sacred · ancient · glowing · unhurried · all-embracing. Never: flashy, corporate, "travel-deal".

## Color tokens
| Token | Hex | Use |
|---|---|---|
| `--kashi-night` | #0B0A14 | page background (top) |
| `--kashi-indigo` | #1C1B3A | section backgrounds |
| `--kashi-ganga` | #23415A | water, cool accents |
| `--kashi-ash` | #D9D4C7 | body text on dark |
| `--kashi-white` | #F6F1E7 | headings |
| `--kashi-saffron` | #E0782A | primary accent, CTAs |
| `--kashi-marigold` | #F2A93B | highlights, hover |
| `--kashi-diya` | #FFD27A | glow, gold text |
| `--kashi-rudraksha` | #5A3A2E | dividers, cards |
| `--kashi-vermilion` | #B8322A | sparse emphasis only |

Rule: ~80% dark, ~15% ash/white, ~5% saffron/gold. Gold is light, not paint — use it as glow, not fill.
Background gradient is bound to scroll progress (see Motion).

## Typography
- Display (Devanagari): **Tiro Devanagari Hindi** or **Yatra One** for hero/section titles.
- Display (Latin): **Cormorant Garamond** (600/700) — tall, serif, temple-carved feel.
- Body: **Inter** or **Noto Sans** at 17–18px, line-height 1.7.
- Regional scripts: the matching **Noto Sans/Serif** family per locale, subset-loaded.
- Every H1/H2 shows a bilingual pair: primary in active locale, secondary small caps in English (or Hindi when locale is English).
- Scale: H1 clamp(2.8rem, 7vw, 6.5rem) · H2 clamp(2rem, 4vw, 3.5rem) · H3 1.5rem.
- Letter-spacing on Latin display: 0.02em. Never all-caps for Indic scripts.

## Layout & spacing
- Max content width 1280px; sections have generous vertical space (min 20vh top/bottom).
- 12-column grid desktop, 4-column mobile. Cards use 3:4 portrait ratio (temple-door proportion).
- Section dividers: a thin gold line with a small diya/lotus glyph centered, not plain `<hr>`.
- Corners: subtle 12px radius; arches (border-top-radius 50%) allowed on hero image frames.

## Iconography & texture
- Line icons, 1.5px stroke, gold. Custom glyphs: diya, lotus, trishul, dharma-chakra, khanda, crescent, cross, ektara.
- Faint grain/noise overlay (opacity 0.04) on dark backgrounds; subtle water-caustic pattern on Ganga sections.
- Photography: dusk/dawn, smoke, lamps, silhouettes. Avoid harsh midday shots.

## Motion system
| Moment | Behaviour |
|---|---|
| Page load | Black screen → one diya flame ignites center → light spreads → hero reveals (≤1.8s, skippable) |
| Hero | R3F scene: dozens of floating diyas on gently rippling water, soft bloom, parallax on mouse. Text paints instantly. |
| Scroll | Body background gradient interpolates night→dawn→gold by `scrollProgress` (GSAP ScrollTrigger scrub) |
| Section enter | Headings: SplitText char reveal from below with slight blur→sharp (0.8s, `power3.out`) |
| Cards | Stagger fade-up 60px, 0.08s apart; hover: lift 6px + gold edge glow |
| Day-in-Kashi timeline | Pinned scene, horizontal scrub through dawn (Assi) → noon (galis) → dusk (Dashashwamedh aarti); lamps ignite as progress hits marks |
| Section transitions | SVG ripple mask wipe (water) between major sections |
| Cursor (desktop only) | Soft incense-smoke trail (canvas, low alpha), disabled on touch & reduced-motion |
| Aarti finale | Flames flicker (noise-driven scale/opacity), bell sound cue if audio enabled |

Easing: `power3.out` for entrances, `expo.inOut` for wipes. Durations 0.6–1.2s. Nothing snaps.
`prefers-reduced-motion: reduce` → no scrub effects, no 3D, no cursor trail; simple 300ms fades only.

## Sound (optional layer)
Muted by default. Floating toggle bottom-right (bell glyph). Ambient: distant temple bells,
river water, faint conch. Fade in over 2s; never above -18 dB. Persist choice in localStorage.

## Components
- **Language switcher**: top-right, shows script sample of each language (नमस्ते / வணக்கம் / নমস্কার …), 12+1 entries, keyboard navigable.
- **Place card**: image (arch frame), name bilingual, faith badge(s), "best time" chip, → detail modal with map pin, story, tips.
- **Project card**: status badge (Completed = gold, Under construction = saffron pulse, Announced = ash outline), agency, timeline, source links.
- **Faith tiles**: 7 equal tiles, each with its glyph, one-line essence, key sites in Kashi. Equal size, equal weight, alphabetical or by antiquity — never by "importance".
- **Itinerary strips**: 1 / 2 / 3-day tabs, timeline with sunrise/sunset markers.
- **Map**: dark Leaflet tiles (CartoDB Dark Matter), gold custom pins, cluster at low zoom, filter by faith/type.

## Voice & copy
Short, lyrical, respectful. Present tense. Example H1:
> **काशी — जो इतिहास से भी पुरानी है**
> *Kashi — older than history itself*

Avoid superlatives like "best", "top 10". Prefer "the ghat where the city wakes".
