import Reveal from "@/components/motion/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import type { Locale } from "@/lib/i18n/locales";
import { getProjectsProps } from "@/lib/sectionProps";
import EnglishNote from "@/components/ui/EnglishNote";
import ProjectsList, { StatusBadge } from "./ProjectsList";

export default async function Projects({ locale }: { locale: Locale }) {
  const { heading, legend, latestLabel, groups, labels, order, englishNote } = await getProjectsProps(locale);
  return (
    <section id="projects" aria-labelledby="projects-title" className="cv-section section-kashi scroll-mt-4">
      <div className="container-kashi text-center">
        <SectionHeading id="projects-title" locale={locale} title={heading.title} secondary={heading.secondary} />
        <Reveal>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-kashi-ash/90">{heading.intro}</p>
          <p className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-kashi-ash/60">
            <span className="uppercase tracking-[0.2em]">{legend}:</span>
            {order.map((s) => (
              <StatusBadge key={s} status={s} label={labels.groups[s]} />
            ))}
            <span>· {labels.lastVerified}: {latestLabel}</span>
          </p>
          {englishNote && <EnglishNote text={englishNote} className="mt-3" />}
        </Reveal>
      </div>
      <ProjectsList groups={groups} labels={labels} />
    </section>
  );
}
