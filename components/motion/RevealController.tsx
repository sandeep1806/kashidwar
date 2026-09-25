"use client";

import { useEffect } from "react";
import { prefersReducedMotion } from "@/lib/device";
import { useGsap, type GsapModule } from "./SmoothScroll";

/**
 * One client component drives every scroll reveal on the page, so the
 * revealed markup itself can stay server-rendered and unhydrated (see
 * components/ui/Static.tsx). It looks for the attributes written by the
 * server components Reveal, StaggerCards and TextReveal:
 *   [data-reveal]  fade up the element (data-reveal-y, data-reveal-delay)
 *   [data-stagger] fade up each direct child, 0.08 s apart
 *   [data-split]   SplitText by "chars" or "words" (Indic scripts: words only)
 *   [data-ripple]  RippleWipe rings, scrubbed with the scroll (ScrollTrigger
 *                  created only when the divider comes near)
 *
 * Two IntersectionObservers per element, no forced layout: when it comes
 * within 30% of a viewport below the fold it is put in its start state; when
 * its top passes 88% of the viewport it animates in. Elements already on
 * screen when GSAP arrives are left alone. Everything is skipped under
 * reduced motion.
 */
type Job = { prepare: () => void; play: () => void; scrub?: () => void };

function jobFor(g: GsapModule, el: HTMLElement): Job | null {
  const { gsap, SplitText } = g;
  if (el.dataset.reveal !== undefined) {
    const y = Number(el.dataset.revealY ?? 40);
    const delay = Number(el.dataset.revealDelay ?? 0);
    return {
      prepare: () => gsap.set(el, { y, opacity: 0 }),
      play: () => gsap.to(el, { y: 0, opacity: 1, duration: 1, delay, ease: "power3.out" }),
    };
  }
  if (el.dataset.stagger !== undefined) {
    return {
      prepare: () => gsap.set(el.children, { y: 60, opacity: 0 }),
      play: () => gsap.to(el.children, { y: 0, opacity: 1, duration: 0.9, stagger: 0.08, ease: "power3.out" }),
    };
  }
  if (el.dataset.ripple !== undefined) {
    // Scrubbed, so it is created when near and runs for as long as it is in view.
    return {
      prepare: () => {},
      play: () => {},
      scrub: () =>
        gsap.fromTo(
          gsap.utils.toArray<SVGElement>("[data-ring]", el),
          { scale: 0.15, opacity: 0, transformOrigin: "50% 50%" },
          { scale: 1, opacity: 0.8, stagger: 0.12, ease: "expo.inOut", scrollTrigger: { trigger: el, start: "top 95%", end: "bottom 45%", scrub: 0.5 } },
        ),
    };
  }
  if (el.dataset.split) {
    const byChar = el.dataset.split === "chars";
    let pieces: Element[] = [];
    return {
      prepare: () => {
        SplitText.create(el, {
          type: byChar ? "chars,words" : "words",
          aria: "none", // an sr-only twin carries the accessible text
          onSplit: (self) => {
            pieces = byChar ? self.chars : self.words;
            gsap.set(pieces, { yPercent: 60, opacity: 0, filter: "blur(6px)" });
          },
        });
      },
      play: () => gsap.to(pieces, { yPercent: 0, opacity: 1, filter: "blur(0px)", stagger: byChar ? 0.02 : 0.06, duration: 0.8, ease: "power3.out" }),
    };
  }
  return null;
}

export default function RevealController() {
  const g = useGsap();
  useEffect(() => {
    if (!g || prefersReducedMotion()) return;
    const ctx = g.gsap.context(() => {});
    const observers: IntersectionObserver[] = [];
    const jobs = new Map<Element, Job>();
    const enter = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          enter.unobserve(e.target);
          const job = jobs.get(e.target);
          if (job) ctx.add(job.play);
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    const near = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          near.unobserve(e.target);
          if ((e.target as HTMLElement).dataset.ripple !== undefined) {
            const job = jobFor(g, e.target as HTMLElement);
            if (job?.scrub) ctx.add(job.scrub);
            continue;
          }
          // Reached the viewport without passing the "near" band first
          // (already visible, or a jump): leave it as it is.
          if (e.boundingClientRect.top < window.innerHeight * 0.88) continue;
          const job = jobFor(g, e.target as HTMLElement);
          if (!job) continue;
          jobs.set(e.target, job);
          ctx.add(job.prepare);
          enter.observe(e.target);
        }
      },
      { rootMargin: "0px 0px 30% 0px" },
    );
    observers.push(near, enter);
    document.querySelectorAll("[data-reveal], [data-stagger], [data-split], [data-ripple]").forEach((el) => near.observe(el));
    return () => {
      observers.forEach((o) => o.disconnect());
      ctx.revert();
    };
  }, [g]);
  return null;
}
