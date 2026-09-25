import { getTranslations } from "next-intl/server";
import Reveal from "@/components/motion/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { itineraries, places } from "@/lib/content";
import { LOCALES, type Locale } from "@/lib/i18n/locales";
import ItineraryTabsClient from "./ItineraryTabsClient";

export default async function Itineraries({ locale }: { locale: Locale }) {
  const t = await getTranslations("itineraries");
  const devanagari = LOCALES[locale].script === "devanagari";
  const placeNames = Object.fromEntries(places.map((p) => [p.id, devanagari ? p.name_hi : p.name_en]));
  const tabs = itineraries.map((it) => t("dayTab", { days: it.days }));

  return (
    <section id="itineraries" aria-labelledby="itineraries-title" className="section-kashi scroll-mt-4">
      <div className="container-kashi text-center">
        <SectionHeading id="itineraries-title" locale={locale} title={t("title")} secondary={t("titleSecondary")} />
        <Reveal>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-kashi-ash/90">{t("intro")}</p>
        </Reveal>
      </div>
      <div className="mt-12">
        <ItineraryTabsClient
          itineraries={itineraries}
          tabs={tabs}
          dayTemplate={t.raw("day")}
          sunrise={t("sunrise")}
          sunset={t("sunset")}
          placeNames={placeNames}
        />
      </div>
      <p className="container-kashi mt-6 text-center text-xs text-kashi-ash/60">{t("placesNote")}</p>
    </section>
  );
}
