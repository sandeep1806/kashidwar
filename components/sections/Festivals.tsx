import { getTranslations } from "next-intl/server";
import Reveal from "@/components/motion/Reveal";
import StaggerCards from "@/components/motion/StaggerCards";
import FaithGlyph from "@/components/ui/FaithGlyph";
import SectionHeading from "@/components/ui/SectionHeading";
import { festivals, type Faith } from "@/lib/content";
import { LOCALES, type Locale } from "@/lib/i18n/locales";

/** Calendar strip (12 months, lamps where festivals fall) + festival cards in month order. */
export default async function Festivals({ locale }: { locale: Locale }) {
  const t = await getTranslations("festivals");
  const months = t.raw("months") as string[];
  const devanagari = LOCALES[locale].script === "devanagari";
  const sorted = festivals.slice().sort((a, b) => Math.min(...a.months) - Math.min(...b.months));

  return (
    <section id="festivals" aria-labelledby="festivals-title" className="section-kashi scroll-mt-4">
      <div className="container-kashi text-center">
        <SectionHeading id="festivals-title" locale={locale} title={t("title")} secondary={t("titleSecondary")} />
        <Reveal>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-kashi-ash/90">{t("intro")}</p>
        </Reveal>
      </div>

      {/* Calendar strip */}
      <Reveal className="container-kashi mt-12">
        <ol className="grid grid-cols-6 gap-1 sm:grid-cols-12" aria-label={t("when")}>
          {months.map((m, i) => {
            const here = sorted.filter((f) => f.months.includes(i + 1));
            return (
              <li key={m} className="flex flex-col items-center gap-2 rounded-kashi border border-kashi-rudraksha/40 px-1 py-3 text-center">
                <span className="text-[0.65rem] uppercase tracking-[0.15em] text-kashi-ash/60">{m}</span>
                <span className="flex h-5 items-end gap-0.5" aria-hidden="true">
                  {here.map((f) => (
                    <span key={f.id} className="h-2 w-2 rounded-full bg-kashi-diya shadow-glow" />
                  ))}
                </span>
                <span className="sr-only">{here.map((f) => (devanagari ? f.name_hi : f.name_en)).join(", ")}</span>
              </li>
            );
          })}
        </ol>
        <p className="mt-3 text-center text-xs text-kashi-ash/60">{t("lunarNote")}</p>
      </Reveal>

      <StaggerCards className="container-kashi mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {sorted.map((f) => {
          const faith: Faith = f.faith[0] ?? "secular";
          return (
            <article key={f.id} className="grain flex flex-col rounded-kashi border border-kashi-rudraksha/60 bg-kashi-indigo/40 p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full border border-kashi-diya/40 text-kashi-diya">
                  <FaithGlyph faith={faith} className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-[1.3rem] leading-snug text-kashi-white">{devanagari ? f.name_hi : f.name_en}</h3>
                  <p className="text-sm text-kashi-ash/70">{devanagari ? f.name_en : f.name_hi}</p>
                </div>
              </div>
              <p className="mt-4 text-kashi-ash/90">{f.summary}</p>
              <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                <dt className="text-kashi-diya/80">{t("when")}</dt>
                <dd className="text-kashi-ash/85">{f.when} · {f.months.map((m) => months[m - 1]).join("–")}</dd>
                <dt className="text-kashi-diya/80">{t("where")}</dt>
                <dd className="text-kashi-ash/85">{f.where}</dd>
              </dl>
            </article>
          );
        })}
      </StaggerCards>
    </section>
  );
}
