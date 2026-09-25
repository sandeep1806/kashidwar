import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n/locales";
import { languageAlternates } from "@/lib/pages";
import { SITE_URL } from "@/lib/site";
import { sitemapPages } from "@/lib/sitemapEntries";

/**
 * Every page (home, places, festivals, projects, itineraries, credits) in all
 * 13 locales, each carrying hreflang alternates for the others and
 * x-default → English. Photos are listed in /sitemap-images.xml.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return sitemapPages().flatMap((page) => {
    const languages = Object.fromEntries(Object.entries(languageAlternates(page.path)).map(([k, v]) => [k, `${SITE_URL}${v}`]));
    return locales.map((l) => ({
      url: `${SITE_URL}/${l}${page.path}`,
      lastModified,
      changeFrequency: page.changeFrequency,
      priority: l === "hi" || l === "en" ? page.priority : Math.round(page.priority * 80) / 100,
      alternates: { languages },
    }));
  });
}

