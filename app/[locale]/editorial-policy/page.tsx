import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import LdJson from "@/components/pages/LdJson";
import ListingShell from "@/components/pages/ListingShell";
import EnglishNote from "@/components/ui/EnglishNote";
import Icon, { type IconName } from "@/components/ui/Icon";
import editorial from "@/content/editorial.json";
import { projects, localize, loadEntryTranslations } from "@/lib/content";
import { displayName } from "@/lib/contentTypes";
import { guides, guideTranslations, localizeGuide } from "@/lib/guides";
import type { Locale } from "@/lib/i18n/locales";
import { LOCALES } from "@/lib/i18n/locales";
import { absolute, alternatesFor, pageUrl } from "@/lib/pages";
import { CONTACT_EMAIL, organizationLd } from "@/lib/site";

type EditorialText = (typeof editorial)["en"];

export async function generateMetadata({ params }: PageProps<"/[locale]/editorial-policy">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "editorial" });
  return { title: t("title"), description: t("description"), alternates: alternatesFor(locale, "/editorial-policy") };
}

/**
 * How content is sourced, checked, kept current and corrected, how AI tools are used, and
 * how ads stay apart from content; ends with the most recently checked pages (guide updates
 * and project status checks), newest first. Hindi and English, regional blocks once translated.
 */
export default async function EditorialPage({ params }: PageProps<"/[locale]/editorial-policy">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  await loadEntryTranslations(loc);
  const [t, tp, common] = await Promise.all([
    getTranslations({ locale, namespace: "editorial" }),
    getTranslations({ locale, namespace: "page" }),
    getTranslations({ locale, namespace: "common" }),
  ]);
  const regional = (editorial as unknown as Record<string, EditorialText | undefined>)[locale];
  const lang = regional ? locale : locale === "hi" ? "hi" : "en";
  const text: EditorialText = regional ?? editorial[locale === "hi" ? "hi" : "en"];
  const path = "/editorial-policy";
  const fmt = new Intl.DateTimeFormat(LOCALES[loc].bcp47, { dateStyle: "medium", timeZone: "UTC" });

  const tr = await guideTranslations(loc);
  const recent = [
    ...guides.map((g) => ({ date: g.updated, href: `/${locale}/guides/${g.slug}`, name: localizeGuide(g, loc, tr).title })),
    ...projects.map((p) => ({ date: p.lastVerified, href: pageUrl(loc, "projects", p.id), name: displayName(loc, localize(p, loc)).primary })),
  ]
    .filter((r) => r.date)
    .sort((a, b) => b.date.localeCompare(a.date) || a.name.localeCompare(b.name))
    .slice(0, 12);

  const ICON_FOR: [RegExp, IconName][] = [[/source/, "shield"], [/check/, "tip"], [/update/, "calendar"], [/tool/, "info"], [/correct/, "clock"], [/independ/, "people"]];
  const iconFor = (id: string): IconName => ICON_FOR.find(([re]) => re.test(id))?.[1] ?? "info";
  return (
    <>
      <LdJson
        data={[
          organizationLd(),
          { "@context": "https://schema.org", "@type": "WebPage", "@id": absolute(`/${locale}${path}`), url: absolute(`/${locale}${path}`), name: t("title"), dateModified: editorial.updated, publisher: { "@id": organizationLd()["@id"] } },
        ]}
      />
      <ListingShell
        promo={false}
        locale={loc}
        path={path}
        sectionId="editorial"
        crumbs={[{ name: tp("home"), href: `/${locale}` }, { name: t("title"), href: `/${locale}${path}` }]}
        title={t("title")}
        secondary={t("titleSecondary")}
        intro={<p lang={lang}>{text.lead}</p>}
      >
        <div className="container-kashi mx-auto mt-10 max-w-3xl space-y-8" lang={lang}>
          {lang === "en" && locale !== "en" && <EnglishNote text={common("englishNote")} />}
          {text.sections.map((s) => (
            <section key={s.id} id={s.id} className="guide-card scroll-mt-24">
              <h2 className="flex items-start gap-3 text-h3 text-kashi-white">
                <span className="guide-card-icon"><Icon name={iconFor(s.id)} className="h-5 w-5" /></span>
                <span>{s.heading}</span>
              </h2>
              <div className="mt-4 space-y-4 leading-relaxed text-kashi-ash/90">
                {s.body.map((p) => (
                  <p key={p.slice(0, 40)}>{p}</p>
                ))}
                {"list" in s && s.list && (
                  <ul className="guide-list">
                    {s.list.map((li) => (
                      <li key={li.slice(0, 40)}>
                        <Icon name="chevron" className="mt-1 h-4 w-4 shrink-0 text-kashi-diya" />
                        <span>{li}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {s.id === "corrections" && (
                  <p>
                    <a href={`mailto:${CONTACT_EMAIL}`} className="text-kashi-diya underline decoration-kashi-diya/40 underline-offset-4 hover:text-kashi-marigold">{CONTACT_EMAIL}</a>
                  </p>
                )}
              </div>
            </section>
          ))}
          <section id="recent" className="scroll-mt-24 rounded-kashi border border-kashi-diya/30 bg-kashi-indigo/40 p-6">
            <h2 className="text-h3 text-kashi-white">{text.recentTitle}</h2>
            <p className="mt-3 text-sm text-kashi-ash/75">{text.recentNote}</p>
            <ul className="mt-4 space-y-2">
              {recent.map((r) => (
                <li key={r.href} className="flex flex-wrap items-baseline gap-x-3">
                  <time dateTime={r.date} className="w-28 shrink-0 text-sm text-kashi-diya">{fmt.format(new Date(r.date + "T00:00:00Z"))}</time>
                  <a href={r.href} className="min-w-0 flex-1 text-kashi-ash underline decoration-kashi-diya/30 underline-offset-4 hover:text-kashi-white">{r.name}</a>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </ListingShell>
    </>
  );
}
