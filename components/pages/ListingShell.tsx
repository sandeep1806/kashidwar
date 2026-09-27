import type { ReactNode } from "react";
import LdJson from "@/components/pages/LdJson";
import type { Crumb } from "@/components/pages/PageShell";
import SectionHeading from "@/components/ui/SectionHeading";
import SiteFooter from "@/components/ui/SiteFooter";
import Static from "@/components/ui/Static";
import type { Locale } from "@/lib/i18n/locales";
import { breadcrumbLd } from "@/lib/pages";

/**
 * Layout for the "See all" pages (festivals, projects, food): breadcrumb,
 * bilingual H1, intro, then the full server-rendered list, the same cards the
 * home page shows as a carousel on phones. `island` (hydrated) goes after the
 * static markup.
 */
export default function ListingShell({
  locale,
  path,
  sectionId,
  crumbs,
  title,
  secondary,
  intro,
  children,
  island,
}: {
  locale: Locale;
  /** Locale-less path of this page, for the footer's language links */
  path: string;
  /** The home section this page expands (its id is reused, so section scripts find it) */
  sectionId: string;
  crumbs: Crumb[];
  title: string;
  secondary: string;
  intro: ReactNode;
  children: ReactNode;
  island?: ReactNode;
}) {
  return (
    <main id="content" className="flex flex-1 flex-col">
      <Static>
        <LdJson data={breadcrumbLd(locale, crumbs.map((c) => ({ name: c.name, path: c.href })))} />
        <section id={sectionId} aria-labelledby="page-title" className="section-kashi pb-6 pt-28 sm:pt-32">
          <div className="container-kashi">
            <nav aria-label="Breadcrumb" className="text-sm text-kashi-ash/70">
              <ol className="flex flex-wrap items-center gap-x-2">
                {crumbs.map((c, i) => (
                  <li key={c.href} className="flex items-center gap-2">
                    {i > 0 && <span aria-hidden="true" className="text-kashi-diya/50">/</span>}
                    {i === crumbs.length - 1 ? (
                      <span aria-current="page" className="text-kashi-ash">{c.name}</span>
                    ) : (
                      <a href={c.href} className="inline-flex min-h-11 items-center underline decoration-kashi-diya/30 underline-offset-4 hover:text-kashi-white">{c.name}</a>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
            <div className="mt-8 text-center">
              <SectionHeading as="h1" id="page-title" locale={locale} title={title} secondary={secondary} />
              <div className="mx-auto mt-8 max-w-2xl text-lg text-kashi-ash/90">{intro}</div>
            </div>
          </div>
          {children}
        </section>
      </Static>
      {island}
      <Static>
        <SiteFooter locale={locale} path={path} />
      </Static>
    </main>
  );
}
