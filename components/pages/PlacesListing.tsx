import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import ListingShell from "@/components/pages/ListingShell";
import PlaceCard from "@/components/ui/PlaceCard";
import { LOCALES, type Locale } from "@/lib/i18n/locales";
import { alternatesFor, pageUrl } from "@/lib/pages";
import { getPlacesProps } from "@/lib/sectionProps";
import type { PlaceType } from "@/lib/contentTypes";

/**
 * "Ghats of Varanasi" / "Temples of Varanasi": every place of one type as a
 * static card grid linking to its page. The home page's places explorer stays
 * the interactive view; these pages give the two biggest groups a URL of their
 * own (the old site had /ghats/ and /mandir/ indexes, still searched for).
 */
export type ListingKind = "ghats" | "temples";

const TYPE_OF: Record<ListingKind, PlaceType> = { ghats: "ghat", temples: "temple" };
const KEY_OF: Record<ListingKind, { title: string; intro: string }> = {
  ghats: { title: "ghatsTitle", intro: "ghatsIntro" },
  temples: { title: "templesTitle", intro: "templesIntro" },
};

export async function listingMetadata(locale: string, kind: ListingKind): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "places" });
  return { title: t(KEY_OF[kind].title), description: t(KEY_OF[kind].intro), alternates: alternatesFor(locale, `/${kind}`) };
}

export default async function PlacesListing({ locale, kind }: { locale: Locale; kind: ListingKind }) {
  setRequestLocale(locale);
  const [{ items, labels }, tp, t, nav] = await Promise.all([
    getPlacesProps(locale),
    getTranslations({ locale, namespace: "places" }),
    getTranslations({ locale, namespace: "page" }),
    getTranslations({ locale, namespace: "nav" }),
  ]);
  const path = `/${kind}`;
  const list = items.filter((item) => item.place.type === TYPE_OF[kind]);
  // Bilingual H1: the same title in the other language (English under Devanagari, Hindi otherwise).
  const other = await getTranslations({ locale: LOCALES[locale].script === "devanagari" ? "en" : "hi", namespace: "places" });
  const secondary = other(KEY_OF[kind].title);
  return (
    <ListingShell
      locale={locale}
      path={path}
      sectionId="places"
      crumbs={[
        { name: t("home"), href: `/${locale}` },
        { name: nav("places"), href: `/${locale}#places` },
        { name: tp(KEY_OF[kind].title), href: `/${locale}${path}` },
      ]}
      title={tp(KEY_OF[kind].title)}
      secondary={secondary}
      intro={<p>{tp(KEY_OF[kind].intro)}</p>}
    >
      <p className="sr-only">{tp("results", { count: list.length })}</p>
      <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-3 xl:grid-cols-4">
        {list.map((item) => (
          <PlaceCard key={item.place.id} place={item.place} primaryName={item.primaryName} secondaryName={item.secondaryName} photo={item.photo} labels={labels} href={pageUrl(locale, "places", item.place.id)} />
        ))}
      </div>
    </ListingShell>
  );
}
