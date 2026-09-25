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
import type { FaithEntry, Festival, Food, Itinerary, Place, Project } from "./contentTypes";

export * from "./contentTypes";

export const faithEntries = (faithsJson as FaithEntry[]).slice().sort((a, b) => a.order - b.order);
export const places = placesJson as Place[];
export const projects = projectsJson as Project[];
export const festivals = festivalsJson as Festival[];
export const foods = foodJson as Food[];
export const itineraries = itinerariesJson as Itinerary[];

export function getPlace(id: string): Place | undefined {
  return places.find((p) => p.id === id);
}

/** Apply a locale's overrides (if any) over the English fields. Shallow, field by field. */
export function localize<T extends { i18n?: Record<string, object> }>(entry: T, locale: string): T {
  const { i18n, ...rest } = entry;
  const over = i18n?.[locale];
  // The i18n map is dropped from the copy: it is server-only data and would
  // otherwise be serialised into the client payload for every locale.
  return (over ? { ...rest, ...over } : rest) as T;
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
