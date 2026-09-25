import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Block, Facts, LinkCards, PrevNext, Sources } from "@/components/pages/Blocks";
import LdJson from "@/components/pages/LdJson";
import PageMap from "@/components/pages/PageMap";
import PageShell from "@/components/pages/PageShell";
import EnglishNote from "@/components/ui/EnglishNote";
import FaithGlyph from "@/components/ui/FaithGlyph";
import { festivals, localize, type Faith } from "@/lib/content";
import { FESTIVAL_YEAR, festivalDate } from "@/lib/festivalDates";
import { LOCALES, locales, type Locale } from "@/lib/i18n/locales";
import { absolute, breadcrumbLd, festivalPlaces, languageAlternates, metaDescription, neighbours, pagePath, pageUrl } from "@/lib/pages";
import { getPhoto } from "@/lib/photos";
import { proseFallsBack } from "@/lib/proseLocale";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) => festivals.map((f) => ({ locale, id: f.id })));
}

const names = (locale: Locale, p: { name_en: string; name_hi: string }) =>
  LOCALES[locale].script === "devanagari" ? { primary: p.name_hi, secondary: p.name_en } : { primary: p.name_en, secondary: p.name_hi };

function formatRange(locale: Locale, start: string, end: string | null) {
  const fmt = new Intl.DateTimeFormat(LOCALES[locale].bcp47, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  const s = new Date(start + "T00:00:00Z");
  if (!end || end === start) return fmt.format(s);
  return fmt.formatRange(s, new Date(end + "T00:00:00Z"));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/festivals/[id]">): Promise<Metadata> {
  const { locale, id } = await params;
  const raw = festivals.find((f) => f.id === id);
  if (!raw) return {};
  const loc = locale as Locale;
  const f = localize(raw, loc);
  const t = await getTranslations({ locale, namespace: "meta" });
  const { primary } = names(loc, raw);
  const path = pagePath("festivals", id);
  const title = t("festivalTitle", { name: primary, year: String(FESTIVAL_YEAR) });
  const description = metaDescription(t("festivalDescription", { name: primary, when: f.when, summary: f.summary }));
  const photo = getPhoto(`festivals/${id}`, loc);
  const image = photo ? `${photo.src}-${photo.widths.at(-1)}.webp` : `/media/og/og-${locale}.png`;
  return {
    title,
    description,
    alternates: { canonical: `/${locale}${path}`, languages: languageAlternates(path) },
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
  const date = festivalDate(id);
  const dated = date?.verified && date.startDate ? date : null;
  const venues = festivalPlaces(raw);
  const { prev, next } = neighbours(festivals, index);
  const home = `/${locale}`;
  const crumbs = [
    { name: t("home"), href: home },
    { name: nav("festivals"), href: `${home}#festivals` },
    { name: primary, href: `/${locale}${path}` },
  ];
  const months = tf.raw("months") as string[];
  const lite = (x: (typeof venues)[number]) => ({ id: x.id, name_en: x.name_en, faith: x.faith, type: x.type, lat: x.lat, lng: x.lng, bestTime: "", coordsVerified: x.coordsVerified });
  const firstVenue = raw.placeIds.length ? venues[0] : null;

  const ld: object[] = [breadcrumbLd(loc, crumbs.map((c) => ({ name: c.name, path: c.href })))];
  if (dated) {
    ld.unshift({
      "@context": "https://schema.org",
      "@type": "Event",
      "@id": absolute(`/${locale}${path}#event-${FESTIVAL_YEAR}`),
      name: `${primary} ${FESTIVAL_YEAR}`,
      alternateName: secondary,
      description: f.summary,
      url: absolute(`/${locale}${path}`),
      inLanguage: LOCALES[loc].bcp47,
      startDate: dated.startDate,
      endDate: dated.endDate ?? dated.startDate,
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      isAccessibleForFree: true,
      image: [absolute(photo ? `${photo.src}-${photo.widths.at(-1)}.webp` : `/media/og/og-${locale}.png`)],
      location: {
        "@type": "Place",
        name: firstVenue ? names(loc, firstVenue).primary : f.where,
        address: { "@type": "PostalAddress", streetAddress: f.where, addressLocality: "Varanasi", addressRegion: "Uttar Pradesh", addressCountry: "IN" },
        ...(firstVenue ? { geo: { "@type": "GeoCoordinates", latitude: firstVenue.lat, longitude: firstVenue.lng } } : {}),
      },
    });
  }

  return (
    <>
      <LdJson data={ld} />
      <PageShell
        locale={loc}
        path={path}
        crumbs={crumbs}
        faith={faiths[0]}
        chips={faiths.map((x) => (
          <span key={x} className="inline-flex items-center gap-1 rounded-full border border-kashi-diya/40 px-2 py-0.5 text-kashi-diya">
            <FaithGlyph faith={x} className="h-3.5 w-3.5" />
            {tp(`faiths.${x}`)}
          </span>
        ))}
        title={primary}
        secondary={secondary}
        lead={<p>{f.summary}</p>}
        photo={photo}
        island={
          venues.length && raw.placeIds.length ? (
            <PageMap
              title={t("onMap")}
              loading={t("mapLoading")}
              places={venues.map(lite)}
              focusId={venues.length === 1 ? venues[0].id : undefined}
              hrefs={Object.fromEntries(venues.map((x) => [x.id, pageUrl(loc, "places", x.id)]))}
              clusterTemplate={tp.raw("cluster") as string}
            />
          ) : null
        }
        after={
          <>
            <LinkCards
              title={t("related")}
              items={venues.map((r) => ({ href: pageUrl(loc, "places", r.id), ...(() => { const n = names(loc, r); return { name: n.primary, secondary: n.secondary }; })(), photo: getPhoto(`places/${r.id}`, loc) }))}
            />
            <PrevNext
              prev={{ href: pageUrl(loc, "festivals", prev.id), label: t("prev"), name: names(loc, prev).primary }}
              next={{ href: pageUrl(loc, "festivals", next.id), label: t("next"), name: names(loc, next).primary }}
              back={{ href: `${home}#festivals`, label: t("backTo", { section: nav("festivals") }) }}
            />
          </>
        }
      >
        <div className="space-y-10">
          {proseFallsBack(loc) && !raw.i18n?.[loc] && <EnglishNote text={common("englishNote")} />}
          <Block title={t("howToReach")}>
            <p>{f.where}</p>
            {venues.length > 0 && raw.placeIds.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                {venues.map((v) => (
                  <li key={v.id}>
                    <a href={pageUrl(loc, "places", v.id)} className="text-kashi-diya underline decoration-kashi-diya/40 underline-offset-4 hover:text-kashi-marigold">{names(loc, v).primary}</a>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-6 space-y-3 text-sm text-kashi-ash/80">
              <p className="text-xs uppercase tracking-[0.18em] text-kashi-diya">{t("reachVaranasi")}</p>
              <p>{practical("air.text")}</p>
              <p>{practical("rail.text")}</p>
            </div>
          </Block>
          <Sources label={tp("sources")} sources={[...raw.sources, ...(dated?.sources ?? [])]} />
        </div>
        <aside>
          <Facts
            items={[
              { label: t("datesIn", { year: String(FESTIVAL_YEAR) }), value: dated ? formatRange(loc, dated.startDate!, dated.endDate) : t("datesTbc", { year: String(FESTIVAL_YEAR) }) },
              { label: tf("when"), value: `${f.when} · ${raw.months.map((m) => months[m - 1]).join("–")}` },
              { label: tf("where"), value: f.where },
            ]}
          />
          <p className="mt-3 text-xs text-kashi-ash/60">{tf("lunarNote")}</p>
        </aside>
      </PageShell>
    </>
  );
}
