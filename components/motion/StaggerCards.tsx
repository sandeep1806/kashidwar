"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { prefersReducedMotion } from "@/lib/device";
import { useGsap } from "./SmoothScroll";

/**
 * Children fade up 60px, 0.08s apart, when the group scrolls into view
 * (DESIGN.md → Cards). Wrap a grid; each direct child is one card.
 */
export default function StaggerCards({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const g = useGsap();

  useEffect(() => {
    const el = ref.current;
    if (!g || !el || prefersReducedMotion()) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.85) return;
    const ctx = g.gsap.context(() => {
      g.gsap.from(el.children, {
        y: 60,
        opacity: 0,
        duration: 0.9,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
      });
    }, el);
    return () => ctx.revert();
  }, [g]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
