import ArtFallback from "@/components/ui/ArtFallback";
import Photo from "@/components/ui/Photo";
import type { Faith, PhotoData } from "@/lib/contentTypes";

/**
 * A row of four small arch photos under a listing page's title: what the
 * list below looks like, before any reading. Decorative (empty alt): the
 * cards underneath name every place. Hook-free, renders inside <Static>.
 */
export default function PhotoBand({ photos, faith = "secular" }: { photos: (PhotoData | null)[]; faith?: Faith }) {
  const list = photos.slice(0, 4);
  if (!list.some(Boolean)) return null;
  return (
    <ul className="photo-band mx-auto mt-10 grid max-w-4xl grid-cols-4 gap-2 sm:gap-4" aria-hidden="true">
      {list.map((p, i) => (
        <li key={i} className="arch relative aspect-[4/5] overflow-hidden border border-kashi-rudraksha/50 bg-kashi-indigo sm:aspect-[4/3]">
          {p ? <Photo photo={{ ...p, note: undefined }} sizes={[["(min-width: 896px)", "208px", 4 / 3], ["(min-width: 640px)", "22vw", 4 / 3], [null, "22vw", 4 / 5]]} decorative priority={i < 2} /> : <ArtFallback faith={faith} glyphOnly />}
        </li>
      ))}
    </ul>
  );
}
