"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { PROMO_DISMISS_KEY, PROMO_URL, isDismissed, pickHeadline, type PromoCopy } from "@/lib/promo";

type Target = { slot: HTMLElement | null; situation: string | null };

const readDismissed = () => {
  try {
    return isDismissed(window.localStorage.getItem(PROMO_DISMISS_KEY), Date.now());
  } catch {
    return false;
  }
};

/**
 * One house ad, two looks. Pages mark a spot with <PromoSlot> (an empty
 * `[data-promo-slot]` div in the server markup, see PromoSlot.tsx); the full
 * card is portalled into it. A page without a slot gets the slim bar fixed to
 * the bottom instead. Nothing renders until after mount, so the server HTML
 * never disagrees with a stored dismissal. Closing it stores the time in
 * localStorage and hides it on every page (and open tab) for 30 days.
 */
export default function Promo({ copy }: { copy: PromoCopy }) {
  const pathname = usePathname();
  const [target, setTarget] = useState<Target | null>(null);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    // Re-run per route: the layout persists across client navigations, the slot does not.
    const slot = document.querySelector<HTMLElement>('[data-promo-slot="primary"]') ?? document.querySelector<HTMLElement>("[data-promo-slot]");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading browser-only state after mount is the point
    setTarget({ slot, situation: slot?.dataset.promoSituation ?? null });
    setDismissed(readDismissed());
  }, [pathname]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === PROMO_DISMISS_KEY) setDismissed(readDismissed());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const showBar = !!target && !target.slot && !dismissed;
  useEffect(() => {
    // Lifts the floating sound toggle above the bar (globals.css → .promo-bar-on).
    document.documentElement.classList.toggle("promo-bar-on", showBar);
    return () => document.documentElement.classList.remove("promo-bar-on");
  }, [showBar]);

  if (!target || dismissed) return null;

  const close = () => {
    try {
      window.localStorage.setItem(PROMO_DISMISS_KEY, String(Date.now()));
    } catch {}
    setDismissed(true);
  };
  const link = { href: PROMO_URL, target: "_blank", rel: "sponsored noopener noreferrer" } as const;
  const closeButton = (cls: string) => (
    <button type="button" onClick={close} aria-label={copy.close} className={`promo-close ${cls}`}>
      <Icon name="close" className="h-4 w-4" inline />
    </button>
  );

  if (target.slot) {
    return createPortal(
      <aside aria-label={copy.sponsored} className="promo-card guide-card relative mt-8">
        {closeButton("absolute right-2 top-2")}
        <div className="flex items-start gap-4 pr-8">
          <span className="guide-card-icon" aria-hidden="true">
            <Icon name="plane" className="h-5 w-5" inline />
          </span>
          <p className="min-w-0 font-display text-xl leading-snug text-kashi-white sm:text-2xl">{pickHeadline(copy, "card", target.situation)}</p>
        </div>
        <p className="mt-3 text-base leading-relaxed text-kashi-ash/90 sm:pl-[3.25rem]">{copy.support}</p>
        <ul className="mt-4 flex flex-wrap gap-2 text-xs">
          {copy.perks.map((p) => (
            <li key={p} className="rounded-full border border-kashi-diya/40 px-2.5 py-1 text-kashi-diya">{p}</li>
          ))}
        </ul>
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
          <a {...link} className="inline-flex min-h-11 items-center gap-2 rounded-kashi bg-kashi-saffron px-5 py-2.5 text-sm font-medium text-kashi-night transition-colors hover:bg-kashi-marigold">
            {copy.cta}
            <Icon name="arrow-right" className="h-4 w-4" inline />
          </a>
          <p className="text-xs leading-relaxed text-kashi-ash/70">{copy.footnote}</p>
        </div>
      </aside>,
      target.slot,
    );
  }

  return (
    <aside aria-label={copy.sponsored} className="promo-bar fixed inset-x-0 bottom-0 z-[85]">
      <div className="container-kashi flex items-center gap-3 py-2">
        <Icon name="plane" className="h-5 w-5 flex-none text-kashi-diya" inline />
        <p className="min-w-0 flex-1 truncate text-sm text-kashi-white">
          {copy.short}
          <span className="text-kashi-diya"> · {copy.barPerks}</span>
        </p>
        <a {...link} className="inline-flex min-h-10 flex-none items-center rounded-kashi bg-kashi-saffron px-3 text-sm font-medium text-kashi-night transition-colors hover:bg-kashi-marigold">
          {copy.cta}
        </a>
        {closeButton("relative flex-none")}
      </div>
    </aside>
  );
}
