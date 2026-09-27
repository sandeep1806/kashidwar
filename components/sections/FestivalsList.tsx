import Reveal from "@/components/motion/Reveal";
import StaggerCards from "@/components/motion/StaggerCards";
import CardPhoto from "@/components/ui/CardPhoto";
import FaithGlyph from "@/components/ui/FaithGlyph";
import FestivalDateLine from "@/components/ui/FestivalDateLine";
import SeeAll from "@/components/ui/SeeAll";
import { metaDescription } from "@/lib/pages";
import type { FestivalDateView } from "@/lib/festivalDates";
import type { Faith, Festival, PhotoData } from "@/lib/contentTypes";

export interface FestivalItem extends Pick<Festival, "id" | "months" | "when" | "where" | "summary"> {
  primaryName: string;
  secondaryName: string;
  glyph: Faith;
  href: string;
  /** Next / expected / last date, built on the server */
  date: FestivalDateView;
  photo: PhotoData | null;
}

/**
 * `compact`: the festivals page, where each card is a photo, name, next date
 * and a short summary (first sentences, clamped to two lines) linking to the
 * festival's own page, which carries the full text. The long parts are not
 * rendered at all, which keeps that page's HTML small.
 *
 * `carousel`: the home page, where phones and tablets get a snap carousel of
 * compact cards and a "See all" link to the festivals page (which renders the
 * full grid).
 */
export default function FestivalsList({ items, months, labels, carousel, compact: compactProp = false }: { items: FestivalItem[]; months: string[]; labels: { when: string; where: string; lunarNote: string; readMore: string; nextUp: string; all: string }; carousel?: { href: string; label: string }; compact?: boolean }) {
  // Under the home page's section H2 the cards are H3; on the festivals page, under its H1, H2.
  const H = carousel ? "h3" : "h2";
  // Home cards are compact too: photo, name, next date, two-line summary, link.
  const compact = compactProp || !!carousel;
  return (
    <>
      <Reveal className="container-kashi mt-12">
        {/* Each month is a link: <HashLinks> scrolls here, <FestivalMonthFilter> filters the cards. */}
        <ol data-hash-target="" className="grid grid-cols-6 gap-1 sm:grid-cols-12" aria-label={labels.when}>
          {months.map((m, i) => {
            const here = items.filter((f) => f.months.includes(i + 1));
            const body = (
              <>
                <span className="text-[0.65rem] uppercase tracking-[0.15em] text-kashi-ash/60">{m}</span>
                <span className="flex h-5 items-end gap-0.5" aria-hidden="true">
                  {here.map((f) => (
                    <span key={f.id} className="h-2 w-2 rounded-full bg-kashi-diya shadow-glow" />
                  ))}
                </span>
                <span className="sr-only">{here.map((f) => f.primaryName).join(", ")}</span>
              </>
            );
            return (
              <li key={m}>
                {here.length ? (
                  <a href={`#festivals/${i + 1}`} data-month={i + 1} data-month-name={m} className="month-cell flex h-full flex-col items-center gap-2 rounded-kashi border border-kashi-rudraksha/40 px-1 py-3 text-center transition-colors duration-300 hover:border-kashi-marigold/70 aria-[current]:border-kashi-saffron aria-[current]:bg-kashi-saffron/15">
                    {body}
                  </a>
                ) : (
                  <span className="flex h-full flex-col items-center gap-2 rounded-kashi border border-kashi-rudraksha/20 px-1 py-3 text-center opacity-60">{body}</span>
                )}
              </li>
            );
          })}
        </ol>
        <p data-month-status="" hidden aria-live="polite" className="mt-4 text-center text-sm">
          <span data-month-name="" className="mr-3 rounded-full bg-kashi-saffron/15 px-3 py-1 text-kashi-white" />
          <a href="#festivals/all" className="inline-flex min-h-11 items-center rounded-full border border-kashi-diya/40 px-4 text-kashi-diya transition-colors hover:border-kashi-marigold hover:text-kashi-marigold">
            {labels.all}
          </a>
        </p>
        <p className="mt-3 text-center text-xs text-kashi-ash/60">{labels.lunarNote}</p>
      </Reveal>

      <div className="container-kashi mt-12">
      <StaggerCards className={carousel ? "carousel-sm grid gap-6 md:grid-cols-2 xl:grid-cols-3" : "grid gap-6 md:grid-cols-2 xl:grid-cols-3"} data-carousel={carousel ? "" : undefined}>
        {items.map((f, i) => {
          // Badge the soonest festival with a confirmed date (not an "expected month").
          const nextUp = f.id === items.find((x) => x.date.featured.kind !== "expected")?.id;
          return (
          <article key={f.id} id={carousel ? undefined : f.id} data-festival-card="" data-months={f.months.join(" ")} data-next-up={nextUp ? "" : undefined} className={`group grain relative flex flex-col rounded-kashi border bg-kashi-indigo/40 p-6 card-lift ${nextUp ? "border-kashi-diya/60 shadow-glow" : "border-kashi-rudraksha/60"}`}>
            {nextUp && (
              <span className="absolute right-4 top-4 z-[2] rounded-full bg-kashi-saffron px-3 py-1 text-xs font-medium text-kashi-night">{labels.nextUp}</span>
            )}
            <CardPhoto photo={f.photo} faith={f.glyph} className="card-photo -mx-3 -mt-3 mb-5" carousel={!!carousel} priority={compactProp && i === 0} />
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full border border-kashi-diya/40 text-kashi-diya">
                <FaithGlyph faith={f.glyph} className="h-5 w-5" />
              </span>
              <div>
                <H className="text-[1.3rem] leading-snug text-kashi-white"><a href={f.href} className="hover:text-kashi-marigold">{f.primaryName}</a></H>
                <p className="text-sm text-kashi-ash/70">{f.secondaryName}</p>
              </div>
            </div>
            <FestivalDateLine view={f.date} compact className="mt-3" />
            {compact ? (
              <p className="mt-3 line-clamp-2 text-kashi-ash/90">{metaDescription(f.summary, 140)}</p>
            ) : (
              <p className="mt-4 text-kashi-ash/90">{f.summary}</p>
            )}
            {!compact && <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
              <dt className="text-kashi-diya/80">{labels.when}</dt>
              <dd className="text-kashi-ash/85">{f.when} · {f.months.map((m) => months[m - 1]).join("–")}</dd>
              <dt className="text-kashi-diya/80">{labels.where}</dt>
              <dd className="text-kashi-ash/85">{f.where}</dd>
            </dl>}
            <a href={f.href} className="mt-auto inline-flex items-center gap-2 pt-5 text-sm text-kashi-diya underline decoration-kashi-diya/40 underline-offset-4 hover:text-kashi-marigold">
              {labels.readMore}
              <span aria-hidden="true">→</span>
            </a>
          </article>
          );
        })}
      </StaggerCards>
      </div>
      {carousel && <SeeAll href={carousel.href} label={carousel.label} />}
    </>
  );
}
