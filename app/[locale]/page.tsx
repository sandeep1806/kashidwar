import { setRequestLocale } from "next-intl/server";
import Hero from "@/components/hero/Hero";
import RippleWipe from "@/components/motion/RippleWipe";
import DayInKashi from "@/components/sections/DayInKashi";
import Faiths from "@/components/sections/Faiths";
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
    </main>
  );
}
