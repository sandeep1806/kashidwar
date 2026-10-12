import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import ListingFaq, { GhatsIndex } from "@/components/pages/ListingFaq";
import ListingShell from "@/components/pages/ListingShell";
import PhotoBand from "@/components/pages/PhotoBand";
import EnglishNote from "@/components/ui/EnglishNote";
import PlaceCard from "@/components/ui/PlaceCard";
import { LOCALES, type Locale } from "@/lib/i18n/locales";
import { alternatesFor, pageUrl } from "@/lib/pages";
import { getPlacesProps } from "@/lib/sectionProps";
import { proseFallsBack } from "@/lib/proseLocale";
import type { PlaceType } from "@/lib/contentTypes";

/**
 * "Places to visit in Varanasi" (/places: every place, grouped by type),
 * "Ghats of Varanasi" (/ghats: the 13 ghat pages plus the index of all 84) and
 * "Temples of Varanasi" (/temples): static card grids linking to each page,
 * with the questions people search for answered underneath (FAQPage JSON-LD).
 * The home page's places explorer stays the interactive view.
 */
export type ListingKind = "ghats" | "temples" | "places";

const TYPE_OF: Record<ListingKind, PlaceType | null> = { ghats: "ghat", temples: "temple", places: null };
const KEY_OF: Record<ListingKind, { title: string; intro: string; meta: string }> = {
  ghats: { title: "ghatsTitle", intro: "ghatsIntro", meta: "ghatsTitle" },
  temples: { title: "templesTitle", intro: "templesIntro", meta: "templesTitle" },
  places: { title: "allTitle", intro: "allIntro", meta: "placesTitle" },
};
/** Groups on /places, in this order (type labels come from places.types). */
const GROUPS: PlaceType[][] = [["ghat"], ["temple"], ["stupa", "monastery"], ["fort", "university", "heritage", "museum"], ["mosque", "gurudwara", "church", "math"]];

export async function listingMetadata(locale: string, kind: ListingKind): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "places" });
  const meta = await getTranslations({ locale, namespace: "meta" });
  return { title: meta(KEY_OF[kind].meta), description: t(KEY_OF[kind].intro), alternates: alternatesFor(locale, `/${kind}`) };
}

export default async function PlacesListing({ locale, kind }: { locale: Locale; kind: ListingKind }) {
  setRequestLocale(locale);
  const [{ items, labels }, tp, t, tg, common] = await Promise.all([
    getPlacesProps(locale),
    getTranslations({ locale, namespace: "places" }),
    getTranslations({ locale, namespace: "page" }),
    getTranslations({ locale, namespace: "guides" }),
    getTranslations({ locale, namespace: "common" }),
  ]);
  const path = `/${kind}`;
  const type = TYPE_OF[kind];
  const list = type ? items.filter((item) => item.place.type === type) : items;
  // Bilingual H1: the same title in the other language (English under Devanagari, Hindi otherwise).
  const other = await getTranslations({ locale: LOCALES[locale].script === "devanagari" ? "en" : "hi", namespace: "places" });
  const secondary = other(KEY_OF[kind].title);
  const card = (item: (typeof items)[number]) => (
    <PlaceCard key={item.place.id} place={item.place} primaryName={item.primaryName} secondaryName={item.secondaryName} photo={item.photo} labels={labels} href={pageUrl(locale, "places", item.place.id)} />
  );
  const grid = "grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-3 xl:grid-cols-4";
  const faqFallsBack = proseFallsBack(locale);
  return (
    <ListingShell
      locale={locale}
      path={path}
      sectionId="places"
      crumbs={[
        { name: t("home"), href: `/${locale}` },
        ...(kind === "places" ? [] : [{ name: tp("allTitle"), href: `/${locale}/places` }]),
        { name: tp(KEY_OF[kind].title), href: `/${locale}${path}` },
      ]}
      title={tp(KEY_OF[kind].title)}
      secondary={secondary}
      intro={<p>{tp(KEY_OF[kind].intro)}</p>}
      band={<PhotoBand photos={list.filter((i) => i.photo).slice(0, 4).map((i) => i.photo)} faith="hindu" />}
    >
      <div className="container-kashi">
      <p className="sr-only">{tp("results", { count: list.length })}</p>
      {kind === "places" ? (
        GROUPS.map((types) => {
          const group = list.filter((i) => types.includes(i.place.type));
          if (!group.length) return null;
          const label = types.length === 1 ? tp(`types.${types[0]}`) : types.map((x) => tp(`types.${x}`)).join(" · ");
          const href = types[0] === "ghat" ? `/${locale}/ghats` : types[0] === "temple" ? `/${locale}/temples` : null;
          return (
            <section key={types.join()} className="mt-14">
              <h2 className="mb-6 flex items-center gap-4 text-h3 text-kashi-white">
                {href ? <a href={href} className="hover:text-kashi-marigold">{label} ({group.length})</a> : <span>{label} ({group.length})</span>}
                <span aria-hidden="true" className="h-px flex-1 bg-gradient-to-r from-kashi-diya/40 to-transparent" />
              </h2>
              <div className={grid}>{group.map(card)}</div>
            </section>
          );
        })
      ) : (
        <div className={`mt-10 ${grid}`}>{list.map(card)}</div>
      )}
      {kind !== "places" && (
        <p className="mt-10 text-center">
          <a href={`/${locale}/places`} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-kashi-diya/40 px-5 text-sm text-kashi-diya transition-colors hover:border-kashi-marigold hover:text-kashi-marigold">{tp("allPlaces")} <span aria-hidden="true">→</span></a>
        </p>
      )}
      </div>
      {kind === "ghats" && <GhatsIndex locale={locale} title={tp("ghatsListTitle")} note={tp("ghatsListNote")} hrefFor={(id) => pageUrl(locale, "places", id)} />}
      {faqFallsBack && <div className="container-kashi mt-16"><EnglishNote text={common("englishNote")} /></div>}
      <ListingFaq locale={locale} kind={kind} title={tg("faq")} path={`/${locale}${path}`} sourcesLabel={tp("sources")} />
    </ListingShell>
  );
}
