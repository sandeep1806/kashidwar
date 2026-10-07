import type { Metadata } from "next";
import PlacesListing, { listingMetadata } from "@/components/pages/PlacesListing";
import type { Locale } from "@/lib/i18n/locales";

export async function generateMetadata({ params }: PageProps<"/[locale]/temples">): Promise<Metadata> {
  const { locale } = await params;
  return listingMetadata(locale, "temples");
}

export default async function Page({ params }: PageProps<"/[locale]/temples">) {
  const { locale } = await params;
  return <PlacesListing locale={locale as Locale} kind="temples" />;
}
