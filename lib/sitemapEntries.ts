import photos from "@/content/photos.json";
import { locales } from "@/lib/i18n/locales";
import { SLUGS, type Kind } from "@/lib/pages";

export interface SitemapPage {
  /** Locale-less path: "" for home */
  path: string;
  priority: number;
  changeFrequency: "weekly" | "monthly";
  /** Photo keys (content/photos.json) shown on the page */
  photoKeys: string[];
}

const PHOTO_KEYS = Object.keys(photos);
const kindPhoto = (kind: Kind, slug: string) => (PHOTO_KEYS.includes(`${kind}/${slug}`) ? [`${kind}/${slug}`] : []);

/** Every page of the site once (locale-less), with the photos it shows. */
export function sitemapPages(): SitemapPage[] {
  const home: SitemapPage = { path: "", priority: 1, changeFrequency: "weekly", photoKeys: PHOTO_KEYS };
  const items = (Object.keys(SLUGS) as Kind[]).flatMap((kind) =>
    SLUGS[kind].map((slug) => ({
      path: `/${kind}/${slug}`,
      priority: kind === "places" ? 0.8 : 0.7,
      changeFrequency: (kind === "projects" || kind === "festivals" ? "weekly" : "monthly") as SitemapPage["changeFrequency"],
      photoKeys: kindPhoto(kind, slug),
    })),
  );
  return [home, ...items, { path: "/credits", priority: 0.3, changeFrequency: "monthly", photoKeys: [] }];
}

export const LOCALE_LIST = locales;
export const PHOTOS = photos as Record<string, { src: string; widths: number[] }>;
