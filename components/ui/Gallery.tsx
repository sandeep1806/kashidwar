"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import type { PhotoData } from "@/lib/contentTypes";
import type { PhotoCredit } from "@/lib/photos";
import Icon from "./Icon";
import LazyPhoto from "./LazyPhoto";

const Lightbox = dynamic(() => import("./GalleryLightbox"), { ssr: false });

export interface GalleryLabels {
  title: string;
  /** "Open photo {n} of {total}" */
  open: string;
  close: string;
  prev: string;
  next: string;
  /** "Photo: {author} · {license}" */
  credit: string;
}

/** Photo and its credit line for the lightbox. */
export interface GalleryItem {
  photo: PhotoData;
  credit: PhotoCredit | null;
}

const fill = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));

/**
 * Photo strip for a detail page: CSS scroll-snap, each frame a button that
 * opens the lightbox (loaded on first click). Photos mount on approach
 * (LazyPhoto), so this island costs nothing on the page-load path.
 */
export default function Gallery({ items, labels }: { items: GalleryItem[]; labels: GalleryLabels }) {
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);
  if (!items.length) return null;
  return (
    <section className="container-kashi mt-10 sm:mt-14" aria-labelledby="gallery-title">
      <h2 id="gallery-title" className="flex items-center gap-2 text-h3 text-kashi-white">
        <Icon name="photos" className="h-5 w-5 text-kashi-diya" />
        {labels.title}
      </h2>
      <ul className="gallery-strip mt-5" data-lenis-prevent-wheel="">
        {items.map((it, i) => (
          <li key={it.photo.src} className="gallery-item">
            <button type="button" className="group gallery-frame" onClick={() => setOpen(i)} aria-label={fill(labels.open, { n: i + 1, total: items.length })}>
              <LazyPhoto photo={it.photo} sizes="(min-width: 1024px) 400px, (min-width: 640px) 46vw, 76vw" photoClassName="photo-zoom" />
              <span className="gallery-expand"><Icon name="expand" className="h-4 w-4" /></span>
            </button>
            <p className="gallery-caption">{it.photo.alt}</p>
          </li>
        ))}
      </ul>
      {open !== null && <Lightbox items={items} index={open} onClose={close} labels={labels} />}
    </section>
  );
}
