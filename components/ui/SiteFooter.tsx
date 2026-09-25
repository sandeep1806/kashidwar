import { getTranslations } from "next-intl/server";
import DiyaGlyph from "@/components/ui/DiyaGlyph";
import { projects } from "@/lib/content";
import { LOCALES, locales, type Locale } from "@/lib/i18n/locales";
import { SECTIONS } from "@/lib/sections";
import { langFontClass } from "@/lib/fonts";

/** Footer: sections, languages, credits and attribution, verification note. */
/** `path`: locale-less path of the current page ("" on the home page). */
export default async function SiteFooter({ locale, path = "" }: { locale: Locale; path?: string }) {
  const t = await getTranslations("footer");
  const nav = await getTranslations("nav");
  const meta = await getTranslations("meta");
  const fmt = new Intl.DateTimeFormat(LOCALES[locale].bcp47, { dateStyle: "long" });
  const latest = projects.reduce((d, p) => (p.lastVerified > d ? p.lastVerified : d), "");
  const year = new Date(latest + "T00:00:00Z").getUTCFullYear();

  return (
    <footer id="site-footer" className="cv-auto relative border-t border-kashi-diya/20 bg-kashi-night/90 pb-24 pt-16 text-sm text-kashi-ash/80">
      <div className="container-kashi grid gap-10 md:grid-cols-[1.2fr_1fr_1fr_1.4fr]">
        <div>
          <p className="flex items-center gap-3 font-display text-2xl text-kashi-white">
            <DiyaGlyph className="h-8 w-8" />
            {meta("siteName")}
          </p>
          <p className="mt-3 max-w-xs">{t("tagline")}</p>
        </div>
        <nav aria-label={t("sections")}>
          <h2 className="font-body text-xs uppercase tracking-[0.2em] text-kashi-diya">{t("sections")}</h2>
          <ul className="mt-1">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={path ? `/${locale}#${s.id}` : `#${s.id}`} className="inline-flex min-h-11 items-center hover:text-kashi-white">{nav(s.key)}</a>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label={t("languages")}>
          <h2 className="font-body text-xs uppercase tracking-[0.2em] text-kashi-diya">{t("languages")}</h2>
          <ul className="mt-1 grid grid-cols-2 gap-x-4">
            {locales.map((l) => (
              <li key={l}>
                <a href={`/${l}${path}`} lang={LOCALES[l].bcp47} hrefLang={LOCALES[l].bcp47} aria-current={l === locale ? "true" : undefined} className={`inline-flex min-h-11 items-center ${l === locale ? "text-kashi-diya" : "hover:text-kashi-white"}`}>
                  <span className={langFontClass(LOCALES[l].script)}>{LOCALES[l].nativeName}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <h2 className="font-body text-xs uppercase tracking-[0.2em] text-kashi-diya">{t("credits")}</h2>
          <ul className="mt-3 space-y-2">
            <li>{t("photos")}</li>
            <li>{t("mapData")}</li>
            <li>
              <a href={`/${locale}/credits`} className="text-kashi-diya underline decoration-kashi-diya/40 underline-offset-4 hover:text-kashi-marigold">{t("creditsLink")}</a>
            </li>
            <li className="pt-2">{t("verified", { date: fmt.format(new Date(latest + "T00:00:00Z")) })}</li>
            <li className="text-kashi-ash/60">{t("sourcesNote")}</li>
          </ul>
        </div>
      </div>
      <p className="container-kashi mt-12 border-t border-kashi-diya/10 pt-6 text-xs text-kashi-ash/70">{t("rights", { year })}</p>
    </footer>
  );
}
