// Server-side only: imports every photo record. Client components receive PhotoData via props.
import credits from "@/content/credits.json";
import notes from "@/content/i18n/photo-notes.json";
import photos from "@/content/photos.json";
import type { PhotoData } from "@/lib/contentTypes";

interface PhotoEntry extends Omit<PhotoData, "alt" | "note"> {
  alt: Record<string, string>;
  elsewhere?: "photo" | "art";
}
const NOTES = notes as Record<"photo" | "art", Record<string, string>>;
const ALL = photos as Record<string, PhotoEntry>;

/** Photo for `group/id` with alt text in the page locale (English, then Hindi, as fallbacks). */
export function getPhoto(key: string, locale: string): PhotoData | null {
  const p = ALL[key];
  if (!p) return null;
  const note = p.elsewhere ? (NOTES[p.elsewhere][locale] ?? NOTES[p.elsewhere].en) : undefined;
  return { src: p.src, widths: p.widths, width: p.width, height: p.height, blur: p.blur, alt: p.alt[locale] ?? p.alt.en ?? p.alt.hi ?? "", ...(note ? { note } : {}) };
}

/**
 * Every photo for `group/id`: the main one (`group/id`) first, then the gallery
 * extras keyed `group/id#2`, `group/id#3`, … (see scripts/optimize-images.mjs).
 */
export function getGallery(key: string, locale: string): PhotoData[] {
  return Object.keys(ALL)
    .filter((k) => k === key || k.startsWith(`${key}#`))
    .sort((a, b) => galleryIndex(a) - galleryIndex(b))
    .map((k) => getPhoto(k, locale))
    .filter((p): p is PhotoData => !!p);
}
const galleryIndex = (k: string) => Number(k.split("#")[1] ?? 1);

export interface PhotoCredit {
  author: string;
  license: string;
  source: string;
}
const CREDITS = new Map((credits as ({ key: string } & PhotoCredit)[]).map((c) => [c.key, c]));
/** Author and licence of a Commons photo (null for the owner's own photos). */
export function getCredit(key: string): PhotoCredit | null {
  const c = CREDITS.get(key);
  return c ? { author: c.author, license: c.license, source: c.source } : null;
}
/** Credits for a page's gallery, in the same order as getGallery. */
export function getGalleryCredits(key: string): (PhotoCredit | null)[] {
  return Object.keys(ALL)
    .filter((k) => k === key || k.startsWith(`${key}#`))
    .sort((a, b) => galleryIndex(a) - galleryIndex(b))
    .map(getCredit);
}

export function photoAlt(key: string, locale: string): string | null {
  const a = ALL[key]?.alt;
  return a ? (a[locale] ?? a.en ?? null) : null;
}
