"use client";

import StaggerCards from "@/components/motion/StaggerCards";
import FaithGlyph from "@/components/ui/FaithGlyph";
import type { FaithEntry } from "@/lib/contentTypes";

export interface FaithTile extends FaithEntry {
  name: string;
  essence: string;
  translation: string;
  siteNames: string[];
}

export default function FaithTiles({ tiles, labels }: { tiles: FaithTile[]; labels: { verseLabel: string; seePlaces: string } }) {
  return (
    <StaggerCards className="container-kashi mt-14 flex flex-wrap justify-center gap-5">
      {tiles.map((f) => (
        <article key={f.id} className="faith-tile grain relative flex w-full flex-col rounded-kashi border border-kashi-rudraksha/60 bg-kashi-indigo/40 p-6 sm:w-[calc(50%-0.625rem)] lg:w-[calc(25%-0.9375rem)]">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full border border-kashi-diya/40 text-kashi-diya">
              <FaithGlyph faith={f.id} className="h-6 w-6" />
            </span>
            <h3 className="text-[1.35rem] text-kashi-white">{f.name}</h3>
          </div>
          <p className="mt-4 text-kashi-ash/90">{f.essence}</p>
          <figure className="mt-5 border-t border-kashi-diya/20 pt-4">
            <figcaption className="text-[0.65rem] uppercase tracking-[0.2em] text-kashi-diya/70">{labels.verseLabel}</figcaption>
            <blockquote className="mt-2">
              <p lang={f.verse.lang} dir={f.verse.dir} className="font-display text-xl leading-snug text-kashi-white">{f.verse.original}</p>
              <p className="mt-1 text-sm italic text-kashi-ash/75">{f.verse.transliteration}</p>
              <p className="mt-1 text-sm text-kashi-ash/90">{f.translation}</p>
              <cite className="mt-1 block text-xs not-italic text-kashi-diya/70">{f.verse.attribution}</cite>
            </blockquote>
          </figure>
          <ul className="mt-5 flex flex-wrap gap-x-3 gap-y-1 text-sm text-kashi-ash/80">
            {f.siteNames.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
          <a href={`#places/${f.filter}`} className="mt-auto inline-flex items-center gap-2 pt-5 text-sm text-kashi-diya underline decoration-kashi-diya/40 underline-offset-4 transition-colors hover:text-kashi-marigold">
            {labels.seePlaces}
            <span aria-hidden="true">→</span>
          </a>
        </article>
      ))}
    </StaggerCards>
  );
}
