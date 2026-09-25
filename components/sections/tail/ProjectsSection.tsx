"use client";

import Reveal from "@/components/motion/Reveal";
import type { ProjectsProps } from "@/lib/sectionProps";
import ProjectsList, { StatusBadge } from "../ProjectsList";

export default function ProjectsSection({ legend, latestLabel, groups, labels, order }: ProjectsProps) {
  return (
    <>
      <Reveal className="container-kashi text-center">
        <p className="flex flex-wrap items-center justify-center gap-3 text-xs text-kashi-ash/60">
          <span className="uppercase tracking-[0.2em]">{legend}:</span>
          {order.map((s) => (
            <StatusBadge key={s} status={s} label={labels.groups[s]} />
          ))}
          <span>· {labels.lastVerified}: {latestLabel}</span>
        </p>
      </Reveal>
      <ProjectsList groups={groups} labels={labels} />
    </>
  );
}
