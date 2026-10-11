"use client";

import { useCallback, useEffect, useState } from "react";
import type { GalleryItem, GalleryLabels } from "./Gallery";
import Icon from "./Icon";
import Modal from "./Modal";
import Photo from "./Photo";

const fill = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));

/** Full-screen photo viewer with previous/next, caption and credit. Loaded on first click. */
export default function GalleryLightbox({ items, index, onClose, labels }: { items: GalleryItem[]; index: number; onClose: () => void; labels: GalleryLabels }) {
  const [i, setI] = useState(index);
  const n = items.length;
  const go = useCallback((d: number) => setI((x) => (x + d + n) % n), [n]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [go]);
  const it = items[i];
  return (
    <Modal open onClose={onClose} labelledBy="lightbox-caption" closeLabel={labels.close} size="wide">
      <div className="lightbox">
        <div className="lightbox-frame">
          <Photo key={it.photo.src} photo={it.photo} sizes="100vw" priority className="object-contain!" />
        </div>
        <div className="lightbox-bar">
          <div className="min-w-0 flex-1">
            <p id="lightbox-caption" className="text-sm text-kashi-white sm:text-base">{it.photo.alt}</p>
            {it.credit && (
              <p className="mt-1 text-xs text-kashi-ash/60">
                <a href={it.credit.source} target="_blank" rel="noopener noreferrer" className="underline decoration-kashi-diya/30 underline-offset-2 hover:text-kashi-diya">
                  {fill(labels.credit, { author: it.credit.author, license: it.credit.license })}
                </a>
              </p>
            )}
          </div>
          <p className="shrink-0 text-xs tabular-nums text-kashi-ash/70">{i + 1} / {n}</p>
        </div>
        {n > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label={labels.prev} className="lightbox-nav left-2 sm:left-4"><Icon name="arrow-left" className="h-5 w-5" /></button>
            <button type="button" onClick={() => go(1)} aria-label={labels.next} className="lightbox-nav right-2 sm:right-4"><Icon name="arrow-right" className="h-5 w-5" /></button>
          </>
        )}
      </div>
    </Modal>
  );
}
