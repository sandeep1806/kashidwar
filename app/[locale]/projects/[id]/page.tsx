import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Block, Facts, LinkCards, PrevNext, Sources } from "@/components/pages/Blocks";
import LdJson from "@/components/pages/LdJson";
import PageShell from "@/components/pages/PageShell";
import { StatusBadge } from "@/components/sections/ProjectsList";
import EnglishNote from "@/components/ui/EnglishNote";
import { localize, projects, type Faith } from "@/lib/content";
import { LOCALES, locales, type Locale } from "@/lib/i18n/locales";
import { breadcrumbLd, hubDistances, alternatesFor, mapLinks, metaDescription, neighbours, pagePath, pageUrl, projectPlaces } from "@/lib/pages";
import { getPhoto } from "@/lib/photos";
import { proseFallsBack } from "@/lib/proseLocale";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) => projects.map((p) => ({ locale, id: p.id })));
}

const names = (locale: Locale, p: { name_en: string; name_hi: string }) =>
  LOCALES[locale].script === "devanagari" ? { primary: p.name_hi, secondary: p.name_en } : { primary: p.name_en, secondary: p.name_hi };

export async function generateMetadata({ params }: PageProps<"/[locale]/projects/[id]">): Promise<Metadata> {
  const { locale, id } = await params;
  const raw = projects.find((p) => p.id === id);
  if (!raw) return {};
  const loc = locale as Locale;
  const p = localize(raw, loc);
  const t = await getTranslations({ locale, namespace: "meta" });
  const { primary } = names(loc, raw);
  const path = pagePath("projects", id);
  const title = t("projectTitle", { name: primary });
  const description = metaDescription(t("projectDescription", { name: primary, summary: p.summary }));
  const photo = getPhoto(`projects/${id}`, loc);
  const image = photo ? `${photo.src}-${photo.widths.at(-1)}.webp` : `/media/og/og-${locale}.png`;
  return {
    title,
    description,
    alternates: alternatesFor(locale, path),
    openGraph: { type: "article", title, description, url: `/${locale}${path}`, images: [{ url: image, alt: photo?.alt ?? title }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function ProjectPage({ params }: PageProps<"/[locale]/projects/[id]">) {
  const { locale, id } = await params;
  const index = projects.findIndex((p) => p.id === id);
  if (index < 0) notFound();
  setRequestLocale(locale);
  const loc = locale as Locale;
  const raw = projects[index];
  const p = localize(raw, loc);
  const [t, tj, nav, common] = await Promise.all([
    getTranslations({ locale, namespace: "page" }),
    getTranslations({ locale, namespace: "projects" }),
    getTranslations({ locale, namespace: "nav" }),
    getTranslations({ locale, namespace: "common" }),
  ]);
  const { primary, secondary } = names(loc, raw);
  const path = pagePath("projects", id);
  const faith: Faith = raw.faith[0] ?? "secular";
  const photo = getPhoto(`projects/${id}`, loc);
  const links = mapLinks(raw);
  const nearby = projectPlaces(raw);
  const { prev, next } = neighbours(projects, index);
  const home = `/${locale}`;
  const fmt = new Intl.DateTimeFormat(LOCALES[loc].bcp47, { dateStyle: "long", timeZone: "UTC" });
  const crumbs = [
    { name: t("home"), href: home },
    { name: nav("projects"), href: `${home}#projects` },
    { name: primary, href: `/${locale}${path}` },
  ];
  const statusLabel = tj(`groups.${raw.status}`);

  return (
    <>
      <LdJson data={breadcrumbLd(loc, crumbs.map((c) => ({ name: c.name, path: c.href })))} />
      <PageShell
        locale={loc}
        path={path}
        crumbs={crumbs}
        faith={faith}
        chips={
          <>
            <StatusBadge status={raw.status} label={statusLabel} />
            <span className="rounded-full bg-kashi-rudraksha/50 px-2 py-0.5 text-kashi-ash/80">{tj(`types.${raw.type}`)}</span>
          </>
        }
        title={primary}
        secondary={secondary}
        lead={<p>{p.summary}</p>}
        photo={photo}
        after={
          <>
            <LinkCards
              title={t("related")}
              items={nearby.map((r) => ({ href: pageUrl(loc, "places", r.id), ...(() => { const n = names(loc, r); return { name: n.primary, secondary: n.secondary }; })(), photo: getPhoto(`places/${r.id}`, loc) }))}
            />
            <PrevNext
              prev={{ href: pageUrl(loc, "projects", prev.id), label: t("prev"), name: names(loc, prev).primary }}
              next={{ href: pageUrl(loc, "projects", next.id), label: t("next"), name: names(loc, next).primary }}
              back={{ href: `${home}#projects`, label: t("backTo", { section: nav("projects") }) }}
            />
          </>
        }
      >
        <div className="space-y-10">
          {proseFallsBack(loc) && <EnglishNote text={common("englishNote")} />}
          <Block title={tj("timeline")}>
            <p>{p.timeline}</p>
            {!raw.verified && <p className="mt-3 text-sm text-kashi-marigold">{tj("unverified")}</p>}
          </Block>
          <Block title={t("howToReach")}>
            <ul className="space-y-1.5">
              {hubDistances(raw).map((h) => (
                <li key={h.key}>{t("fromHub", { km: new Intl.NumberFormat(LOCALES[loc].bcp47).format(h.km), hub: t(h.key) })}</li>
              ))}
            </ul>
            <p className="mt-2 text-sm text-kashi-ash/60">{t("straightLine")}</p>
            <p className="mt-4 flex flex-wrap gap-4 text-sm">
              <a href={links.google} target="_blank" rel="noopener noreferrer" className="text-kashi-diya underline decoration-kashi-diya/40 underline-offset-4 hover:text-kashi-marigold">{t("googleMaps")}</a>
              <a href={links.osm} target="_blank" rel="noopener noreferrer" className="text-kashi-diya underline decoration-kashi-diya/40 underline-offset-4 hover:text-kashi-marigold">{t("osm")}</a>
            </p>
          </Block>
          <Sources label={tj("sources")} sources={raw.sources} />
        </div>
        <aside>
          <Facts
            items={[
              { label: tj("legend"), value: statusLabel },
              { label: tj("agency"), value: p.agency },
              { label: tj("lastVerified"), value: fmt.format(new Date(raw.lastVerified + "T00:00:00Z")) },
            ]}
          />
        </aside>
      </PageShell>
    </>
  );
}
