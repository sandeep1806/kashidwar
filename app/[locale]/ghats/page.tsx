import type { Metadata } from "next";
import PlacesListing, { listingMetadata } from "@/components/pages/PlacesListing";
import type { Locale } from "@/lib/i18n/locales";

export async function generateMetadata({ params }: PageProps<"/[locale]/ghats">): Promise<Metadata> {
  const { locale } = await params;
  return listingMetadata(locale, "ghats");
}

export default async function Page({ params }: PageProps<"/[locale]/ghats">) {
  const { locale } = await params;
  return <PlacesListing locale={locale as Locale} kind="ghats" />;
}
