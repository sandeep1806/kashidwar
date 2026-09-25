import type { FestivalDateView } from "@/lib/festivalDates";

/**
 * A festival's featured date (the next occurrence, the one in progress, or the
 * month it is expected in) shown prominently, with "Last held" underneath.
 * Data attributes let scripts/check-seo.mjs check it against the build date,
 * the page title and the Event JSON-LD:
 *   data-featured, data-event-date="YYYY-MM-DD" | "expected-YYYY-MM", data-event-end
 *   data-last-held="YYYY-MM-DD"
 */
export default function FestivalDateLine({ view, compact = false, className = "" }: { view: FestivalDateView; compact?: boolean; className?: string }) {
  const { featured: f, last } = view;
  const dated = f.kind !== "expected";
  return (
    <div className={className}>
      <p
        data-featured=""
        data-event-date={f.iso ?? `expected-${f.expected}`}
        data-event-end={f.end ?? undefined}
        className={`inline-flex flex-wrap items-center gap-x-2 gap-y-1 ${compact ? "text-sm" : "rounded-full border border-kashi-diya/40 bg-kashi-indigo/50 px-4 py-2 text-base"} ${dated ? "text-kashi-marigold" : "text-kashi-ash/80"}`}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className={compact ? "h-4 w-4 shrink-0" : "h-5 w-5 shrink-0"} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <rect x="3.5" y="5" width="17" height="15" rx="2" />
          <path d="M3.5 10h17M8 3v4M16 3v4" />
        </svg>
        {f.prefix && (
          <span className={`text-xs uppercase tracking-[0.16em] ${f.kind === "now" ? "text-kashi-saffron" : "text-kashi-diya/80"}`}>{f.prefix}</span>
        )}
        <time dateTime={f.iso ?? f.expected ?? undefined}>{f.text}</time>
      </p>
      {last && (
        <p data-last-held={last.iso} className={`${compact ? "mt-1" : "mt-2 pl-1"} text-xs text-kashi-ash/60`}>
          {last.before}
          <time dateTime={last.iso}>{last.date}</time>
          {last.after}
        </p>
      )}
    </div>
  );
}
