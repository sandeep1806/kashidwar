import { getTranslations } from "next-intl/server";
import StaggerCards from "@/components/motion/StaggerCards";
import CardPhoto from "@/components/ui/CardPhoto";
import { guidePhoto, guides, localizeGuide } from "@/lib/guides";
import type { Locale } from "@/lib/i18n/locales";

/**
 * "Plan your visit": a small strip of guide cards on the home page (title,
 * one-line description, link), a snap carousel on phones. Server component,
 * rendered inside <Static>.
 */
export default async function PlanYourVisit({ locale, list = guides }: { locale: Locale; list?: typeof guides }) {
  if (!list.length) return null;
  const t = await getTranslations({ locale, namespace: "guides" });
  return (
    <section id="plan" aria-labelledby="plan-title" className="cv-auto py-16">
      <div className="container-kashi">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="plan-title" className="text-h3 text-kashi-white">{t("plan")}</h2>
            <p className="mt-2 text-sm text-kashi-ash/75">{t("planIntro")}</p>
          </div>
          <a href={`/${locale}/guides`} className="inline-flex min-h-11 items-center gap-2 text-sm text-kashi-diya underline decoration-kashi-diya/40 underline-offset-4 hover:text-kashi-marigold">
            {t("title")}
            <span aria-hidden="true">→</span>
          </a>
        </div>
        <StaggerCards className="carousel-sm mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((g) => {
            const l = localizeGuide(g, locale);
            return (
              <article key={g.slug} className="group card-lift flex flex-col rounded-kashi border border-kashi-rudraksha/60 bg-kashi-indigo/40 p-5">
                <CardPhoto photo={guidePhoto(g, locale)} className="card-photo -mx-2 -mt-2 mb-4" carousel />
                <h3 className="text-[1.2rem] leading-snug text-kashi-white" lang={l.lang}>
                  <a href={`/${locale}/guides/${g.slug}`} className="hover:text-kashi-marigold">{l.title}</a>
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-kashi-ash/85" lang={l.lang}>{l.description}</p>
                <a href={`/${locale}/guides/${g.slug}`} className="mt-auto inline-flex items-center gap-2 pt-4 text-sm text-kashi-diya underline decoration-kashi-diya/40 underline-offset-4 hover:text-kashi-marigold">
                  {t("read")}
                  <span aria-hidden="true">→</span>
                </a>
              </article>
            );
          })}
        </StaggerCards>
      </div>
    </section>
  );
}
