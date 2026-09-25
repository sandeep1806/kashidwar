import { getTranslations } from "next-intl/server";
import Reveal from "@/components/motion/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import type { Locale } from "@/lib/i18n/locales";
import AartiFlames from "./AartiFlames";

/** The end of the journey: the Ganga Aarti blazes (DESIGN.md → Aarti finale). */
export default async function AartiFinale({ locale }: { locale: Locale }) {
  const t = await getTranslations("finale");
  return (
    <section id="aarti" aria-labelledby="aarti-title" className="aarti relative isolate overflow-hidden pb-24 pt-[18vh] text-center">
      <div aria-hidden="true" className="aarti-glow pointer-events-none absolute inset-x-0 bottom-0 h-[70%]" />
      <div className="container-kashi relative">
        <SectionHeading id="aarti-title" locale={locale} title={t("title")} secondary={t("titleSecondary")} />
        <Reveal>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-kashi-ash/90">{t("text")}</p>
        </Reveal>
      </div>
      <div className="relative mt-16">
        <AartiFlames />
        <div aria-hidden="true" className="mx-auto mt-0 h-px w-3/4 max-w-3xl bg-gradient-to-r from-transparent via-kashi-diya/70 to-transparent" />
      </div>
      <Reveal>
        <p className="mt-14 font-display text-2xl text-kashi-diya text-glow">{t("closing")}</p>
        <p className="mt-2 text-sm text-kashi-ash/60">{t("closingSecondary")}</p>
      </Reveal>
    </section>
  );
}
