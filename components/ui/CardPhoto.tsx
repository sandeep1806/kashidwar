import type { Faith, PhotoData } from "@/lib/contentTypes";
import ArtFallback from "./ArtFallback";
import Photo from "./Photo";

/** Arch-framed photo at the top of a text card; the glyph placeholder when there is none. */
export default function CardPhoto({ photo, faith = "secular", className = "" }: { photo?: PhotoData | null; faith?: Faith; className?: string }) {
  return (
    <div className={`arch relative aspect-[16/10] overflow-hidden ${className}`}>
      {photo ? (
        <Photo photo={photo} sizes="(min-width: 1280px) 380px, (min-width: 768px) 45vw, 92vw" className="photo-zoom" />
      ) : (
        <ArtFallback faith={faith} />
      )}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-kashi-night/70 to-transparent" />
    </div>
  );
}
