import type { ReactNode } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import SiteFooter from "@/components/ui/SiteFooter";
import Static from "@/components/ui/Static";
import Photo from "@/components/ui/Photo";
import FaithGlyph from "@/components/ui/FaithGlyph";
import type { Faith, PhotoData } from "@/lib/contentTypes";
import type { Locale } from "@/lib/i18n/locales";

export interface Crumb {
  name: string;
  href: string;
}

/**
 * Layout for the per-item pages (places, festivals, projects, itineraries):
 * breadcrumb, bilingual H1 beside an arch-framed photo, then the body.
 * Everything except `island` is server-rendered and not hydrated.
 */
export default function PageShell({
  locale,
  path,
  crumbs,
  chips,
  title,
  secondary,
  lead,
  photo,
  faith,
  children,
  island,
  after,
}: {
  locale: Locale;
  /** Locale-less path of this page, for the footer's language links */
  path: string;
  crumbs: Crumb[];
  chips?: ReactNode;
  title: string;
  secondary: string;
  lead?: ReactNode;
  photo: PhotoData | null;
  faith: Faith;
  children: ReactNode;
  /** Interactive part (map), hydrated */
  island?: ReactNode;
  /** Static content after the island (related, prev/next) */
  after?: ReactNode;
}) {
  return (
    <main id="content" className="flex flex-1 flex-col">
      <Static>
        <article className="section-kashi pb-6 pt-28 sm:pt-32">
          <div className="container-kashi">
            <nav aria-label="Breadcrumb" className="text-sm text-kashi-ash/70">
              <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
                {crumbs.map((c, i) => (
                  <li key={c.href} className="flex items-center gap-2">
                    {i > 0 && <span aria-hidden="true" className="text-kashi-diya/50">/</span>}
                    {i === crumbs.length - 1 ? (
                      <span aria-current="page" className="text-kashi-ash">{c.name}</span>
                    ) : (
                      <a href={c.href} className="underline decoration-kashi-diya/30 underline-offset-4 hover:text-kashi-white">{c.name}</a>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
            <header className="mt-8 grid items-end gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
              <div>
                {chips && <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">{chips}</div>}
                <SectionHeading as="h1" id="page-title" locale={locale} title={title} secondary={secondary} align="left" />
                {lead && <div className="mt-6 text-lg leading-relaxed text-kashi-ash/90">{lead}</div>}
              </div>
              <div className="arch relative aspect-[4/5] w-full overflow-hidden border border-kashi-rudraksha/60 shadow-glow sm:aspect-[5/4] md:aspect-[4/5]">
                {photo ? (
                  <Photo photo={photo} sizes="(min-width: 768px) 42vw, 92vw" priority />
                ) : (
                  <div className={`place-art place-art-${faith} flex h-full w-full items-center justify-center`}>
                    <FaithGlyph faith={faith} className="h-1/3 w-1/3 text-kashi-diya/70" />
                  </div>
                )}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-kashi-night/70 to-transparent" />
              </div>
            </header>
            <div className="mt-14 grid gap-12 lg:grid-cols-[1.4fr_1fr]">{children}</div>
          </div>
        </article>
      </Static>
      {island}
      {after && <Static>{after}</Static>}
      <Static>
        <SiteFooter locale={locale} path={path} />
      </Static>
    </main>
  );
}
