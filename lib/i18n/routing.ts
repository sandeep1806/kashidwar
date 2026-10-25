import { defineRouting } from "next-intl/routing";
import { defaultLocale, locales } from "./locales";

export const routing = defineRouting({
  locales,
  defaultLocale,
  // Always prefix so every locale has a canonical URL (/hi, /en, /ta …).
  localePrefix: "always",
  // No hreflang `Link` response header: it listed all 13 locales (11 are noindex) and
  // x-default → "/", contradicting the <link rel="alternate"> tags in the HTML (lib/seo.ts).
  alternateLinks: false,
});
