"use client";

import { useEffect } from "react";
import { prefersReducedMotion } from "@/lib/device";
import { useGsap } from "./SmoothScroll";

/**
 * The sky behind the whole page. A fixed layer whose gradient is driven by
 * page scroll progress (GSAP ScrollTrigger, scrubbed): night → indigo → violet
 * → ember → saffron, with a gold glow that grows toward the finale.
 *
 * The base stops stay dark enough for ash body text (≥ 4.5:1); gold arrives
 * as the glow layer, never as a fill — DESIGN.md: "gold is light, not paint".
 * Under reduced motion the CSS keeps a static indigo (see globals.css).
 */
const TOP = ["#0B0A14", "#1C1B3A", "#3A2450", "#5E2E30", "#7A3A22", "#8A3F1A"];
const BOTTOM = ["#0B0A14", "#0B0A14", "#1C1B3A", "#2A1C34", "#3A2224", "#4A2A1C"];
const GLOW = [0, 0, 0.08, 0.22, 0.5, 0.85];

export default function SunriseBackground() {
  const g = useGsap();

  useEffect(() => {
    if (!g || prefersReducedMotion()) return;
    const root = document.documentElement;
    const top = g.gsap.utils.interpolate(TOP);
    const bottom = g.gsap.utils.interpolate(BOTTOM);
    const glow = g.gsap.utils.interpolate(GLOW);
    const proxy = { p: 0 };

    const ctx = g.gsap.context(() => {
      g.gsap.to(proxy, {
        p: 1,
        ease: "none",
        scrollTrigger: { start: 0, end: "max", scrub: 0.8 },
        onUpdate: () => {
          root.style.setProperty("--sky-top", top(proxy.p));
          root.style.setProperty("--sky-bottom", bottom(proxy.p));
          root.style.setProperty("--sky-glow", String(glow(proxy.p)));
        },
      });
    });

    return () => {
      ctx.revert();
      root.style.removeProperty("--sky-top");
      root.style.removeProperty("--sky-bottom");
      root.style.removeProperty("--sky-glow");
    };
  }, [g]);

  return <div aria-hidden="true" className="sky" />;
}
