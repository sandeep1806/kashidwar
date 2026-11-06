import { promoEnabled } from "@/lib/promo";

/**
 * Where a page wants the full promo card (components/ui/Promo.tsx portals it in after mount).
 * A plain empty div, so it is safe inside <Static>. `situation` is the first clause of the
 * frustrated headline when the page shows a bad outcome; `primary` wins over the default slot under
 * a page's lead (a guide section about lounges). Renders nothing when NEXT_PUBLIC_PROMO=off.
 */
/** Marks a page that shows no house ad at all (policy pages): no card and no bottom bar. */
export function NoPromo() {
  return <div data-promo-off="" hidden />;
}

export default function PromoSlot({ className = "", situation, primary = false }: { className?: string; situation?: string; primary?: boolean }) {
  if (!promoEnabled(process.env.NEXT_PUBLIC_PROMO)) return null;
  return <div data-promo-slot={primary ? "primary" : ""} data-promo-situation={situation} className={className} />;
}
