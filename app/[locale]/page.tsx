import { getTranslations, setRequestLocale } from "next-intl/server";
import Hero from "@/components/hero/Hero";
import RippleWipe from "@/components/motion/RippleWipe";
import DayInKashi from "@/components/sections/DayInKashi";
import Places from "@/components/sections/Places";
import TailSections from "@/components/sections/tail/TailSections";
import JsonLd from "@/components/ui/JsonLd";
import type { Locale } from "@/lib/i18n/locales";
import { getTailHeadings } from "@/lib/sectionProps";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const meta = await getTranslations("meta");
  const headings = await getTailHeadings(loc);

  return (
    <main id="content" className="flex flex-1 flex-col">
      <JsonLd locale={loc} name={meta("title")} description={meta("description")} />
      <Hero locale={loc} />
      <RippleWipe />
      <DayInKashi locale={loc} />
      <RippleWipe />
      <Places locale={loc} />
      <TailSections locale={loc} headings={headings} />
    </main>
  );
}
