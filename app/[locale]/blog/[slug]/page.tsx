import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import ArticlePage, { articleMetadata } from "@/components/pages/ArticlePage";
import { postBySlug, posts } from "@/lib/guides";
import { locales } from "@/lib/i18n/locales";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) => posts.map((g) => ({ locale, slug: g.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/blog/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const g = postBySlug(slug);
  return g ? articleMetadata(g, locale, "blog") : {};
}

/** A blog post, "Kashi A to Z" (components/pages/ArticlePage.tsx). */
export default async function BlogPostPage({ params }: PageProps<"/[locale]/blog/[slug]">) {
  const { locale, slug } = await params;
  const g = postBySlug(slug);
  if (!g) notFound();
  setRequestLocale(locale);
  return <ArticlePage g={g} locale={locale} kind="blog" />;
}
