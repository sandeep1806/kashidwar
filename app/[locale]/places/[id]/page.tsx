import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Block, LinkCards, PrevNext, Sources } from "@/components/pages/Blocks";
import DistanceCards, { type DistanceItem } from "@/components/pages/DistanceCards";
import FactStrip from "@/components/pages/FactStrip";
import GlanceGrid, { type GlanceTile } from "@/components/pages/GlanceGrid";
import GuideLinks from "@/components/pages/GuideLinks";
import LdJson from "@/components/pages/LdJson";
import PageMap from "@/components/pages/PageMap";
import PageShell from "@/components/pages/PageShell";
import EnglishNote from "@/components/ui/EnglishNote";
import FaithGlyph from "@/components/ui/FaithGlyph";
import Gallery from "@/components/ui/Gallery";
import Icon from "@/components/ui/Icon";
import { localize, places, type Faith } from "@/lib/content";
import { LOCALES, locales, type Locale } from "@/lib/i18n/locales";
import { absolute, breadcrumbLd, festivalsAt, hubDistances, alternatesFor, leadOf, mapLinks, metaDescription, nearestPlace, neighbours, pagePath, pageUrl, relatedPlaces, travelEstimate } from "@/lib/pages";
import { getGallery, getGalleryCredits, getPhoto } from "@/lib/photos";
import { proseFallsBack } from "@/lib/proseLocale";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) => places.map((p) => ({ locale, id: p.id })));
}

const names = (locale: Locale, p: { name_en: string; name_hi: string }) =>
  LOCALES[locale].script === "devanagari" ? { primary: p.name_hi, secondary: p.name_en } : { primary: p.name_en, secondary: p.name_hi };

export async function generateMetadata({ params }: PageProps<"/[locale]/places/[id]">): Promise<Metadata> {
  const { locale, id } = await params;
  const raw = places.find((p) => p.id === id);
  if (!raw) return {};
  const loc = locale as Locale;
  const p = localize(raw, loc);
  const t = await getTranslations({ locale, namespace: "meta" });
  const tp = await getTranslations({ locale, namespace: "places" });
  const { primary } = names(loc, raw);
  const path = pagePath("places", id);
  const title = t("placeTitle", { name: primary, type: tp(`types.${raw.type}`) });
  const description = metaDescription(t("placeDescription", { name: primary, summary: p.summary }));
  const photo = getPhoto(`places/${id}`, loc);
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

export default async function PlacePage({ params }: PageProps<"/[locale]/places/[id]">) {
  const { locale, id } = await params;
  const index = places.findIndex((p) => p.id === id);
  if (index < 0) notFound();
  setRequestLocale(locale);
  const loc = locale as Locale;
  const raw = places[index];
  const p = localize(raw, loc);
  const [t, tp, nav, common] = await Promise.all([
    getTranslations({ locale, namespace: "page" }),
    getTranslations({ locale, namespace: "places" }),
    getTranslations({ locale, namespace: "nav" }),
    getTranslations({ locale, namespace: "common" }),
  ]);
  const { primary, secondary } = names(loc, raw);
  const path = pagePath("places", id);
  const faiths: Faith[] = raw.faith.length ? raw.faith : ["secular"];
  const gallery = getGallery(`places/${id}`, loc);
  const credits = getGalleryCredits(`places/${id}`);
  const photo = gallery[0] ?? null;
  const links = mapLinks(raw);
  const related = relatedPlaces(raw);
  const fests = festivalsAt(id);
  const near = nearestPlace(raw);
  const { prev, next } = neighbours(places, index);
  const home = `/${locale}`;
  const nf = new Intl.NumberFormat(LOCALES[loc].bcp47);
  const g = p.glance ?? {};
  // Ghats and temples sit under their listing page; everything else under the home places section.
  const parent =
    raw.type === "ghat" ? { name: tp("ghatsTitle"), href: `${home}/ghats` }
    : raw.type === "temple" ? { name: tp("templesTitle"), href: `${home}/temples` }
    : { name: nav("places"), href: `${home}#places` };
  const crumbs = [
    { name: t("home"), href: home },
    parent,
    { name: primary, href: `/${locale}${path}` },
  ];
  const lite = (x: typeof raw) => ({ id: x.id, name_en: x.name_en, faith: x.faith, type: x.type, lat: x.lat, lng: x.lng, bestTime: "", coordsVerified: x.coordsVerified });

  // The lead is the first sentence; the whole summary (and story) sit behind "Read the full story".
  const lead = leadOf(p.summary);
  const restOfSummary = p.summary.slice(lead.length).trim();

  const distances: DistanceItem[] = hubDistances(raw).map((h) => {
    const est = travelEstimate(h.km);
    return {
      key: h.key,
      icon: HUB_ICON[h.key],
      label: t(h.key),
      distance: t("glance.km", { km: nf.format(h.km) }),
      estimate: est.mode === "walk" ? t("glance.walkMin", { min: est.minutes }) : t("glance.rideMin", { min: est.minutes }),
    };
  });

  const tiles = ([
    g.crowd ? { icon: "people", label: t("glance.crowd"), value: t(`glance.crowdLevel.${g.crowd}`) } : null,
    g.photography ? { icon: g.photography === "no" ? "camera-off" : "camera", label: t("glance.photography"), value: t(`glance.photographyLevel.${g.photography}`) } : null,
    g.dress ? { icon: "dress", label: t("glance.dress"), value: t(`glance.dressLevel.${g.dress}`) } : null,
    g.season ? { icon: "leaf", label: t("glance.season"), value: g.season } : null,
    near ? { icon: "walk", label: t("glance.nearest"), value: names(loc, near.place).primary, note: t("glance.walkMin", { min: near.minutes }), href: pageUrl(loc, "places", near.place.id) } : null,
    fests.length ? { icon: "calendar", label: t("festivalsHere"), value: names(loc, fests[0]).primary, note: fests.length > 1 ? fests.slice(1).map((f) => names(loc, f).primary).join(" · ") : localize(fests[0], loc).when, href: pageUrl(loc, "festivals", fests[0].id) } : null,
  ] as (GlanceTile | null)[]).filter((x): x is GlanceTile => !!x);

  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "TouristAttraction",
      "@id": absolute(`/${locale}${path}#place`),
      name: primary,
      alternateName: secondary,
      description: p.summary,
      url: absolute(`/${locale}${path}`),
      inLanguage: LOCALES[loc].bcp47,
      ...(gallery.length ? { image: gallery.map((ph) => absolute(`${ph.src}-${ph.widths.at(-1)}.webp`)) } : {}),
      geo: { "@type": "GeoCoordinates", latitude: raw.lat, longitude: raw.lng },
      address: { "@type": "PostalAddress", addressLocality: "Varanasi", addressRegion: "Uttar Pradesh", addressCountry: "IN" },
      isAccessibleForFree: !g.entry || /^(free|निःशुल्क|नि:शुल्क)/i.test(g.entry),
      ...(g.timings ? { openingHours: g.timings } : {}),
      touristType: faiths.map((f) => tp(`faiths.${f}`)),
      containedInPlace: { "@type": "City", name: "Varanasi", alternateName: ["Banaras", "Kashi"] },
      sameAs: raw.sources.map((s) => s.url).slice(0, 3),
    },
    breadcrumbLd(loc, crumbs.map((c) => ({ name: c.name, path: c.href }))),
  ];

  return (
    <>
      <LdJson data={ld} />
      <PageShell
        variant="visual"
        locale={loc}
        path={path}
        crumbs={crumbs}
        faith={faiths[0]}
        placeType={raw.type}
        chips={
          <>
            {faiths.map((f) => (
              <span key={f} className="inline-flex items-center gap-1 rounded-full border border-kashi-diya/40 bg-kashi-night/60 px-2 py-0.5 text-kashi-diya">
                <FaithGlyph faith={f} className="h-3.5 w-3.5" />
                {tp(`faiths.${f}`)}
              </span>
            ))}
            <span className="rounded-full bg-kashi-night/70 px-2 py-0.5 text-kashi-ash/90">{tp(`types.${raw.type}`)}</span>
          </>
        }
        title={primary}
        secondary={secondary}
        strip={
          <FactStrip
            items={[
              { icon: "clock", label: t("glance.timings"), value: g.timings },
              { icon: "ticket", label: t("glance.entry"), value: g.entry },
              { icon: "hourglass", label: t("glance.duration"), value: g.duration },
              { icon: "sunrise", label: tp("bestTime"), value: p.bestTime },
            ]}
          />
        }
        lead={<p>{lead}</p>}
        photo={photo}
        gallery={
          gallery.length > 1 ? (
            <Gallery
              items={gallery.slice(1).map((ph, i) => ({ photo: ph, credit: credits[i + 1] ?? null }))}
              labels={{ title: t("gallery.title"), open: t.raw("gallery.open") as string, close: t("gallery.close"), prev: t("gallery.prev"), next: t("gallery.next"), credit: t.raw("gallery.credit") as string }}
            />
          ) : null
        }
        island={
          <PageMap
            title={t("onMap")}
            loading={t("mapLoading")}
            places={[lite(raw), ...related.map(lite)]}
            focusId={id}
            hrefs={Object.fromEntries([raw, ...related].map((x) => [x.id, pageUrl(loc, "places", x.id)]))}
            clusterTemplate={tp.raw("cluster") as string}
          />
        }
        after={
          <>
            <LinkCards
              title={t("related")}
              items={related.map((r) => {
                const n = names(loc, r);
                const rg = localize(r, loc).glance;
                return { href: pageUrl(loc, "places", r.id), name: n.primary, secondary: n.secondary, photo: getPhoto(`places/${r.id}`, loc), faith: r.faith[0] ?? "secular", type: r.type, meta: rg?.duration, metaIcon: "hourglass" as const };
              })}
            />
            <LinkCards
              title={t("festivalsHere")}
              items={fests.map((f) => ({ href: pageUrl(loc, "festivals", f.id), ...(() => { const n = names(loc, f); return { name: n.primary, secondary: n.secondary }; })(), photo: getPhoto(`festivals/${f.id}`, loc), faith: f.faith[0] ?? "secular", meta: localize(f, loc).when, metaIcon: "calendar" as const }))}
            />
            <GuideLinks locale={loc} kind="places" id={id} />
            <PrevNext
              prev={{ href: pageUrl(loc, "places", prev.id), label: t("prev"), name: names(loc, prev).primary, photo: getPhoto(`places/${prev.id}`, loc), faith: prev.faith[0] ?? "secular", type: prev.type }}
              next={{ href: pageUrl(loc, "places", next.id), label: t("next"), name: names(loc, next).primary, photo: getPhoto(`places/${next.id}`, loc), faith: next.faith[0] ?? "secular", type: next.type }}
              back={{ href: parent.href, label: t("backTo", { section: parent.name }) }}
            />
          </>
        }
      >
        <div className="space-y-10">
          {proseFallsBack(loc) && <EnglishNote text={common("englishNote")} />}
          <GlanceGrid
            title={t("glance.title")}
            items={tiles}
            footnote={g.verified === false ? t("glance.unverified") : undefined}
          />
          {p.tips?.length ? (
            <Block title={t("glance.tipsHint")}>
              <ul className="space-y-3">
                {p.tips.map((tip) => (
                  <li key={tip} className="flex gap-3">
                    <Icon name="tip" className="mt-0.5 h-5 w-5 shrink-0 text-kashi-diya" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </Block>
          ) : null}
          {(restOfSummary || p.story) && (
            <details className="story-details">
              <summary>
                <Icon name="chevron" className="icon-chevron h-4 w-4" />
                {t("readStory")}
              </summary>
              <div className="mt-4 space-y-5 text-kashi-ash/90">
                {restOfSummary && <p className="leading-relaxed">{restOfSummary}</p>}
                {p.story && <p className="border-l-2 border-kashi-diya/50 pl-4 text-lg italic leading-relaxed text-kashi-ash/85">{p.story}</p>}
              </div>
            </details>
          )}
          <Sources label={tp("sources")} sources={[...raw.sources, ...(raw.glance?.sources ?? []).filter((s) => !raw.sources.some((x) => x.url === s.url))]} />
        </div>
        <aside className="space-y-8">
          <DistanceCards
            title={t("howToReach")}
            items={distances}
            note={`${t("straightLine")}${raw.coordsVerified === false ? ` · ${tp("approxCoords")}` : ""}`}
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
