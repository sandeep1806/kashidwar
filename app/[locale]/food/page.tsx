import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import ListingShell from "@/components/pages/ListingShell";
import FoodList from "@/components/sections/FoodList";
import EnglishNote from "@/components/ui/EnglishNote";
import type { Locale } from "@/lib/i18n/locales";
import { alternatesFor } from "@/lib/pages";
import { getFoodProps } from "@/lib/sectionProps";

export async function generateMetadata({ params }: PageProps<"/[locale]/food">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "food" });
  return { title: t("title"), description: t("intro"), alternates: alternatesFor(locale, "/food") };
}

/** Every dish in full; each card has an id, so home-page cards link to /food#<id>. */
export default async function FoodPage({ params }: PageProps<"/[locale]/food">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const [{ heading, items, labels, englishNote }, t, nav] = await Promise.all([
    getFoodProps(loc),
    getTranslations({ locale, namespace: "page" }),
    getTranslations({ locale, namespace: "nav" }),
  ]);
  const path = "/food";
  return (
    <ListingShell
      locale={loc}
      path={path}
      sectionId="food"
      crumbs={[{ name: t("home"), href: `/${locale}` }, { name: nav("food"), href: `/${locale}${path}` }]}
      title={heading.title}
      secondary={heading.secondary}
      intro={
        <>
          <p>{heading.intro}</p>
          {englishNote && <EnglishNote text={englishNote} className="mt-3" />}
        </>
      }
    >
      <FoodList items={items} labels={labels} />
    </ListingShell>
  );
}
