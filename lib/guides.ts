// Server-side only: imports every guide. Guides are researched articles in
// English and Hindi (content/guides/<slug>.json); other locales show English.
import devDeepawali from "@/content/guides/dev-deepawali-2026.json";
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
  sections: GuideSection[];
  faq: { q_en: string; a_en: string; q_hi: string; a_hi: string }[];
  sources: GuideSource[];
  related: Partial<Record<Kind, string[]>>;
  notes?: string;
}

/** Newest first. Add a guide by importing its JSON here. */
export const guides: Guide[] = ([devDeepawali] as Guide[]).sort((a, b) => b.published.localeCompare(a.published));

export const guideBySlug = (slug: string) => guides.find((g) => g.slug === slug);

/** Guides are written in Hindi and English; every other locale reads the English text. */
export const guideLang = (locale: Locale): "hi" | "en" => (locale === "hi" ? "hi" : "en");

/** The guide in one language, with section sources resolved. */
export function localizeGuide(g: Guide, locale: Locale) {
  const l = guideLang(locale);
  const pick = (o: Guide, k: "title" | "description" | "lead") => (o as unknown as Record<string, string>)[`${k}_${l}`];
  return {
    lang: l,
    title: pick(g, "title"),
    description: pick(g, "description"),
    lead: pick(g, "lead"),
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
}

/** A photo for the guide: its first related festival, place or project that has one. */
export function guidePhoto(g: Guide, locale: Locale) {
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
