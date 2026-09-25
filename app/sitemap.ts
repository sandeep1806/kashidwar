import type { MetadataRoute } from "next";
import { languageAlternates } from "@/lib/pages";
import { INDEXED_LOCALES } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import { sitemapPages } from "@/lib/sitemapEntries";

/**
 * Every page (home, places, festivals, projects, itineraries, credits) in the
 * indexed locales (lib/seo.ts), each with hreflang alternates for the other
 * indexed locale(s) and x-default → English. Photos: /sitemap-images.xml.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return sitemapPages().flatMap((page) => {
    const languages = Object.fromEntries(Object.entries(languageAlternates(page.path)).map(([k, v]) => [k, `${SITE_URL}${v}`]));
    return INDEXED_LOCALES.map((l) => ({
      url: `${SITE_URL}/${l}${page.path}`,
      lastModified,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: { languages },
    }));
  });
}

