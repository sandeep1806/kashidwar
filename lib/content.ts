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

/** Locales whose copy writes numbers in their own digits; the rest use Latin digits, as their texts do. */
const NATIVE_DIGITS: Record<string, string> = { bn: "beng", as: "beng" };

/** The number of places, formatted for the `{count}` in the site description, /places and /map texts. */
export const placeCount = (locale: string) => new Intl.NumberFormat(`${locale}-u-nu-${NATIVE_DIGITS[locale] ?? "latn"}`).format(places.length);

/**
 * Regional translations (every locale except en and hi) live one file per locale in
 * content/i18n/entries/<locale>.json, keyed by kind and id. They are loaded on demand so
 * one locale's text is never bundled with the shared content files. Call
 * `await loadEntryTranslations(locale)` before `localize` in any server code that
 * renders a regional locale; the overrides are then found by entry identity.
 */
type EntryOverride = Record<string, unknown>;
type ItineraryOverride = EntryOverride & { plan?: (EntryOverride & { stops?: EntryOverride[] })[] };
interface EntryTranslations {
  places?: Record<string, EntryOverride>;
  festivals?: Record<string, EntryOverride>;
  projects?: Record<string, EntryOverride>;
  food?: Record<string, EntryOverride>;
  itineraries?: Record<string, ItineraryOverride>;
}
const regional = new Map<string, WeakMap<object, EntryOverride>>();

export async function loadEntryTranslations(locale: string): Promise<void> {
  if (locale === "en" || locale === "hi" || regional.has(locale)) return;
  let data: EntryTranslations = {};
  try {
    data = (await import(`@/content/i18n/entries/${locale}.json`)).default as EntryTranslations;
  } catch {
    // Unknown locale: everything falls back to English.
  }
  const map = new WeakMap<object, EntryOverride>();
  const add = (target: object | undefined, over: EntryOverride | undefined) => {
    if (target && over && Object.keys(over).length) map.set(target, over);
  };
  const addAll = (list: { id: string }[], overrides?: Record<string, EntryOverride>) => {
    for (const e of list) add(e, overrides?.[e.id]);
  };
  addAll(places, data.places);
  addAll(festivals, data.festivals);
  addAll(projects, data.projects);
  addAll(foods, data.food);
  for (const it of itineraries) {
    const o = data.itineraries?.[it.id];
    if (!o) continue;
    const { plan, ...top } = o;
    add(it, top);
    plan?.forEach((d, i) => {
      const day = it.plan[i];
      if (!day || !d) return;
      const { stops, ...dayTop } = d;
      add(day, dayTop);
      stops?.forEach((s, j) => add(day.stops[j], s));
    });
  }
  regional.set(locale, map);
}

/** True when the entry has text written for this locale (inline for hi, loaded for regional locales). */
export function hasTranslation(entry: { i18n?: Record<string, object> }, locale: string): boolean {
  return !!(entry.i18n?.[locale] ?? regional.get(locale)?.get(entry));
}

export function getPlace(id: string): Place | undefined {
  return places.find((p) => p.id === id);
}

/** Apply a locale's overrides (if any) over the English fields. Shallow, field by field. */
export function localize<T extends { i18n?: Record<string, object> }>(entry: T, locale: string): T {
  const { i18n, ...rest } = entry;
  const over = (i18n?.[locale] ?? regional.get(locale)?.get(entry)) as (Record<string, unknown> & { glance?: object }) | undefined;
  // The i18n map is dropped from the copy: it is server-only data and would
  // otherwise be serialised into the client payload for every locale.
  if (!over) return rest as T;
  const base = rest as Record<string, unknown> & { glance?: object };
  // `glance` holds both enumerated values (not translated) and free text (translated): merge, don't replace.
  const glance = over.glance && base.glance ? { glance: { ...base.glance, ...over.glance } } : {};
  return { ...base, ...over, ...glance } as T;
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
