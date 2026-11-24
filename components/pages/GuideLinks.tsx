import { getTranslations } from "next-intl/server";
import { LinkCards } from "@/components/pages/Blocks";
import { guidePhoto, guidesFor, localizeGuide, postsFor, type Guide } from "@/lib/guides";
import { guideTranslations } from "@/lib/guideTranslations";
import type { Locale } from "@/lib/i18n/locales";
import type { Kind } from "@/lib/pages";

/**
 * On a place/festival/project/itinerary page: "Full history" cards for the blog posts that
 * tell its story, then "Guides" cards for every guide that links to it.
 */
export default async function GuideLinks({ locale, kind, id }: { locale: Locale; kind: Kind; id: string }) {
  const list = guidesFor(kind, id);
  const stories = postsFor(kind, id);
  if (!list.length && !stories.length) return null;
  const [t, tb, tr] = await Promise.all([getTranslations({ locale, namespace: "guides" }), getTranslations({ locale, namespace: "blog" }), guideTranslations(locale)]);
  const card = (g: Guide, base: string) => {
    const l = localizeGuide(g, locale, tr);
    return { href: `/${locale}/${base}/${g.slug}`, name: l.title, secondary: l.lang === "hi" ? g.title_en : g.title_hi, photo: guidePhoto(g, locale), faith: "secular" as const };
  };
  return (
    <>
      {stories.length > 0 && <LinkCards title={tb("history")} items={stories.map((g) => card(g, "blog"))} />}
      {list.length > 0 && <LinkCards title={t("relatedGuides")} items={list.map((g) => card(g, "guides"))} />}
    </>
  );
}
