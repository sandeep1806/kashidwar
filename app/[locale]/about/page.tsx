import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import LdJson from "@/components/pages/LdJson";
import ListingShell from "@/components/pages/ListingShell";
import FactStrip from "@/components/pages/FactStrip";
import EnglishNote from "@/components/ui/EnglishNote";
import Icon, { type IconName } from "@/components/ui/Icon";
import ghatsList from "@/content/ghats-list.json";
import { festivals, places, projects } from "@/lib/content";
import { guides } from "@/lib/guides";
import { locales } from "@/lib/i18n/locales";
import about from "@/content/about.json";
import type { Locale } from "@/lib/i18n/locales";
import { absolute, alternatesFor } from "@/lib/pages";
import { CONTACT_EMAIL, organizationLd } from "@/lib/site";

type AboutText = (typeof about)["en"];

export async function generateMetadata({ params }: PageProps<"/[locale]/about">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: t("title"), description: t("description"), alternates: alternatesFor(locale, "/about") };
}

/** Who runs the site, its mission, how content is verified, the update policy, and contact. Hindi and English. */
export default async function AboutPage({ params }: PageProps<"/[locale]/about">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const [t, tp, common] = await Promise.all([
    getTranslations({ locale, namespace: "about" }),
    getTranslations({ locale, namespace: "page" }),
    getTranslations({ locale, namespace: "common" }),
  ]);
  const lang = locale === "hi" ? "hi" : "en";
  const text: AboutText = about[lang];
  const path = "/about";
  const nf = new Intl.NumberFormat(locale === "hi" ? "hi-IN" : "en-IN");
  const stats = [
    { icon: "pin" as IconName, label: t("stats.places"), value: nf.format(places.length) },
    { icon: "boat" as IconName, label: t("stats.ghats"), value: nf.format(ghatsList.ghats.length) },
    { icon: "tip" as IconName, label: t("stats.guides"), value: nf.format(guides.length) },
    { icon: "calendar" as IconName, label: t("stats.festivals"), value: nf.format(festivals.length) },
    { icon: "shield" as IconName, label: t("stats.projects"), value: nf.format(projects.length) },
    { icon: "info" as IconName, label: t("stats.languages"), value: nf.format(locales.length) },
  ];
  const ICON_FOR: [RegExp, IconName][] = [[/who|team|owner/, "people"], [/mission|why/, "sunrise"], [/verif|source|check|fact/, "shield"], [/update|policy|correct/, "calendar"], [/photo|image|credit/, "photos"], [/language|translat/, "info"]];
  const iconFor = (id: string): IconName => ICON_FOR.find(([re]) => re.test(id))?.[1] ?? "info";
  return (
    <>
      <LdJson
        data={[
          organizationLd(),
          { "@context": "https://schema.org", "@type": "AboutPage", "@id": absolute(`/${locale}${path}`), url: absolute(`/${locale}${path}`), name: t("title"), dateModified: about.updated, about: { "@id": organizationLd()["@id"] } },
        ]}
      />
      <ListingShell
        locale={loc}
        path={path}
        sectionId="about"
        crumbs={[{ name: tp("home"), href: `/${locale}` }, { name: t("title"), href: `/${locale}${path}` }]}
        title={t("title")}
        secondary={t("titleSecondary")}
        intro={<p lang={lang}>{text.lead}</p>}
      >
        <div className="container-kashi mx-auto mt-4 max-w-5xl">
          <FactStrip className="fact-strip-3" items={stats} />
        </div>
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
              </div>
            </section>
          ))}
          <section id="contact" className="scroll-mt-24 rounded-kashi border border-kashi-diya/30 bg-kashi-indigo/40 p-6">
            <h2 className="text-h3 text-kashi-white">{t("contactTitle")}</h2>
            <p className="mt-4 text-kashi-ash/90">{text.contact[0]}</p>
            <p className="mt-3">
              <span className="text-xs uppercase tracking-[0.18em] text-kashi-diya">{t("email")}: </span>
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-lg text-kashi-diya underline decoration-kashi-diya/40 underline-offset-4 hover:text-kashi-marigold">{CONTACT_EMAIL}</a>
            </p>
            <p className="mt-3 text-sm text-kashi-ash/75">{text.contact[1]}</p>
          </section>
        </div>
      </ListingShell>
    </>
  );
}
