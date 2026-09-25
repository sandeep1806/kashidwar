import { getTranslations } from "next-intl/server";
import Reveal from "@/components/motion/Reveal";
import StaggerCards from "@/components/motion/StaggerCards";
import SectionHeading from "@/components/ui/SectionHeading";
import { foods, localize } from "@/lib/content";
import { LOCALES, type Locale } from "@/lib/i18n/locales";

export default async function Food({ locale }: { locale: Locale }) {
  const t = await getTranslations("food");
  const devanagari = LOCALES[locale].script === "devanagari";

  return (
    <section id="food" aria-labelledby="food-title" className="section-kashi scroll-mt-4">
      <div className="container-kashi text-center">
        <SectionHeading id="food-title" locale={locale} title={t("title")} secondary={t("titleSecondary")} />
        <Reveal>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-kashi-ash/90">{t("intro")}</p>
        </Reveal>
      </div>
      <StaggerCards className="container-kashi mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {foods.map((raw) => localize(raw, locale)).map((f) => (
          <article key={f.id} className="flex flex-col rounded-kashi border border-kashi-rudraksha/60 bg-kashi-indigo/40 p-5 transition-[translate,border-color] duration-500 ease-enter hover:-translate-y-1 hover:border-kashi-diya/50">
            <div className="flex items-center gap-2 text-[0.7rem]">
              <span className="rounded-full border border-kashi-diya/40 px-2 py-0.5 text-kashi-diya">{t(`types.${f.type}`)}</span>
              {f.vegetarian && (
                <span className="inline-flex items-center gap-1 text-kashi-ash/70">
                  <span aria-hidden="true" className="inline-block h-2.5 w-2.5 rounded-[2px] border border-green-500/80 p-px"><span className="block h-full w-full rounded-full bg-green-500/80" /></span>
                  {t("veg")}
                </span>
              )}
            </div>
            <h3 className="mt-3 text-[1.25rem] leading-snug text-kashi-white">{devanagari ? f.name_hi : f.name_en}</h3>
            <p className="text-sm text-kashi-ash/70">{devanagari ? f.name_en : f.name_hi}</p>
            <p className="mt-3 text-sm text-kashi-ash/90">{f.summary}</p>
            <dl className="mt-4 space-y-2 text-xs">
              <div>
                <dt className="uppercase tracking-[0.18em] text-kashi-diya/80">{t("season")}</dt>
                <dd className="mt-0.5 text-kashi-ash/85">{f.season}</dd>
              </div>
              <div>
                <dt className="uppercase tracking-[0.18em] text-kashi-diya/80">{t("where")}</dt>
                <dd className="mt-0.5 text-kashi-ash/85">{(Array.isArray(f.where) ? f.where : [f.where]).join(" · ")}</dd>
              </div>
            </dl>
          </article>
        ))}
      </StaggerCards>
    </section>
  );
}
