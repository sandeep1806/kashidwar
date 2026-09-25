import Image from "next/image";
import type { Faith, Place } from "@/lib/content";
import FaithGlyph from "./FaithGlyph";

export interface PlaceLabels {
  faiths: Record<Faith, string>;
  types: Record<string, string>;
  bestTime: string;
  openDetails: string;
}

/** Portrait 3:4 card with an arch-framed image (DESIGN.md → Place card). */
export default function PlaceCard({
  place,
  primaryName,
  secondaryName,
  hasImage,
  labels,
  onOpen,
}: {
  place: Place;
  primaryName: string;
  secondaryName: string;
  hasImage: boolean;
  labels: PlaceLabels;
  onOpen: (place: Place) => void;
}) {
  const faiths: Faith[] = place.faith.length ? place.faith : ["secular"];
  return (
    <article className="group flex flex-col">
      <button
        type="button"
        onClick={() => onOpen(place)}
        className="place-card relative flex aspect-[3/4] w-full flex-col overflow-hidden rounded-kashi border border-kashi-rudraksha/60 bg-kashi-indigo/40 text-left transition-[translate,box-shadow,border-color] duration-500 ease-enter hover:-translate-y-1.5 hover:border-kashi-diya/60 hover:shadow-glow focus-visible:-translate-y-1.5 focus-visible:border-kashi-diya"
      >
        <span className="sr-only">{labels.openDetails}: </span>
        <div className="arch relative mx-3 mt-3 aspect-[4/5] overflow-hidden">
          {hasImage ? (
            <Image
              src={place.image}
              alt=""
              fill
              sizes="(min-width: 1280px) 300px, (min-width: 768px) 33vw, 80vw"
              className="object-cover transition-transform duration-700 ease-enter group-hover:scale-105"
            />
          ) : (
            <div className={`place-art place-art-${faiths[0]} flex h-full w-full items-center justify-center`}>
              <FaithGlyph faith={faiths[0]} className="h-16 w-16 text-kashi-diya/80" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-kashi-night/80 to-transparent" />
        </div>
        <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
          <h3 className="text-[1.25rem] leading-snug text-kashi-white">{primaryName}</h3>
          <p className="mt-0.5 text-sm text-kashi-ash/70">{secondaryName}</p>
          <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-3">
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
      <p className="mt-2 flex items-start gap-2 px-1 text-xs text-kashi-ash/70">
        <span className="shrink-0 text-kashi-diya/80">{labels.bestTime}:</span>
        <span className="line-clamp-2">{place.bestTime}</span>
      </p>
    </article>
  );
}
