import { getTranslations } from "next-intl/server";
import Reveal from "@/components/motion/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import Static from "@/components/ui/Static";
import type { Locale } from "@/lib/i18n/locales";
import { getPlacesProps } from "@/lib/sectionProps";
import StaggerCards from "@/components/motion/StaggerCards";
import PlaceCard from "@/components/ui/PlaceCard";
import PlacesExplorer from "./PlacesExplorer";

/**
 * Server-rendered: every card's text is in the initial HTML and the cards are
 * not hydrated. The explorer island handles the filters, the modal and the
 * Leaflet map (which loads only when scrolled near).
 */
export default async function Places({ locale }: { locale: Locale }) {
  const t = await getTranslations("places");
  const { items, labels } = await getPlacesProps(locale);
  return (
    <section id="places" aria-labelledby="places-title" className="cv-section section-kashi scroll-mt-4">
      <Static>
        <div className="container-kashi pb-12 text-center">
        <SectionHeading id="places-title" locale={locale} title={t("title")} secondary={t("titleSecondary")} />
        <Reveal>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-kashi-ash/90">{t("intro")}</p>
        </Reveal>
      </div>
      </Static>
      <PlacesExplorer
        items={items}
        labels={labels}
        detailsUrl={`/${locale}/places.json`}
        grid={
          <Static>
            <StaggerCards className="mt-10 grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item) => (
                <PlaceCard key={item.place.id} place={item.place} primaryName={item.primaryName} secondaryName={item.secondaryName} photo={item.photo} labels={labels} />
              ))}
            </StaggerCards>
          </Static>
        }
      />
    </section>
  );
}
