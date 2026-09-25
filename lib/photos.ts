// Server-side only: imports every photo record. Client components receive PhotoData via props.
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

export function photoAlt(key: string, locale: string): string | null {
  const a = ALL[key]?.alt;
  return a ? (a[locale] ?? a.en ?? null) : null;
}
