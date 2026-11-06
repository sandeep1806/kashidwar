import type { ContentSection } from "@/lib/contentTypes";

/**
 * Visitor sections ("details") for festival, project and place pages, kept out of the main
 * content files: those are bundled into every server function (route handlers, sitemaps),
 * while these files are imported only here, and this module only by the three detail pages.
 * That keeps the Worker under Cloudflare's size limit (it went over on 6 Nov 2026).
 * content/details/<locale>.json: { places | festivals | projects: { <id>: ContentSection[] } }.
 */
type Kind = "places" | "festivals" | "projects";
type DetailsFile = Partial<Record<Kind, Record<string, ContentSection[]>>>;

const cache = new Map<string, Promise<DetailsFile>>();

function load(locale: string): Promise<DetailsFile> {
  let p = cache.get(locale);
  if (!p) {
    p = import(`@/content/details/${locale}.json`).then((m) => m.default as DetailsFile).catch(() => ({}));
    cache.set(locale, p);
  }
  return p;
}

/**
 * The entry's sections in the locale, falling back to English as a whole when the locale has
 * none (never mixed section by section). `translated` is false when the English was used.
 */
export async function getDetails(locale: string, kind: Kind, id: string): Promise<{ details?: ContentSection[]; translated: boolean }> {
  const own = (await load(locale))[kind]?.[id];
  if (own?.length) return { details: own, translated: true };
  const en = locale === "en" ? undefined : (await load("en"))[kind]?.[id];
  return { details: en, translated: locale === "en" };
}
