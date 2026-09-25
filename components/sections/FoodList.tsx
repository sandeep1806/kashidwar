"use client";

import StaggerCards from "@/components/motion/StaggerCards";
import type { Food } from "@/lib/contentTypes";

export interface FoodItem extends Food {
  primaryName: string;
  secondaryName: string;
  typeLabel: string;
}

export default function FoodList({ items, labels }: { items: FoodItem[]; labels: { season: string; where: string; veg: string } }) {
  return (
    <StaggerCards className="container-kashi mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((f) => (
        <article key={f.id} className="flex flex-col rounded-kashi border border-kashi-rudraksha/60 bg-kashi-indigo/40 p-5 transition-[translate,border-color] duration-500 ease-enter hover:-translate-y-1 hover:border-kashi-diya/50">
          <div className="flex items-center gap-2 text-[0.7rem]">
            <span className="rounded-full border border-kashi-diya/40 px-2 py-0.5 text-kashi-diya">{f.typeLabel}</span>
            {f.vegetarian && (
              <span className="inline-flex items-center gap-1 text-kashi-ash/70">
                <span aria-hidden="true" className="inline-block h-2.5 w-2.5 rounded-[2px] border border-green-500/80 p-px"><span className="block h-full w-full rounded-full bg-green-500/80" /></span>
                {labels.veg}
              </span>
            )}
          </div>
          <h3 className="mt-3 text-[1.25rem] leading-snug text-kashi-white">{f.primaryName}</h3>
          <p className="text-sm text-kashi-ash/70">{f.secondaryName}</p>
          <p className="mt-3 text-sm text-kashi-ash/90">{f.summary}</p>
          <dl className="mt-4 space-y-2 text-xs">
            <div>
              <dt className="uppercase tracking-[0.18em] text-kashi-diya/80">{labels.season}</dt>
              <dd className="mt-0.5 text-kashi-ash/85">{f.season}</dd>
            </div>
            <div>
              <dt className="uppercase tracking-[0.18em] text-kashi-diya/80">{labels.where}</dt>
              <dd className="mt-0.5 text-kashi-ash/85">{(Array.isArray(f.where) ? f.where : [f.where]).join(" · ")}</dd>
            </div>
          </dl>
        </article>
      ))}
    </StaggerCards>
  );
}
