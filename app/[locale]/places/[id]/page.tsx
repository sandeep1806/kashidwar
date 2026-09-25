import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Block, Facts, LinkCards, PrevNext, Sources } from "@/components/pages/Blocks";
import LdJson from "@/components/pages/LdJson";
import PageMap from "@/components/pages/PageMap";
import PageShell from "@/components/pages/PageShell";
import EnglishNote from "@/components/ui/EnglishNote";
import FaithGlyph from "@/components/ui/FaithGlyph";
import { localize, places, type Faith } from "@/lib/content";
import { LOCALES, locales, type Locale } from "@/lib/i18n/locales";
import { absolute, breadcrumbLd, festivalsAt, hubDistances, alternatesFor, mapLinks, metaDescription, neighbours, pagePath, pageUrl, relatedPlaces } from "@/lib/pages";
import { getPhoto } from "@/lib/photos";
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

export default async function PlacePage({ params }: PageProps<"/[locale]/places/[id]">) {
  const { locale, id } = await params;
  const index = places.findIndex((p) => p.id === id);
  if (index < 0) notFound();
  setRequestLocale(locale);
  const loc = locale as Locale;
  const raw = places[index];
  const p = localize(raw, loc);
  const [t, tp, tf, nav, common] = await Promise.all([
    getTranslations({ locale, namespace: "page" }),
    getTranslations({ locale, namespace: "places" }),
    getTranslations({ locale, namespace: "festivals" }),
    getTranslations({ locale, namespace: "nav" }),
    getTranslations({ locale, namespace: "common" }),
  ]);
  const { primary, secondary } = names(loc, raw);
  const path = pagePath("places", id);
  const faiths: Faith[] = raw.faith.length ? raw.faith : ["secular"];
  const photo = getPhoto(`places/${id}`, loc);
  const links = mapLinks(raw);
  const related = relatedPlaces(raw);
  const fests = festivalsAt(id);
  const { prev, next } = neighbours(places, index);
  const home = `/${locale}`;
  const crumbs = [
    { name: t("home"), href: home },
    { name: nav("places"), href: `${home}#places` },
    { name: primary, href: `/${locale}${path}` },
  ];
  const lite = (x: typeof raw) => ({ id: x.id, name_en: x.name_en, faith: x.faith, type: x.type, lat: x.lat, lng: x.lng, bestTime: "", coordsVerified: x.coordsVerified });

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
      ...(photo ? { image: absolute(`${photo.src}-${photo.widths.at(-1)}.webp`) } : {}),
      geo: { "@type": "GeoCoordinates", latitude: raw.lat, longitude: raw.lng },
      address: { "@type": "PostalAddress", addressLocality: "Varanasi", addressRegion: "Uttar Pradesh", addressCountry: "IN" },
      isAccessibleForFree: true,
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
        locale={loc}
        path={path}
        crumbs={crumbs}
        faith={faiths[0]}
        chips={
          <>
            {faiths.map((f) => (
              <span key={f} className="inline-flex items-center gap-1 rounded-full border border-kashi-diya/40 px-2 py-0.5 text-kashi-diya">
                <FaithGlyph faith={f} className="h-3.5 w-3.5" />
                {tp(`faiths.${f}`)}
              </span>
            ))}
            <span className="rounded-full bg-kashi-rudraksha/50 px-2 py-0.5 text-kashi-ash/80">{tp(`types.${raw.type}`)}</span>
          </>
        }
        title={primary}
        secondary={secondary}
        lead={<p>{p.summary}</p>}
        photo={photo}
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
              items={related.map((r) => ({ href: pageUrl(loc, "places", r.id), ...(() => { const n = names(loc, r); return { name: n.primary, secondary: n.secondary }; })(), photo: getPhoto(`places/${r.id}`, loc) }))}
            />
            <LinkCards
              title={t("festivalsHere")}
              items={fests.map((f) => ({ href: pageUrl(loc, "festivals", f.id), ...(() => { const n = names(loc, f); return { name: n.primary, secondary: n.secondary }; })(), photo: getPhoto(`festivals/${f.id}`, loc), meta: localize(f, loc).when }))}
            />
            <PrevNext
              prev={{ href: pageUrl(loc, "places", prev.id), label: t("prev"), name: names(loc, prev).primary }}
              next={{ href: pageUrl(loc, "places", next.id), label: t("next"), name: names(loc, next).primary }}
              back={{ href: `${home}#places`, label: t("backTo", { section: nav("places") }) }}
            />
          </>
        }
      >
        <div className="space-y-10">
          {proseFallsBack(loc) && <EnglishNote text={common("englishNote")} />}
          {p.story && (
            <p className="border-l-2 border-kashi-diya/50 pl-4 text-lg italic leading-relaxed text-kashi-ash/85">{p.story}</p>
          )}
          {p.tips?.length ? (
            <Block title={tp("tips")}>
              <ul className="list-disc space-y-2 pl-5">
                {p.tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </Block>
          ) : null}
          <Block title={t("howToReach")}>
            <ul className="space-y-1.5">
              {hubDistances(raw).map((h) => (
                <li key={h.key}>{t("fromHub", { km: new Intl.NumberFormat(LOCALES[loc].bcp47).format(h.km), hub: t(h.key) })}</li>
              ))}
            </ul>
            <p className="mt-2 text-sm text-kashi-ash/60">{t("straightLine")}{raw.coordsVerified === false ? ` · ${tp("approxCoords")}` : ""}</p>
            <p className="mt-4 flex flex-wrap gap-4 text-sm">
              <a href={links.google} target="_blank" rel="noopener noreferrer" className="text-kashi-diya underline decoration-kashi-diya/40 underline-offset-4 hover:text-kashi-marigold">{t("googleMaps")}</a>
              <a href={links.osm} target="_blank" rel="noopener noreferrer" className="text-kashi-diya underline decoration-kashi-diya/40 underline-offset-4 hover:text-kashi-marigold">{t("osm")}</a>
            </p>
          </Block>
          <Sources label={tp("sources")} sources={raw.sources} />
        </div>
        <aside>
          <Facts
            items={[
              { label: tp("bestTime"), value: p.bestTime },
              { label: t("location"), value: `${raw.lat.toFixed(4)}° N, ${raw.lng.toFixed(4)}° E` },
              ...(fests.length ? [{ label: tf("title"), value: fests.map((f) => names(loc, f).primary).join(" · ") }] : []),
            ]}
          />
        </aside>
      </PageShell>
    </>
  );
}
