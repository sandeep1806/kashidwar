"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { NO_AD_PATHS } from "@/lib/ads";

/**
 * Google AdSense (Auto ads), loaded like <Analytics>: after the window `load`
 * event and the next idle period, so the ad script never competes with the
 * page's own paint. The layout renders this only for supported locales
 * (lib/ads.ts → adsForLocale), and it skips low-value pages (map, credits,
 * privacy). Locales are separate root layouts, so switching language is a full
 * page load and a script injected on one locale never carries over to another.
 */
export default function AdSense({ client, locale }: { client: string; locale: string }) {
  const pathname = usePathname();
  const path = pathname.slice(`/${locale}`.length) || "/";
  const allowed = !NO_AD_PATHS.some((re) => re.test(path));

  useEffect(() => {
    if (!client || !allowed || process.env.NODE_ENV !== "production") return;
    if (document.querySelector('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]')) return;
    let idleId: number | undefined;
    let timer: number | undefined;
    const inject = () => {
      const s = document.createElement("script");
      s.async = true;
      s.crossOrigin = "anonymous";
      s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
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
  }, [client, allowed]);
  return null;
}
