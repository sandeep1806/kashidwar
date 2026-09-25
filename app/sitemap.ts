import type { MetadataRoute } from "next";
import { LOCALES, locales } from "@/lib/i18n/locales";
import { SITE_URL } from "@/lib/site";

/** One entry per locale, each carrying hreflang alternates for all the others. */
export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(locales.map((l) => [LOCALES[l].bcp47, `${SITE_URL}/${l}`]));
  languages["x-default"] = `${SITE_URL}/hi`;
  const lastModified = new Date();
  return locales.map((l) => ({
    url: `${SITE_URL}/${l}`,
    lastModified,
    changeFrequency: "weekly",
    priority: l === "hi" || l === "en" ? 1 : 0.8,
    alternates: { languages },
  }));
}
