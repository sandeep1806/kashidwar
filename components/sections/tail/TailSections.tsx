"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, type ReactNode } from "react";
import Reveal from "@/components/motion/Reveal";
import RippleWipe from "@/components/motion/RippleWipe";
import SectionHeading from "@/components/ui/SectionHeading";
import type { Locale } from "@/lib/i18n/locales";
import { useApproach } from "@/lib/useApproach";
import type { HeadingProps, TailProps } from "@/lib/sectionProps";

/*
 * The seven content sections after Places. Their headings and intros are in the HTML;
 * their bodies are separate client chunks rendered after hydration, once the
 * browser is idle or the section comes within ~1200 px of the viewport —
 * whichever first. That keeps ~90 KB of markup and their JS out of the
 * first-paint path on slow mobile links (Lighthouse LCP) while search
 * engines, which execute JS and fire idle callbacks, still see the content.
 * To go back to full server rendering, import the sections directly in
 * app/[locale]/page.tsx instead of this component.
 */
const FaithsSection = dynamic(() => import("./FaithsSection"), { ssr: false });
const ProjectsSection = dynamic(() => import("./ProjectsSection"), { ssr: false });
const FestivalsSection = dynamic(() => import("./FestivalsSection"), { ssr: false });
const FoodSection = dynamic(() => import("./FoodSection"), { ssr: false });
const ItinerariesSection = dynamic(() => import("./ItinerariesSection"), { ssr: false });
const PracticalSection = dynamic(() => import("./PracticalSection"), { ssr: false });
const FinaleSection = dynamic(() => import("./FinaleSection"), { ssr: false });

function Shell({ locale, heading, className = "", onReady, children }: { locale: Locale; heading: HeadingProps; className?: string; onReady: () => void; children: (ready: boolean) => ReactNode }) {
  const { ref, ready } = useApproach<HTMLElement>();
  useEffect(() => {
    if (ready) onReady();
  }, [ready, onReady]);
  return (
    <section ref={ref} id={heading.id} aria-labelledby={`${heading.id}-title`} className={`cv-section section-kashi scroll-mt-4 ${className}`}>
      <div className="container-kashi text-center">
        <SectionHeading id={`${heading.id}-title`} locale={locale} title={heading.title} secondary={heading.secondary} />
        <Reveal>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-kashi-ash/90">{heading.intro}</p>
        </Reveal>
      </div>
      <div className="min-h-[40vh]">{children(ready)}</div>
    </section>
  );
}

export default function TailSections({ locale, headings }: { locale: Locale; headings: Record<keyof TailProps, HeadingProps> }) {
  const [wanted, setWanted] = useState(false);
  const [data, setData] = useState<TailProps | null>(null);
  useEffect(() => {
    if (!wanted) return;
    let cancelled = false;
    fetch(`/${locale}/data/tail`)
      .then((r) => r.json())
      .then((d: TailProps) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [wanted, locale]);
  const want = () => setWanted(true);

  return (
    <>
      <RippleWipe />
      <Shell locale={locale} heading={headings.faiths} onReady={want}>{() => data && <FaithsSection {...data.faiths} />}</Shell>
      <RippleWipe />
      <Shell locale={locale} heading={headings.projects} onReady={want}>{() => data && <ProjectsSection {...data.projects} />}</Shell>
      <RippleWipe />
      <Shell locale={locale} heading={headings.festivals} onReady={want}>{() => data && <FestivalsSection {...data.festivals} />}</Shell>
      <Shell locale={locale} heading={headings.food} onReady={want}>{() => data && <FoodSection {...data.food} />}</Shell>
      <RippleWipe />
      <Shell locale={locale} heading={headings.itineraries} onReady={want}>{() => data && <ItinerariesSection {...data.itineraries} />}</Shell>
      <Shell locale={locale} heading={headings.practical} onReady={want}>{() => data && <PracticalSection {...data.practical} />}</Shell>
      <RippleWipe />
      <Shell locale={locale} heading={headings.finale} onReady={want} className="aarti relative isolate overflow-hidden !pb-24 !pt-[18vh]">
        {() => (
          <>
            <div aria-hidden="true" className="aarti-glow pointer-events-none absolute inset-x-0 bottom-0 h-[70%]" />
            <div className="relative">{data && <FinaleSection {...data.finale} />}</div>
          </>
        )}
      </Shell>
    </>
  );
}
