import Reveal from "@/components/motion/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import type { Locale } from "@/lib/i18n/locales";
import { getFaithsProps } from "@/lib/sectionProps";
import FaithTiles from "./FaithTiles";

/** One Kashi, every faith — server-rendered so the verses and essences are in the HTML. */
export default async function Faiths({ locale }: { locale: Locale }) {
  const { heading, order, tiles, labels } = await getFaithsProps(locale);
  return (
    <section id="faiths" aria-labelledby="faiths-title" className="cv-section section-kashi scroll-mt-4">
      <div className="container-kashi text-center">
        <SectionHeading id="faiths-title" locale={locale} title={heading.title} secondary={heading.secondary} />
        <Reveal>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-kashi-ash/90">{heading.intro}</p>
          <p className="mt-3 text-xs uppercase tracking-[0.2em] text-kashi-diya/80">{order}</p>
        </Reveal>
      </div>
      <FaithTiles tiles={tiles} labels={labels} />
    </section>
  );
}
