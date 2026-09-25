"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useLenis } from "@/components/motion/SmoothScroll";

/**
 * Accessible modal: focus moves in on open and back on close, Tab is trapped,
 * Esc and backdrop close it, page scroll is held. Enter/exit via `motion`
 * (DESIGN.md: 0.6 s, power3.out), a plain fade under reduced motion.
 */
export default function Modal({
  open,
  onClose,
  labelledBy,
  closeLabel,
  children,
}: {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  closeLabel: string;
  children: ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const lenis = useLenis();
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    returnTo.current = document.activeElement as HTMLElement | null;
    const el = panel.current;
    const focusables = () =>
      Array.from(
        el?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
    focusables()[0]?.focus();
    lenis?.stop();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const f = focusables();
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      lenis?.start();
      returnTo.current?.focus();
    };
  }, [open, onClose, lenis]);

  const ease = [0.215, 0.61, 0.355, 1] as const;

  // Portal to <body>: the sections use `content-visibility`, whose containment
  // makes them the containing block for `position: fixed` — rendered in place,
  // the modal was positioned (and clipped) inside the section, not the viewport.
  // This component is only loaded client-side (dynamic, ssr:false).
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="backdrop"
          className="fixed inset-0 z-[90] flex items-end justify-center bg-kashi-night/80 p-0 backdrop-blur-sm sm:items-center sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.3 : 0.4 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            data-lenis-prevent
            className="grain relative max-h-[92dvh] w-full max-w-3xl overflow-y-auto overscroll-contain rounded-t-kashi border border-kashi-diya/25 bg-kashi-indigo shadow-glow-lg sm:max-h-[calc(100dvh-4rem)] sm:rounded-kashi"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: reduced ? 0.3 : 0.6, ease }}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label={closeLabel}
              className="absolute right-3 top-3 z-10 rounded-full border border-kashi-ash/30 p-2 text-kashi-ash transition-colors hover:border-kashi-marigold hover:text-kashi-white"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
