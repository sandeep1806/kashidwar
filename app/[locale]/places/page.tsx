import type { Metadata } from "next";
import PlacesListing, { listingMetadata } from "@/components/pages/PlacesListing";
import type { Locale } from "@/lib/i18n/locales";

export async function generateMetadata({ params }: PageProps<"/[locale]/places">): Promise<Metadata> {
  const { locale } = await params;
  return listingMetadata(locale, "places");
}

export default async function Page({ params }: PageProps<"/[locale]/places">) {
  const { locale } = await params;
  return <PlacesListing locale={locale as Locale} kind="places" />;
}
