import type { GuideTranslations } from "@/lib/guides";
import type { Locale } from "@/lib/i18n/locales";

/**
 * The regional translations of every guide for one locale, loaded on demand
 * (one chunk per locale, so the other locales' text is never parsed).
 * Kept out of lib/guides.ts: that module is also imported by route handlers
 * (sitemaps), and the dynamic import below pulled every locale's file into
 * their bundle too, which doubled it in the Worker (6-7 Nov 2026, size limit).
 * Import this only from pages and page components.
 */
export async function guideTranslations(locale: Locale): Promise<GuideTranslations> {
  if (locale === "en" || locale === "hi") return {};
  try {
    return (await import(`@/content/guides/i18n/${locale}.json`)).default as GuideTranslations;
  } catch {
    return {};
  }
}
