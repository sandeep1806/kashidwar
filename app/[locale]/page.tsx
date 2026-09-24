import { getTranslations, setRequestLocale } from "next-intl/server";
import { LOCALES, type Locale } from "@/lib/i18n/locales";

/**
 * Phase 1 placeholder page. Proves tokens, fonts and i18n wiring.
 * Phase 2 replaces this with the loader + R3F hero.
 */
export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("hero");
  const secondaryIsLatin = LOCALES[locale as Locale].script !== "latin";

  return (
    <main className="grain relative flex flex-1 flex-col items-center justify-center bg-kashi-night text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 45% at 50% 62%, color-mix(in oklab, var(--kashi-diya) 14%, transparent), transparent 70%)",
        }}
      />
      <section className="container-kashi section-kashi relative z-10">
        <h1 className="text-glow">
          {t("title")}
          <span
            className={
              secondaryIsLatin ? "bilingual-secondary" : "bilingual-secondary-indic"
            }
            lang={secondaryIsLatin ? "en" : "hi"}
          >
            {t("titleSecondary")}
          </span>
        </h1>
        <p className="mx-auto mt-8 max-w-2xl text-balance text-lg text-kashi-ash/90 md:text-xl">
          {t("subtitle")}
        </p>
        <a
          href="#journey"
          className="mt-12 inline-flex items-center gap-3 rounded-kashi border border-kashi-saffron/70 bg-kashi-saffron/10 px-7 py-3.5 font-body text-base font-medium text-kashi-white shadow-glow transition-[background-color,box-shadow,transform] duration-500 ease-enter hover:-translate-y-0.5 hover:bg-kashi-saffron/20 hover:shadow-glow-lg"
        >
          {t("cta")}
          <span aria-hidden className="text-kashi-diya">
            ↓
          </span>
        </a>
      </section>
    </main>
  );
}
