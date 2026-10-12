import { getPhoto } from "@/lib/photos";
import { festivalDateView } from "@/lib/festivalDates";
import { itinerarySlug, pageUrl } from "@/lib/pages";
import { getTranslations } from "next-intl/server";
import { faithEntries, festivals, foods, getPlace, itineraries, loadEntryTranslations, localize, localizeItinerary, places, projects, type Itinerary, type ProjectStatus } from "@/lib/content";
import { LOCALES, type Locale } from "@/lib/i18n/locales";
import { proseFallsBack } from "@/lib/proseLocale";
import type { FestivalItem } from "@/components/sections/FestivalsList";
import type { FoodItem } from "@/components/sections/FoodList";
import type { ProjectItem, ProjectLabels } from "@/components/sections/ProjectsList";
import type { ExplorerLabels, ExplorerPlace } from "@/components/sections/PlacesExplorer";
import type { FaithTile } from "@/components/sections/FaithTiles";
import { FAITHS, PLACE_FILTERS, displayName, type Crowd, type Faith, type PlaceDetail, type PlaceFilter } from "@/lib/contentTypes";

const CROWDS: Crowd[] = ["quiet", "moderate", "busy", "very-busy"];

/**
 * Data for the sections below the fold that render client-side after
 * hydration (see components/sections/tail/TailSections.tsx). Everything here
 * is plain JSON: translations resolved on the server, content localised.
 */
export interface HeadingProps {
  id: string;
  title: string;
  secondary: string;
  /** Listing pages and meta descriptions */
  intro: string;
  /** The home page: one short line under the heading */
  lead?: string;
}

const ORDER: ProjectStatus[] = ["under_construction", "announced", "completed"];
const PROJECT_TYPES = ["transport", "heritage", "tourism", "infrastructure", "culture"];

export async function getProjectsProps(locale: Locale) {
  await loadEntryTranslations(locale);
  const t = await getTranslations({ locale, namespace: "projects" });
  const meta = LOCALES[locale];
  const fmt = new Intl.DateTimeFormat(meta.bcp47, { dateStyle: "long" });
  const latest = projects.reduce((d, p) => (p.lastVerified > d ? p.lastVerified : d), "");
  const items: ProjectItem[] = projects.map((raw) => {
    const p = localize(raw, locale);
    return { id: p.id, href: pageUrl(locale, "projects", p.id), faith: p.faith[0] ?? "secular", status: p.status, type: p.type, agency: p.agency, timeline: p.timeline, summary: p.summary, verified: p.verified, lastVerified: p.lastVerified, cost: p.cost, progress: p.progress, sources: p.sources.map(({ title, url }) => ({ title, url })), photo: getPhoto(`projects/${p.id}`, locale), primaryName: displayName(locale, p).primary, secondaryName: displayName(locale, p).secondary, lastVerifiedLabel: fmt.format(new Date(p.lastVerified + "T00:00:00Z")) };
  });
  const groups = ORDER.map((status) => ({ status, items: items.filter((p) => p.status === status) })).filter((g) => g.items.length);
  const labels: ProjectLabels = {
    groups: Object.fromEntries(ORDER.map((s) => [s, t(`groups.${s}`)])) as Record<ProjectStatus, string>,
    types: Object.fromEntries(PROJECT_TYPES.map((k) => [k, t(`types.${k}`)])),
    agency: t("agency"),
    readMore: (await getTranslations({ locale, namespace: "page" }))("readMore"),
    timeline: t("timeline"),
    sources: t("sources"),
    lastVerified: t("lastVerified"),
    unverified: t("unverified"),
    cost: t("cost"),
    progress: t.raw("progress"),
  };
  const common = await getTranslations({ locale, namespace: "common" });
  return {
    englishNote: proseFallsBack(locale) ? common("englishNote") : null,
    heading: { id: "projects", title: t("title"), secondary: t("titleSecondary"), intro: t("intro"), lead: t("lead") } as HeadingProps,
    legend: t("legend"),
    latestLabel: fmt.format(new Date(latest + "T00:00:00Z")),
    groups,
    labels,
    order: ORDER,
  };
}
export type ProjectsProps = Awaited<ReturnType<typeof getProjectsProps>>;

export async function getFestivalsProps(locale: Locale) {
  await loadEntryTranslations(locale);
  const t = await getTranslations({ locale, namespace: "festivals" });
  const tpage = await getTranslations({ locale, namespace: "page" });
  const items: FestivalItem[] = festivals
    .map((raw) => {
      const f = localize(raw, locale);
      return { id: f.id, href: pageUrl(locale, "festivals", f.id), date: festivalDateView(raw, LOCALES[locale].bcp47, tpage), months: f.months, when: f.when, where: f.where, summary: f.summary, photo: getPhoto(`festivals/${f.id}`, locale), primaryName: displayName(locale, f).primary, secondaryName: displayName(locale, f).secondary, glyph: f.faith[0] ?? "secular" };
    })
    // What's coming next first (by the next verified or expected date).
    .sort((a, b) => a.date.sortKey.localeCompare(b.date.sortKey));
  return {
    heading: { id: "festivals", title: t("title"), secondary: t("titleSecondary"), intro: t("intro"), lead: t("lead") } as HeadingProps,
    items,
    months: t.raw("months") as string[],
    labels: { when: t("when"), where: t("where"), lunarNote: t("lunarNote"), readMore: tpage("readMore"), nextUp: tpage("nextUp"), all: (await getTranslations({ locale, namespace: "places" }))("filters.all") },
  };
}
export type FestivalsProps = Awaited<ReturnType<typeof getFestivalsProps>>;

export async function getFoodProps(locale: Locale) {
  await loadEntryTranslations(locale);
  const t = await getTranslations({ locale, namespace: "food" });
  const items: FoodItem[] = foods.map((raw) => {
    const f = localize(raw, locale);
    return { id: f.id, season: f.season, where: f.where, summary: f.summary, vegetarian: f.vegetarian, price: f.price, priceVerified: f.priceVerified, photo: getPhoto(`food/${f.id}`, locale), primaryName: displayName(locale, f).primary, secondaryName: displayName(locale, f).secondary, typeLabel: t(`types.${f.type}`) };
  });
  const common = await getTranslations({ locale, namespace: "common" });
  return {
    englishNote: proseFallsBack(locale) ? common("englishNote") : null,
    heading: { id: "food", title: t("title"), secondary: t("titleSecondary"), intro: t("intro"), lead: t("lead") } as HeadingProps,
    items,
    labels: { season: t("season"), where: t("where"), veg: t("veg"), price: t("price"), priceNote: t("priceNote") },
  };
}
export type FoodProps = Awaited<ReturnType<typeof getFoodProps>>;

export async function getItinerariesProps(locale: Locale) {
  await loadEntryTranslations(locale);
  const t = await getTranslations({ locale, namespace: "itineraries" });
  const list: Itinerary[] = itineraries.map((it) => localizeItinerary(it, locale));
  const common = await getTranslations({ locale, namespace: "common" });
  return {
    englishNote: proseFallsBack(locale) ? common("englishNote") : null,
    heading: { id: "itineraries", title: t("title"), secondary: t("titleSecondary"), intro: t("intro"), lead: t("lead") } as HeadingProps,
    itineraries: list,
    tabs: list.map((it) => t("dayTab", { days: it.days })),
    dayTemplate: t.raw("day") as string,
    sunrise: t("sunrise"),
    sunset: t("sunset"),
    placesNote: t("placesNote"),
    openPage: (await getTranslations({ locale, namespace: "page" }))("openPage"),
    pageHrefs: list.map((it) => pageUrl(locale, "itineraries", itinerarySlug(it))),
    placeNames: Object.fromEntries(places.map((p) => [p.id, displayName(locale, p).primary])),
  };
}
export type ItinerariesProps = Awaited<ReturnType<typeof getItinerariesProps>>;

export async function getPracticalProps(locale: Locale) {
  const t = await getTranslations({ locale, namespace: "practical" });
  return {
    heading: { id: "practical", title: t("title"), secondary: t("titleSecondary"), intro: t("intro"), lead: t("lead") } as HeadingProps,
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
/** Modal prose for every place in one locale (served by app/[locale]/places.json). Load the locale's entry translations first. */
export function getPlaceDetails(locale: Locale): Record<string, PlaceDetail> {
  return Object.fromEntries(
    places.map((raw) => {
      const p = localize(raw, locale);
      return [p.id, { summary: p.summary, story: p.story, tips: p.tips, sources: p.sources.map(({ title, url }) => ({ title, url })) }];
    }),
  );
}

export type FinaleProps = Awaited<ReturnType<typeof getFinaleProps>>;

const PLACE_TYPES = ["ghat", "temple", "stupa", "monastery", "mosque", "church", "gurudwara", "math", "fort", "museum", "university", "heritage"];

export async function getPlacesProps(locale: Locale) {
  await loadEntryTranslations(locale);
  const t = await getTranslations({ locale, namespace: "places" });
  const tpage = await getTranslations({ locale, namespace: "page" });
  const items: ExplorerPlace[] = places.map((raw) => {
    const p = localize(raw, locale);
    return {
      place: { id: p.id, name_en: displayName(locale, raw).primary, faith: p.faith, type: p.type, lat: p.lat, lng: p.lng, bestTime: p.bestTime, coordsVerified: p.coordsVerified, ...(p.glance?.duration ? { duration: p.glance.duration } : {}), ...(p.glance?.crowd ? { crowd: p.glance.crowd } : {}) },
      primaryName: displayName(locale, raw).primary,
      secondaryName: displayName(locale, raw).secondary,
      photo: getPhoto(`places/${raw.id}`, locale),
    };
  });
  const allFaiths: Faith[] = [...FAITHS, "secular"];
  const labels: ExplorerLabels = {
    filters: Object.fromEntries(PLACE_FILTERS.map((f) => [f, t(`filters.${f}`)])) as Record<PlaceFilter, string>,
    faiths: Object.fromEntries(allFaiths.map((f) => [f, t(`faiths.${f}`)])) as Record<Faith, string>,
    types: Object.fromEntries(PLACE_TYPES.map((k) => [k, t(`types.${k}`)])),
    results: t.raw("results"),
    bestTime: t("bestTime"),
    duration: tpage("glance.duration"),
    crowd: tpage("glance.crowd"),
    crowdLevel: Object.fromEntries(CROWDS.map((c) => [c, tpage(`glance.crowdLevel.${c}`)])) as Record<Crowd, string>,
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
    openPage: (await getTranslations({ locale, namespace: "page" }))("openPage"),
    linkCopied: t("linkCopied"),
    showAll: (await getTranslations({ locale, namespace: "common" })).raw("showAllCount"),
    englishNote: proseFallsBack(locale) ? (await getTranslations({ locale, namespace: "common" }))("englishNote") : null,
  };
  return { items, labels };
}
export type PlacesProps = Awaited<ReturnType<typeof getPlacesProps>>;

export async function getFaithsProps(locale: Locale) {
  const t = await getTranslations({ locale, namespace: "faiths" });
  const tiles: FaithTile[] = faithEntries.map((f) => ({
    ...f,
    name: t(`tiles.${f.id}.name`),
    essence: t(`tiles.${f.id}.essence`),
    translation: t(`tiles.${f.id}.translation`),
    siteNames: f.sites.map((id) => getPlace(id)).filter((p) => !!p).map((p) => displayName(locale, p).primary),
  }));
  return {
    heading: { id: "faiths", title: t("title"), secondary: t("titleSecondary"), intro: t("intro"), lead: t("lead") } as HeadingProps,
    order: t("order"),
    tiles,
    labels: { verseLabel: t("verseLabel"), seePlaces: t("seePlaces") },
  };
}
export type FaithsProps = Awaited<ReturnType<typeof getFaithsProps>>;

/** The listing page a home-page carousel's "See all" points to. */
export async function seeAllLink(locale: Locale, section: "festivals" | "projects" | "food") {
  const common = await getTranslations({ locale, namespace: "common" });
  return { href: `/${locale}/${section}`, label: common("seeAll"), readMore: common("readMore") };
}
