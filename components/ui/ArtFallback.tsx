import type { Faith, PlaceType } from "@/lib/contentTypes";
import FaithGlyph from "./FaithGlyph";
import PlaceArt from "./PlaceArt";

/**
 * Styled placeholder for a photo frame with no photo: a faith-tinted gradient,
 * the place-type silhouette when known, and the faith glyph. Marked with
 * `data-art-fallback` so scripts/check-seo.mjs can verify that no arch frame
 * is ever rendered empty.
 */
export default function ArtFallback({ faith, type, glyphOnly = false }: { faith: Faith; type?: PlaceType; glyphOnly?: boolean }) {
  return (
    <div data-art-fallback="" className={`place-art place-art-${faith} relative flex h-full w-full items-center justify-center`}>
      {type && !glyphOnly ? (
        <>
          <PlaceArt type={type} className="h-3/5 w-3/5 text-kashi-diya/75" />
          <FaithGlyph faith={faith} className="absolute right-3 top-3 h-5 w-5 text-kashi-diya/60 sm:h-6 sm:w-6" />
        </>
      ) : (
        <FaithGlyph faith={faith} className="h-1/3 w-1/3 text-kashi-diya/70" />
      )}
    </div>
  );
}
