/**
 * Typed access to /content JSON. Never hardcode copy in JSX — add it here.
 * Schemas follow CLAUDE.md → Content rules.
 */
import faithsJson from "@/content/faiths.json";
import festivalsJson from "@/content/festivals.json";
import foodJson from "@/content/food.json";
import itinerariesJson from "@/content/itineraries.json";
import placesJson from "@/content/places.json";
import projectsJson from "@/content/projects.json";

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

export const faithEntries = (faithsJson as FaithEntry[]).slice().sort((a, b) => a.order - b.order);
export const places = placesJson as Place[];
export const projects = projectsJson as Project[];
export const festivals = festivalsJson as Festival[];
export const foods = foodJson as Food[];
export const itineraries = itinerariesJson as Itinerary[];

export function getPlace(id: string): Place | undefined {
  return places.find((p) => p.id === id);
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

export function placeMatches(place: Place, filter: PlaceFilter): boolean {
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

/** Apply a locale's overrides (if any) over the English fields. Shallow, field by field. */
export function localize<T extends { i18n?: Record<string, object> }>(entry: T, locale: string): T {
  const over = entry.i18n?.[locale];
  if (!over) return entry;
  return { ...entry, ...over };
}

export function localizeItinerary(it: Itinerary, locale: string): Itinerary {
  return {
    ...localize(it, locale),
    plan: it.plan.map((d) => ({
      ...localize(d, locale),
      stops: d.stops.map((s) => localize(s, locale)),
    })),
  };
}
