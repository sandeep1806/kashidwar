import { getTranslations } from "next-intl/server";
import Reveal from "@/components/motion/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import type { Locale } from "@/lib/i18n/locales";
import { getPlacesProps } from "@/lib/sectionProps";
import PlacesExplorer from "./PlacesExplorer";

/**
 * Server-rendered: every card's text is in the initial HTML. The explorer is a
 * client component for filtering and the modal; the Leaflet map inside it
 * still loads only when scrolled near.
 */
export default async function Places({ locale }: { locale: Locale }) {
  const t = await getTranslations("places");
  const { items, labels } = await getPlacesProps(locale);
  return (
    <section id="places" aria-labelledby="places-title" className="cv-section section-kashi scroll-mt-4">
      <div className="container-kashi pb-12 text-center">
        <SectionHeading id="places-title" locale={locale} title={t("title")} secondary={t("titleSecondary")} />
        <Reveal>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-kashi-ash/90">{t("intro")}</p>
        </Reveal>
      </div>
      <PlacesExplorer items={items} labels={labels} detailsUrl={`/${locale}/places.json`} />
    </section>
  );
}
