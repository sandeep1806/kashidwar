import { getTranslations } from "next-intl/server";
import Reveal from "@/components/motion/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import type { Locale } from "@/lib/i18n/locales";
import PlacesBody from "./PlacesBody";

/** Heading + intro are server-rendered; the explorer body loads its data from /<locale>/data/places. */
export default async function Places({ locale }: { locale: Locale }) {
  const t = await getTranslations("places");
  return (
    <section id="places" aria-labelledby="places-title" className="cv-section section-kashi scroll-mt-4">
      <div className="container-kashi pb-12 text-center">
        <SectionHeading id="places-title" locale={locale} title={t("title")} secondary={t("titleSecondary")} />
        <Reveal>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-kashi-ash/90">{t("intro")}</p>
        </Reveal>
      </div>
      <PlacesBody locale={locale} loadingLabel={t("mapLoading")} />
    </section>
  );
}
