import type { CSSProperties } from "react";
import type { PhotoData } from "@/lib/contentTypes";

const set = (p: PhotoData, ext: string) => p.widths.map((w) => `${p.src}-${w}.${ext} ${w}w`).join(", ");
/** The WebP fallback: the smallest width of at least 720 px (or the largest there is). */
const fallbackWidth = (p: PhotoData) => p.widths.find((w) => w >= 720) ?? p.widths[p.widths.length - 1];

/**
 * One `sizes` entry: [media query or null, frame width, frame aspect (w/h)].
 * With object-fit: cover a landscape photo in a portrait frame is drawn wider
 * than the frame, so the width the browser should fetch for is the frame
 * width times (photo aspect / frame aspect).
 */
export type CoverSize = [media: string | null, width: string, aspect: number];

export function coverSizes(photo: Pick<PhotoData, "width" | "height">, entries: CoverSize[]): string {
  const ratio = photo.width / photo.height;
  return entries
    .map(([media, width, aspect]) => {
      const k = ratio / aspect;
      const w = k > 1.02 ? `calc(${width} * ${k.toFixed(2)})` : width;
      return media ? `${media} ${w}` : w;
    })
    .join(", ");
}

/**
 * Self-hosted photo as <picture>: an AVIF srcset (every current browser), and
 * for older ones a single mid-size WebP as the <img> src. One srcset instead
 * of two keeps the HTML (and its RSC copy) lighter. Lazy unless `priority`.
 * Blur-up: the tiny placeholder sits behind the photo (softened), and a lazy
 * photo fades in once it has loaded (the `is-loaded` class is set by a
 * capture-phase load listener in the layout's head snippet, so it works in
 * unhydrated markup too). Priority photos paint straight away, over the
 * placeholder, so the LCP image is never held back. Fills its positioned parent.
 */
export default function Photo({
  photo,
  sizes,
  priority = false,
  className = "",
  style,
  decorative = false,
}: {
  photo: PhotoData;
  /** A sizes string, or frame sizes to correct for object-fit: cover */
  sizes: string | CoverSize[];
  priority?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Empty alt when the caption next to the photo already says what it shows */
  decorative?: boolean;
}) {
  const s = typeof sizes === "string" ? sizes : coverSizes(photo, sizes);
  const cls = ["photo", priority ? "" : "photo-fade", className].filter(Boolean).join(" ");
  return (
    <>
      <span aria-hidden="true" className="photo-blur" style={{ backgroundImage: `url(${photo.blur})` }} />
      <picture>
        <source type="image/avif" srcSet={set(photo, "avif")} sizes={s} />
        <img
          src={`${photo.src}-${fallbackWidth(photo)}.webp`}
          alt={decorative ? "" : photo.alt}
          width={photo.width}
          height={photo.height}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          decoding="async"
          className={cls}
          style={priority ? { backgroundImage: `url(${photo.blur})`, ...style } : style}
        />
      </picture>
      {photo.note && <span className="photo-note">{photo.note}</span>}
    </>
  );
}
