import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import ListingShell from "@/components/pages/ListingShell";
import CardPhoto from "@/components/ui/CardPhoto";
import { guidePhoto, guides, localizeGuide } from "@/lib/guides";
import { LOCALES, type Locale } from "@/lib/i18n/locales";
import { alternatesFor } from "@/lib/pages";

export async function generateMetadata({ params }: PageProps<"/[locale]/guides">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "guides" });
  return { title: t("title"), description: t("intro"), alternates: alternatesFor(locale, "/guides") };
}

/** Every guide, newest first. */
export default async function GuidesPage({ params }: PageProps<"/[locale]/guides">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const [t, tp] = await Promise.all([getTranslations({ locale, namespace: "guides" }), getTranslations({ locale, namespace: "page" })]);
  const fmt = new Intl.DateTimeFormat(LOCALES[loc].bcp47, { dateStyle: "long", timeZone: "UTC" });
  const path = "/guides";
  return (
    <ListingShell
      locale={loc}
      path={path}
      sectionId="guides"
      crumbs={[{ name: tp("home"), href: `/${locale}` }, { name: t("title"), href: `/${locale}${path}` }]}
      title={t("title")}
      secondary={t("titleSecondary")}
      intro={<p>{t("intro")}</p>}
    >
      <div className="container-kashi mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {guides.map((g, i) => {
          const l = localizeGuide(g, loc);
          return (
            <article key={g.slug} className="group card-lift flex flex-col rounded-kashi border border-kashi-rudraksha/60 bg-kashi-indigo/40 p-6">
              <CardPhoto photo={guidePhoto(g, loc)} className="-mx-3 -mt-3 mb-5" priority={i === 0} />
              <h2 className="text-[1.3rem] leading-snug text-kashi-white" lang={l.lang}>
                <a href={`/${locale}/guides/${g.slug}`} className="hover:text-kashi-marigold">{l.title}</a>
              </h2>
              <p className="mt-3 text-kashi-ash/90" lang={l.lang}>{l.description}</p>
              <p className="mt-3 text-xs text-kashi-ash/60">
                <time dateTime={g.updated}>{t("updated", { date: fmt.format(new Date(g.updated + "T00:00:00Z")) })}</time>
              </p>
              <a href={`/${locale}/guides/${g.slug}`} className="mt-auto inline-flex items-center gap-2 pt-5 text-sm text-kashi-diya underline decoration-kashi-diya/40 underline-offset-4 hover:text-kashi-marigold">
                {t("read")}
                <span aria-hidden="true">→</span>
              </a>
            </article>
          );
        })}
      </div>
    </ListingShell>
  );
}
