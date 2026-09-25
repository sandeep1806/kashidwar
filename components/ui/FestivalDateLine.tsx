/**
 * A festival's date for this year, shown prominently. `data-event-date`
 * carries the ISO start date (or "tbc"); scripts/check-seo.mjs checks it
 * against the page's Event JSON-LD and its title.
 */
export default function FestivalDateLine({ iso, label, heading, compact = false }: { iso: string | null; label: string; heading?: string; compact?: boolean }) {
  return (
    <p data-event-date={iso ?? "tbc"} className={`inline-flex items-center gap-2 ${compact ? "text-sm" : "rounded-full border border-kashi-diya/40 bg-kashi-indigo/50 px-4 py-2 text-base"} ${iso ? "text-kashi-marigold" : "text-kashi-ash/75"}`}>
      <svg aria-hidden="true" viewBox="0 0 24 24" className={compact ? "h-4 w-4 shrink-0" : "h-5 w-5 shrink-0"} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <rect x="3.5" y="5" width="17" height="15" rx="2" />
        <path d="M3.5 10h17M8 3v4M16 3v4" />
      </svg>
      {heading && !compact && <span className="sr-only">{heading}: </span>}
      <time dateTime={iso ?? undefined}>{label}</time>
    </p>
  );
}
