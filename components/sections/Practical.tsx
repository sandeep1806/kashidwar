import Reveal from "@/components/motion/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import type { Locale } from "@/lib/i18n/locales";
import { getPracticalProps } from "@/lib/sectionProps";
import PracticalSection from "./tail/PracticalSection";

export default async function Practical({ locale }: { locale: Locale }) {
  const props = await getPracticalProps(locale);
  return (
    <section id="practical" aria-labelledby="practical-title" className="cv-section section-kashi scroll-mt-4">
      <div className="container-kashi text-center">
        <SectionHeading id="practical-title" locale={locale} title={props.heading.title} secondary={props.heading.secondary} />
        <Reveal>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-kashi-ash/90">{props.heading.intro}</p>
        </Reveal>
      </div>
      <PracticalSection {...props} />
    </section>
  );
}
