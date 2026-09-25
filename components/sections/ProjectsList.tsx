"use client";

import StaggerCards from "@/components/motion/StaggerCards";
import CardPhoto from "@/components/ui/CardPhoto";
import type { PhotoData, Project, ProjectStatus } from "@/lib/contentTypes";

export interface ProjectItem extends Pick<Project, "id" | "status" | "type" | "agency" | "timeline" | "summary" | "verified" | "lastVerified"> {
  sources: { title: string; url: string }[];
  primaryName: string;
  secondaryName: string;
  lastVerifiedLabel: string;
  photo: PhotoData | null;
}
export interface ProjectLabels {
  groups: Record<ProjectStatus, string>;
  types: Record<string, string>;
  agency: string;
  timeline: string;
  sources: string;
  lastVerified: string;
  unverified: string;
}

/** Status badge per DESIGN.md: Completed = gold, Under construction = saffron pulse, Announced = ash outline. */
export function StatusBadge({ status, label }: { status: ProjectStatus; label: string }) {
  const cls =
    status === "completed"
      ? "bg-kashi-diya text-kashi-night"
      : status === "under_construction"
        ? "border border-kashi-saffron text-kashi-marigold"
        : "border border-kashi-ash/40 text-kashi-ash/80";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.7rem] font-medium tracking-wide ${cls}`}>
      {status === "under_construction" && <span aria-hidden="true" className="status-pulse h-1.5 w-1.5 rounded-full bg-kashi-saffron" />}
      {label}
    </span>
  );
}

/** Client-rendered so the card markup is not serialised per project in the RSC payload. */
export default function ProjectsList({ groups, labels }: { groups: { status: ProjectStatus; items: ProjectItem[] }[]; labels: ProjectLabels }) {
  return (
    <>
      {groups.map((g) => (
        <div key={g.status} className="container-kashi mt-14">
          <h3 className="mb-6 flex items-center gap-4 text-h3 text-kashi-white">
            <span>{labels.groups[g.status]}</span>
            <span aria-hidden="true" className="h-px flex-1 bg-gradient-to-r from-kashi-diya/40 to-transparent" />
          </h3>
          <StaggerCards className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {g.items.map((p) => (
              <article key={p.id} className="group grain relative flex flex-col rounded-kashi border border-kashi-rudraksha/60 bg-kashi-indigo/40 p-6 transition-[translate,border-color,box-shadow] duration-500 ease-enter hover:-translate-y-1 hover:border-kashi-diya/50 hover:shadow-glow">
                <CardPhoto photo={p.photo} className="-mx-3 -mt-3 mb-5" />
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={p.status} label={labels.groups[p.status]} />
                  <span className="rounded-full bg-kashi-rudraksha/50 px-2 py-0.5 text-[0.7rem] text-kashi-ash/80">{labels.types[p.type]}</span>
                </div>
                <h4 className="mt-4 text-[1.3rem] leading-snug text-kashi-white">{p.primaryName}</h4>
                <p className="text-sm text-kashi-ash/70">{p.secondaryName}</p>
                <p className="mt-4 text-kashi-ash/90">{p.summary}</p>
                <dl className="mt-5 space-y-3 text-sm">
                  <div>
                    <dt className="text-[0.65rem] uppercase tracking-[0.2em] text-kashi-diya/80">{labels.agency}</dt>
                    <dd className="mt-0.5 text-kashi-ash/85">{p.agency}</dd>
                  </div>
                  <div>
                    <dt className="text-[0.65rem] uppercase tracking-[0.2em] text-kashi-diya/80">{labels.timeline}</dt>
                    <dd className="mt-0.5 text-kashi-ash/85">{p.timeline}</dd>
                  </div>
                </dl>
                <footer className="mt-auto pt-5 text-xs text-kashi-ash/60">
                  {!p.verified && <p className="mb-2 text-kashi-marigold/90">⚠ {labels.unverified}</p>}
                  <p>
                    {labels.sources}:{" "}
                    {p.sources.map((s, i) => (
                      <span key={s.url}>
                        {i > 0 && " · "}
                        <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline decoration-kashi-diya/40 underline-offset-2 hover:text-kashi-diya">
                          {s.title}
                        </a>
                      </span>
                    ))}
                  </p>
                  <p className="mt-1">
                    {labels.lastVerified}: <time dateTime={p.lastVerified}>{p.lastVerifiedLabel}</time>
                  </p>
                </footer>
              </article>
            ))}
          </StaggerCards>
        </div>
      ))}
    </>
  );
}
