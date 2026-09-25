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
import Static from "@/components/ui/Static";
import RevealController from "@/components/motion/RevealController";
import { SECTIONS } from "@/lib/sections";
import type { Locale } from "@/lib/i18n/locales";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const meta = await getTranslations("meta");
  const nav = await getTranslations("nav");

  // Text-only sections sit in <Static>: server-rendered, never hydrated.
  // Islands that do hydrate: hero scene, Day-in-Kashi scroller, places
  // explorer and map, itinerary tabs, aarti lamps, header menus, sound toggle.
  return (
    <main id="content" className="flex flex-1 flex-col">
      <Static><JsonLd locale={loc} name={meta("title")} description={meta("description")} /></Static>
      <Hero locale={loc} />
      <RippleWipe />
      <DayInKashi locale={loc} />
      <RippleWipe />
      <Places locale={loc} />
      <RippleWipe />
      <Static><Faiths locale={loc} /></Static>
      <RippleWipe />
      <Static><Projects locale={loc} /></Static>
      <RippleWipe />
      <Static><Festivals locale={loc} /></Static>
      <Static><Food locale={loc} /></Static>
      <RippleWipe />
      <Itineraries locale={loc} />
      <Static><Practical locale={loc} /></Static>
      <RippleWipe />
      <AartiFinale locale={loc} />
      <RevealController />
      <SectionDots label={nav("sectionsNav")} items={SECTIONS.map((s) => ({ id: s.id, label: nav(s.key) }))} />
      <Static><SiteFooter locale={loc} /></Static>
    </main>
  );
}
