/**
 * Locale registry for Kashi.
 * Order here is the order shown in the language switcher: Hindi first (default),
 * English, then regional languages grouped roughly south → east → west → north.
 */
export const locales = [
  "hi",
  "en",
  "ta",
  "te",
  "kn",
  "ml",
  "bn",
  "or",
  "as",
  "mr",
  "gu",
  "pa",
  "sa",
] as const;

export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "hi";

export type Script =
  | "devanagari"
  | "latin"
  | "tamil"
  | "telugu"
  | "kannada"
  | "malayalam"
  | "bengali"
  | "oriya"
  | "gujarati"
  | "gurmukhi";

export interface LocaleMeta {
  /** English name */
  name: string;
  /** Endonym in its own script */
  nativeName: string;
  /** Greeting sample shown in the language switcher */
  sample: string;
  script: Script;
  region: "north" | "south" | "east" | "west" | "pan-india";
  /** BCP-47 tag for <html lang> and hreflang */
  bcp47: string;
}

export const LOCALES: Record<Locale, LocaleMeta> = {
  hi: { name: "Hindi", nativeName: "हिन्दी", sample: "नमस्ते", script: "devanagari", region: "north", bcp47: "hi-IN" },
  en: { name: "English", nativeName: "English", sample: "Namaste", script: "latin", region: "pan-india", bcp47: "en-IN" },
  ta: { name: "Tamil", nativeName: "தமிழ்", sample: "வணக்கம்", script: "tamil", region: "south", bcp47: "ta-IN" },
  te: { name: "Telugu", nativeName: "తెలుగు", sample: "నమస్కారం", script: "telugu", region: "south", bcp47: "te-IN" },
  kn: { name: "Kannada", nativeName: "ಕನ್ನಡ", sample: "ನಮಸ್ಕಾರ", script: "kannada", region: "south", bcp47: "kn-IN" },
  ml: { name: "Malayalam", nativeName: "മലയാളം", sample: "നമസ്കാരം", script: "malayalam", region: "south", bcp47: "ml-IN" },
  bn: { name: "Bengali", nativeName: "বাংলা", sample: "নমস্কার", script: "bengali", region: "east", bcp47: "bn-IN" },
  or: { name: "Odia", nativeName: "ଓଡ଼ିଆ", sample: "ନମସ୍କାର", script: "oriya", region: "east", bcp47: "or-IN" },
  as: { name: "Assamese", nativeName: "অসমীয়া", sample: "নমস্কাৰ", script: "bengali", region: "east", bcp47: "as-IN" },
  mr: { name: "Marathi", nativeName: "मराठी", sample: "नमस्कार", script: "devanagari", region: "west", bcp47: "mr-IN" },
  gu: { name: "Gujarati", nativeName: "ગુજરાતી", sample: "નમસ્તે", script: "gujarati", region: "west", bcp47: "gu-IN" },
  pa: { name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", sample: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ", script: "gurmukhi", region: "north", bcp47: "pa-IN" },
  sa: { name: "Sanskrit", nativeName: "संस्कृतम्", sample: "नमः", script: "devanagari", region: "pan-india", bcp47: "sa-IN" },
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}
