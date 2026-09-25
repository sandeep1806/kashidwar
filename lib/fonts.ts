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
/*
 * Display faces use `display: "block"`: the hero title paints once, in its
 * real face, instead of a fallback first and a re-paint (which registers a
 * second, later Largest Contentful Paint). Up to 3 s of invisible heading is
 * covered by the page loader on first visits; repeat visits are cached.
 */
export const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display-latin",
  display: "block",
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
  display: "block",
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

const regionalByScript: Record<Script, { variable: string; className: string } | null> = {
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

/**
 * className of the regional face for a script (or "" for Latin). Used by the
 * language switcher so every entry shows in its own typeface; the woff2 only
 * downloads when the menu opens, because the faces are declared with
 * `preload: false`.
 */
export function fontClassForScript(script: Script): string {
  return regionalByScript[script]?.className ?? "";
}

/**
 * Font classes for <html>, split by when they should apply:
 *  - immediate: nothing at the moment (kept so a face can be promoted again).
 *  - deferred: every face, attached after first paint by <DeferredFonts>.
 *    The display faces (Cormorant 37 KB, Tiro 62 KB, regional display faces)
 *    blocked the hero H1, which is the LCP element, and held Lighthouse mobile
 *    at 84. Deferred, the first paint uses system fonts and all faces swap in
 *    once, at idle, under the page loader on first visits (a font swap does not
 *    register a new LCP entry). Repeat visits apply them before paint.
 */
export function fontClassesFor(locale: Locale): { immediate: string; deferred: string } {
  const script = LOCALES[locale].script;
  const regional = regionalByScript[script];
  const immediate: string[] = [];
  const deferred = [cormorant.variable, inter.variable, tiroDevanagari.variable, regional?.variable ?? ""];
  return { immediate: immediate.filter(Boolean).join(" "), deferred: deferred.filter(Boolean).join(" ") };
}

/**
 * CSS font shorthands for every deferred face of a locale, for
 * `document.fonts.load()`: the files download without any element using them,
 * so warming them costs no style or layout work.
 */
export function fontLoadSpecsFor(locale: Locale): string[] {
  const regional = regionalByScript[LOCALES[locale].script] as { style?: { fontFamily: string } } | null;
  const family = (f: { style: { fontFamily: string } }) => f.style.fontFamily.split(",")[0].trim();
  const specs = [`600 1em ${family(cormorant)}`, `400 1em ${family(inter)}`, `400 1em ${family(tiroDevanagari)}`];
  if (regional?.style) specs.push(`400 1em ${family(regional as { style: { fontFamily: string } })}`);
  return specs;
}
