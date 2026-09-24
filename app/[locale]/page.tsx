import { getTranslations, setRequestLocale } from "next-intl/server";
import Hero from "@/components/hero/Hero";
import { LOCALES, type Locale } from "@/lib/i18n/locales";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("journey");
  const secondaryIsLatin = LOCALES[locale as Locale].script !== "latin";

  return (
    <main id="content" className="flex flex-1 flex-col">
      <Hero locale={locale as Locale} />

      {/* Phase 3 replaces this stub with the scroll-bound sky + Day in Kashi. */}
      <section
        id="journey"
        aria-labelledby="journey-title"
        className="container-kashi section-kashi scroll-mt-8 text-center"
      >
        <h2 id="journey-title">
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
        </h2>
        <p className="mx-auto mt-8 max-w-2xl text-lg text-kashi-ash/90">
          {t("text")}
        </p>
      </section>
    </main>
  );
}
