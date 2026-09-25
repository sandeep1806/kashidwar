"use client";

import { useEffect, type RefObject } from "react";
import { prefersReducedMotion } from "@/lib/device";
import { useGsap, type GsapModule as GsapBundle } from "./SmoothScroll";

/**
 * Scroll-reveal plumbing without forced layout.
 *
 * The old version called getBoundingClientRect() and created a ScrollTrigger
 * for every revealed element as soon as GSAP loaded. Inside a
 * `content-visibility: auto` section that forces the browser to lay out the
 * whole skipped section, so GSAP's arrival laid out the entire page in one
 * long task. Here two IntersectionObservers do the work instead (their entries
 * carry geometry without forcing layout):
 *   1. when the element comes within 30% of a viewport below the fold,
 *      `prepare` puts it in its hidden start state;
 *   2. when its top passes 88% of the viewport height, `play` animates it in.
 * Elements already on screen when GSAP arrives are left alone, as before.
 */
export function useRevealOnEnter<T extends HTMLElement>(
  ref: RefObject<T | null>,
  prepare: (g: GsapBundle, el: T) => void,
  play: (g: GsapBundle, el: T) => void,
  deps: readonly unknown[] = [],
) {
  const g = useGsap();
  useEffect(() => {
    const el = ref.current;
    if (!g || !el || prefersReducedMotion()) return;
    const ctx = g.gsap.context(() => {}, el);
    let enter: IntersectionObserver | null = null;
    const near = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        near.disconnect();
        // Reached the viewport without passing through the "near" band first
        // (already visible, or a fast jump): show it as it is.
        if (entry.boundingClientRect.top < window.innerHeight * 0.88) return;
        ctx.add(() => prepare(g, el));
        enter = new IntersectionObserver(
          ([e]) => {
            if (!e.isIntersecting) return;
            enter?.disconnect();
            ctx.add(() => play(g, el));
          },
          { rootMargin: "0px 0px -12% 0px" },
        );
        enter.observe(el);
      },
      { rootMargin: "0px 0px 30% 0px" },
    );
    near.observe(el);
    return () => {
      near.disconnect();
      enter?.disconnect();
      ctx.revert();
    };
    // prepare/play are inline closures; callers list what they depend on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [g, ref, ...deps]);
}
