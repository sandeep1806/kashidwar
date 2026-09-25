import type { PhotoData } from "@/lib/contentTypes";
import Photo from "./Photo";

/** Arch-framed photo at the top of a text card; renders nothing without a photo. */
export default function CardPhoto({ photo, className = "" }: { photo?: PhotoData | null; className?: string }) {
  if (!photo) return null;
  return (
    <div className={`arch relative aspect-[16/10] overflow-hidden ${className}`}>
      <Photo
        photo={photo}
        sizes="(min-width: 1280px) 380px, (min-width: 768px) 45vw, 92vw"
        className="photo-zoom"
      />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-kashi-night/70 to-transparent" />
    </div>
  );
}
