import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { fontClassesFor } from "@/lib/fonts";
import { LOCALES, type Locale } from "@/lib/i18n/locales";
import { routing } from "@/lib/i18n/routing";
import "../globals.css";

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
  // Enables static rendering for this locale segment.
  setRequestLocale(locale);

  const meta = LOCALES[locale as Locale];

  return (
    <html
      lang={meta.bcp47}
      dir="ltr"
      data-script={meta.script}
      className={`${fontClassesFor(locale as Locale)} h-full`}
    >
      <body className="min-h-dvh flex flex-col font-body text-kashi-ash">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
