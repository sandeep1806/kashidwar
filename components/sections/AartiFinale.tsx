import Reveal from "@/components/motion/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import Static from "@/components/ui/Static";
import type { Locale } from "@/lib/i18n/locales";
import { getFinaleProps } from "@/lib/sectionProps";
import FinaleSection from "./tail/FinaleSection";

/** The end of the journey (DESIGN.md → Aarti finale). Lamps render with the page; only the flicker waits for GSAP. */
export default async function AartiFinale({ locale }: { locale: Locale }) {
  const props = await getFinaleProps(locale);
  return (
    <section id="aarti" aria-labelledby="aarti-title" className="aarti cv-section relative isolate overflow-hidden pb-24 pt-[18vh] text-center scroll-mt-4">
      <Static>
      <div aria-hidden="true" className="aarti-glow pointer-events-none absolute inset-x-0 bottom-0 h-[70%]" />
      <div className="container-kashi relative">
        <SectionHeading id="aarti-title" locale={locale} title={props.heading.title} secondary={props.heading.secondary} />
        <Reveal>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-kashi-ash/90">{props.heading.intro}</p>
        </Reveal>
      </div>
      </Static>
      <FinaleSection {...props} />
    </section>
  );
}
