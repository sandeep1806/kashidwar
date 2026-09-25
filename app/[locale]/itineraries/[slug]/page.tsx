import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Block, LinkCards, PrevNext } from "@/components/pages/Blocks";
import LdJson from "@/components/pages/LdJson";
import PageShell from "@/components/pages/PageShell";
import EnglishNote from "@/components/ui/EnglishNote";
import { getPlace, itineraries, localizeItinerary } from "@/lib/content";
import { LOCALES, locales, type Locale } from "@/lib/i18n/locales";
import { absolute, breadcrumbLd, itinerarySlug, alternatesFor, metaDescription, neighbours, pagePath, pageUrl } from "@/lib/pages";
import { getPhoto } from "@/lib/photos";
import { proseFallsBack } from "@/lib/proseLocale";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) => itineraries.map((it) => ({ locale, slug: itinerarySlug(it) })));
}

const titleOf = (locale: Locale, it: { title_en: string; title_hi: string }) =>
  LOCALES[locale].script === "devanagari" ? { primary: it.title_hi, secondary: it.title_en } : { primary: it.title_en, secondary: it.title_hi };

export async function generateMetadata({ params }: PageProps<"/[locale]/itineraries/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const raw = itineraries.find((it) => itinerarySlug(it) === slug);
  if (!raw) return {};
  const loc = locale as Locale;
  const it = localizeItinerary(raw, loc);
  const t = await getTranslations({ locale, namespace: "meta" });
  const path = pagePath("itineraries", slug);
  const title = t("itineraryTitle", { n: String(raw.days), title: titleOf(loc, raw).primary });
  const description = metaDescription(t("itineraryDescription", { n: String(raw.days), summary: it.summary }));
  return {
    title,
    description,
    alternates: alternatesFor(locale, path),
    openGraph: { type: "article", title, description, url: `/${locale}${path}` },
  };
}

export default async function ItineraryPage({ params }: PageProps<"/[locale]/itineraries/[slug]">) {
  const { locale, slug } = await params;
  const index = itineraries.findIndex((it) => itinerarySlug(it) === slug);
  if (index < 0) notFound();
  setRequestLocale(locale);
  const loc = locale as Locale;
  const raw = itineraries[index];
  const it = localizeItinerary(raw, loc);
  const [t, ti, nav, common, practical] = await Promise.all([
    getTranslations({ locale, namespace: "page" }),
    getTranslations({ locale, namespace: "itineraries" }),
    getTranslations({ locale, namespace: "nav" }),
    getTranslations({ locale, namespace: "common" }),
    getTranslations({ locale, namespace: "practical" }),
  ]);
  const devanagari = LOCALES[loc].script === "devanagari";
  const { primary, secondary } = titleOf(loc, raw);
  const path = pagePath("itineraries", slug);
  const stops = raw.plan.flatMap((d) => d.stops);
  const placeIds = [...new Set(stops.map((s) => s.placeId).filter((x): x is string => !!x))];
  const photo = placeIds.map((id) => getPhoto(`places/${id}`, loc)).find(Boolean) ?? null;
  const { prev, next } = neighbours(itineraries, index);
  const home = `/${locale}`;
  const crumbs = [
    { name: t("home"), href: home },
    { name: nav("itineraries"), href: `${home}#itineraries` },
    { name: t("itineraryDays", { n: String(raw.days) }), href: `/${locale}${path}` },
  ];
  const placeName = (id: string) => {
    const p = getPlace(id);
    return p ? (devanagari ? p.name_hi : p.name_en) : id;
  };

  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "TouristTrip",
      "@id": absolute(`/${locale}${path}#trip`),
      name: primary,
      alternateName: secondary,
      description: it.summary,
      url: absolute(`/${locale}${path}`),
      inLanguage: LOCALES[loc].bcp47,
      touristType: ["Pilgrims", "Heritage travellers"],
      itinerary: {
        "@type": "ItemList",
        numberOfItems: placeIds.length,
        itemListElement: placeIds.map((id, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: { "@type": "TouristAttraction", name: placeName(id), url: absolute(pageUrl(loc, "places", id)) },
        })),
      },
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
        faith="secular"
        chips={<span className="rounded-full border border-kashi-diya/40 px-2 py-0.5 text-kashi-diya">{ti("dayTab", { days: raw.days })}</span>}
        title={primary}
        secondary={secondary}
        lead={<p>{it.summary}</p>}
        photo={photo}
        after={
          <>
            <LinkCards
              title={t("related")}
              items={placeIds.slice(0, 8).map((id) => ({ href: pageUrl(loc, "places", id), name: placeName(id), secondary: devanagari ? getPlace(id)!.name_en : getPlace(id)!.name_hi, photo: getPhoto(`places/${id}`, loc) }))}
            />
            <PrevNext
              prev={{ href: pageUrl(loc, "itineraries", itinerarySlug(prev)), label: t("prev"), name: t("itineraryDays", { n: String(prev.days) }) }}
              next={{ href: pageUrl(loc, "itineraries", itinerarySlug(next)), label: t("next"), name: t("itineraryDays", { n: String(next.days) }) }}
              back={{ href: `${home}#itineraries`, label: t("backTo", { section: nav("itineraries") }) }}
            />
          </>
        }
      >
        <div className="space-y-12">
          {proseFallsBack(loc) && <EnglishNote text={common("englishNote")} />}
          {it.plan.map((day) => (
            <Block key={day.day} title={`${(ti.raw("day") as string).replace("{n}", String(day.day))} · ${day.theme}`}>
              <ol className="relative space-y-6 border-l border-kashi-diya/30 pl-6">
                {day.stops.map((s, i) => (
                  <li key={i} className="relative">
                    <span aria-hidden="true" className={`absolute -left-[1.9rem] top-1.5 h-3 w-3 rounded-full ${s.marker ? "bg-kashi-saffron shadow-glow" : "bg-kashi-diya/70"}`} />
                    <p className="text-xs uppercase tracking-[0.18em] text-kashi-diya/80">
                      {s.time}
                      {s.marker && ` · ${ti(s.marker)}`}
                    </p>
                    <p className="mt-1 font-display text-xl text-kashi-white">
                      {s.placeId ? (
                        <a href={pageUrl(loc, "places", s.placeId)} className="underline decoration-kashi-diya/30 underline-offset-4 hover:text-kashi-marigold">{s.title}</a>
                      ) : (
                        s.title
                      )}
                    </p>
                    <p className="mt-1 text-kashi-ash/85">{s.note}</p>
                  </li>
                ))}
              </ol>
            </Block>
          ))}
        </div>
        <aside className="space-y-8">
          <Block title={t("reachVaranasi")}>
            <div className="space-y-3 text-sm">
              <p><strong className="text-kashi-white">{practical("air.title")}.</strong> {practical("air.text")}</p>
              <p><strong className="text-kashi-white">{practical("rail.title")}.</strong> {practical("rail.text")}</p>
              <p><strong className="text-kashi-white">{practical("road.title")}.</strong> {practical("road.text")}</p>
            </div>
          </Block>
          <Block title={t("otherItineraries")}>
            <ul className="space-y-2">
              {itineraries.filter((x) => x !== raw).map((x) => (
                <li key={x.id}>
                  <a href={pageUrl(loc, "itineraries", itinerarySlug(x))} className="text-kashi-diya underline decoration-kashi-diya/40 underline-offset-4 hover:text-kashi-marigold">
                    {t("itineraryDays", { n: String(x.days) })} — {titleOf(loc, x).primary}
                  </a>
                </li>
              ))}
            </ul>
          </Block>
        </aside>
      </PageShell>
    </>
  );
}
