import type { ReactNode } from "react";

/**
 * Fade-up on enter. Content is visible by default (server-rendered, no flash);
 * <RevealController> animates it in when scrolled to, once GSAP has loaded.
 * A server component: it only writes data attributes.
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
  return (
    <div data-reveal="" data-reveal-y={y === 40 ? undefined : y} data-reveal-delay={delay || undefined} className={className}>
      {children}
    </div>
  );
}
