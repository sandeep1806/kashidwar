import Reveal from "@/components/motion/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import type { Locale } from "@/lib/i18n/locales";
import { getFoodProps } from "@/lib/sectionProps";
import EnglishNote from "@/components/ui/EnglishNote";
import FoodList from "./FoodList";

export default async function Food({ locale }: { locale: Locale }) {
  const { heading, items, labels, englishNote } = await getFoodProps(locale);
  return (
    <section id="food" aria-labelledby="food-title" className="cv-section section-kashi scroll-mt-4">
      <div className="container-kashi text-center">
        <SectionHeading id="food-title" locale={locale} title={heading.title} secondary={heading.secondary} />
        <Reveal>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-kashi-ash/90">{heading.intro}</p>
          {englishNote && <EnglishNote text={englishNote} className="mt-3" />}
        </Reveal>
      </div>
      <FoodList items={items} labels={labels} />
    </section>
  );
}
