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
