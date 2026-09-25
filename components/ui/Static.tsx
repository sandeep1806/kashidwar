"use client";

import { useId, type ReactNode } from "react";

/**
 * Server-rendered markup that React does not hydrate.
 *
 * The App Router hydrates every element the page renders, server components
 * included, so text-only sections still cost client CPU on load. On the
 * server this renders its children normally, so the text is in the HTML. On
 * the client, while hydrating a node the server produced, it renders the same
 * wrapper with an empty `dangerouslySetInnerHTML`: React never walks into
 * such a node and leaves the server's children in place. No fibers, no event
 * wiring, no work.
 *
 * Only put server components with no interactivity inside. Links, native
 * details/summary and CSS all keep working; scroll reveals are driven from
 * outside by <RevealController>. If there is no server node (a fresh client
 * render after an error), the children render normally.
 */
export default function Static({ children, className = "contents" }: { children: ReactNode; className?: string }) {
  const id = useId();
  if (typeof document !== "undefined" && document.querySelector(`[data-static="${CSS.escape(id)}"]`)) {
    return <div data-static={id} className={className} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: "" }} />;
  }
  return (
    <div data-static={id} className={className}>
      {children}
    </div>
  );
}
