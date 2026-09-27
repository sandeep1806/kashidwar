import type { Faith, PhotoData } from "@/lib/contentTypes";
import ArtFallback from "./ArtFallback";
import Photo, { type CoverSize } from "./Photo";

/** Arch-framed photo at the top of a text card; the glyph placeholder when there is none. */
const A = 16 / 10;
const GRID_SIZES: CoverSize[] = [["(min-width: 1280px)", "380px", A], ["(min-width: 768px)", "45vw", A], [null, "92vw", A]];
/** Home page: carousel cards (min(78vw, 340px)) below lg, the grid above. */
const CAROUSEL_SIZES: CoverSize[] = [["(min-width: 1280px)", "380px", A], ["(min-width: 1024px)", "30vw", A], ["(min-width: 436px)", "320px", A], [null, "74vw", A]];

export default function CardPhoto({ photo, faith = "secular", className = "", carousel = false, priority = false }: { photo?: PhotoData | null; faith?: Faith; className?: string; carousel?: boolean; priority?: boolean }) {
  return (
    <div className={`arch relative aspect-[16/10] overflow-hidden ${className}`}>
      {photo ? (
        <Photo photo={photo} sizes={carousel ? CAROUSEL_SIZES : GRID_SIZES} className="photo-zoom" priority={priority} />
      ) : (
        <ArtFallback faith={faith} />
      )}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-kashi-night/70 to-transparent" />
    </div>
  );
}
