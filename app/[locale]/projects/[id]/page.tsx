import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Block, LinkCards, PrevNext, Sources } from "@/components/pages/Blocks";
import DistanceCards, { type DistanceItem } from "@/components/pages/DistanceCards";
import FactStrip from "@/components/pages/FactStrip";
import GuideLinks from "@/components/pages/GuideLinks";
import LdJson from "@/components/pages/LdJson";
import PageMap from "@/components/pages/PageMap";
import PageShell from "@/components/pages/PageShell";
import { ProgressBar, StatusBadge } from "@/components/sections/ProjectsList";
import EnglishNote from "@/components/ui/EnglishNote";
import Icon from "@/components/ui/Icon";
import { localize, projects, type Faith } from "@/lib/content";
import { LOCALES, locales, type Locale } from "@/lib/i18n/locales";
import { breadcrumbLd, hubDistances, alternatesFor, leadOf, mapLinks, metaDescription, neighbours, pagePath, pageUrl, projectPlaces, travelEstimate } from "@/lib/pages";
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

const HUB_ICON = { hubJunction: "train", hubAirport: "plane", hubGodowlia: "car" } as const;

export default async function ProjectPage({ params }: PageProps<"/[locale]/projects/[id]">) {
  const { locale, id } = await params;
  const index = projects.findIndex((p) => p.id === id);
  if (index < 0) notFound();
  setRequestLocale(locale);
  const loc = locale as Locale;
  const raw = projects[index];
  const p = localize(raw, loc);
  const [t, tj, tp, nav, common] = await Promise.all([
    getTranslations({ locale, namespace: "page" }),
    getTranslations({ locale, namespace: "projects" }),
    getTranslations({ locale, namespace: "places" }),
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
  const nf = new Intl.NumberFormat(LOCALES[loc].bcp47);
  const crumbs = [
    { name: t("home"), href: home },
    { name: nav("projects"), href: `${home}/projects` },
    { name: primary, href: `/${locale}${path}` },
  ];
  const statusLabel = tj(`groups.${raw.status}`);
  const progressText = typeof raw.progress === "number" ? (tj.raw("progress") as string).replace("{n}", String(raw.progress)) : null;
  const lead = leadOf(p.summary);
  const rest = p.summary.slice(lead.length).trim();
  // "Foundation 24 March 2023 · Trial runs from 2025 · …" → milestones
  const milestones = p.timeline.split(/\s+·\s+/).map((s) => s.trim()).filter(Boolean);
  const distances: DistanceItem[] = hubDistances(raw).map((h) => {
    const est = travelEstimate(h.km);
    return { key: h.key, icon: HUB_ICON[h.key], label: t(h.key), distance: t("glance.km", { km: nf.format(h.km) }), estimate: est.mode === "walk" ? t("glance.walkMin", { min: est.minutes }) : t("glance.rideMin", { min: est.minutes }) };
  });
  const lite = (x: (typeof nearby)[number]) => ({ id: x.id, name_en: x.name_en, faith: x.faith, type: x.type, lat: x.lat, lng: x.lng, bestTime: "", coordsVerified: x.coordsVerified });
  // The project itself as the focused pin (a generic "heritage" silhouette: project types are not place types).
  const self = { id: raw.id, name_en: raw.name_en, faith: raw.faith, type: "heritage" as const, lat: raw.lat, lng: raw.lng, bestTime: "", coordsVerified: true };

  return (
    <>
      <LdJson data={breadcrumbLd(loc, crumbs.map((c) => ({ name: c.name, path: c.href })))} />
      <PageShell
        variant="visual"
        locale={loc}
        path={path}
        crumbs={crumbs}
        faith={faith}
        chips={
          <>
            <StatusBadge status={raw.status} label={statusLabel} />
            <span className="rounded-full bg-kashi-night/70 px-2 py-0.5 text-kashi-ash/90">{tj(`types.${raw.type}`)}</span>
          </>
        }
        title={primary}
        secondary={secondary}
        strip={
          <FactStrip
            items={[
              { icon: "shield", label: tj("legend"), value: statusLabel },
              { icon: "ticket", label: tj("cost"), value: p.cost },
              { icon: "hourglass", label: tj("progressLabel"), value: progressText },
              { icon: "calendar", label: tj("lastVerified"), value: fmt.format(new Date(raw.lastVerified + "T00:00:00Z")) },
            ]}
          />
        }
        lead={<p>{lead}</p>}
        photo={photo}
        island={
          <PageMap
            title={t("onMap")}
            loading={t("mapLoading")}
            places={[self, ...nearby.map(lite)]}
            focusId={raw.id}
            hrefs={Object.fromEntries(nearby.map((x) => [x.id, pageUrl(loc, "places", x.id)]))}
            clusterTemplate={tp.raw("cluster") as string}
          />
        }
        after={
          <>
            <LinkCards
              title={t("related")}
              items={nearby.map((r) => {
                const n = names(loc, r);
                const g = localize(r, loc).glance;
                return { href: pageUrl(loc, "places", r.id), name: n.primary, secondary: n.secondary, photo: getPhoto(`places/${r.id}`, loc), faith: r.faith[0] ?? "secular", type: r.type, meta: g?.duration, metaIcon: "hourglass" as const };
              })}
            />
            <GuideLinks locale={loc} kind="projects" id={id} />
            <PrevNext
              prev={{ href: pageUrl(loc, "projects", prev.id), label: t("prev"), name: names(loc, prev).primary, photo: getPhoto(`projects/${prev.id}`, loc), faith: prev.faith[0] ?? "secular" }}
              next={{ href: pageUrl(loc, "projects", next.id), label: t("next"), name: names(loc, next).primary, photo: getPhoto(`projects/${next.id}`, loc), faith: next.faith[0] ?? "secular" }}
              back={{ href: `${home}/projects`, label: t("backTo", { section: nav("projects") }) }}
            />
          </>
        }
      >
        <div className="space-y-10">
          {proseFallsBack(loc) && <EnglishNote text={common("englishNote")} />}
          <Block title={tj("milestones")}>
            {typeof raw.progress === "number" && raw.status !== "announced" && progressText && (
              <div className="mb-6">
                <ProgressBar value={raw.progress} label={progressText} />
                <p className="mt-2 text-xs text-kashi-ash/60">{progressText}</p>
              </div>
            )}
            <ol className="milestones">
              {milestones.map((m, i) => (
                <li key={i} className={i === milestones.length - 1 && raw.status !== "completed" ? "is-pending" : ""}>
                  <span className="milestone-dot" aria-hidden="true" />
                  <span>{m}</span>
                </li>
              ))}
            </ol>
            {!raw.verified && <p className="mt-4 flex items-start gap-2 text-sm text-kashi-marigold"><Icon name="info" className="mt-0.5 h-4 w-4 shrink-0" />{tj("unverified")}</p>}
          </Block>
          {rest && (
            <details className="story-details">
              <summary>
                <Icon name="chevron" className="icon-chevron h-4 w-4" />
                {t("readStory")}
              </summary>
              <p className="mt-4 leading-relaxed text-kashi-ash/90">{rest}</p>
            </details>
          )}
          <Block title={tj("agency")}>
            <p className="flex items-start gap-2"><Icon name="shield" className="mt-0.5 h-5 w-5 shrink-0 text-kashi-diya" /><span>{p.agency}</span></p>
          </Block>
          <Sources label={tj("sources")} sources={raw.sources} />
        </div>
        <aside className="space-y-8">
          <DistanceCards
            title={t("howToReach")}
            items={distances}
            note={t("straightLine")}
            links={[
              { href: links.google, label: t("googleMaps") },
              { href: links.osm, label: t("osm") },
            ]}
          />
        </aside>
      </PageShell>
    </>
  );
}
