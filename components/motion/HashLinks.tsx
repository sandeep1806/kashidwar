"use client";

import { useEffect } from "react";
import { scrollToElement } from "./SmoothScroll";

/** Fired after an in-page URL rewrite (replaceState does not fire hashchange). */
export const URL_EVENT = "kashi:url";

/** `#places/sikh`, `#festivals/3`: a section id plus one argument for that section's island. */
const DEEP_HASH = /^#([a-z-]+)\/([a-z0-9-]+)$/;

export function sectionOfHash(hash: string): string | null {
  const m = /^#([a-z-]+)/.exec(hash);
  return m ? m[1] : null;
}

/** Rewrite the URL's hash in place and tell the islands. */
export function writeHash(hash: string) {
  const { pathname, search } = window.location;
  history.replaceState(history.state, "", pathname + search + hash);
  window.dispatchEvent(new Event(URL_EVENT));
}

/**
 * Deep links inside the home page. A browser treats `#places/sikh` as a
 * fragment with no matching element: the URL changes but nothing scrolls, and
 * clicking the same link twice does nothing at all. This island takes those
 * clicks (before Lenis' own anchor handler), rewrites the hash, lets the
 * section's island apply the argument (filter, month), and scrolls to the
 * section — every time, including a repeat click on the same link.
 *
 * On arrival with any section hash it also re-aims once layout settles, since
 * content-visibility sections above can make the browser's own jump land short;
 * the same re-aim runs on `hashchange` (URL bar, back/forward).
 */
export default function HashLinks() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href^='#']");
      const href = a?.getAttribute("href");
      if (!href || !DEEP_HASH.test(href)) return;
      const section = document.getElementById(sectionOfHash(href)!);
      if (!section) return;
      e.preventDefault();
      e.stopPropagation();
      writeHash(href);
      // A section can name a closer landing spot (the filter chips, the calendar).
      const target = section.querySelector<HTMLElement>("[data-hash-target]");
      scrollToElement(target ?? section, { offset: target ? 72 : 0 });
    };
    document.addEventListener("click", onClick, true);

    let raf = 0;
    const aim = () => {
      const id = sectionOfHash(window.location.hash);
      const el = id ? document.getElementById(id) : null;
      if (!el) return;
      const target = el.querySelector<HTMLElement>("[data-hash-target]");
      scrollToElement(target ?? el, { offset: target ? 72 : 0 });
    };
    const id = sectionOfHash(window.location.hash);
    if (id && document.getElementById(id)) raf = requestAnimationFrame(aim);
    // The URL bar, back/forward and same-document links change the hash without a
    // click on this page: the islands already re-apply the argument, so re-aim too.
    const onHashChange = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(aim);
    };
    window.addEventListener("hashchange", onHashChange);

    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("hashchange", onHashChange);
      cancelAnimationFrame(raf);
    };
  }, []);
  return null;
}
