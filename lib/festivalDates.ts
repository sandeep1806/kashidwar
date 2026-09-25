import dates from "@/content/festival-dates.json";

/**
 * Festival dates, per year, in content/festival-dates.json:
 *   { "<festival id>": { "2026": Occurrence, "2027": Occurrence, "2027-dec": Occurrence, … } }
 * Everything below is computed against the BUILD date, so a rebuild rolls
 * every page over to the next occurrence. The Worker's weekly cron triggers
 * that rebuild (worker.js + wrangler.jsonc `triggers`, README → "Festival dates").
 */
export interface Occurrence {
  startDate: string | null;
  endDate: string | null;
  verified: boolean;
  note: string;
  sources: { title: string; url: string }[];
}

type Dated = Occurrence & { year: number; startDate: string; endDate: string };

/** YYYY-MM-DD the pages are built for (UTC). FESTIVAL_TODAY overrides it for tests. */
export const BUILD_DATE: string = process.env.FESTIVAL_TODAY || new Date().toISOString().slice(0, 10);

const ALL = dates as Record<string, Record<string, Occurrence>>;

function occurrences(id: string): (Occurrence & { year: number })[] {
  return Object.entries(ALL[id] ?? {})
    .map(([key, o]) => ({ ...o, year: parseInt(key, 10) })) // keys: "2027", or "2027-dec" for a second occurrence in a year
    .sort((a, b) => a.year - b.year || (a.startDate ?? "").localeCompare(b.startDate ?? ""));
}

const isDated = (o: Occurrence & { year: number }): o is Dated => !!o.startDate;
const endOf = (o: Dated) => o.endDate ?? o.startDate;

export interface FestivalTiming {
  /** The next verified occurrence (or the one in progress); what titles and Event JSON-LD use. */
  next: (Dated & { ongoing: boolean }) | null;
  /** When nothing upcoming is verified: the month it is expected in. */
  expected: { year: number; month: number } | null;
  /** The most recent verified occurrence that has ended. */
  last: Dated | null;
  /** Sort key for "what's coming next": YYYY-MM-DD of the next or expected date. */
  sortKey: string;
}

/** Next / expected / last occurrence of a festival, relative to BUILD_DATE. */
export function festivalTiming(f: { id: string; months: number[] }, today: string = BUILD_DATE): FestivalTiming {
  const all = occurrences(f.id).filter(isDated);
  const verified = all.filter((o) => o.verified);
  const upcoming = verified.find((o) => endOf(o) >= today) ?? null;
  const last = [...verified].reverse().find((o) => endOf(o) < today) ?? null;
  if (upcoming) {
    return { next: { ...upcoming, endDate: endOf(upcoming), ongoing: upcoming.startDate <= today }, expected: null, last, sortKey: upcoming.startDate };
  }
  // Nothing verified ahead: an unverified but dated entry gives the month;
  // otherwise the festival's usual months after the last occurrence.
  const tentative = all.find((o) => !o.verified && o.startDate >= today);
  let expected: { year: number; month: number };
  if (tentative) {
    expected = { year: Number(tentative.startDate.slice(0, 4)), month: Number(tentative.startDate.slice(5, 7)) };
  } else {
    const [ty, tm] = [Number(today.slice(0, 4)), Number(today.slice(5, 7))];
    const lastKey = last ? Number(last.startDate.slice(0, 4)) * 12 + Number(last.startDate.slice(5, 7)) : 0;
    const candidates = [ty, ty + 1, ty + 2].flatMap((y) => [...f.months].sort((a, b) => a - b).map((m) => ({ year: y, month: m })));
    expected = candidates.find((c) => c.year * 12 + c.month >= ty * 12 + tm && c.year * 12 + c.month > lastKey) ?? { year: ty + 1, month: f.months[0] };
  }
  return { next: null, expected, last, sortKey: `${expected.year}-${String(expected.month).padStart(2, "0")}-01` };
}

/** Localized "24 November 2026" or "13–16 November 2026". */
export function formatFestivalRange(bcp47: string, start: string, end: string | null): string {
  const fmt = new Intl.DateTimeFormat(bcp47, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  const s = new Date(start + "T00:00:00Z");
  if (!end || end === start) return fmt.format(s);
  return fmt.formatRange(s, new Date(end + "T00:00:00Z"));
}

/** Localized month name. */
export function formatMonth(bcp47: string, month: number): string {
  return new Intl.DateTimeFormat(bcp47, { month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(2026, month - 1, 15)));
}

/** Sources for the occurrences a page shows (next and last). */
export function timingSources(t: FestivalTiming): { title: string; url: string }[] {
  const seen = new Set<string>();
  return [t.next, t.last].flatMap((o) => o?.sources ?? []).filter((s) => !seen.has(s.url) && seen.add(s.url));
}

/** What a festival page or card shows about dates (server-built, serializable). */
export interface FestivalDateView {
  featured: {
    kind: "next" | "now" | "expected";
    /** ISO start of the featured occurrence (null when only a month is expected) */
    iso: string | null;
    end: string | null;
    /** "YYYY-MM" when only the month is expected */
    expected: string | null;
    prefix: string | null;
    text: string;
  };
  last: { iso: string; before: string; date: string; after: string } | null;
  sortKey: string;
}

type T = { (key: string, values?: Record<string, string>): string; raw: (key: string) => unknown };

/** Build the date view for one festival in one locale (t = the "page" namespace). */
export function festivalDateView(f: { id: string; months: number[] }, bcp47: string, t: T, timing = festivalTiming(f)): FestivalDateView {
  const { next, expected, last } = timing;
  const featured: FestivalDateView["featured"] = next
    ? { kind: next.ongoing ? "now" : "next", iso: next.startDate, end: next.endDate, expected: null, prefix: t(next.ongoing ? "dateNow" : "dateNext"), text: formatFestivalRange(bcp47, next.startDate, next.endDate) }
    : {
        kind: "expected",
        iso: null,
        end: null,
        expected: `${expected!.year}-${String(expected!.month).padStart(2, "0")}`,
        prefix: null,
        text: t("dateExpected", { month: formatMonth(bcp47, expected!.month), year: String(expected!.year) }),
      };
  let lastView: FestivalDateView["last"] = null;
  if (last) {
    const [before, after = ""] = String(t.raw("dateLastHeld")).split("{date}");
    lastView = { iso: last.startDate, before, date: formatFestivalRange(bcp47, last.startDate, last.endDate), after };
  }
  return { featured, last: lastView, sortKey: timing.sortKey };
}
