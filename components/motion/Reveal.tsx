"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { prefersReducedMotion } from "@/lib/device";
import { useGsap } from "./SmoothScroll";

/**
 * Fade-up on enter. Content is visible by default (server-rendered, no flash);
 * once GSAP is loaded and the element is still below the fold, it animates in
 * when scrolled to. Nothing happens under reduced motion.
 */
export default function Reveal({
  children,
  className,
  y = 40,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const g = useGsap();

  useEffect(() => {
    const el = ref.current;
    if (!g || !el || prefersReducedMotion()) return;
    // Already on screen when GSAP arrived: leave it alone.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
    const ctx = g.gsap.context(() => {
      g.gsap.from(el, {
        y,
        opacity: 0,
        duration: 1,
        delay,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
    }, el);
    return () => ctx.revert();
  }, [g, y, delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
