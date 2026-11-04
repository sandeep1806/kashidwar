/**
 * House ad for the Scapia travel credit card, shown until AdSense is approved
 * (components/ui/Promo.tsx). Pure helpers with no imports, so tests/promo.test.mjs
 * can load this file directly with Node's type stripping.
 */

export const PROMO_URL = "https://apply.scapia.cards/landing_page?referral_code=a2rjio";
/** localStorage key holding the epoch-ms time the visitor closed the promo (no cookie) */
export const PROMO_DISMISS_KEY = "promoDismissedAt";
export const PROMO_DISMISS_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

/** NEXT_PUBLIC_PROMO=off removes the promo everywhere (for the day real ads take the slot). */
export const promoEnabled = (flag: string | undefined) => (flag ?? "").trim().toLowerCase() !== "off";

/** True while a stored dismissal is younger than 30 days. Junk or future timestamps count as not dismissed. */
export function isDismissed(stored: string | null, now: number): boolean {
  if (!stored) return false;
  const at = Number(stored);
  if (!Number.isFinite(at) || at <= 0 || at > now) return false;
  return now - at < PROMO_DISMISS_DAYS * DAY_MS;
}

export interface PromoCopy {
  headline: string;
  support: string;
  short: string;
  /** "{situation} …": the first clause is the page's own frustrated outcome */
  frustrated: string;
  cta: string;
  close: string;
  sponsored: string;
  perks: string[];
  barPerks: string;
  footnote: string;
}

/**
 * The headline for a look and page: the bar always uses the short line; the card uses the
 * frustrated line when the page marks a bad outcome (a slot's data-promo-situation, e.g.
 * "Ropeway not open yet?"), else the default headline.
 */
export function pickHeadline(copy: Pick<PromoCopy, "headline" | "short" | "frustrated">, look: "card" | "bar", situation?: string | null): string {
  if (look === "bar") return copy.short;
  const s = situation?.trim();
  return s ? copy.frustrated.replace("{situation}", s) : copy.headline;
}
