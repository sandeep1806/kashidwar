import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import ArticlePage, { articleMetadata } from "@/components/pages/ArticlePage";
import { guideBySlug, guides } from "@/lib/guides";
import { locales } from "@/lib/i18n/locales";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) => guides.map((g) => ({ locale, slug: g.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/guides/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const g = guideBySlug(slug);
  return g ? articleMetadata(g, locale, "guides") : {};
}

/** A guide (components/pages/ArticlePage.tsx). */
export default async function GuidePage({ params }: PageProps<"/[locale]/guides/[slug]">) {
  const { locale, slug } = await params;
  const g = guideBySlug(slug);
  if (!g) notFound();
  setRequestLocale(locale);
  return <ArticlePage g={g} locale={locale} kind="guides" />;
}
