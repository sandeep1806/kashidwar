import Reveal from "@/components/motion/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import type { Locale } from "@/lib/i18n/locales";
import { getItinerariesProps } from "@/lib/sectionProps";
import ItinerariesSection from "./tail/ItinerariesSection";

export default async function Itineraries({ locale }: { locale: Locale }) {
  const props = await getItinerariesProps(locale);
  return (
    <section id="itineraries" aria-labelledby="itineraries-title" className="cv-section section-kashi scroll-mt-4">
      <div className="container-kashi text-center">
        <SectionHeading id="itineraries-title" locale={locale} title={props.heading.title} secondary={props.heading.secondary} />
        <Reveal>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-kashi-ash/90">{props.heading.intro}</p>
        </Reveal>
      </div>
      <ItinerariesSection {...props} />
    </section>
  );
}
