import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import SmoothScroll from "@/components/motion/SmoothScroll";
import SunriseBackground from "@/components/motion/SunriseBackground";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import PageLoader from "@/components/ui/PageLoader";
import SoundToggle from "@/components/ui/SoundToggle";
import IncenseCursor from "@/components/motion/IncenseCursor";
import { fontClassesFor } from "@/lib/fonts";
import { LOCALES, type Locale } from "@/lib/i18n/locales";
import { routing } from "@/lib/i18n/routing";
import "../globals.css";

/**
 * Runs before the loader markup is parsed: if this session already saw the
 * diya ignite, hide the overlay instantly so repeat navigations don't flash.
 */
const LOADER_SNIPPET =
  "try{if(sessionStorage.getItem('kashi:loader')==='1')document.documentElement.setAttribute('data-loader','done')}catch(e){}";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: Omit<LayoutProps<"/[locale]">, "children">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: {
      default: t("title"),
      template: `%s · ${t("siteName")}`,
    },
    description: t("description"),
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

  return (
    <html
      lang={meta.bcp47}
      dir="ltr"
      data-script={meta.script}
      className={`${fontClassesFor(locale as Locale)} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh flex flex-col font-body text-kashi-ash">
        <script dangerouslySetInnerHTML={{ __html: LOADER_SNIPPET }} />
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
          <LanguageSwitcher current={locale as Locale} label={t("chooseLanguage")} />
          <SoundToggle labels={{ on: t("soundOn"), off: t("soundOff") }} />
          <IncenseCursor />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
