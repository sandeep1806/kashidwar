import dates from "@/content/festival-dates-2026.json";

/** Year the festival dates in content/festival-dates-<year>.json cover. */
export const FESTIVAL_YEAR = 2026;

export interface FestivalDate {
  startDate: string | null;
  endDate: string | null;
  verified: boolean;
  note: string;
  sources: { title: string; url: string }[];
}

const ALL = dates as Record<string, FestivalDate>;
export const festivalDate = (id: string): FestivalDate | null => ALL[id] ?? null;

/** The verified date if there is one (what the page shows and Event JSON-LD uses). */
export const verifiedDate = (id: string): (FestivalDate & { startDate: string }) | null => {
  const d = festivalDate(id);
  return d?.verified && d.startDate ? (d as FestivalDate & { startDate: string }) : null;
};

/** Localized "24 November 2026" or "13–16 November 2026". */
export function formatFestivalRange(bcp47: string, start: string, end: string | null): string {
  const fmt = new Intl.DateTimeFormat(bcp47, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  const s = new Date(start + "T00:00:00Z");
  if (!end || end === start) return fmt.format(s);
  return fmt.formatRange(s, new Date(end + "T00:00:00Z"));
}
