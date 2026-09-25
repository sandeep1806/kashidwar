import { NextResponse } from "next/server";
import { locales, type Locale } from "@/lib/i18n/locales";
import { getPlacesProps, getTailProps } from "@/lib/sectionProps";

/**
 * Prerendered JSON for the lazily rendered section bodies:
 *   /<locale>/data/places  → PlacesProps
 *   /<locale>/data/tail    → TailProps (projects, festivals, food, itineraries, practical, finale)
 * Keeping this data out of the page keeps the HTML and the hydration payload small.
 */
export const dynamic = "force-static";
export const dynamicParams = false;

const SECTIONS = ["places", "tail"] as const;

export function generateStaticParams() {
  return locales.flatMap((locale) => SECTIONS.map((section) => ({ locale, section })));
}

export async function GET(_req: Request, { params }: { params: Promise<{ locale: string; section: string }> }) {
  const { locale, section } = await params;
  if (!(locales as readonly string[]).includes(locale)) return NextResponse.json({ error: "unknown locale" }, { status: 404 });
  const l = locale as Locale;
  if (section === "places") return NextResponse.json(await getPlacesProps(l), { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } });
  if (section === "tail") return NextResponse.json(await getTailProps(l), { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } });
  return NextResponse.json({ error: "unknown section" }, { status: 404 });
}
