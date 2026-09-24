/**
 * Typed access to /content JSON. Never hardcode copy in JSX — add it here.
 * Schemas follow CLAUDE.md → Content rules.
 */
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

export interface Place {
  id: string;
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
  story?: string;
  tips?: string[];
  /** Optional verse shown in original script + transliteration + translation */
  verse?: { original: string; transliteration: string; translation: string; attribution: string };
}

export type ProjectStatus = "completed" | "under_construction" | "announced";
export type ProjectType = "transport" | "heritage" | "tourism" | "infrastructure" | "culture";

export interface Project {
  id: string;
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
  stops: ItineraryStop[];
}

export interface Itinerary {
  id: string;
  days: number;
  title_en: string;
  title_hi: string;
  summary: string;
  plan: ItineraryDay[];
}

export const places = placesJson as Place[];
export const projects = projectsJson as Project[];
export const festivals = festivalsJson as Festival[];
export const foods = foodJson as Food[];
export const itineraries = itinerariesJson as Itinerary[];

export function getPlace(id: string): Place | undefined {
  return places.find((p) => p.id === id);
}
