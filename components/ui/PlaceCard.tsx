import type { Faith, PhotoData, PlaceLite as Place } from "@/lib/contentTypes";
import FaithGlyph from "./FaithGlyph";
import Photo from "./Photo";
import PlaceArt from "./PlaceArt";

export interface PlaceLabels {
  faiths: Record<Faith, string>;
  types: Record<string, string>;
  bestTime: string;
  openDetails: string;
}

/**
 * Portrait 3:4 card with an arch-framed image (DESIGN.md → Place card).
 * Server component: the explorer island opens it via `data-place-open`.
 */
export default function PlaceCard({
  place,
  primaryName,
  secondaryName,
  photo,
  labels,
}: {
  place: Place;
  primaryName: string;
  secondaryName: string;
  photo: PhotoData | null;
  labels: PlaceLabels;
}) {
  const faiths: Faith[] = place.faith.length ? place.faith : ["secular"];
  return (
    <article className="group flex flex-col" data-place-card="" data-type={place.type} data-faith={place.faith.join(" ")}>
      <button
        type="button"
        data-place-open={place.id}
        className="place-card relative flex w-full flex-col overflow-hidden rounded-kashi sm:aspect-[3/4] border border-kashi-rudraksha/60 bg-kashi-indigo/40 text-left transition-[translate,box-shadow,border-color] duration-500 ease-enter hover:-translate-y-1.5 hover:border-kashi-diya/60 hover:shadow-glow focus-visible:-translate-y-1.5 focus-visible:border-kashi-diya"
      >
        <span className="sr-only">{labels.openDetails}: </span>
        <div className="arch relative mx-2 mt-2 aspect-square overflow-hidden sm:mx-3 sm:mt-3 sm:aspect-[4/5]">
          {photo ? (
            <Photo
              photo={photo}
              sizes="(min-width: 1280px) 290px, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 46vw"
              className="photo-zoom"
            />
          ) : (
            <div className={`place-art place-art-${faiths[0]} relative flex h-full w-full items-center justify-center`}>
              <PlaceArt type={place.type} className="h-3/5 w-3/5 text-kashi-diya/75" />
              <FaithGlyph faith={faiths[0]} className="absolute right-3 top-3 h-5 w-5 text-kashi-diya/60 sm:h-6 sm:w-6" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-kashi-night/80 to-transparent" />
        </div>
        <div className="flex flex-1 flex-col px-3 pb-3 pt-2 sm:px-4 sm:pb-4 sm:pt-3">
          <h3 className="text-base leading-snug text-kashi-white sm:text-[1.25rem]">{primaryName}</h3>
          <p className="mt-0.5 line-clamp-1 text-xs text-kashi-ash/70 sm:text-sm">{secondaryName}</p>
          <div className="mt-auto flex flex-wrap items-center gap-1 pt-2 sm:gap-1.5 sm:pt-3">
            {faiths.map((f) => (
              <span
                key={f}
                className="inline-flex items-center gap-1 rounded-full border border-kashi-diya/40 px-2 py-0.5 text-[0.7rem] text-kashi-diya"
              >
                <FaithGlyph faith={f} className="h-3.5 w-3.5" />
                {labels.faiths[f]}
              </span>
            ))}
            <span className="rounded-full bg-kashi-rudraksha/50 px-2 py-0.5 text-[0.7rem] text-kashi-ash/80">
              {labels.types[place.type]}
            </span>
          </div>
        </div>
      </button>
      <p className="mt-2 hidden items-start gap-2 px-1 text-xs text-kashi-ash/70 sm:flex">
        <span className="shrink-0 text-kashi-diya/80">{labels.bestTime}:</span>
        <span className="line-clamp-2">{place.bestTime}</span>
      </p>
    </article>
  );
}
