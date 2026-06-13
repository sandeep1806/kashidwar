# Image Credits — Kashi Dwar

All photographs are from **Unsplash** and used under the
[Unsplash License](https://unsplash.com/license) (free for commercial use, no
attribution required — credited here anyway with gratitude 🙏). All were
verified as photographed in Varanasi, except where noted. Logged per the
project images policy (see CLAUDE.md › Images Strategy).

Downloaded: **2026-06-12**, via Unsplash CDN with WebP conversion
(`fm=webp`, 1280×800 and 640×420 crops).

| File (`public/images/`) | Subject | Photographer | Source URL | License |
|---|---|---|---|---|
| `varanasi-ganga-aarti-assi-ghat-*.webp`, `og-default.jpg` | Ganga Aarti at Assi Ghat, Varanasi | Diwakar Singh | https://unsplash.com/photos/a-couple-of-people-that-are-holding-torches-Rn_GBQ7d5HE | Unsplash |
| `varanasi-ghats-riverfront-panorama-*.webp` | Ganges riverfront with buildings and boats, Varanasi | Vizag Explore | https://unsplash.com/photos/ganges-riverfront-with-buildings-and-boats-i6mwttXNB8M | Unsplash |
| `varanasi-boats-rowing-ganga-*.webp` | People rowing boats on the Ganga, Varanasi | Parker Hilton | https://unsplash.com/photos/a-group-of-people-rowing-boats-fGVNrHS9ivc | Unsplash |
| `varanasi-morning-boats-blue-hour-*.webp` | Morning blue-hour boats and cityscape, Varanasi | Shiv Prasad | https://unsplash.com/photos/OPWM488DfeQ | Unsplash |
| `varanasi-sunset-temple-boats-*.webp` | Boats at sunset with temple view, Varanasi | Martijn Vonk | https://unsplash.com/photos/a-group-of-boats-floating-on-top-of-a-river-wloNuC7qKf8 | Unsplash |
| `varanasi-boats-riverbank-pilgrims-*.webp` | Boats on the riverbank with people, Varanasi | Sheila C | https://unsplash.com/photos/boats-rest-on-a-riverbank-with-people-nearby-QqJmdqfhFfI | Unsplash |
| `varanasi-boats-on-the-ganga-*.webp` | Boats gathered on the Ganga, Varanasi | Saurabh Solanki | https://unsplash.com/photos/a-harbor-filled-with-lots-of-boats-on-top-of-water-CCXYvxv14pM | Unsplash |
| `varanasi-boat-ghat-steps-*.webp` | Boat beside ghat steps, Varanasi | Srivatsan Balaji | https://unsplash.com/photos/dz42hvd61BE | Unsplash |
| `varanasi-boatman-rowing-*.webp` | Boatman rowing on the Ganga, Varanasi | Parker Hilton | https://unsplash.com/photos/a-person-rowing-a-boat-dJVODPvLebs | Unsplash |
| `varanasi-diyas-lamps-*.webp` | Lighted diya lamps (Diwali; location not specified) | Dilip Rathod | https://unsplash.com/photos/lighted-diya-lamps-zNY2lVIRh7M | Unsplash |
| `varanasi-sadhu-portrait-*.webp` | Portrait of a smiling sadhu, Varanasi | Pratyush Mishra | https://unsplash.com/photos/a-man-in-a-turban-with-a-bird-on-his-shoulder-mQBKw9zlH5Y | Unsplash |
| `varanasi-riverside-market-*.webp` | Crowded riverside market with colorful umbrellas, Varanasi | hsin-you chen | https://unsplash.com/photos/crowded-riverside-market-with-people-and-colorful-umbrellas-a0Yl32-W9Xs | Unsplash |
| `varanasi-masaan-holi-*.webp` | Masaan Holi celebration, Varanasi | Harsh Pandey | https://unsplash.com/photos/man-in-grey-jacket-with-orange-turban-D0ONyzGkc6w | Unsplash |
| `namo-ghat-pranam-hands-*.webp` | Giant pranam (namaste) hands sculpture at Namo Ghat, Varanasi (added 2026-06-12) | Abhishek Royal | https://unsplash.com/photos/cGEGb-hUbCk | Unsplash |

## SVG art

All decorative SVG (hero dawn scene, silk dividers, diyas, icons, patterns) is
custom-drawn for this project — no external assets, no license obligations.

The **Kashi Darshan Map** (`src/components/MapExperience.astro`) is 100% original
SVG artwork drawn in code — no Google Maps, Mapbox, OpenStreetMap tiles, and no
traced or copied maps or photographs. Nothing to attribute.

## Adding new images — checklist

1. Source ONLY from Unsplash / Pexels / Pixabay (AdSense-safe free commercial licenses)
2. Verify the photo's location field actually says Varanasi (several "varanasi" search results are not — three were rejected during the original sourcing for being Bangkok/Karnataka)
3. Download via CDN with `?w=1280&h=800&fit=crop&q=72&fm=webp` (+ a 640×420 card size)
4. Descriptive kebab-case filename, e.g. `varanasi-<subject>-1280.webp`
5. Add a row to the table above (subject, photographer, source URL, license, date)
6. Always set `width`/`height` attributes and `loading="lazy"` below the fold
