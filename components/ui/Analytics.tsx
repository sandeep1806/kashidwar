"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Google Analytics 4, loaded late on purpose: after the window `load` event
 * and the next idle period (or 2 s), so gtag.js (~100 KB) never competes
 * with the page's own paint or hydration. Production only; the measurement
 * ID comes from NEXT_PUBLIC_GA_ID (wrangler.jsonc → vars). GA4's enhanced
 * measurement records page views on full loads and on history changes.
 */
export default function Analytics({ id }: { id: string }) {
  useEffect(() => {
    if (!id || process.env.NODE_ENV !== "production") return;
    if (document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) return;
    let idleId: number | undefined;
    let timer: number | undefined;
    const inject = () => {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag(...args: unknown[]) {
        window.dataLayer!.push(args);
      };
      window.gtag("js", new Date());
      window.gtag("config", id);
      const s = document.createElement("script");
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
      document.head.appendChild(s);
    };
    const schedule = () => {
      if (typeof window.requestIdleCallback === "function") idleId = window.requestIdleCallback(inject, { timeout: 4000 });
      else timer = window.setTimeout(inject, 2000);
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
    return () => {
      window.removeEventListener("load", schedule);
      if (idleId !== undefined) window.cancelIdleCallback(idleId);
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [id]);
  return null;
}
