import { getTranslations } from "next-intl/server";
import Reveal from "@/components/motion/Reveal";
import StaggerCards from "@/components/motion/StaggerCards";
import FaithGlyph from "@/components/ui/FaithGlyph";
import SectionHeading from "@/components/ui/SectionHeading";
import { faithEntries, getPlace } from "@/lib/content";
import { LOCALES, type Locale } from "@/lib/i18n/locales";

/**
 * "One Kashi, every faith": seven tiles of identical size and weight, ordered
 * by arrival in the city (never by importance). Each carries its glyph, a
 * one-line essence, a verse in its own script with transliteration and
 * translation, and its key sites, which deep-link into the Places filter.
 */
export default async function Faiths({ locale }: { locale: Locale }) {
  const t = await getTranslations("faiths");
  const devanagari = LOCALES[locale].script === "devanagari";

  return (
    <section id="faiths" aria-labelledby="faiths-title" className="section-kashi scroll-mt-4">
      <div className="container-kashi text-center">
        <SectionHeading id="faiths-title" locale={locale} title={t("title")} secondary={t("titleSecondary")} />
        <Reveal>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-kashi-ash/90">{t("intro")}</p>
          <p className="mt-3 text-xs uppercase tracking-[0.2em] text-kashi-diya/80">{t("order")}</p>
        </Reveal>
      </div>

      <StaggerCards className="container-kashi mt-14 flex flex-wrap justify-center gap-5">
        {faithEntries.map((f) => (
          <article
            key={f.id}
            className="faith-tile grain relative flex w-full flex-col rounded-kashi border border-kashi-rudraksha/60 bg-kashi-indigo/40 p-6 sm:w-[calc(50%-0.625rem)] lg:w-[calc(25%-0.9375rem)]"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full border border-kashi-diya/40 text-kashi-diya">
                <FaithGlyph faith={f.id} className="h-6 w-6" />
              </span>
              <h3 className="text-[1.35rem] text-kashi-white">{t(`tiles.${f.id}.name`)}</h3>
            </div>
            <p className="mt-4 text-kashi-ash/90">{t(`tiles.${f.id}.essence`)}</p>

            <figure className="mt-5 border-t border-kashi-diya/20 pt-4">
              <figcaption className="text-[0.65rem] uppercase tracking-[0.2em] text-kashi-diya/70">{t("verseLabel")}</figcaption>
              <blockquote className="mt-2">
                <p lang={f.verse.lang} dir={f.verse.dir} className="font-display text-xl leading-snug text-kashi-white">
                  {f.verse.original}
                </p>
                <p className="mt-1 text-sm italic text-kashi-ash/75">{f.verse.transliteration}</p>
                <p className="mt-1 text-sm text-kashi-ash/90">{t(`tiles.${f.id}.translation`)}</p>
                <cite className="mt-1 block text-xs not-italic text-kashi-diya/70">{f.verse.attribution}</cite>
              </blockquote>
            </figure>

            <ul className="mt-5 flex flex-wrap gap-x-3 gap-y-1 text-sm text-kashi-ash/80">
              {f.sites.map((id) => {
                const p = getPlace(id);
                if (!p) return null;
                return <li key={id}>{devanagari ? p.name_hi : p.name_en}</li>;
              })}
            </ul>
            <a
              href={`#places/${f.filter}`}
              className="mt-auto inline-flex items-center gap-2 pt-5 text-sm text-kashi-diya underline decoration-kashi-diya/40 underline-offset-4 transition-colors hover:text-kashi-marigold"
            >
              {t("seePlaces")}
              <span aria-hidden="true">→</span>
            </a>
          </article>
        ))}
      </StaggerCards>
    </section>
  );
}
