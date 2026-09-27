/**
 * next/font setup (DESIGN.md → Typography).
 *
 * Core pair, loaded everywhere:
 *   - Cormorant Garamond 600     → Latin display (temple-carved serif), heading subset
 *   - Inter (variable)           → Latin body
 *   - Tiro Devanagari Hindi      → Devanagari display (hi / mr / sa titles)
 *
 * Regional Noto Sans families are declared once, `preload: false`, and only the
 * one matching the active locale's script is attached to <html>. Browsers only
 * download an @font-face when text actually uses it, so other scripts cost nothing.
 */
import {
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
} from "next/font/google";
import localFont from "next/font/local";
import { LOCALES, type Locale, type Script } from "./i18n/locales";

/*
 * No font is preloaded. Preloaded woff2 files compete with the stylesheet for
 * bandwidth on slow mobile links and pushed FCP/LCP past 2 s in Lighthouse.
 * With `display: swap` the H1 paints instantly in the size-adjusted fallback,
 * the web fonts arrive under the page loader, and repeat visits hit the cache.
 */
/*
 * The two heading faces (the hero H1 is the LCP element) are small subsets,
 * preloaded and applied from first paint with `display: "optional"`: the
 * heading waits at most ~100 ms for its preloaded face (on a normal link it
 * arrives in time and paints once, in the real face); on a slow link it paints
 * in the metric-matched fallback and stays so for that page view. Never
 * `block` (invisible text) and never `swap`: a swap re-paints the H1 in a
 * larger face, which registers a second, later LCP (measured on /hi: 1.26 s).
 *
 * Cormorant Garamond, pinned at weight 600 (the only weight headings use) and
 * subset to Latin, Latin-1, Latin Extended-A, IAST letters and punctuation:
 * 22 KB instead of Google's 38 KB variable file. Built by
 * scripts/heading-font/subset-latin.py.
 */
export const cormorant = localFont({
  src: "./fonts/cormorant-headings.woff2",
  weight: "600",
  variable: "--font-display-latin",
  display: "optional",
  preload: true,
  fallback: ["Georgia", "serif"],
  adjustFontFallback: "Times New Roman",
});

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body-latin",
  display: "swap",
  preload: false,
});

/*
 * Tiro Devanagari Hindi, subset to the 207 glyphs the site's display text
 * actually uses (headings, names, verses, Hindi secondary lines in every
 * locale): 20 KB instead of 62 KB for Google's Devanagari subset. Built by
 * scripts/heading-font/ (crawl → HarfBuzz shaping trace → fontTools subset,
 * verified by re-shaping the corpus). Preloaded and applied at first paint,
 * so Devanagari headings render once, in their real face.
 */
export const tiroDevanagari = localFont({
  src: "./fonts/tiro-devanagari-headings.woff2",
  weight: "400",
  variable: "--font-display-deva",
  display: "optional",
  preload: true,
  fallback: ["serif"],
  adjustFontFallback: "Times New Roman",
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
 * Font classes for <html>, split by when they should apply:
 *  - immediate: the two heading subsets, Tiro Devanagari (21 KB) and
 *    Cormorant (22 KB), preloaded, display: optional.
 *  - deferred: every other face, attached after first paint by <DeferredFonts>.
 *    The display faces (Cormorant 37 KB, Tiro 62 KB, regional display faces)
 *    blocked the hero H1, which is the LCP element, and held Lighthouse mobile
 *    at 84. Deferred, the first paint uses system fonts and all faces swap in
 *    once, at idle, under the page loader on first visits (a font swap does not
 *    register a new LCP entry). Repeat visits apply them before paint.
 */
export function fontClassesFor(locale: Locale): { immediate: string; deferred: string } {
  const script = LOCALES[locale].script;
  const regional = regionalByScript[script];
  const immediate = [tiroDevanagari.variable, cormorant.variable];
  const deferred = [inter.variable, regional?.variable ?? ""];
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
  const specs = [`400 1em ${family(inter)}`];
  if (regional?.style) specs.push(`400 1em ${family(regional as { style: { fontFamily: string } })}`);
  return specs;
}

/*
 * Language names (switcher and footer): one tiny Noto Sans subset per script,
 * containing only that script's native names and greetings (1.6–2.7 KB each;
 * built by scripts/lang-fonts/build.py). Loaded only when a list renders, and
 * all at Regular weight, so the 13 names look even.
 */
const langLatin = localFont({ src: "./fonts/lang/latin.woff2", weight: "400", display: "swap", preload: false, fallback: ["system-ui", "sans-serif"] });
const langDevanagari = localFont({ src: "./fonts/lang/devanagari.woff2", weight: "400", display: "swap", preload: false, fallback: ["system-ui", "sans-serif"] });
const langTamil = localFont({ src: "./fonts/lang/tamil.woff2", weight: "400", display: "swap", preload: false, fallback: ["system-ui", "sans-serif"] });
const langTelugu = localFont({ src: "./fonts/lang/telugu.woff2", weight: "400", display: "swap", preload: false, fallback: ["system-ui", "sans-serif"] });
const langKannada = localFont({ src: "./fonts/lang/kannada.woff2", weight: "400", display: "swap", preload: false, fallback: ["system-ui", "sans-serif"] });
const langMalayalam = localFont({ src: "./fonts/lang/malayalam.woff2", weight: "400", display: "swap", preload: false, fallback: ["system-ui", "sans-serif"] });
const langBengali = localFont({ src: "./fonts/lang/bengali.woff2", weight: "400", display: "swap", preload: false, fallback: ["system-ui", "sans-serif"] });
const langOriya = localFont({ src: "./fonts/lang/oriya.woff2", weight: "400", display: "swap", preload: false, fallback: ["system-ui", "sans-serif"] });
const langGujarati = localFont({ src: "./fonts/lang/gujarati.woff2", weight: "400", display: "swap", preload: false, fallback: ["system-ui", "sans-serif"] });
const langGurmukhi = localFont({ src: "./fonts/lang/gurmukhi.woff2", weight: "400", display: "swap", preload: false, fallback: ["system-ui", "sans-serif"] });
const LANG_FONTS: Record<Script, { className: string }> = {
  latin: langLatin, devanagari: langDevanagari, tamil: langTamil, telugu: langTelugu, kannada: langKannada,
  malayalam: langMalayalam, bengali: langBengali, oriya: langOriya, gujarati: langGujarati, gurmukhi: langGurmukhi,
};

/** className for a language's native name / greeting in its own script. */
export const langFontClass = (script: Script): string => LANG_FONTS[script].className;
