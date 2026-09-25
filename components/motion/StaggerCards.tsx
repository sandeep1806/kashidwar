"use client";

import { useRef, type ReactNode } from "react";
import { useRevealOnEnter } from "./useRevealOnEnter";

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
  useRevealOnEnter(
    ref,
    (g, el) => g.gsap.set(el.children, { y: 60, opacity: 0 }),
    (g, el) => g.gsap.to(el.children, { y: 0, opacity: 1, duration: 0.9, stagger: 0.08, ease: "power3.out" }),
  );
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
