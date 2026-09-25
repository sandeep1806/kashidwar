// Server-side helpers for the per-item pages (/[locale]/places/<id>, …).
import { festivals, itineraries, places, projects, type Festival, type Itinerary, type Place, type Project } from "@/lib/content";
import { LOCALES, type Locale } from "@/lib/i18n/locales";
import { DEFAULT_INDEXED_LOCALE, INDEXED_LOCALES, isIndexed } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

export type Kind = "places" | "festivals" | "projects" | "itineraries";

export const itinerarySlug = (it: Itinerary) => `${it.days}-day`;
export const itineraryBySlug = (slug: string) => itineraries.find((it) => itinerarySlug(it) === slug);

export const SLUGS: Record<Kind, string[]> = {
  places: places.map((p) => p.id),
  festivals: festivals.map((f) => f.id),
  projects: projects.map((p) => p.id),
  itineraries: itineraries.map(itinerarySlug),
};

/** Home-page section each kind belongs to (breadcrumbs, "back to" links). */
export const SECTION_OF: Record<Kind, { id: string; navKey: string }> = {
  places: { id: "places", navKey: "places" },
  festivals: { id: "festivals", navKey: "festivals" },
  projects: { id: "projects", navKey: "projects" },
  itineraries: { id: "itineraries", navKey: "itineraries" },
};

export const pagePath = (kind: Kind, slug: string) => `/${kind}/${slug}`;
export const pageUrl = (locale: Locale, kind: Kind, slug: string) => `/${locale}${pagePath(kind, slug)}`;
export const absolute = (path: string) => `${SITE_URL}${path}`;

/** hreflang map for a locale-less path ("" for home): indexed locales only, x-default → English. */
export function languageAlternates(path: string): Record<string, string> {
  const languages: Record<string, string> = Object.fromEntries(INDEXED_LOCALES.map((l) => [LOCALES[l].bcp47, `/${l}${path}`]));
  languages["x-default"] = `/${DEFAULT_INDEXED_LOCALE}${path}`;
  return languages;
}

/**
 * `alternates` for a page's metadata: a self canonical always; hreflang only
 * on indexed locales (noindexed pages are not part of the hreflang set).
 */
export function alternatesFor(locale: string, path: string) {
  return { canonical: `/${locale}${path}`, ...(isIndexed(locale) ? { languages: languageAlternates(path) } : {}) };
}

/** Great-circle distance in km. */
export function km(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371, rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Transport hubs for "how to reach" (coordinates from OpenStreetMap). */
export const HUBS = [
  { key: "hubJunction", lat: 25.3269, lng: 82.9879 },
  { key: "hubAirport", lat: 25.4524, lng: 82.8593 },
  { key: "hubGodowlia", lat: 25.3095, lng: 83.0073 },
] as const;

export function hubDistances(p: { lat: number; lng: number }) {
  return HUBS.map((h) => ({ key: h.key, km: Math.max(0.1, Math.round(km(p, h) * 10) / 10) }));
}

export const mapLinks = (p: { lat: number; lng: number }) => ({
  google: `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`,
  osm: `https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lng}#map=17/${p.lat}/${p.lng}`,
});

/** Up to `n` other places, nearest first, favouring the same faith. */
export function relatedPlaces(origin: { lat: number; lng: number; id?: string; faith?: string[] }, n = 4): Place[] {
  return places
    .filter((p) => p.id !== origin.id)
    .map((p) => {
      const shared = origin.faith?.some((f) => p.faith.includes(f as never)) ?? false;
      return { p, score: km(origin, p) * (shared ? 1 : 2.5) };
    })
    .sort((a, b) => a.score - b.score)
    .slice(0, n)
    .map((x) => x.p);
}

/** Places a festival is held at, else places of its faith. */
export function festivalPlaces(f: Festival, n = 4): Place[] {
  const listed = f.placeIds.map((id) => places.find((p) => p.id === id)).filter((p): p is Place => !!p);
  if (listed.length) return listed.slice(0, n);
  return places.filter((p) => p.faith.some((x) => f.faith.includes(x))).slice(0, n);
}

export const festivalsAt = (placeId: string) => festivals.filter((f) => f.placeIds.includes(placeId));

export function projectPlaces(p: Project, n = 3): Place[] {
  return relatedPlaces({ lat: p.lat, lng: p.lng }, n);
}

/** Previous / next in the collection's own order (wraps around). */
export function neighbours<T>(list: T[], index: number): { prev: T; next: T } {
  return { prev: list[(index - 1 + list.length) % list.length], next: list[(index + 1) % list.length] };
}

/** schema.org BreadcrumbList: Home → section (home anchor) → this page. */
export function breadcrumbLd(locale: Locale, items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: absolute(it.path) })),
  };
}

/** Meta description: first sentences of the text, up to ~155 characters. */
export function metaDescription(text: string, max = 158): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const stop = Math.max(cut.lastIndexOf("। "), cut.lastIndexOf(". "), cut.lastIndexOf("; "));
  return (stop > 80 ? cut.slice(0, stop + 1) : cut.slice(0, cut.lastIndexOf(" ")) + "…").trim();
}
