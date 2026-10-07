import photos from "@/content/photos.json";
import { guidePhoto, guides } from "@/lib/guides";
import { places } from "@/lib/content";
import { SLUGS, type Kind } from "@/lib/pages";

export interface SitemapPage {
  /** Locale-less path: "" for home */
  path: string;
  priority: number;
  changeFrequency: "weekly" | "monthly";
  /** Photo keys (content/photos.json) shown on the page */
  photoKeys: string[];
  /** ISO date the page last changed (guides); otherwise the build date is used */
  lastModified?: string;
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
  const group = (g: string) => PHOTO_KEYS.filter((k) => k.startsWith(`${g}/`));
  const listings: SitemapPage[] = (["festivals", "projects", "food"] as const).map((g) => ({
    path: `/${g}`,
    priority: 0.8,
    changeFrequency: g === "food" ? "monthly" : "weekly",
    photoKeys: group(g),
  }));
  // Place listings by type (ghats, temples): the photos of the places they list.
  const typed = (type: "ghat" | "temple") => places.filter((pl) => pl.type === type).flatMap((pl) => kindPhoto("places", pl.id));
  listings.push(
    { path: "/ghats", priority: 0.8, changeFrequency: "monthly", photoKeys: typed("ghat") },
    { path: "/temples", priority: 0.8, changeFrequency: "monthly", photoKeys: typed("temple") },
  );
  const photoKey = (g: (typeof guides)[number]) => {
    const p = guidePhoto(g, "en");
    return p ? [p.src.replace("/media/photos/", "")] : [];
  };
  const guidePages: SitemapPage[] = [
    { path: "/guides", priority: 0.8, changeFrequency: "weekly", photoKeys: [] },
    ...guides.map((g) => ({ path: `/guides/${g.slug}`, priority: 0.8, changeFrequency: "weekly" as const, photoKeys: photoKey(g), lastModified: g.updated })),
  ];
  return [
    home,
    ...listings,
    ...guidePages,
    ...items,
    { path: "/about", priority: 0.4, changeFrequency: "monthly", photoKeys: [] },
    { path: "/credits", priority: 0.3, changeFrequency: "monthly", photoKeys: [] },
  ];
}

export const PHOTOS = photos as Record<string, { src: string; widths: number[] }>;
