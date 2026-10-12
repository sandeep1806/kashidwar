/**
 * Content types and pure helpers with NO JSON imports, so client components
 * can import them without pulling every content file into the browser bundle.
 * Data itself lives in lib/content.ts (server side).
 */
export type Faith =
  | "hindu"
  | "buddhist"
  | "jain"
  | "sikh"
  | "islamic"
  | "christian"
  | "bhakti"
  | "secular";

export const FAITHS: Faith[] = [
  "buddhist",
  "bhakti",
  "christian",
  "hindu",
  "islamic",
  "jain",
  "sikh",
];

export type PlaceType =
  | "ghat"
  | "temple"
  | "stupa"
  | "monastery"
  | "mosque"
  | "church"
  | "gurudwara"
  | "math"
  | "fort"
  | "museum"
  | "university"
  | "heritage";

export interface Source {
  title: string;
  url: string;
  /** ISO date the URL was last read */
  accessed: string;
}

/**
 * Optional per-locale overrides for the prose fields of a content entry.
 * `localize(entry, locale)` returns a copy with the overrides applied and
 * English as the fallback, so a partially translated locale never breaks.
 */
export type LocalizedFields = Partial<{
  summary: string;
  /** Free-text "at a glance" values (timings, entry, duration, season) */
  glance: GlanceText;
  bestTime: string;
  story: string;
  tips: string[];
  timeline: string;
  agency: string;
  when: string;
  where: string | string[];
  season: string;
  title: string;
  theme: string;
  cost: string;
  price: string;
}>;

export type Crowd = "quiet" | "moderate" | "busy" | "very-busy";
export type Photography = "allowed" | "outside-only" | "no";
export type Dress = "any" | "modest" | "covered";

/** The free-text half of a place's "at a glance" facts (translatable). */
export interface GlanceText {
  /** Opening hours as a visitor meets them, e.g. "04:00–23:00; darshan pauses 11:30–12:00" */
  timings?: string;
  /** Entry fee, e.g. "Free" or "₹25 (Indian) · ₹300 (foreign)" */
  entry?: string;
  /** Typical visit, e.g. "45–60 min" */
  duration?: string;
  /** Best months, e.g. "Oct–Mar" */
  season?: string;
}

/**
 * Structured visitor facts shown as icons and chips instead of prose
 * (CLAUDE.md → Content rules: every value sourced; `verified: false` when
 * timings or fees come only from non-official pages).
 */
export interface Glance extends GlanceText {
  crowd?: Crowd;
  photography?: Photography;
  dress?: Dress;
  verified?: boolean;
  sources?: Source[];
}

export interface Place {
  id: string;
  /** Name in a regional script, keyed by locale (Devanagari locales use name_hi) */
  names?: Record<string, string>;
  i18n?: Record<string, LocalizedFields>;
  name_en: string;
  name_hi: string;
  faith: Faith[];
  type: PlaceType;
  lat: number;
  lng: number;
  summary: string;
  bestTime: string;
  image: string;
  sources: Source[];
  /** false when lat/lng were placed from a locality description, not a cited coordinate */
  coordsVerified?: boolean;
  story?: string;
  tips?: string[];
  glance?: Glance;
  /** Optional verse shown in original script + transliteration + translation */
  verse?: { original: string; transliteration: string; translation: string; attribution: string };
}

export type ProjectStatus = "completed" | "under_construction" | "announced";
export type ProjectType = "transport" | "heritage" | "tourism" | "infrastructure" | "culture";

export interface Project {
  id: string;
  /** Name in a regional script, keyed by locale (Devanagari locales use name_hi) */
  names?: Record<string, string>;
  i18n?: Record<string, LocalizedFields>;
  name_en: string;
  name_hi: string;
  faith: Faith[];
  type: ProjectType;
  lat: number;
  lng: number;
  summary: string;
  bestTime: string;
  image: string;
  sources: Source[];
  status: ProjectStatus;
  agency: string;
  timeline: string;
  /** false when status could not be confirmed from a source */
  verified: boolean;
  /** ISO date of the last status check */
  lastVerified: string;
  /** Sanctioned or final cost as a short string, e.g. "₹339 crore" (sourced in `sources`) */
  cost?: string;
  /** Physical progress 0–100 from the latest sourced inspection; 100 when completed, 0 when announced */
  progress?: number;
}

export interface Festival {
  id: string;
  /** Name in a regional script, keyed by locale (Devanagari locales use name_hi) */
  names?: Record<string, string>;
  i18n?: Record<string, LocalizedFields>;
  name_en: string;
  name_hi: string;
  faith: Faith[];
  /** Lunar-calendar rule, e.g. "Kartik Purnima" */
  when: string;
  /** Gregorian months, 1–12, in which it usually falls */
  months: number[];
  where: string;
  /** Listed places named in `where` (links on the festival page) */
  placeIds: string[];
  summary: string;
  image: string;
  sources: Source[];
}

export type FoodType = "breakfast" | "sweet" | "drink" | "street" | "paan";

export interface Food {
  id: string;
  /** Name in a regional script, keyed by locale (Devanagari locales use name_hi) */
  names?: Record<string, string>;
  i18n?: Record<string, LocalizedFields>;
  name_en: string;
  name_hi: string;
  type: FoodType;
  vegetarian: boolean;
  season: string;
  where: string[];
  /** Typical street price per serving, e.g. "₹30–50" */
  price?: string;
  priceBand?: "₹" | "₹₹" | "₹₹₹";
  priceVerified?: boolean;
  priceSources?: Source[];
  summary: string;
  image: string;
  sources: Source[];
}

export interface ItineraryStop {
  time: string;
  i18n?: Record<string, { title?: string; note?: string }>;
  /** Place id from places.json, when the stop is a listed place */
  placeId?: string;
  title: string;
  note: string;
  /** Marks the sunrise/sunset moment on the timeline strip */
  marker?: "sunrise" | "sunset";
}

export interface ItineraryDay {
  day: number;
  theme: string;
  i18n?: Record<string, { theme?: string }>;
  stops: ItineraryStop[];
}

export interface Itinerary {
  id: string;
  /** Title in a regional script, keyed by locale */
  titles?: Record<string, string>;
  i18n?: Record<string, { summary?: string }>;
  days: number;
  title_en: string;
  title_hi: string;
  summary: string;
  plan: ItineraryDay[];
}

export interface FaithVerse {
  original: string;
  transliteration: string;
  /** BCP-47 of the original text (sa, pi, ar, pa, grc, hi) */
  lang: string;
  dir: "ltr" | "rtl";
  attribution: string;
}

export interface FaithEntry {
  id: Faith;
  /** Order of arrival in Kashi (locale-independent, unlike alphabetical) */
  order: number;
  /** Places filter this faith deep-links to */
  filter: PlaceFilter;
  /** Place ids shown as key sites */
  sites: string[];
  verse: FaithVerse;
}


/** Filter chips for the Places section (DESIGN.md → Place card, PROMPTS.md Phase 4). */
export const PLACE_FILTERS = [
  "all",
  "hindu",
  "ghats",
  "temples",
  "buddhist",
  "jain",
  "sikh",
  "islamic",
  "christian",
  "bhakti",
  "heritage",
] as const;
export type PlaceFilter = (typeof PLACE_FILTERS)[number];

const HERITAGE_TYPES: PlaceType[] = ["fort", "museum", "heritage", "university"];

export function placeMatches(place: Pick<Place, "type" | "faith">, filter: PlaceFilter): boolean {
  switch (filter) {
    case "all":
      return true;
    case "ghats":
      return place.type === "ghat";
    case "temples":
      return place.type === "temple";
    case "heritage":
      return HERITAGE_TYPES.includes(place.type);
    default:
      return place.faith.includes(filter);
  }
}


/** A self-hosted photo set: `${src}-${width}.avif|webp` for each width. */
export interface PhotoData {
  src: string;
  widths: number[];
  width: number;
  height: number;
  /** Tiny WebP data URL shown while the photo loads */
  blur: string;
  alt: string;
  /** Shown on the photo when it was taken (or the artwork made) outside Varanasi */
  note?: string;
}

/** The part of a place the grid, filters and map need on page load. `name_en` carries the display name in the page's locale (map labels). */
export type PlaceLite = Pick<Place, "id" | "name_en" | "faith" | "type" | "lat" | "lng" | "bestTime" | "coordsVerified"> & {
  /** Glance chips on the card */
  duration?: string;
  crowd?: Crowd;
};

/** Modal prose, fetched from /<locale>/places.json when a modal opens. */
export interface PlaceDetail {
  summary: string;
  story?: string;
  tips?: string[];
  sources: { title: string; url: string }[];
}


/** Scripts that read the Hindi name (Devanagari) — the others get their own `names[locale]`, else English. */
const DEVANAGARI_LOCALES = new Set(["hi", "mr", "sa"]);

/**
 * The name to show for an entry in a locale: its own-script name (`names[locale]`) when there
 * is one, the Hindi name in Devanagari locales, English otherwise. The secondary line is
 * English for regional scripts and Devanagari locales, Hindi for English.
 */
export function displayName(locale: string, e: { name_en: string; name_hi: string; names?: Record<string, string> }): { primary: string; secondary: string } {
  const own = e.names?.[locale];
  if (own) return { primary: own, secondary: e.name_en };
  if (DEVANAGARI_LOCALES.has(locale)) return { primary: e.name_hi, secondary: e.name_en };
  return { primary: e.name_en, secondary: e.name_hi };
}
