import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import HashLinks from "@/components/motion/HashLinks";
import ListingShell from "@/components/pages/ListingShell";
import LazyMonthFilter from "@/components/sections/LazyMonthFilter";
import FestivalsList from "@/components/sections/FestivalsList";
import type { Locale } from "@/lib/i18n/locales";
import { alternatesFor } from "@/lib/pages";
import { getFestivalsProps } from "@/lib/sectionProps";

export async function generateMetadata({ params }: PageProps<"/[locale]/festivals">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "festivals" });
  return { title: t("title"), description: t("intro"), alternates: alternatesFor(locale, "/festivals") };
}

/** Every festival as a compact card linking to its page (the full text lives there). */
export default async function FestivalsPage({ params }: PageProps<"/[locale]/festivals">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const [{ heading, items, months, labels }, t, nav] = await Promise.all([
    getFestivalsProps(loc),
    getTranslations({ locale, namespace: "page" }),
    getTranslations({ locale, namespace: "nav" }),
  ]);
  const path = "/festivals";
  return (
    <ListingShell
      locale={loc}
      path={path}
      sectionId="festivals"
      crumbs={[{ name: t("home"), href: `/${locale}` }, { name: nav("festivals"), href: `/${locale}${path}` }]}
      title={heading.title}
      secondary={heading.secondary}
      intro={<p>{heading.intro}</p>}
      island={
        <>
          <HashLinks />
          <LazyMonthFilter />
        </>
      }
    >
      <FestivalsList items={items} months={months} labels={labels} compact />
    </ListingShell>
  );
}
