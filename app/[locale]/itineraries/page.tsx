import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import ListingFaq from "@/components/pages/ListingFaq";
import ListingShell from "@/components/pages/ListingShell";
import PhotoBand from "@/components/pages/PhotoBand";
import Icon from "@/components/ui/Icon";
import Photo from "@/components/ui/Photo";
import ArtFallback from "@/components/ui/ArtFallback";
import { getPlace, itineraries, localizeItinerary } from "@/lib/content";
import { displayName } from "@/lib/contentTypes";
import { LOCALES, type Locale } from "@/lib/i18n/locales";
import { alternatesFor, itineraryLeadPlace, itinerarySlug, pageUrl } from "@/lib/pages";
import { guideBySlug, guideTranslations, localizeGuide } from "@/lib/guides";
import { getPhoto } from "@/lib/photos";
import { isIndexed } from "@/lib/seo";

/**
 * /itineraries — "Varanasi itinerary": the 1-, 2- and 3-day plans as photo
 * cards (stops, places, start and end), then the planning questions people
 * search for (FAQPage JSON-LD).
 */
export async function generateMetadata({ params }: PageProps<"/[locale]/itineraries">): Promise<Metadata> {
  const { locale } = await params;
  const meta = await getTranslations({ locale, namespace: "meta" });
  const t = await getTranslations({ locale, namespace: "itineraries" });
  return isIndexed(locale)
    ? { title: meta("itinerariesTitle"), description: meta("itinerariesDesc"), alternates: alternatesFor(locale, "/itineraries") }
    : { title: t("title"), description: t("intro"), alternates: alternatesFor(locale, "/itineraries") };
}

export default async function ItinerariesPage({ params }: PageProps<"/[locale]/itineraries">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const [t, tp, tpl] = await Promise.all([
    getTranslations({ locale, namespace: "itineraries" }),
    getTranslations({ locale, namespace: "page" }),
    getTranslations({ locale, namespace: "places" }),
  ]);
  const gtr = await guideTranslations(loc);
  const other = await getTranslations({ locale: LOCALES[loc].script === "devanagari" ? "en" : "hi", namespace: "itineraries" });
  const plans = itineraries.map((raw) => {
    const it = localizeItinerary(raw, loc);
    const stops = it.plan.flatMap((d) => d.stops);
    const placeIds = [...new Set(stops.map((s) => s.placeId).filter((x): x is string => !!x))];
    const lead = itineraryLeadPlace(raw);
    const photos = placeIds.map((id) => getPhoto(`places/${id}`, loc)).filter(Boolean);
    return { raw, it, stops, placeIds, photo: (lead ? getPhoto(`places/${lead}`, loc) : null) ?? photos[0] ?? null, href: pageUrl(loc, "itineraries", itinerarySlug(raw)) };
  });
  return (
    <ListingShell
      locale={loc}
      path="/itineraries"
      sectionId="itineraries"
      crumbs={[{ name: tp("home"), href: `/${locale}` }, { name: t("title"), href: `/${locale}/itineraries` }]}
      title={t("title")}
      secondary={other("title")}
      intro={<p>{t("facts.hubIntro")}</p>}
      band={<PhotoBand photos={plans.flatMap((p) => p.placeIds.map((id) => getPhoto(`places/${id}`, loc))).filter(Boolean).slice(0, 4)} />}
    >
      <div className="container-kashi mt-12">
        <h2 className="sr-only">{t("facts.plans")}</h2>
        <ul className="grid gap-6 lg:grid-cols-3">
          {plans.map(({ raw, it, stops, placeIds, photo, href }) => {
            const first = it.plan[0].stops[0];
            const lastDay = it.plan[it.plan.length - 1];
            const last = lastDay.stops[lastDay.stops.length - 1];
            return (
              <li key={raw.id}>
                <a href={href} className="group flex h-full flex-col overflow-hidden rounded-kashi border border-kashi-rudraksha/60 bg-kashi-indigo/40 card-lift">
                  <div className="arch relative mx-3 mt-3 aspect-[16/10] overflow-hidden bg-kashi-indigo">
                    {photo ? <Photo photo={photo} sizes={[["(min-width: 1024px)", "380px", 16 / 10], [null, "92vw", 16 / 10]]} className="photo-zoom" /> : <ArtFallback faith="secular" />}
                    <span className="absolute left-3 top-3 z-[1] inline-flex items-center gap-1 rounded-full bg-kashi-saffron px-3 py-1 text-xs font-medium text-kashi-night">
                      <Icon name="calendar" className="h-3.5 w-3.5" />
                      {t("dayTab", { days: raw.days })}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-display text-2xl leading-snug text-kashi-white">{displayName(loc, { name_en: raw.title_en, name_hi: raw.title_hi, names: raw.titles }).primary}</h3>
                    <p className="mt-2 text-kashi-ash/85">{it.summary}</p>
                    <ul className="mt-4 grid grid-cols-2 gap-2 text-xs text-kashi-ash/80">
                      <li className="inline-flex items-center gap-1.5"><Icon name="tip" className="h-4 w-4 text-kashi-diya" />{(t.raw("facts.stops") as string).replace("{n}", String(stops.length))}</li>
                      <li className="inline-flex items-center gap-1.5"><Icon name="pin" className="h-4 w-4 text-kashi-diya" />{placeIds.length} {t("facts.places")}</li>
                      <li className="col-span-2 inline-flex items-center gap-1.5"><Icon name="sunrise" className="h-4 w-4 shrink-0 text-kashi-diya" /><span className="line-clamp-1">{first.time} · {first.title}</span></li>
                      <li className="col-span-2 inline-flex items-center gap-1.5"><Icon name="clock" className="h-4 w-4 shrink-0 text-kashi-diya" /><span className="line-clamp-1">{last.time} · {last.title}</span></li>
                    </ul>
                    <p className="mt-auto flex flex-wrap gap-1.5 pt-4">
                      {placeIds.slice(0, 5).map((id) => (
                        <span key={id} className="rounded-full bg-kashi-rudraksha/50 px-2 py-0.5 text-[0.7rem] text-kashi-ash/85">{getPlace(id) ? displayName(loc, getPlace(id)!).primary : id}</span>
                      ))}
                    </p>
                  </div>
                </a>
              </li>
            );
          })}
        </ul>
        <p className="mt-8 flex flex-wrap justify-center gap-3">
          <a href={`/${locale}/guides/varanasi-in-2-days`} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-kashi-diya/40 px-5 text-sm text-kashi-diya hover:border-kashi-marigold hover:text-kashi-marigold"><Icon name="tip" className="h-4 w-4" />{localizeGuide(guideBySlug("varanasi-in-2-days")!, loc, gtr).title.split(":")[0]}</a>
          <a href={`/${locale}/guides/varanasi-trip-cost`} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-kashi-diya/40 px-5 text-sm text-kashi-diya hover:border-kashi-marigold hover:text-kashi-marigold"><Icon name="ticket" className="h-4 w-4" />{localizeGuide(guideBySlug("varanasi-trip-cost")!, loc, gtr).title.split(":")[0]}</a>
          <a href={`/${locale}/map`} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-kashi-diya/40 px-5 text-sm text-kashi-diya hover:border-kashi-marigold hover:text-kashi-marigold"><Icon name="pin" className="h-4 w-4" />{tpl("mapTitle")}</a>
        </p>
      </div>
      <ListingFaq locale={loc} kind="itineraries" title={t("facts.faq")} path={`/${locale}/itineraries`} sourcesLabel={tpl("sources")} />
    </ListingShell>
  );
}
