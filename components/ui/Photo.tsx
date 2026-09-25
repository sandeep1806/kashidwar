import type { CSSProperties } from "react";
import type { PhotoData } from "@/lib/contentTypes";

const set = (p: PhotoData, ext: string) => p.widths.map((w) => `${p.src}-${w}.${ext} ${w}w`).join(", ");

/**
 * Self-hosted photo as <picture>: AVIF, then WebP. Lazy unless `priority`.
 * The blur placeholder is the <img> background, so it shows until the photo
 * decodes and costs no extra element or script. Fills its (positioned) parent.
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
  sizes: string;
  priority?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Empty alt when the caption next to the photo already says what it shows */
  decorative?: boolean;
}) {
  return (
    <>
    <picture>
      <source type="image/avif" srcSet={set(photo, "avif")} sizes={sizes} />
      <source type="image/webp" srcSet={set(photo, "webp")} sizes={sizes} />
      <img
        src={`${photo.src}-${photo.widths[0]}.webp`}
        alt={decorative ? "" : photo.alt}
        width={photo.width}
        height={photo.height}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        className={className ? `photo ${className}` : "photo"}
        style={{ backgroundImage: `url(${photo.blur})`, ...style }}
      />
    </picture>
    {photo.note && <span className="photo-note">{photo.note}</span>}
    </>
  );
}
