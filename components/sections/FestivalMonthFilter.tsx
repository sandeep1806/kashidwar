"use client";

import { useEffect, useSyncExternalStore } from "react";
import { URL_EVENT } from "@/components/motion/HashLinks";

function readMonth(): number | null {
  const n = Number(/^#festivals\/(\d{1,2})$/.exec(window.location.hash)?.[1]);
  return n >= 1 && n <= 12 ? n : null;
}
function subscribe(cb: () => void) {
  window.addEventListener("hashchange", cb);
  window.addEventListener(URL_EVENT, cb);
  return () => {
    window.removeEventListener("hashchange", cb);
    window.removeEventListener(URL_EVENT, cb);
  };
}

/**
 * Headless island for the festival calendar, mounted outside the section's
 * <Static> markup. The months are links (`#festivals/3`); <HashLinks> rewrites
 * the hash and scrolls, and this shows only that month's festivals by toggling
 * `hidden` on the server-rendered cards, marks the month, and reveals the
 * "month · All" line. Tapping the active month again, or "All", clears it.
 */
export default function FestivalMonthFilter() {
  const month = useSyncExternalStore(subscribe, readMonth, () => null);

  useEffect(() => {
    const root = document.getElementById("festivals");
    if (!root) return;
    root.querySelectorAll<HTMLElement>("[data-festival-card]").forEach((card) => {
      card.hidden = month !== null && !(card.dataset.months ?? "").split(" ").includes(String(month));
    });
    let name = "";
    root.querySelectorAll<HTMLAnchorElement>("a[data-month]").forEach((a) => {
      const active = Number(a.dataset.month) === month;
      if (active) {
        a.setAttribute("aria-current", "true");
        name = a.dataset.monthName ?? "";
      } else a.removeAttribute("aria-current");
      a.setAttribute("href", active ? "#festivals/all" : `#festivals/${a.dataset.month}`);
    });
    const status = root.querySelector<HTMLElement>("[data-month-status]");
    const label = status?.querySelector<HTMLElement>("[data-month-name]");
    if (status && label) {
      label.textContent = name;
      status.hidden = month === null;
    }
    // A carousel (phones, tablets) starts again from its first card.
    root.querySelectorAll<HTMLElement>("[data-carousel]").forEach((c) => c.scrollTo({ left: 0 }));
  }, [month]);

  return null;
}
