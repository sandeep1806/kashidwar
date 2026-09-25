import { getTranslations, setRequestLocale } from "next-intl/server";
import Hero from "@/components/hero/Hero";
import RippleWipe from "@/components/motion/RippleWipe";
import AartiFinale from "@/components/sections/AartiFinale";
import DayInKashi from "@/components/sections/DayInKashi";
import Faiths from "@/components/sections/Faiths";
import Festivals from "@/components/sections/Festivals";
import Food from "@/components/sections/Food";
import Itineraries from "@/components/sections/Itineraries";
import Places from "@/components/sections/Places";
import Practical from "@/components/sections/Practical";
import Projects from "@/components/sections/Projects";
import JsonLd from "@/components/ui/JsonLd";
import SectionDots from "@/components/ui/SectionDots";
import SiteFooter from "@/components/ui/SiteFooter";
import { SECTIONS } from "@/lib/sections";
import type { Locale } from "@/lib/i18n/locales";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const meta = await getTranslations("meta");
  const nav = await getTranslations("nav");

  return (
    <main id="content" className="flex flex-1 flex-col">
      <JsonLd locale={loc} name={meta("title")} description={meta("description")} />
      <Hero locale={loc} />
      <RippleWipe />
      <DayInKashi locale={loc} />
      <RippleWipe />
      <Places locale={loc} />
      <RippleWipe />
      <Faiths locale={loc} />
      <RippleWipe />
      <Projects locale={loc} />
      <RippleWipe />
      <Festivals locale={loc} />
      <Food locale={loc} />
      <RippleWipe />
      <Itineraries locale={loc} />
      <Practical locale={loc} />
      <RippleWipe />
      <AartiFinale locale={loc} />
      <SectionDots label={nav("sectionsNav")} items={SECTIONS.map((s) => ({ id: s.id, label: nav(s.key) }))} />
      <SiteFooter locale={loc} />
    </main>
  );
}
