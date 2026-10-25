import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import LdJson from "@/components/pages/LdJson";
import ListingShell from "@/components/pages/ListingShell";
import EnglishNote from "@/components/ui/EnglishNote";
import Icon from "@/components/ui/Icon";
import privacy from "@/content/privacy.json";
import type { Locale } from "@/lib/i18n/locales";
import { absolute, alternatesFor } from "@/lib/pages";
import { ADSENSE_CLIENT, CONTACT_EMAIL, organizationLd } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[locale]/privacy">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });
  return { title: t("title"), description: t("description"), alternates: alternatesFor(locale, "/privacy") };
}

/** What the site collects (analytics, browser storage, map tiles), and ads once AdSense is on. Hindi and English. */
export default async function PrivacyPage({ params }: PageProps<"/[locale]/privacy">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, tp, common] = await Promise.all([
    getTranslations({ locale, namespace: "privacy" }),
    getTranslations({ locale, namespace: "page" }),
    getTranslations({ locale, namespace: "common" }),
  ]);
  const lang = locale === "hi" ? "hi" : "en";
  const text = privacy[lang];
  const path = "/privacy";
  // The advertising section describes ad cookies, so it is shown only while ads are switched on.
  const sections = text.sections.filter((s) => !("ads" in s && s.ads) || ADSENSE_CLIENT);
  const updated = new Intl.DateTimeFormat(locale === "hi" ? "hi-IN" : "en-IN", { dateStyle: "long", timeZone: "UTC" }).format(new Date(privacy.updated + "T00:00:00Z"));
  return (
    <>
      <LdJson
        data={[
          organizationLd(),
          { "@context": "https://schema.org", "@type": "WebPage", "@id": absolute(`/${locale}${path}`), url: absolute(`/${locale}${path}`), name: t("title"), dateModified: privacy.updated, publisher: { "@id": organizationLd()["@id"] } },
        ]}
      />
      <ListingShell
        locale={locale as Locale}
        path={path}
        sectionId="privacy"
        crumbs={[{ name: tp("home"), href: `/${locale}` }, { name: t("title"), href: `/${locale}${path}` }]}
        title={t("title")}
        secondary={t("titleSecondary")}
        intro={
          <>
            <p lang={lang}>{text.lead}</p>
            <p className="mt-3 text-sm text-kashi-ash/75">{t("updated", { date: updated })}</p>
          </>
        }
      >
        <div className="container-kashi mx-auto mt-10 max-w-3xl space-y-8" lang={lang}>
          {lang === "en" && locale !== "en" && <EnglishNote text={common("englishNote")} />}
          {sections.map((s) => (
            <section key={s.id} id={s.id} className="guide-card scroll-mt-24">
              <h2 className="text-h3 text-kashi-white">{s.heading}</h2>
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
            <p className="text-kashi-ash/90">
              {text.contact}{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-kashi-diya underline decoration-kashi-diya/40 underline-offset-4 hover:text-kashi-marigold">{CONTACT_EMAIL}</a>
            </p>
          </section>
        </div>
      </ListingShell>
    </>
  );
}
