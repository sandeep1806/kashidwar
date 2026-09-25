import type { ReactNode } from "react";

/**
 * Children fade up 60px, 0.08s apart, when the group scrolls into view
 * (DESIGN.md → Cards). Wrap a grid; each direct child is one card. A server
 * component: <RevealController> does the animation.
 */
export default function StaggerCards({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div data-stagger="" className={className}>
      {children}
    </div>
  );
}
