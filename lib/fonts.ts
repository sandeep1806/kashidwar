/**
 * next/font setup (DESIGN.md → Typography).
 *
 * Core pair, loaded everywhere:
 *   - Cormorant Garamond 600/700 → Latin display (temple-carved serif)
 *   - Inter (variable)           → Latin body
 *   - Tiro Devanagari Hindi      → Devanagari display (hi / mr / sa titles)
 *
 * Regional Noto Sans families are declared once, `preload: false`, and only the
 * one matching the active locale's script is attached to <html>. Browsers only
 * download an @font-face when text actually uses it, so other scripts cost nothing.
 */
import {
  Cormorant_Garamond,
  Inter,
  Noto_Sans_Bengali,
  Noto_Sans_Devanagari,
  Noto_Sans_Gujarati,
  Noto_Sans_Gurmukhi,
  Noto_Sans_Kannada,
  Noto_Sans_Malayalam,
  Noto_Sans_Oriya,
  Noto_Sans_Tamil,
  Noto_Sans_Telugu,
  Tiro_Devanagari_Hindi,
} from "next/font/google";
import { LOCALES, type Locale, type Script } from "./i18n/locales";

/*
 * No font is preloaded. Preloaded woff2 files compete with the stylesheet for
 * bandwidth on slow mobile links and pushed FCP/LCP past 2 s in Lighthouse.
 * With `display: swap` the H1 paints instantly in the size-adjusted fallback,
 * the web fonts arrive under the page loader, and repeat visits hit the cache.
 */
export const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display-latin",
  display: "swap",
  preload: false,
});

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body-latin",
  display: "swap",
  preload: false,
});

export const tiroDevanagari = Tiro_Devanagari_Hindi({
  subsets: ["devanagari"],
  weight: "400",
  variable: "--font-display-deva",
  display: "swap",
  preload: false,
});

// --- Regional body/display faces (one per script) -----------------------------
// Static 400 only: the variable file is ~120 KB and sits on the LCP path for
// every Devanagari locale. Headings use Tiro; body needs one weight.
const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari", "latin"],
  weight: "400",
  variable: "--font-regional",
  display: "swap",
  preload: false,
});
const notoTamil = Noto_Sans_Tamil({
  subsets: ["tamil", "latin"],
  variable: "--font-regional",
  display: "swap",
  preload: false,
});
const notoTelugu = Noto_Sans_Telugu({
  subsets: ["telugu", "latin"],
  variable: "--font-regional",
  display: "swap",
  preload: false,
});
const notoKannada = Noto_Sans_Kannada({
  subsets: ["kannada", "latin"],
  variable: "--font-regional",
  display: "swap",
  preload: false,
});
const notoMalayalam = Noto_Sans_Malayalam({
  subsets: ["malayalam", "latin"],
  variable: "--font-regional",
  display: "swap",
  preload: false,
});
const notoBengali = Noto_Sans_Bengali({
  subsets: ["bengali", "latin"],
  variable: "--font-regional",
  display: "swap",
  preload: false,
});
const notoOriya = Noto_Sans_Oriya({
  subsets: ["oriya", "latin"],
  variable: "--font-regional",
  display: "swap",
  preload: false,
});
const notoGujarati = Noto_Sans_Gujarati({
  subsets: ["gujarati", "latin"],
  variable: "--font-regional",
  display: "swap",
  preload: false,
});
const notoGurmukhi = Noto_Sans_Gurmukhi({
  subsets: ["gurmukhi", "latin"],
  variable: "--font-regional",
  display: "swap",
  preload: false,
});

const regionalByScript: Record<Script, { variable: string } | null> = {
  latin: null,
  devanagari: notoDevanagari,
  tamil: notoTamil,
  telugu: notoTelugu,
  kannada: notoKannada,
  malayalam: notoMalayalam,
  bengali: notoBengali,
  oriya: notoOriya,
  gujarati: notoGujarati,
  gurmukhi: notoGurmukhi,
};

/** Class list for <html> so the right CSS variables exist for this locale. */
export function fontClassesFor(locale: Locale): string {
  const script = LOCALES[locale].script;
  const regional = regionalByScript[script];
  return [
    cormorant.variable,
    inter.variable,
    tiroDevanagari.variable,
    regional?.variable ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}
