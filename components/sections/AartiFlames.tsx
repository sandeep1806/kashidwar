"use client";

import { useEffect } from "react";
import { useGsap } from "@/components/motion/SmoothScroll";
import { getSoundOn } from "@/components/ui/SoundToggle";
import { ambient } from "@/lib/ambient";
import { prefersReducedMotion } from "@/lib/device";

/**
 * The Aarti finale's motion island: the flames of <AartiLamps> flicker with
 * noise-driven scale/opacity (GSAP, repeatRefresh with random values) while
 * the lamps are on screen, and a bell cue plays when the section enters, if
 * the visitor turned sound on. Reduced motion: static flames, no cue.
 * Renders nothing itself; the lamp markup is static.
 */
export default function AartiFlames() {
  const g = useGsap();

  useEffect(() => {
    const el = document.getElementById("aarti-lamps");
    if (!g || !el || prefersReducedMotion()) return;
    let tweens: gsap.core.Tween[] = [];
    const ctx = g.gsap.context(() => {
      tweens = g.gsap.utils.toArray<SVGElement>(".aarti-flame", el).map((f) =>
        g.gsap.to(f, {
          scaleY: () => 0.85 + Math.random() * 0.35,
          scaleX: () => 0.9 + Math.random() * 0.2,
          opacity: () => 0.75 + Math.random() * 0.25,
          x: () => (Math.random() - 0.5) * 1.5,
          duration: () => 0.12 + Math.random() * 0.2,
          ease: "sine.inOut",
          repeat: -1,
          repeatRefresh: true,
          transformOrigin: "50% 100%",
          paused: true,
        }),
      );
    }, el);
    let rang = false;
    const io = new IntersectionObserver(([e]) => {
      tweens.forEach((t) => (e.isIntersecting ? t.play() : t.pause()));
      if (e.isIntersecting && !rang && e.intersectionRatio > 0) {
        rang = true;
        if (getSoundOn()) ambient.bell();
      }
    }, { rootMargin: "0px 0px -30% 0px" });
    io.observe(el);
    return () => {
      io.disconnect();
      ctx.revert();
    };
  }, [g]);

  return null;
}
