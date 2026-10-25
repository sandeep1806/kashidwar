import type { Locale } from "@/lib/i18n/locales";
import { ADSENSE_CLIENT } from "@/lib/site";

/**
 * Locales whose pages may carry AdSense code: the languages Google Publisher Products
 * support (support.google.com/adsense/answer/9727, checked 25 Oct 2026). Odia, Assamese
 * and Sanskrit are not supported, and "placing Google ad code on pages with content
 * primarily in an unsupported language is not permitted", so `or`, `as` and `sa` never
 * get the script or the account meta tag.
 */
export const AD_LOCALES: readonly Locale[] = ["hi", "en", "ta", "te", "kn", "ml", "bn", "mr", "gu", "pa"];

/**
 * Pages that are mostly navigation, a tool or a notice (Google: no ads on screens
 * "without publisher-content or with low-value content"). Matched on the path after the locale.
 */
export const NO_AD_PATHS = [/^\/map(\/|$)/, /^\/credits(\/|$)/, /^\/privacy(\/|$)/];

/** True when this locale may load AdSense at all (decided on the server, so other locales never ship the code). */
export const adsForLocale = (locale: string) => !!ADSENSE_CLIENT && (AD_LOCALES as readonly string[]).includes(locale);
