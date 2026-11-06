import type { Locale } from "@/lib/i18n/locales";

/**
 * Locales that search engines may index. A locale left out stays fully usable
 * but carries `noindex, follow`, is left out of both sitemaps, and gets no
 * hreflang links (README → "Indexing a locale"). All 13 are indexed since
 * 6 Nov 2026, at the owner's request, before the native-speaker review in
 * TRANSLATION_REVIEW.md; until 6 Nov only hi and en were.
 */
// Written out (not `locales`): scripts/check-seo.mjs reads this literal.
export const INDEXED_LOCALES = ["hi", "en", "ta", "te", "kn", "ml", "bn", "or", "as", "mr", "gu", "pa", "sa"] as const satisfies readonly Locale[];

/** Where x-default points (must be an indexed locale). */
export const DEFAULT_INDEXED_LOCALE: Locale = "en";

export const isIndexed = (locale: string): boolean => (INDEXED_LOCALES as readonly string[]).includes(locale);
