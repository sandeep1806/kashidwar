import type { ReactNode } from "react";
import Photo from "@/components/ui/Photo";
import type { PhotoData } from "@/lib/contentTypes";

/** A titled block in the page body (h2 + content). */
export function Block({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={className}>
      <h2 className="text-h3 text-kashi-white">{title}</h2>
      <div className="mt-4 text-kashi-ash/90">{children}</div>
    </section>
  );
}

/** Dotted "label: value" facts. */
export function Facts({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="grid gap-4 rounded-kashi border border-kashi-rudraksha/60 bg-kashi-indigo/40 p-6">
      {items.map((it) => (
        <div key={it.label}>
          <dt className="text-xs uppercase tracking-[0.18em] text-kashi-diya">{it.label}</dt>
          <dd className="mt-1 text-kashi-ash/90">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Sources({ label, sources }: { label: string; sources: { title: string; url: string }[] }) {
  if (!sources.length) return null;
  return (
    <p className="text-xs text-kashi-ash/60">
      {label}:{" "}
      {sources.map((s, i) => (
        <span key={s.url}>
          {i > 0 && " · "}
          <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline decoration-kashi-diya/40 underline-offset-2 hover:text-kashi-diya">{s.title}</a>
        </span>
      ))}
    </p>
  );
}

export interface LinkCard {
  href: string;
  name: string;
  secondary: string;
  photo: PhotoData | null;
  meta?: string;
}

/** Grid of small arch cards linking to other pages. */
export function LinkCards({ title, items }: { title: string; items: LinkCard[] }) {
  if (!items.length) return null;
  return (
    <section className="container-kashi mt-16">
      <h2 className="text-h3 text-kashi-white">{title}</h2>
      <ul className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {items.map((it) => (
          <li key={it.href}>
            <a href={it.href} className="group flex h-full flex-col overflow-hidden rounded-kashi border border-kashi-rudraksha/60 bg-kashi-indigo/40 transition-[translate,border-color,box-shadow] duration-500 ease-enter hover:-translate-y-1 hover:border-kashi-diya/60 hover:shadow-glow">
              <div className="arch relative mx-2 mt-2 aspect-[4/3] overflow-hidden bg-kashi-indigo">
                {it.photo && <Photo photo={it.photo} sizes="(min-width: 1024px) 280px, 45vw" className="photo-zoom" />}
              </div>
              <div className="px-3 pb-3 pt-2">
                <p className="font-display text-base leading-snug text-kashi-white sm:text-lg">{it.name}</p>
                <p className="mt-0.5 line-clamp-1 text-xs text-kashi-ash/70">{it.secondary}</p>
                {it.meta && <p className="mt-1 text-xs text-kashi-diya/80">{it.meta}</p>}
              </div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Previous / next / back navigation at the foot of a page. */
export function PrevNext({ prev, next, back }: { prev: { href: string; label: string; name: string }; next: { href: string; label: string; name: string }; back: { href: string; label: string } }) {
  return (
    <nav aria-label={back.label} className="container-kashi mt-16 grid gap-4 border-t border-kashi-diya/15 pt-8 sm:grid-cols-3 sm:items-center">
      <a href={prev.href} rel="prev" className="group text-sm text-kashi-ash/80 hover:text-kashi-white">
        <span className="block text-xs uppercase tracking-[0.18em] text-kashi-diya/80">← {prev.label}</span>
        <span className="font-display text-lg">{prev.name}</span>
      </a>
      <a href={back.href} className="text-center text-sm text-kashi-diya underline decoration-kashi-diya/40 underline-offset-4 hover:text-kashi-marigold">{back.label}</a>
      <a href={next.href} rel="next" className="group text-sm text-kashi-ash/80 hover:text-kashi-white sm:text-right">
        <span className="block text-xs uppercase tracking-[0.18em] text-kashi-diya/80">{next.label} →</span>
        <span className="font-display text-lg">{next.name}</span>
      </a>
    </nav>
  );
}
