import { getTranslations } from "next-intl/server";
import { LOCALES, type Locale } from "@/lib/i18n/locales";
import HeroFallback from "./HeroFallback";
import HeroScene from "./HeroScene";

/**
 * Pre-dawn on the Ganga. The title is server-rendered and paints with the
 * first HTML; the 3D scene, when it loads, fades in beneath it.
 */
export default async function Hero({ locale }: { locale: Locale }) {
  const t = await getTranslations("hero");
  const secondaryIsLatin = LOCALES[locale].script !== "latin";

  return (
    <section
      id="hero"
      aria-labelledby="hero-title"
      className="grain relative isolate flex min-h-dvh flex-col justify-end overflow-hidden bg-kashi-night"
    >
      <HeroFallback />
      <HeroScene />
      {/* Legibility veil over the lower half */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-kashi-night/85 via-kashi-night/35 to-transparent"
      />

      <div className="container-kashi relative z-10 pb-[12vh] pt-[28vh] text-center">
        <h1 id="hero-title" className="text-glow">
          {t("title")}
          <span
            className={
              secondaryIsLatin
                ? "bilingual-secondary"
                : "bilingual-secondary-indic"
            }
            lang={secondaryIsLatin ? "en" : "hi"}
          >
            {t("titleSecondary")}
          </span>
        </h1>

        <p className="hero-rise mx-auto mt-8 max-w-2xl text-lg text-kashi-ash/90 md:text-xl">
          {t("subtitle")}
        </p>

        <a
          href="#journey"
          className="hero-rise mt-12 inline-flex items-center gap-3 rounded-kashi bg-kashi-saffron px-8 py-4 text-base font-normal text-kashi-night shadow-glow transition-[background-color,box-shadow,translate] duration-500 ease-enter hover:-translate-y-0.5 hover:bg-kashi-marigold hover:shadow-glow-lg focus-visible:bg-kashi-marigold"
        >
          {t("cta")}
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 4v16m0 0l-6-6m6 6l6-6" />
          </svg>
        </a>

        <div
          aria-hidden="true"
          className="hero-rise mx-auto mt-14 h-16 w-px bg-gradient-to-b from-kashi-diya/70 to-transparent"
        />
      </div>
    </section>
  );
}
