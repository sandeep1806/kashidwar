import { getPlaceDetails } from "@/lib/sectionProps";
import { routing } from "@/lib/i18n/routing";
import type { Locale } from "@/lib/i18n/locales";

/**
 * Place-modal prose (summary, story, tips, sources) for one locale, as a
 * prerendered static JSON file. The explorer fetches it when a card is hovered
 * or a modal opens, so this text is not parsed on page load.
 */
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return Response.json(getPlaceDetails(locale as Locale));
}
