"use client";

import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { langFontClass } from "@/lib/fonts";
import { LOCALES, locales, type Locale } from "@/lib/i18n/locales";

/** Swap the leading locale segment of the current path. Plain links: a locale switch is a full navigation. */
function withLocale(pathname: string, locale: Locale): string {
  const rest = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "");
  return `/${locale}${rest}`;
}

/**
 * Top-right language menu (DESIGN.md → Components): every language shown by
 * a script sample (नमस्ते / வணக்கம் / নমস্কার …) plus its own name. Fully
 * keyboard navigable: Enter/Space/ArrowDown open, arrows move, Home/End jump,
 * Esc closes, focus returns to the trigger. Links are locale-aware, so the
 * visitor stays on the same page.
 */
export default function LanguageSwitcher({
  current,
  label,
}: {
  current: Locale;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const pathname = usePathname() ?? "/";

  useEffect(() => {
    if (!open) return;
    const items = () => Array.from(list.current?.querySelectorAll<HTMLAnchorElement>("a") ?? []);
    const idx = Math.max(0, locales.indexOf(current));
    items()[idx]?.focus();
    const onKey = (e: KeyboardEvent) => {
      const els = items();
      const i = els.indexOf(document.activeElement as HTMLAnchorElement);
      if (e.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        els[(i + 1) % els.length]?.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        els[(i - 1 + els.length) % els.length]?.focus();
      } else if (e.key === "Home") {
        e.preventDefault();
        els[0]?.focus();
      } else if (e.key === "End") {
        e.preventDefault();
        els[els.length - 1]?.focus();
      } else if (e.key === "Tab") {
        setOpen(false);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (!list.current?.contains(e.target as Node) && e.target !== trigger.current) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onClick);
    };
  }, [open, current]);

  const meta = LOCALES[current];

  return (
    <div className="relative">
      <button
        ref={trigger}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={`${id}-menu`}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && !open) {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className="flex h-9 items-center gap-2 rounded-full border border-kashi-diya/40 bg-kashi-night/60 px-3 text-sm text-kashi-white transition-colors hover:border-kashi-marigold focus-visible:border-kashi-marigold"
      >
        <span aria-hidden="true" className="text-base leading-none">{meta.sample}</span>
        <span className="hidden sm:inline">{meta.nativeName}</span>
        <span className="sr-only">· {label}</span>
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-kashi-diya" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul
          ref={list}
          id={`${id}-menu`}
          role="menu"
          aria-label={label}
          className="grain absolute right-0 mt-2 max-h-[70vh] w-[min(18rem,calc(100vw-2rem))] overflow-y-auto rounded-kashi border border-kashi-diya/25 bg-kashi-indigo/95 p-2 shadow-glow-lg backdrop-blur-md"
        >
          {locales.map((loc) => {
            const m = LOCALES[loc];
            const active = loc === current;
            return (
              <li key={loc} role="none">
                <a
                  role="menuitem"
                  href={withLocale(pathname, loc)}
                  hrefLang={m.bcp47}
                  lang={m.bcp47}
                  aria-current={active ? "true" : undefined}
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between gap-3 min-h-11 rounded-lg px-3 py-2 text-sm outline-none transition-colors hover:bg-kashi-saffron/15 focus-visible:bg-kashi-saffron/20 ${active ? "text-kashi-diya" : "text-kashi-ash"}`}
                >
                  <span className={`flex items-baseline gap-3 ${langFontClass(m.script)}`}>
                    <span className="w-24 text-base text-kashi-white">{m.sample}</span>
                    <span>{m.nativeName}</span>
                  </span>
                  <span className="text-xs text-kashi-ash/70">{m.name}</span>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
