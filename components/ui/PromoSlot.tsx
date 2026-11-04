import { promoEnabled } from "@/lib/promo";

/**
 * Where a page wants the full promo card (components/ui/Promo.tsx portals it in after mount).
 * A plain empty div, so it is safe inside <Static>. `situation` is the first clause of the
 * frustrated headline when the page shows a bad outcome. Renders nothing when NEXT_PUBLIC_PROMO=off.
 */
export default function PromoSlot({ className = "", situation }: { className?: string; situation?: string }) {
  if (!promoEnabled(process.env.NEXT_PUBLIC_PROMO)) return null;
  return <div data-promo-slot="" data-promo-situation={situation} className={className} />;
}
