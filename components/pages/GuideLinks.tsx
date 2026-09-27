import { getTranslations } from "next-intl/server";
import { LinkCards } from "@/components/pages/Blocks";
import { guidePhoto, guidesFor, localizeGuide } from "@/lib/guides";
import type { Locale } from "@/lib/i18n/locales";
import type { Kind } from "@/lib/pages";

/** "Guides" cards on a place/festival/project/itinerary page: every guide that links to it. */
export default async function GuideLinks({ locale, kind, id }: { locale: Locale; kind: Kind; id: string }) {
  const list = guidesFor(kind, id);
  if (!list.length) return null;
  const t = await getTranslations({ locale, namespace: "guides" });
  return (
    <LinkCards
      title={t("relatedGuides")}
      items={list.map((g) => {
        const l = localizeGuide(g, locale);
        return { href: `/${locale}/guides/${g.slug}`, name: l.title, secondary: l.lang === "hi" ? g.title_en : g.title_hi, photo: guidePhoto(g, locale), faith: "secular" as const };
      })}
    />
  );
}
