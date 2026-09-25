import Reveal from "@/components/motion/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import type { Locale } from "@/lib/i18n/locales";
import { getFestivalsProps } from "@/lib/sectionProps";
import FestivalsList from "./FestivalsList";

export default async function Festivals({ locale }: { locale: Locale }) {
  const { heading, items, months, labels } = await getFestivalsProps(locale);
  return (
    <section id="festivals" aria-labelledby="festivals-title" className="cv-section section-kashi scroll-mt-4">
      <div className="container-kashi text-center">
        <SectionHeading id="festivals-title" locale={locale} title={heading.title} secondary={heading.secondary} />
        <Reveal>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-kashi-ash/90">{heading.intro}</p>
        </Reveal>
      </div>
      <FestivalsList items={items} months={months} labels={labels} />
    </section>
  );
}
