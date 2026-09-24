import { defineRouting } from "next-intl/routing";
import { defaultLocale, locales } from "./locales";

export const routing = defineRouting({
  locales,
  defaultLocale,
  // Always prefix so every locale has a canonical URL (/hi, /en, /ta …).
  localePrefix: "always",
});
