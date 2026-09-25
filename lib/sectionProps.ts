import { existsSync } from "node:fs";
import path from "node:path";
import { getTranslations } from "next-intl/server";
import { faithEntries, festivals, foods, getPlace, itineraries, localize, localizeItinerary, places, projects, type Itinerary, type ProjectStatus } from "@/lib/content";
import { LOCALES, type Locale } from "@/lib/i18n/locales";
import { proseFallsBack } from "@/lib/proseLocale";
import type { FestivalItem } from "@/components/sections/FestivalsList";
import type { FoodItem } from "@/components/sections/FoodList";
import type { ProjectItem, ProjectLabels } from "@/components/sections/ProjectsList";
import type { ExplorerLabels, ExplorerPlace } from "@/components/sections/PlacesExplorer";
import type { FaithTile } from "@/components/sections/FaithTiles";
import { FAITHS, PLACE_FILTERS, type Faith, type PlaceFilter } from "@/lib/contentTypes";

/**
 * Data for the sections below the fold that render client-side after
 * hydration (see components/sections/tail/TailSections.tsx). Everything here
 * is plain JSON: translations resolved on the server, content localised.
 */
export interface HeadingProps {
  id: string;
  title: string;
  secondary: string;
  intro: string;
}

const ORDER: ProjectStatus[] = ["under_construction", "announced", "completed"];
const PROJECT_TYPES = ["transport", "heritage", "tourism", "infrastructure", "culture"];

export async function getProjectsProps(locale: Locale) {
  const t = await getTranslations({ locale, namespace: "projects" });
  const meta = LOCALES[locale];
  const devanagari = meta.script === "devanagari";
  const fmt = new Intl.DateTimeFormat(meta.bcp47, { dateStyle: "long" });
  const latest = projects.reduce((d, p) => (p.lastVerified > d ? p.lastVerified : d), "");
  const items: ProjectItem[] = projects.map((raw) => {
    const p = localize(raw, locale);
    return { ...p, primaryName: devanagari ? p.name_hi : p.name_en, secondaryName: devanagari ? p.name_en : p.name_hi, lastVerifiedLabel: fmt.format(new Date(p.lastVerified + "T00:00:00Z")) };
  });
  const groups = ORDER.map((status) => ({ status, items: items.filter((p) => p.status === status) })).filter((g) => g.items.length);
  const labels: ProjectLabels = {
    groups: Object.fromEntries(ORDER.map((s) => [s, t(`groups.${s}`)])) as Record<ProjectStatus, string>,
    types: Object.fromEntries(PROJECT_TYPES.map((k) => [k, t(`types.${k}`)])),
    agency: t("agency"),
    timeline: t("timeline"),
    sources: t("sources"),
    lastVerified: t("lastVerified"),
    unverified: t("unverified"),
  };
  const common = await getTranslations({ locale, namespace: "common" });
  return {
    englishNote: proseFallsBack(locale) ? common("englishNote") : null,
    heading: { id: "projects", title: t("title"), secondary: t("titleSecondary"), intro: t("intro") } as HeadingProps,
    legend: t("legend"),
    latestLabel: fmt.format(new Date(latest + "T00:00:00Z")),
    groups,
    labels,
    order: ORDER,
  };
}
export type ProjectsProps = Awaited<ReturnType<typeof getProjectsProps>>;

export async function getFestivalsProps(locale: Locale) {
  const t = await getTranslations({ locale, namespace: "festivals" });
  const devanagari = LOCALES[locale].script === "devanagari";
  const items: FestivalItem[] = festivals
    .map((raw) => {
      const f = localize(raw, locale);
      return { ...f, primaryName: devanagari ? f.name_hi : f.name_en, secondaryName: devanagari ? f.name_en : f.name_hi, glyph: f.faith[0] ?? "secular" };
    })
    .sort((a, b) => Math.min(...a.months) - Math.min(...b.months));
  return {
    heading: { id: "festivals", title: t("title"), secondary: t("titleSecondary"), intro: t("intro") } as HeadingProps,
    items,
    months: t.raw("months") as string[],
    labels: { when: t("when"), where: t("where"), lunarNote: t("lunarNote") },
  };
}
export type FestivalsProps = Awaited<ReturnType<typeof getFestivalsProps>>;

export async function getFoodProps(locale: Locale) {
  const t = await getTranslations({ locale, namespace: "food" });
  const devanagari = LOCALES[locale].script === "devanagari";
  const items: FoodItem[] = foods.map((raw) => {
    const f = localize(raw, locale);
    return { ...f, primaryName: devanagari ? f.name_hi : f.name_en, secondaryName: devanagari ? f.name_en : f.name_hi, typeLabel: t(`types.${f.type}`) };
  });
  const common = await getTranslations({ locale, namespace: "common" });
  return {
    englishNote: proseFallsBack(locale) ? common("englishNote") : null,
    heading: { id: "food", title: t("title"), secondary: t("titleSecondary"), intro: t("intro") } as HeadingProps,
    items,
    labels: { season: t("season"), where: t("where"), veg: t("veg") },
  };
}
export type FoodProps = Awaited<ReturnType<typeof getFoodProps>>;

export async function getItinerariesProps(locale: Locale) {
  const t = await getTranslations({ locale, namespace: "itineraries" });
  const devanagari = LOCALES[locale].script === "devanagari";
  const list: Itinerary[] = itineraries.map((it) => localizeItinerary(it, locale));
  const common = await getTranslations({ locale, namespace: "common" });
  return {
    englishNote: proseFallsBack(locale) ? common("englishNote") : null,
    heading: { id: "itineraries", title: t("title"), secondary: t("titleSecondary"), intro: t("intro") } as HeadingProps,
    itineraries: list,
    tabs: list.map((it) => t("dayTab", { days: it.days })),
    dayTemplate: t.raw("day") as string,
    sunrise: t("sunrise"),
    sunset: t("sunset"),
    placesNote: t("placesNote"),
    placeNames: Object.fromEntries(places.map((p) => [p.id, devanagari ? p.name_hi : p.name_en])),
  };
}
export type ItinerariesProps = Awaited<ReturnType<typeof getItinerariesProps>>;

export async function getPracticalProps(locale: Locale) {
  const t = await getTranslations({ locale, namespace: "practical" });
  return {
    heading: { id: "practical", title: t("title"), secondary: t("titleSecondary"), intro: t("intro") } as HeadingProps,
    cards: (["air", "rail", "road", "season"] as const).map((k) => ({ k, title: t(`${k}.title`), text: t(`${k}.text`) })),
    etiquetteTitle: t("etiquette.title"),
    etiquette: t.raw("etiquette.items") as string[],
  };
}
export type PracticalProps = Awaited<ReturnType<typeof getPracticalProps>>;

export async function getFinaleProps(locale: Locale) {
  const t = await getTranslations({ locale, namespace: "finale" });
  return {
    heading: { id: "aarti", title: t("title"), secondary: t("titleSecondary"), intro: t("text") } as HeadingProps,
    closing: t("closing"),
    closingSecondary: t("closingSecondary"),
  };
}
export type FinaleProps = Awaited<ReturnType<typeof getFinaleProps>>;

const PLACE_TYPES = ["ghat", "temple", "stupa", "monastery", "mosque", "church", "gurudwara", "math", "fort", "museum", "university", "heritage"];

export async function getPlacesProps(locale: Locale) {
  const t = await getTranslations({ locale, namespace: "places" });
  const devanagari = LOCALES[locale].script === "devanagari";
  const publicDir = path.join(process.cwd(), "public");
  const items: ExplorerPlace[] = places.map((raw) => {
    const { image, sources, ...rest } = localize(raw, locale);
    return {
      place: { ...rest, image, sources: sources.map(({ title, url }) => ({ title, url, accessed: "" })) },
      primaryName: devanagari ? raw.name_hi : raw.name_en,
      secondaryName: devanagari ? raw.name_en : raw.name_hi,
      hasImage: existsSync(path.join(publicDir, raw.image)),
    };
  });
  const allFaiths: Faith[] = [...FAITHS, "secular"];
  const labels: ExplorerLabels = {
    filters: Object.fromEntries(PLACE_FILTERS.map((f) => [f, t(`filters.${f}`)])) as Record<PlaceFilter, string>,
    faiths: Object.fromEntries(allFaiths.map((f) => [f, t(`faiths.${f}`)])) as Record<Faith, string>,
    types: Object.fromEntries(PLACE_TYPES.map((k) => [k, t(`types.${k}`)])),
    results: t.raw("results"),
    bestTime: t("bestTime"),
    tips: t("tips"),
    sources: t("sources"),
    showOnMap: t("showOnMap"),
    openDetails: t("openDetails"),
    close: t("close"),
    mapTitle: t("mapTitle"),
    mapLoading: t("mapLoading"),
    approxCoords: t("approxCoords"),
    cluster: t.raw("cluster"),
    share: t("share"),
    linkCopied: t("linkCopied"),
    englishNote: proseFallsBack(locale) ? (await getTranslations({ locale, namespace: "common" }))("englishNote") : null,
  };
  return { items, labels };
}
export type PlacesProps = Awaited<ReturnType<typeof getPlacesProps>>;

export async function getFaithsProps(locale: Locale) {
  const t = await getTranslations({ locale, namespace: "faiths" });
  const devanagari = LOCALES[locale].script === "devanagari";
  const tiles: FaithTile[] = faithEntries.map((f) => ({
    ...f,
    name: t(`tiles.${f.id}.name`),
    essence: t(`tiles.${f.id}.essence`),
    translation: t(`tiles.${f.id}.translation`),
    siteNames: f.sites.map((id) => getPlace(id)).filter((p) => !!p).map((p) => (devanagari ? p.name_hi : p.name_en)),
  }));
  return {
    heading: { id: "faiths", title: t("title"), secondary: t("titleSecondary"), intro: t("intro") } as HeadingProps,
    order: t("order"),
    tiles,
    labels: { verseLabel: t("verseLabel"), seePlaces: t("seePlaces") },
  };
}
export type FaithsProps = Awaited<ReturnType<typeof getFaithsProps>>;
