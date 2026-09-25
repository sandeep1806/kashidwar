import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import SmoothScroll from "@/components/motion/SmoothScroll";
import SunriseBackground from "@/components/motion/SunriseBackground";
import { FaithGlyphSprite } from "@/components/ui/FaithGlyph";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import DeferredFonts from "@/components/ui/DeferredFonts";
import PageLoader from "@/components/ui/PageLoader";
import SectionMenu from "@/components/ui/SectionMenu";
import SiteHeader from "@/components/ui/SiteHeader";
import { SECTIONS } from "@/lib/sections";
import SoundToggle from "@/components/ui/SoundToggle";
import IncenseCursor from "@/components/motion/IncenseCursor";
import { fontClassesFor } from "@/lib/fonts";
import { LOCALES, type Locale } from "@/lib/i18n/locales";
import { routing } from "@/lib/i18n/routing";
import { SITE_URL } from "@/lib/site";
import "../globals.css";

/**
 * Runs before the loader markup is parsed: if this session already saw the
 * diya ignite, hide the overlay instantly so repeat navigations don't flash.
 */
const LOADER_SNIPPET = (fontClasses: string) =>
  "try{if(sessionStorage.getItem('kashi:loader')==='1'){var h=document.documentElement;h.setAttribute('data-loader','done');h.className+=' " +
  fontClasses +
  "'}}catch(e){}";

// Only the 13 prerendered locales exist. Without this, `/anything.txt` matched
// [locale] with locale="anything.txt" and crashed (500) instead of a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: Omit<LayoutProps<"/[locale]">, "children">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const languages = Object.fromEntries(routing.locales.map((l) => [LOCALES[l].bcp47, `/${l}`]));
  languages["x-default"] = "/hi";
  const bcp47 = LOCALES[locale as Locale]?.bcp47 ?? "hi-IN";
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: t("title"),
      template: `%s · ${t("siteName")}`,
    },
    description: t("description"),
    applicationName: t("siteName"),
    alternates: { canonical: `/${locale}`, languages },
    openGraph: {
      type: "website",
      siteName: t("siteName"),
      title: t("title"),
      description: t("description"),
      url: `/${locale}`,
      locale: bcp47.replace("-", "_"),
      alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => LOCALES[l].bcp47.replace("-", "_")),
      images: [{ url: `/media/og/og-${locale}.png`, width: 1200, height: 630, alt: t("title") }],
    },
    twitter: { card: "summary_large_image", title: t("title"), description: t("description"), images: [`/media/og/og-${locale}.png`] },
    robots: { index: true, follow: true },
    manifest: "/manifest.webmanifest",
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "48x48" },
        { url: "/icon.svg", type: "image/svg+xml" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const meta = LOCALES[locale as Locale];
  const t = await getTranslations("common");
  const siteName = (await getTranslations("meta"))("siteName");
  const nav = await getTranslations("nav");
  const sectionItems = SECTIONS.map((s) => ({ id: s.id, label: nav(s.key) }));
  // Display faces apply at once; body faces are attached after first paint (see DeferredFonts).
  const fonts = fontClassesFor(locale as Locale);

  return (
    <html
      lang={meta.bcp47}
      dir="ltr"
      data-script={meta.script}
      className={`${fonts.immediate} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh flex flex-col font-body text-kashi-ash">
        <script dangerouslySetInnerHTML={{ __html: LOADER_SNIPPET(fonts.deferred) }} />
        <DeferredFonts classes={fonts.deferred} sample={meta.sample} />
        <FaithGlyphSprite />
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110] focus:rounded-kashi focus:bg-kashi-saffron focus:px-4 focus:py-2 focus:text-kashi-night"
        >
          {t("skipToContent")}
        </a>
        {/*
          No NextIntlClientProvider yet: every component that renders copy is a
          Server Component, and client components receive strings as props.
          Add the provider with a scoped `messages` subset when a client
          component genuinely needs useTranslations.
        */}
        <SmoothScroll>
          <SunriseBackground />
          <PageLoader labels={{ loading: t("loading"), skip: t("skip") }} />
          <SiteHeader brand={meta.name === "English" ? "Kashi · काशी" : `${siteName} · Kashi`} homeHref={`/${locale}#hero`}>
            <SectionMenu label={nav("menu")} items={sectionItems} basePath={`/${locale}`} />
            <LanguageSwitcher current={locale as Locale} label={t("chooseLanguage")} />
          </SiteHeader>
          <SoundToggle labels={{ on: t("soundOn"), off: t("soundOff") }} />
          <IncenseCursor />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
