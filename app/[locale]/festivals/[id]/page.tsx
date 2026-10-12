import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Block, LinkCards, PrevNext, Sources } from "@/components/pages/Blocks";
import FactStrip from "@/components/pages/FactStrip";
import GuideLinks from "@/components/pages/GuideLinks";
import LdJson from "@/components/pages/LdJson";
import PageMap from "@/components/pages/PageMap";
import PageShell from "@/components/pages/PageShell";
import EnglishNote from "@/components/ui/EnglishNote";
import FestivalDateLine from "@/components/ui/FestivalDateLine";
import FaithGlyph from "@/components/ui/FaithGlyph";
import Icon from "@/components/ui/Icon";
import { festivals, localize, type Faith, hasTranslation, loadEntryTranslations } from "@/lib/content";
import { displayName } from "@/lib/contentTypes";
import { festivalDateView, festivalTiming, timingSources } from "@/lib/festivalDates";
import { LOCALES, locales, type Locale } from "@/lib/i18n/locales";
import { absolute, breadcrumbLd, festivalPlaces, alternatesFor, leadOf, metaDescription, neighbours, pagePath, pageUrl } from "@/lib/pages";
import { getPhoto } from "@/lib/photos";
import { proseFallsBack } from "@/lib/proseLocale";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) => festivals.map((f) => ({ locale, id: f.id })));
}

const names = (locale: Locale, p: { name_en: string; name_hi: string; names?: Record<string, string> }) => displayName(locale, p);


export async function generateMetadata({ params }: PageProps<"/[locale]/festivals/[id]">): Promise<Metadata> {
  const { locale, id } = await params;
  const raw = festivals.find((f) => f.id === id);
  if (!raw) return {};
  const loc = locale as Locale;
  await loadEntryTranslations(loc);
  const f = localize(raw, loc);
  const t = await getTranslations({ locale, namespace: "meta" });
  const { primary } = names(loc, raw);
  const path = pagePath("festivals", id);
  // Titles name a year only for a verified upcoming (or current) occurrence.
  const next = festivalTiming(raw).next;
  const title = next ? t("festivalTitle", { name: primary, year: String(next.year) }) : t("festivalTitleTbc", { name: primary });
  const description = metaDescription(t("festivalDescription", { name: primary, when: f.when, summary: f.summary }));
  const photo = getPhoto(`festivals/${id}`, loc);
  const image = photo ? `${photo.src}-${photo.widths.at(-1)}.webp` : `/media/og/og-${locale}.png`;
  return {
    title,
    description,
    alternates: alternatesFor(locale, path),
    openGraph: { type: "article", title, description, url: `/${locale}${path}`, images: [{ url: image, alt: photo?.alt ?? title }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function FestivalPage({ params }: PageProps<"/[locale]/festivals/[id]">) {
  const { locale, id } = await params;
  const index = festivals.findIndex((f) => f.id === id);
  if (index < 0) notFound();
  setRequestLocale(locale);
  const loc = locale as Locale;
  await loadEntryTranslations(loc);
  const raw = festivals[index];
  const f = localize(raw, loc);
  const [t, tf, tp, nav, common, practical] = await Promise.all([
    getTranslations({ locale, namespace: "page" }),
    getTranslations({ locale, namespace: "festivals" }),
    getTranslations({ locale, namespace: "places" }),
    getTranslations({ locale, namespace: "nav" }),
    getTranslations({ locale, namespace: "common" }),
    getTranslations({ locale, namespace: "practical" }),
  ]);
  const { primary, secondary } = names(loc, raw);
  const path = pagePath("festivals", id);
  const faiths: Faith[] = raw.faith.length ? raw.faith : ["secular"];
  const photo = getPhoto(`festivals/${id}`, loc);
  const timing = festivalTiming(raw);
  const dated = timing.next; // Event JSON-LD: the next verified occurrence only, never a past one
  const dateView = festivalDateView(raw, LOCALES[loc].bcp47, t, timing);
  const venues = festivalPlaces(raw);
  const listedVenues = raw.placeIds.length ? venues : [];
  const { prev, next } = neighbours(festivals, index);
  const home = `/${locale}`;
  const crumbs = [
    { name: t("home"), href: home },
    { name: nav("festivals"), href: `${home}/festivals` },
    { name: primary, href: `/${locale}${path}` },
  ];
  const months = tf.raw("months") as string[];
  const lite = (x: (typeof venues)[number]) => ({ id: x.id, name_en: displayName(loc, x).primary, faith: x.faith, type: x.type, lat: x.lat, lng: x.lng, bestTime: "", coordsVerified: x.coordsVerified });
  const firstVenue = raw.placeIds.length ? venues[0] : null;
  const where = Array.isArray(f.where) ? f.where.join(" · ") : f.where;
  const lead = leadOf(f.summary);
  const rest = f.summary.slice(lead.length).trim();

  const ld: object[] = [breadcrumbLd(loc, crumbs.map((c) => ({ name: c.name, path: c.href })))];
  if (dated) {
    ld.unshift({
      "@context": "https://schema.org",
      "@type": "Event",
      "@id": absolute(`/${locale}${path}#event-${dated.year}`),
      name: `${primary} ${dated.year}`,
      alternateName: secondary,
      description: f.summary,
      url: absolute(`/${locale}${path}`),
      inLanguage: LOCALES[loc].bcp47,
      startDate: dated.startDate,
      endDate: dated.endDate,
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      isAccessibleForFree: true,
      image: [absolute(photo ? `${photo.src}-${photo.widths.at(-1)}.webp` : `/media/og/og-${locale}.png`)],
      location: {
        "@type": "Place",
        name: firstVenue ? names(loc, firstVenue).primary : where,
        address: { "@type": "PostalAddress", streetAddress: where, addressLocality: "Varanasi", addressRegion: "Uttar Pradesh", addressCountry: "IN" },
        ...(firstVenue ? { geo: { "@type": "GeoCoordinates", latitude: firstVenue.lat, longitude: firstVenue.lng } } : {}),
      },
    });
  }

  return (
    <>
      <LdJson data={ld} />
      <PageShell
        variant="visual"
        locale={loc}
        path={path}
        crumbs={crumbs}
        faith={faiths[0]}
        chips={faiths.map((x) => (
          <span key={x} className="inline-flex items-center gap-1 rounded-full border border-kashi-diya/40 bg-kashi-night/60 px-2 py-0.5 text-kashi-diya">
            <FaithGlyph faith={x} className="h-3.5 w-3.5" />
            {tp(`faiths.${x}`)}
          </span>
        ))}
        title={primary}
        secondary={secondary}
        subtitle={<FestivalDateLine view={dateView} />}
        strip={
          <FactStrip
            items={[
              { icon: "calendar", label: tf("when"), value: f.when },
              { icon: "leaf", label: tf("monthsLabel"), value: raw.months.map((m) => months[m - 1]).join(" · ") },
              { icon: "pin", label: tf("where"), value: where },
              ...(dateView.last ? [{ icon: "clock" as const, label: dateView.last.before.replace(/[:：]\s*$/, ""), value: dateView.last.date }] : []),
            ]}
          />
        }
        lead={<p>{lead}</p>}
        photo={photo}
        island={
          listedVenues.length ? (
            <PageMap
              title={t("onMap")}
              loading={t("mapLoading")}
              places={listedVenues.map(lite)}
              focusId={listedVenues.length === 1 ? listedVenues[0].id : undefined}
              hrefs={Object.fromEntries(listedVenues.map((x) => [x.id, pageUrl(loc, "places", x.id)]))}
              clusterTemplate={tp.raw("cluster") as string}
            />
          ) : null
        }
        after={
          <>
            <LinkCards
              title={t("related")}
              items={venues.map((r) => {
                const n = names(loc, r);
                const g = localize(r, loc).glance;
                return { href: pageUrl(loc, "places", r.id), name: n.primary, secondary: n.secondary, photo: getPhoto(`places/${r.id}`, loc), faith: r.faith[0] ?? "secular", type: r.type, meta: g?.timings, metaIcon: "clock" as const };
              })}
            />
            <GuideLinks locale={loc} kind="festivals" id={id} />
            <PrevNext
              prev={{ href: pageUrl(loc, "festivals", prev.id), label: t("prev"), name: names(loc, prev).primary, photo: getPhoto(`festivals/${prev.id}`, loc), faith: prev.faith[0] ?? "secular" }}
              next={{ href: pageUrl(loc, "festivals", next.id), label: t("next"), name: names(loc, next).primary, photo: getPhoto(`festivals/${next.id}`, loc), faith: next.faith[0] ?? "secular" }}
              back={{ href: `${home}/festivals`, label: t("backTo", { section: nav("festivals") }) }}
            />
          </>
        }
      >
        <div className="space-y-10">
          {proseFallsBack(loc) && !hasTranslation(raw, loc) && <EnglishNote text={common("englishNote")} />}
          {rest && (
            <details className="story-details">
              <summary>
                <Icon name="chevron" className="icon-chevron h-4 w-4" />
                {t("readStory")}
              </summary>
              <p className="mt-4 leading-relaxed text-kashi-ash/90">{rest}</p>
            </details>
          )}
          <Block title={tf("where")}>
            <p className="flex items-start gap-2">
              <Icon name="pin" className="mt-1 h-5 w-5 shrink-0 text-kashi-diya" />
              <span>{where}</span>
            </p>
            {listedVenues.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2">
                {listedVenues.map((v) => (
                  <li key={v.id}>
                    <a href={pageUrl(loc, "places", v.id)} className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-kashi-diya/40 px-4 text-sm text-kashi-diya transition-colors hover:border-kashi-marigold hover:text-kashi-marigold">
                      <Icon name="chevron" className="h-3.5 w-3.5" />
                      {names(loc, v).primary}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </Block>
          <p className="text-xs text-kashi-ash/60">{tf("lunarNote")}</p>
          <Sources label={tp("sources")} sources={[...raw.sources, ...timingSources(timing)]} />
        </div>
        <aside className="space-y-8">
          <Block title={t("reachVaranasi")}>
            <ul className="space-y-3 text-sm text-kashi-ash/85">
              <li className="flex gap-3"><Icon name="plane" className="mt-0.5 h-5 w-5 shrink-0 text-kashi-diya" /><span>{practical("air.text")}</span></li>
              <li className="flex gap-3"><Icon name="train" className="mt-0.5 h-5 w-5 shrink-0 text-kashi-diya" /><span>{practical("rail.text")}</span></li>
            </ul>
          </Block>
        </aside>
      </PageShell>
    </>
  );
}
