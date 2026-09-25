import { setRequestLocale } from "next-intl/server";
import Hero from "@/components/hero/Hero";
import RippleWipe from "@/components/motion/RippleWipe";
import DayInKashi from "@/components/sections/DayInKashi";
import Faiths from "@/components/sections/Faiths";
import Festivals from "@/components/sections/Festivals";
import Food from "@/components/sections/Food";
import Itineraries from "@/components/sections/Itineraries";
import Practical from "@/components/sections/Practical";
import AartiFinale from "@/components/sections/AartiFinale";
import Places from "@/components/sections/Places";
import Projects from "@/components/sections/Projects";
import type { Locale } from "@/lib/i18n/locales";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main id="content" className="flex flex-1 flex-col">
      <Hero locale={locale as Locale} />
      <RippleWipe />
      <DayInKashi locale={locale as Locale} />
      <RippleWipe />
      <Places locale={locale as Locale} />
      <RippleWipe />
      <Faiths locale={locale as Locale} />
      <RippleWipe />
      <Projects locale={locale as Locale} />
      <RippleWipe />
      <Festivals locale={locale as Locale} />
      <Food locale={locale as Locale} />
      <RippleWipe />
      <Itineraries locale={locale as Locale} />
      <Practical locale={locale as Locale} />
      <RippleWipe />
      <AartiFinale locale={locale as Locale} />
    </main>
  );
}
