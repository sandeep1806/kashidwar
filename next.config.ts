import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./lib/i18n/request.ts");

/**
 * Permanent redirects for the URLs of the previous kashidwar.com (Astro site on
 * the `master` branch). Search Console still shows impressions for them
 * (2026-10-07: 60 legacy URLs, the biggest ones 404ing). The old pages were
 * English, so each goes to its /en equivalent (every old ghat and temple now has a
 * page of its own; the two indexes go to /en/ghats and /en/temples).
 * Trailing-slash variants are normalised by Next first, then matched here.
 */
const LEGACY: Record<string, string> = {
  // ghats
  "/ghats": "/en/ghats",
  "/ghats/assi": "/en/places/assi-ghat",
  "/ghats/dashashwamedh": "/en/places/dashashwamedh-ghat",
  "/ghats/manikarnika": "/en/places/manikarnika-ghat",
  "/ghats/namo": "/en/places/namo-ghat",
  "/ghats/panchganga": "/en/places/panchganga-ghat",
  "/ghats/chet-singh": "/en/places/chet-singh-ghat",
  "/ghats/darbhanga": "/en/places/darbhanga-ghat",
  "/ghats/harishchandra": "/en/places/harishchandra-ghat",
  "/ghats/kedar": "/en/places/kedar-ghat",
  "/ghats/lalita": "/en/places/lalita-ghat",
  "/ghats/man-mandir": "/en/places/man-mandir-ghat",
  "/ghats/scindia": "/en/places/scindia-ghat",
  "/ghats/tulsi": "/en/places/tulsi-ghat",
  // temples
  "/mandir": "/en/temples",
  "/mandir/kashi-vishwanath": "/en/places/kashi-vishwanath",
  "/mandir/sankat-mochan": "/en/places/sankat-mochan",
  "/mandir/durga-kund": "/en/places/durga-kund",
  "/mandir/kaal-bhairav": "/en/places/kaal-bhairav",
  "/mandir/tulsi-manas": "/en/places/tulsi-manas",
  "/mandir/annapurna": "/en/places/annapurna-mandir",
  // festivals (ids that changed; unchanged ids fall through to the locale proxy)
  "/festivals": "/en/festivals",
  "/festivals/mahashivratri": "/en/festivals/maha-shivratri",
  // food, map, static pages
  "/khana": "/en/food",
  "/khana/:slug": "/en/food",
  "/map": "/en#places",
  "/tips": "/en#practical",
  "/about": "/en/about",
  "/contact": "/en/about#contact",
  "/privacy": "/en/about",
};

const nextConfig: NextConfig = {
  async redirects() {
    return Object.entries(LEGACY).map(([source, destination]) => ({ source, destination, permanent: true }));
  },
  experimental: {
    // app/global-not-found.tsx: 404 for URLs outside every [locale] route
    globalNotFound: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // Cloudflare Images via OpenNext (see image-loader.ts)
    loader: "custom",
    loaderFile: "./image-loader.ts",
  },
};

export default withNextIntl(nextConfig);

// Makes Cloudflare bindings available to `next dev` (no-op in production builds).
initOpenNextCloudflareForDev();
