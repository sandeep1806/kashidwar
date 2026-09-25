import type { Locale } from "@/lib/i18n/locales";

/**
 * Locales that search engines may index. The other locales stay fully usable
 * but carry `noindex, follow`, are left out of both sitemaps, and get no
 * hreflang links, until a native speaker has reviewed their machine
 * translations (see TRANSLATION_REVIEW.md, README → "Indexing a locale").
 */
export const INDEXED_LOCALES = ["hi", "en"] as const satisfies readonly Locale[];

/** Where x-default points (must be an indexed locale). */
export const DEFAULT_INDEXED_LOCALE: Locale = "en";

export const isIndexed = (locale: string): boolean => (INDEXED_LOCALES as readonly string[]).includes(locale);
