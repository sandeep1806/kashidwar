"use client";

import { useEffect, useId, useRef, useState } from "react";

/** Compact "Sections" menu in the header: jump links to every section of the long page. */
export default function SectionMenu({ label, items, basePath }: { label: string; items: { id: string; label: string }[]; basePath: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const btn = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!open) return;
    const links = () => Array.from(list.current?.querySelectorAll<HTMLAnchorElement>("a") ?? []);
    links()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      const els = links();
      const i = els.indexOf(document.activeElement as HTMLAnchorElement);
      if (e.key === "Escape") { setOpen(false); btn.current?.focus(); }
      else if (e.key === "ArrowDown") { e.preventDefault(); els[(i + 1) % els.length]?.focus(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); els[(i - 1 + els.length) % els.length]?.focus(); }
      else if (e.key === "Tab") setOpen(false);
    };
    const onDown = (e: PointerEvent) => {
      if (!list.current?.contains(e.target as Node) && !btn.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("pointerdown", onDown); };
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={btn}
        type="button"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 items-center gap-2 rounded-full border border-kashi-ash/25 bg-kashi-night/60 px-3 text-sm text-kashi-ash transition-colors hover:border-kashi-marigold hover:text-kashi-white"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h10" /></svg>
        <span className="hidden sm:inline">{label}</span>
        <span className="sr-only sm:hidden">{label}</span>
      </button>
      {open && (
        <ul ref={list} id={`${id}-list`} className="grain absolute right-0 mt-2 w-60 rounded-kashi border border-kashi-diya/25 bg-kashi-indigo/95 p-2 shadow-glow-lg backdrop-blur-md">
          {items.map((s) => (
            <li key={s.id}>
              <a href={`${basePath}#${s.id}`} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-kashi-ash outline-none transition-colors hover:bg-kashi-saffron/15 hover:text-kashi-white focus-visible:bg-kashi-saffron/20">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
