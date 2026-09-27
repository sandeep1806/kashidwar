import StaggerCards from "@/components/motion/StaggerCards";
import CardPhoto from "@/components/ui/CardPhoto";
import SeeAll from "@/components/ui/SeeAll";
import type { Food, PhotoData } from "@/lib/contentTypes";

export interface FoodItem extends Pick<Food, "id" | "season" | "where" | "summary" | "vegetarian"> {
  primaryName: string;
  secondaryName: string;
  typeLabel: string;
  photo: PhotoData | null;
}

/**
 * `carousel`: the home page, where phones and tablets get a snap carousel of
 * compact cards, each linking to its entry on the food page.
 */
export default function FoodList({ items, labels, carousel }: { items: FoodItem[]; labels: { season: string; where: string; veg: string }; carousel?: { href: string; label: string } }) {
  // H3 under the home page's section H2; H2 on the food page, under its H1.
  const H = carousel ? "h3" : "h2";
  return (
    <>
    <div className="container-kashi mt-12">
    <StaggerCards className={carousel ? "carousel-sm grid gap-5 sm:grid-cols-2 lg:grid-cols-4" : "grid gap-5 sm:grid-cols-2 lg:grid-cols-4"}>
      {items.map((f) => (
        <article key={f.id} id={carousel ? undefined : f.id} className="group flex flex-col rounded-kashi border border-kashi-rudraksha/60 bg-kashi-indigo/40 p-5 card-lift">
          <CardPhoto photo={f.photo} className="card-photo -mx-2 -mt-2 mb-4" carousel={!!carousel} />
          <div className="flex items-center gap-2 text-[0.7rem]">
            <span className="rounded-full border border-kashi-diya/40 px-2 py-0.5 text-kashi-diya">{f.typeLabel}</span>
            {f.vegetarian && (
              <span className="inline-flex items-center gap-1 text-kashi-ash/70">
                <span aria-hidden="true" className="inline-block h-2.5 w-2.5 rounded-[2px] border border-green-500/80 p-px"><span className="block h-full w-full rounded-full bg-green-500/80" /></span>
                {labels.veg}
              </span>
            )}
          </div>
          <H className="mt-3 text-[1.25rem] leading-snug text-kashi-white">
            {carousel ? <a href={`${carousel.href}#${f.id}`} className="hover:text-kashi-marigold">{f.primaryName}</a> : f.primaryName}
          </H>
          <p className="text-sm text-kashi-ash/70">{f.secondaryName}</p>
          <p className="card-summary mt-3 text-sm text-kashi-ash/90">{f.summary}</p>
          <dl className="card-extra mt-4 space-y-2 text-xs">
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
    </div>
    {carousel && <SeeAll href={carousel.href} label={carousel.label} />}
    </>
  );
}
