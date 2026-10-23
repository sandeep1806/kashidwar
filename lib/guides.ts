// Server-side only: imports every guide. Guides are researched articles in
// English and Hindi (content/guides/<slug>.json); other locales show English.
import { BUILD_DATE } from "@/lib/festivalDates";
import { guideFiles } from "@/lib/guides.generated";
import type { Locale } from "@/lib/i18n/locales";
import type { Kind } from "@/lib/pages";
import { getPhoto } from "@/lib/photos";

export interface GuideSource {
  title: string;
  url: string;
  accessed?: string;
}

export interface GuideSection {
  id: string;
  heading_en: string;
  heading_hi: string;
  body_en: string[];
  body_hi: string[];
  list_en?: string[];
  list_hi?: string[];
  unconfirmed?: boolean;
  /** Indexes into the guide's sources */
  sources?: number[];
}

/** One item of the icon fact strip at the top of a guide (values come from its sourced sections). */
export interface GuideFact {
  icon: string;
  label_en: string;
  label_hi: string;
  value_en: string;
  value_hi: string;
}

export interface Guide {
  slug: string;
  published: string;
  updated: string;
  title_en: string;
  title_hi: string;
  description_en: string;
  description_hi: string;
  lead_en: string;
  lead_hi: string;
  /** Photo key for the hero and cards, chosen to match the guide's topic */
  photo?: string;
  /** Set when the guide is about a dated event */
  event?: GuideEvent;
  facts?: GuideFact[];
  sections: GuideSection[];
  faq: { q_en: string; a_en: string; q_hi: string; a_hi: string }[];
  sources: GuideSource[];
  related: Partial<Record<Kind, string[]>>;
  notes?: string;
}

/**
 * Every guide in content/guides/*.json (imported by the generated lib/guides.generated.ts,
 * so adding a guide needs no code change), newest first; ties by slug.
 */
export const guides: Guide[] = (guideFiles as Guide[]).slice().sort((a, b) => b.published.localeCompare(a.published) || a.slug.localeCompare(b.slug));

/** A dated event a guide is about (an air show, a festival night): drives the status banner and Event JSON-LD. */
export interface GuideEvent {
  name_en: string;
  name_hi: string;
  startDate: string;
  endDate: string;
  /** Show days when they are not every day between start and end */
  days?: string[];
  location_en: string;
  location_hi: string;
  lat: number;
  lng: number;
  free?: boolean;
}

export type EventStatus = "upcoming" | "on" | "past";

/** Upcoming, on now (between start and end) or past, relative to the build date (the site rebuilds weekly). */
export function eventStatus(e: Pick<GuideEvent, "startDate" | "endDate">, today: string = BUILD_DATE): EventStatus {
  if (today < e.startDate) return "upcoming";
  if (today > e.endDate) return "past";
  return "on";
}

export const guideBySlug = (slug: string) => guides.find((g) => g.slug === slug);

/** A guide translated into a regional locale (content/guides/i18n/<locale>.json, keyed by slug). */
export interface GuideTranslation {
  title: string;
  description: string;
  lead: string;
  facts?: { label: string; value: string }[];
  sections: { heading: string; body: string[]; list?: string[] }[];
  faq: { q: string; a: string }[];
}
export type GuideTranslations = Record<string, GuideTranslation>;

/**
 * The regional translations of every guide for one locale, loaded on demand
 * (one chunk per locale, so the other locales' text is never parsed).
 */
export async function guideTranslations(locale: Locale): Promise<GuideTranslations> {
  if (locale === "en" || locale === "hi") return {};
  try {
    return (await import(`@/content/guides/i18n/${locale}.json`)).default as GuideTranslations;
  } catch {
    return {};
  }
}

/** Guides are written in Hindi and English; other locales read their translation, else the English. */
export const guideLang = (locale: Locale): "hi" | "en" => (locale === "hi" ? "hi" : "en");

/** The guide in one language, with section sources resolved. Pass the locale's translations for regional locales. */
export function localizeGuide(g: Guide, locale: Locale, translations: GuideTranslations = {}) {
  const tr = translations[g.slug];
  const l = guideLang(locale);
  const pick = (o: Guide, k: "title" | "description" | "lead") => (o as unknown as Record<string, string>)[`${k}_${l}`];
  const base = {
    lang: l as string,
    translated: l === "hi" || locale === "en",
    title: pick(g, "title"),
    description: pick(g, "description"),
    lead: pick(g, "lead"),
    facts: (g.facts ?? []).map((f) => ({ icon: f.icon, label: l === "hi" ? f.label_hi : f.label_en, value: l === "hi" ? f.value_hi : f.value_en })),
    sections: g.sections.map((s) => ({
      id: s.id,
      heading: l === "hi" ? s.heading_hi : s.heading_en,
      body: l === "hi" ? s.body_hi : s.body_en,
      list: (l === "hi" ? s.list_hi : s.list_en) ?? [],
      unconfirmed: !!s.unconfirmed,
      sources: (s.sources ?? []).map((i) => ({ n: i + 1, ...g.sources[i] })).filter((s) => s.url),
    })),
    faq: g.faq.map((f) => ({ q: l === "hi" ? f.q_hi : f.q_en, a: l === "hi" ? f.a_hi : f.a_en })),
  };
  if (!tr) return base;
  // A regional translation replaces the text field by field; anything missing stays English.
  return {
    ...base,
    lang: locale as string,
    translated: true,
    title: tr.title || base.title,
    description: tr.description || base.description,
    lead: tr.lead || base.lead,
    facts: base.facts.map((f, i) => ({ ...f, label: tr.facts?.[i]?.label || f.label, value: tr.facts?.[i]?.value || f.value })),
    sections: base.sections.map((s, i) => {
      const t = tr.sections?.[i];
      return t ? { ...s, heading: t.heading || s.heading, body: t.body?.length === s.body.length ? t.body : s.body, list: t.list?.length === s.list.length ? t.list : s.list } : s;
    }),
    faq: base.faq.map((f, i) => ({ q: tr.faq?.[i]?.q || f.q, a: tr.faq?.[i]?.a || f.a })),
  };
}

/** The guide's own photo (`photo`), else its first related festival, place or project that has one. */
export function guidePhoto(g: Guide, locale: Locale) {
  if (g.photo) {
    const own = getPhoto(g.photo, locale);
    if (own) return own;
  }
  for (const kind of ["festivals", "places", "projects"] as const) {
    for (const id of g.related[kind] ?? []) {
      const p = getPhoto(`${kind}/${id}`, locale);
      if (p) return p;
    }
  }
  return null;
}

/** Guides that list this page among their related pages (for the reverse links). */
export const guidesFor = (kind: Kind, id: string) => guides.filter((g) => g.related[kind]?.includes(id));
