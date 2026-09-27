import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import ListingShell from "@/components/pages/ListingShell";
import ProjectsList, { StatusBadge } from "@/components/sections/ProjectsList";
import EnglishNote from "@/components/ui/EnglishNote";
import type { Locale } from "@/lib/i18n/locales";
import { alternatesFor } from "@/lib/pages";
import { getProjectsProps } from "@/lib/sectionProps";

export async function generateMetadata({ params }: PageProps<"/[locale]/projects">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "projects" });
  return { title: t("title"), description: t("intro"), alternates: alternatesFor(locale, "/projects") };
}

/** Every project in full, grouped by status (the home page shows them as carousels on phones). */
export default async function ProjectsPage({ params }: PageProps<"/[locale]/projects">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const [{ heading, legend, latestLabel, groups, labels, order, englishNote }, t, nav] = await Promise.all([
    getProjectsProps(loc),
    getTranslations({ locale, namespace: "page" }),
    getTranslations({ locale, namespace: "nav" }),
  ]);
  const path = "/projects";
  return (
    <ListingShell
      locale={loc}
      path={path}
      sectionId="projects"
      crumbs={[{ name: t("home"), href: `/${locale}` }, { name: nav("projects"), href: `/${locale}${path}` }]}
      title={heading.title}
      secondary={heading.secondary}
      intro={
        <>
          <p>{heading.intro}</p>
          <p className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-kashi-ash/60">
            <span className="uppercase tracking-[0.2em]">{legend}:</span>
            {order.map((s) => (
              <StatusBadge key={s} status={s} label={labels.groups[s]} />
            ))}
            <span>· {labels.lastVerified}: {latestLabel}</span>
          </p>
          {englishNote && <EnglishNote text={englishNote} className="mt-3" />}
        </>
      }
    >
      <ProjectsList groups={groups} labels={labels} />
    </ListingShell>
  );
}
