import { existsSync } from "node:fs";
import path from "node:path";
import { getTranslations } from "next-intl/server";
import Reveal from "@/components/motion/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { FAITHS, PLACE_FILTERS, localize, places, type Faith, type PlaceFilter } from "@/lib/content";
import { LOCALES, type Locale } from "@/lib/i18n/locales";
import PlacesExplorer, { type ExplorerLabels, type ExplorerPlace } from "./PlacesExplorer";

const TYPES = ["ghat", "temple", "stupa", "monastery", "mosque", "church", "gurudwara", "math", "fort", "museum", "university", "heritage"];

/** Server wrapper: resolves names for the locale, checks which photos exist, translates labels. */
export default async function Places({ locale }: { locale: Locale }) {
  const t = await getTranslations("places");
  const devanagari = LOCALES[locale].script === "devanagari";
  const publicDir = path.join(process.cwd(), "public");

  const items: ExplorerPlace[] = places.map((raw) => ({
    place: localize(raw, locale),
    primaryName: devanagari ? raw.name_hi : raw.name_en,
    secondaryName: devanagari ? raw.name_en : raw.name_hi,
    hasImage: existsSync(path.join(publicDir, raw.image)),
  }));

  const allFaiths: Faith[] = [...FAITHS, "secular"];
  const labels: ExplorerLabels = {
    filters: Object.fromEntries(PLACE_FILTERS.map((f) => [f, t(`filters.${f}`)])) as Record<PlaceFilter, string>,
    faiths: Object.fromEntries(allFaiths.map((f) => [f, t(`faiths.${f}`)])) as Record<Faith, string>,
    types: Object.fromEntries(TYPES.map((k) => [k, t(`types.${k}`)])),
    results: t.raw("results"),
    bestTime: t("bestTime"),
    tips: t("tips"),
    sources: t("sources"),
    showOnMap: t("showOnMap"),
    openDetails: t("openDetails"),
    close: t("close"),
    mapTitle: t("mapTitle"),
    mapLoading: t("mapLoading"),
    approxCoords: t("approxCoords"),
    cluster: t.raw("cluster"),
  };

  return (
    <section id="places" aria-labelledby="places-title" className="section-kashi scroll-mt-4">
      <div className="container-kashi pb-12 text-center">
        <SectionHeading id="places-title" locale={locale} title={t("title")} secondary={t("titleSecondary")} />
        <Reveal>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-kashi-ash/90">{t("intro")}</p>
        </Reveal>
      </div>
      <PlacesExplorer items={items} labels={labels} />
    </section>
  );
}
