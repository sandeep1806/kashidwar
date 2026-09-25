import { getTranslations } from "next-intl/server";
import Reveal from "@/components/motion/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { LOCALES, type Locale } from "@/lib/i18n/locales";
import dawnArt from "@/public/media/art/dawn.svg";
import duskArt from "@/public/media/art/dusk.svg";
import noonArt from "@/public/media/art/noon.svg";
import DayInKashiScroller, { type DayScene } from "./DayInKashiScroller";

// Decorative scene backdrops live in public/media so they are cached files,
// not markup parsed on every visit. Swap for photos (AVIF) later.
const ART = { dawn: dawnArt, noon: noonArt, dusk: duskArt };

/** "A day in Kashi": server wrapper that hands translated scenes to the scroller. */
export default async function DayInKashi({ locale }: { locale: Locale }) {
  const t = await getTranslations("day");
  const scenes: DayScene[] = (["dawn", "noon", "dusk"] as const).map((id) => ({
    id,
    time: t(`scenes.${id}.time`),
    place: t(`scenes.${id}.place`),
    title: t(`scenes.${id}.title`),
    caption: t(`scenes.${id}.caption`),
    art: ART[id],
  }));

  return (
    <section id="journey" aria-labelledby="day-title" className="scroll-mt-4">
      <div className="container-kashi pb-10 pt-[12vh] text-center">
        <SectionHeading id="day-title" locale={locale} title={t("title")} secondary={t("titleSecondary")} />
        <Reveal>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-kashi-ash/90">{t("intro")}</p>
        </Reveal>
      </div>
      <DayInKashiScroller scenes={scenes} script={LOCALES[locale].script} hint={t("hint")} />
    </section>
  );
}
