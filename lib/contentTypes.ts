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
}>;

export interface Place {
  id: string;
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
  /** Optional verse shown in original script + transliteration + translation */
  verse?: { original: string; transliteration: string; translation: string; attribution: string };
}

export type ProjectStatus = "completed" | "under_construction" | "announced";
export type ProjectType = "transport" | "heritage" | "tourism" | "infrastructure" | "culture";

export interface Project {
  id: string;
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
}

export interface Festival {
  id: string;
  i18n?: Record<string, LocalizedFields>;
  name_en: string;
  name_hi: string;
  faith: Faith[];
  /** Lunar-calendar rule, e.g. "Kartik Purnima" */
  when: string;
  /** Gregorian months, 1–12, in which it usually falls */
  months: number[];
  where: string;
  summary: string;
  image: string;
  sources: Source[];
}

export type FoodType = "breakfast" | "sweet" | "drink" | "street" | "paan";

export interface Food {
  id: string;
  i18n?: Record<string, LocalizedFields>;
  name_en: string;
  name_hi: string;
  type: FoodType;
  vegetarian: boolean;
  season: string;
  where: string[];
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

/** The part of a place the grid, filters and map need on page load. */
export type PlaceLite = Pick<Place, "id" | "name_en" | "faith" | "type" | "lat" | "lng" | "bestTime" | "coordsVerified">;

/** Modal prose, fetched from /<locale>/places.json when a modal opens. */
export interface PlaceDetail {
  summary: string;
  story?: string;
  tips?: string[];
  sources: { title: string; url: string }[];
}
