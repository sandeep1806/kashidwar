"use client";

import { useRef, type ReactNode } from "react";
import { useRevealOnEnter } from "./useRevealOnEnter";

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
  useRevealOnEnter(
    ref,
    (g, el) => g.gsap.set(el, { y, opacity: 0 }),
    (g, el) => g.gsap.to(el, { y: 0, opacity: 1, duration: 1, delay, ease: "power3.out" }),
    [y, delay],
  );
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
