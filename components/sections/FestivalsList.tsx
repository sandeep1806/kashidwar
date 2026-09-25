import Reveal from "@/components/motion/Reveal";
import StaggerCards from "@/components/motion/StaggerCards";
import CardPhoto from "@/components/ui/CardPhoto";
import FaithGlyph from "@/components/ui/FaithGlyph";
import type { Faith, Festival, PhotoData } from "@/lib/contentTypes";

export interface FestivalItem extends Pick<Festival, "id" | "months" | "when" | "where" | "summary"> {
  primaryName: string;
  secondaryName: string;
  glyph: Faith;
  href: string;
  photo: PhotoData | null;
}

export default function FestivalsList({ items, months, labels }: { items: FestivalItem[]; months: string[]; labels: { when: string; where: string; lunarNote: string; readMore: string } }) {
  return (
    <>
      <Reveal className="container-kashi mt-12">
        <ol className="grid grid-cols-6 gap-1 sm:grid-cols-12" aria-label={labels.when}>
          {months.map((m, i) => {
            const here = items.filter((f) => f.months.includes(i + 1));
            return (
              <li key={m} className="flex flex-col items-center gap-2 rounded-kashi border border-kashi-rudraksha/40 px-1 py-3 text-center">
                <span className="text-[0.65rem] uppercase tracking-[0.15em] text-kashi-ash/60">{m}</span>
                <span className="flex h-5 items-end gap-0.5" aria-hidden="true">
                  {here.map((f) => (
                    <span key={f.id} className="h-2 w-2 rounded-full bg-kashi-diya shadow-glow" />
                  ))}
                </span>
                <span className="sr-only">{here.map((f) => f.primaryName).join(", ")}</span>
              </li>
            );
          })}
        </ol>
        <p className="mt-3 text-center text-xs text-kashi-ash/60">{labels.lunarNote}</p>
      </Reveal>

      <StaggerCards className="container-kashi mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {items.map((f) => (
          <article key={f.id} className="group grain flex flex-col rounded-kashi border border-kashi-rudraksha/60 bg-kashi-indigo/40 p-6 transition-[border-color,box-shadow] duration-500 ease-enter hover:border-kashi-diya/50 hover:shadow-glow">
            <CardPhoto photo={f.photo} className="-mx-3 -mt-3 mb-5" />
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full border border-kashi-diya/40 text-kashi-diya">
                <FaithGlyph faith={f.glyph} className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-[1.3rem] leading-snug text-kashi-white"><a href={f.href} className="hover:text-kashi-marigold">{f.primaryName}</a></h3>
                <p className="text-sm text-kashi-ash/70">{f.secondaryName}</p>
              </div>
            </div>
            <p className="mt-4 text-kashi-ash/90">{f.summary}</p>
            <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
              <dt className="text-kashi-diya/80">{labels.when}</dt>
              <dd className="text-kashi-ash/85">{f.when} · {f.months.map((m) => months[m - 1]).join("–")}</dd>
              <dt className="text-kashi-diya/80">{labels.where}</dt>
              <dd className="text-kashi-ash/85">{f.where}</dd>
            </dl>
            <a href={f.href} className="mt-auto inline-flex items-center gap-2 pt-5 text-sm text-kashi-diya underline decoration-kashi-diya/40 underline-offset-4 hover:text-kashi-marigold">
              {labels.readMore}
              <span aria-hidden="true">→</span>
            </a>
          </article>
        ))}
      </StaggerCards>
    </>
  );
}
