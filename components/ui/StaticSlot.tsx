"use client";

import { takeStaticHtml } from "@/lib/staticHtml";

/**
 * The client half of <Static>. During server rendering it writes the HTML
 * that <Static> rendered in the server-component pass (handed over by key
 * through a per-process map, so the markup is not also serialised into the
 * RSC payload). In the browser it renders the same wrapper with an empty
 * `dangerouslySetInnerHTML`: React never walks into it and leaves the
 * server's markup in place, unhydrated.
 */
export default function StaticSlot({ id, className }: { id: string; className: string }) {
  if (typeof document !== "undefined") {
    return <div data-static={id} className={className} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: "" }} />;
  }
  return <div data-static={id} className={className} dangerouslySetInnerHTML={{ __html: takeStaticHtml(id) ?? "" }} />;
}
