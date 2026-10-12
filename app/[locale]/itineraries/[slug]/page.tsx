import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Block, LinkCards, PrevNext } from "@/components/pages/Blocks";
import FactStrip, { type Fact } from "@/components/pages/FactStrip";
import PageMap from "@/components/pages/PageMap";
import Icon from "@/components/ui/Icon";
import Photo from "@/components/ui/Photo";
import GuideLinks from "@/components/pages/GuideLinks";
import LdJson from "@/components/pages/LdJson";
import PageShell from "@/components/pages/PageShell";
import EnglishNote from "@/components/ui/EnglishNote";
import { getPlace, itineraries, localize, localizeItinerary } from "@/lib/content";
import { LOCALES, locales, type Locale } from "@/lib/i18n/locales";
import { absolute, breadcrumbLd, itineraryLeadPlace, itinerarySlug, alternatesFor, metaDescription, neighbours, pagePath, pageUrl } from "@/lib/pages";
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
  const [t, ti, nav, common, practical, tp] = await Promise.all([
    getTranslations({ locale, namespace: "page" }),
    getTranslations({ locale, namespace: "itineraries" }),
    getTranslations({ locale, namespace: "nav" }),
    getTranslations({ locale, namespace: "common" }),
    getTranslations({ locale, namespace: "practical" }),
    getTranslations({ locale, namespace: "places" }),
  ]);
  const devanagari = LOCALES[loc].script === "devanagari";
  const { primary, secondary } = titleOf(loc, raw);
  const path = pagePath("itineraries", slug);
  const stops = raw.plan.flatMap((d) => d.stops);
  const placeIds = [...new Set(stops.map((s) => s.placeId).filter((x): x is string => !!x))];
  const lead = itineraryLeadPlace(raw);
  const photo = (lead ? getPhoto(`places/${lead}`, loc) : null) ?? placeIds.map((id) => getPhoto(`places/${id}`, loc)).find(Boolean) ?? null;
  const { prev, next } = neighbours(itineraries, index);
  const home = `/${locale}`;
  const crumbs = [
    { name: t("home"), href: home },
    { name: nav("itineraries"), href: `${home}/itineraries` },
    { name: t("itineraryDays", { n: String(raw.days) }), href: `/${locale}${path}` },
  ];
  const glanceOf = (id: string) => {
    const p = getPlace(id);
    return p ? localize(p, loc).glance : undefined;
  };
  const isFree = (entry?: string) => !entry || /^(free|निःशुल्क|नि:शुल्क|ghat free|घाट निःशुल्क)/i.test(entry);
  const paid = placeIds.filter((id) => !isFree(glanceOf(id)?.entry));
  const firstStop = it.plan[0].stops[0];
  const lastDay = it.plan[it.plan.length - 1];
  const lastStop = lastDay.stops[lastDay.stops.length - 1];
  const dayLabel = (n: number) => (ti.raw("day") as string).replace("{n}", String(n));
  const facts: Fact[] = [
    { icon: "calendar", label: ti("facts.days"), value: String(raw.days) },
    { icon: "pin", label: ti("facts.places"), value: String(placeIds.length) },
    { icon: "sunrise", label: ti("facts.starts"), value: `${firstStop.time} · ${firstStop.title}` },
    { icon: "clock", label: ti("facts.ends"), value: `${lastStop.time} · ${lastStop.title}` },
    { icon: "ticket", label: ti("facts.paid"), value: paid.length ? paid.map((id) => `${placeName(id)}: ${glanceOf(id)?.entry}`).join(" · ") : ti("facts.allFree") },
    { icon: "walk", label: ti("facts.around"), value: ti("facts.aroundValue") },
  ];
  const lite = (id: string) => {
    const p = getPlace(id)!;
    return { id: p.id, name_en: p.name_en, faith: p.faith, type: p.type, lat: p.lat, lng: p.lng, bestTime: "", coordsVerified: p.coordsVerified };
  };
  function placeName(id: string) {
    const p = getPlace(id);
    return p ? (devanagari ? p.name_hi : p.name_en) : id;
  }

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
        variant="visual"
        locale={loc}
        path={path}
        crumbs={crumbs}
        faith="secular"
        chips={<span className="inline-flex items-center gap-1 rounded-full border border-kashi-diya/40 bg-kashi-night/60 px-2 py-0.5 text-kashi-diya"><Icon name="calendar" className="h-3.5 w-3.5" />{ti("dayTab", { days: raw.days })}</span>}
        title={primary}
        secondary={secondary}
        strip={<FactStrip className="fact-strip-3" items={facts} />}
        lead={
          <div>
            <p>{it.summary}</p>
            <nav aria-label={nav("itineraries")} className="guide-jump mt-6">
              {it.plan.map((day) => (
                <a key={day.day} href={`#day-${day.day}`} className="guide-jump-chip">
                  <Icon name="calendar" className="h-4 w-4 shrink-0 text-kashi-diya" />
                  <span>{dayLabel(day.day)} · {day.theme}</span>
                </a>
              ))}
              <a href="#route" className="guide-jump-chip">
                <Icon name="pin" className="h-4 w-4 shrink-0 text-kashi-diya" />
                <span>{ti("facts.route")}</span>
              </a>
            </nav>
          </div>
        }
        photo={photo}
        island={
          <div id="route" className="scroll-mt-24">
            <PageMap
              title={ti("facts.route")}
              loading={t("mapLoading")}
              places={placeIds.map(lite)}
              hrefs={Object.fromEntries(placeIds.map((id) => [id, pageUrl(loc, "places", id)]))}
              clusterTemplate={tp.raw("cluster") as string}
            />
          </div>
        }
        after={
          <>
            <LinkCards
              title={t("related")}
              items={placeIds.slice(0, 8).map((id) => ({ href: pageUrl(loc, "places", id), name: placeName(id), secondary: devanagari ? getPlace(id)!.name_en : getPlace(id)!.name_hi, photo: getPhoto(`places/${id}`, loc), faith: getPlace(id)!.faith[0] ?? "secular", type: getPlace(id)!.type }))}
            />
            <GuideLinks locale={loc} kind="itineraries" id={slug} />
            <PrevNext
              prev={{ href: pageUrl(loc, "itineraries", itinerarySlug(prev)), label: t("prev"), name: t("itineraryDays", { n: String(prev.days) }) }}
              next={{ href: pageUrl(loc, "itineraries", itinerarySlug(next)), label: t("next"), name: t("itineraryDays", { n: String(next.days) }) }}
              back={{ href: `${home}/itineraries`, label: t("backTo", { section: nav("itineraries") }) }}
            />
          </>
        }
      >
        <div className="space-y-12">
          {proseFallsBack(loc) && <EnglishNote text={common("englishNote")} />}
          {it.plan.map((day) => (
            <section key={day.day} id={`day-${day.day}`} className="guide-card scroll-mt-24">
              <h2 className="flex items-start gap-3 text-h3 text-kashi-white">
                <span className="guide-card-icon"><Icon name="calendar" className="h-5 w-5" /></span>
                <span>{dayLabel(day.day)} · {day.theme}</span>
              </h2>
              <ol className="day-timeline mt-6">
                {day.stops.map((s, i) => {
                  const ph = s.placeId ? getPhoto(`places/${s.placeId}`, loc) : null;
                  const g = s.placeId ? glanceOf(s.placeId) : undefined;
                  return (
                    <li key={i} className={`day-stop ${s.marker ? "has-marker" : ""}`}>
                      <span className="day-time">
                        {s.marker && <Icon name={s.marker === "sunrise" ? "sunrise" : "sunrise"} className="h-3.5 w-3.5" />}
                        {s.time}
                      </span>
                      <div className="day-stop-body">
                        {ph && (
                          <a href={pageUrl(loc, "places", s.placeId!)} className="day-thumb" tabIndex={-1} aria-hidden="true">
                            <Photo photo={ph} sizes="96px" decorative />
                          </a>
                        )}
                        <div className="min-w-0">
                          <p className="font-display text-lg leading-snug text-kashi-white sm:text-xl">
                            {s.placeId ? (
                              <a href={pageUrl(loc, "places", s.placeId)} className="underline decoration-kashi-diya/30 underline-offset-4 hover:text-kashi-marigold">{s.title}</a>
                            ) : (
                              s.title
                            )}
                          </p>
                          {s.marker && <p className="mt-0.5 text-xs uppercase tracking-[0.16em] text-kashi-saffron">{ti(s.marker)}</p>}
                          <p className="mt-1 text-kashi-ash/85">{s.note}</p>
                          {g && (g.duration || g.entry || g.timings) && (
                            <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-kashi-ash/75">
                              {g.duration && <li className="inline-flex items-center gap-1"><Icon name="hourglass" className="h-3.5 w-3.5 text-kashi-diya/80" />{g.duration}</li>}
                              {g.entry && <li className="inline-flex items-center gap-1"><Icon name="ticket" className="h-3.5 w-3.5 text-kashi-diya/80" />{g.entry}</li>}
                              {g.timings && <li className="inline-flex items-center gap-1"><Icon name="clock" className="h-3.5 w-3.5 text-kashi-diya/80" /><span className="line-clamp-1">{g.timings}</span></li>}
                            </ul>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </div>
        <aside className="space-y-8">
          <Block title={t("reachVaranasi")}>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3"><Icon name="plane" className="mt-0.5 h-5 w-5 shrink-0 text-kashi-diya" /><span><strong className="text-kashi-white">{practical("air.title")}.</strong> {practical("air.text")}</span></li>
              <li className="flex gap-3"><Icon name="train" className="mt-0.5 h-5 w-5 shrink-0 text-kashi-diya" /><span><strong className="text-kashi-white">{practical("rail.title")}.</strong> {practical("rail.text")}</span></li>
              <li className="flex gap-3"><Icon name="car" className="mt-0.5 h-5 w-5 shrink-0 text-kashi-diya" /><span><strong className="text-kashi-white">{practical("road.title")}.</strong> {practical("road.text")}</span></li>
            </ul>
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
