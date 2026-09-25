import { getTranslations } from "next-intl/server";
import Reveal from "@/components/motion/Reveal";
import StaggerCards from "@/components/motion/StaggerCards";
import SectionHeading from "@/components/ui/SectionHeading";
import { projects, type Project, type ProjectStatus } from "@/lib/content";
import { LOCALES, type Locale } from "@/lib/i18n/locales";

const ORDER: ProjectStatus[] = ["under_construction", "announced", "completed"];

/** Status badge per DESIGN.md: Completed = gold, Under construction = saffron pulse, Announced = ash outline. */
function StatusBadge({ status, label }: { status: ProjectStatus; label: string }) {
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

export default async function Projects({ locale }: { locale: Locale }) {
  const t = await getTranslations("projects");
  const meta = LOCALES[locale];
  const devanagari = meta.script === "devanagari";
  const fmt = new Intl.DateTimeFormat(meta.bcp47, { dateStyle: "long" });
  const latest = projects.reduce((d, p) => (p.lastVerified > d ? p.lastVerified : d), "");

  const groups = ORDER.map((status) => ({ status, items: projects.filter((p) => p.status === status) })).filter((g) => g.items.length);

  return (
    <section id="projects" aria-labelledby="projects-title" className="section-kashi scroll-mt-4">
      <div className="container-kashi text-center">
        <SectionHeading id="projects-title" locale={locale} title={t("title")} secondary={t("titleSecondary")} />
        <Reveal>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-kashi-ash/90">{t("intro")}</p>
          <p className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-kashi-ash/60">
            <span className="uppercase tracking-[0.2em]">{t("legend")}:</span>
            {ORDER.map((s) => (
              <StatusBadge key={s} status={s} label={t(`groups.${s}`)} />
            ))}
            <span>· {t("lastVerified")}: {fmt.format(new Date(latest + "T00:00:00Z"))}</span>
          </p>
        </Reveal>
      </div>

      {groups.map((g) => (
        <div key={g.status} className="container-kashi mt-14">
          <h3 className="mb-6 flex items-center gap-4 text-h3 text-kashi-white">
            <span>{t(`groups.${g.status}`)}</span>
            <span aria-hidden="true" className="h-px flex-1 bg-gradient-to-r from-kashi-diya/40 to-transparent" />
          </h3>
          <StaggerCards className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {g.items.map((p) => (
              <ProjectCard key={p.id} project={p} devanagari={devanagari} t={t} fmt={fmt} />
            ))}
          </StaggerCards>
        </div>
      ))}
    </section>
  );
}

function ProjectCard({
  project: p,
  devanagari,
  t,
  fmt,
}: {
  project: Project;
  devanagari: boolean;
  t: Awaited<ReturnType<typeof getTranslations<"projects">>>;
  fmt: Intl.DateTimeFormat;
}) {
  return (
    <article className="grain relative flex flex-col rounded-kashi border border-kashi-rudraksha/60 bg-kashi-indigo/40 p-6 transition-[translate,border-color,box-shadow] duration-500 ease-enter hover:-translate-y-1 hover:border-kashi-diya/50 hover:shadow-glow">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={p.status} label={t(`groups.${p.status}`)} />
        <span className="rounded-full bg-kashi-rudraksha/50 px-2 py-0.5 text-[0.7rem] text-kashi-ash/80">{t(`types.${p.type}`)}</span>
      </div>
      <h4 className="mt-4 text-[1.3rem] leading-snug text-kashi-white">{devanagari ? p.name_hi : p.name_en}</h4>
      <p className="text-sm text-kashi-ash/70">{devanagari ? p.name_en : p.name_hi}</p>
      <p className="mt-4 text-kashi-ash/90">{p.summary}</p>
      <dl className="mt-5 space-y-3 text-sm">
        <div>
          <dt className="text-[0.65rem] uppercase tracking-[0.2em] text-kashi-diya/80">{t("agency")}</dt>
          <dd className="mt-0.5 text-kashi-ash/85">{p.agency}</dd>
        </div>
        <div>
          <dt className="text-[0.65rem] uppercase tracking-[0.2em] text-kashi-diya/80">{t("timeline")}</dt>
          <dd className="mt-0.5 text-kashi-ash/85">{p.timeline}</dd>
        </div>
      </dl>
      <footer className="mt-auto pt-5 text-xs text-kashi-ash/60">
        {!p.verified && <p className="mb-2 text-kashi-marigold/90">⚠ {t("unverified")}</p>}
        <p>
          {t("sources")}:{" "}
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
          {t("lastVerified")}: <time dateTime={p.lastVerified}>{fmt.format(new Date(p.lastVerified + "T00:00:00Z"))}</time>
        </p>
      </footer>
    </article>
  );
}
