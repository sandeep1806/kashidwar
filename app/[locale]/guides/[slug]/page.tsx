import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LinkCards, type LinkCard } from "@/components/pages/Blocks";
import LdJson from "@/components/pages/LdJson";
import PageShell from "@/components/pages/PageShell";
import EnglishNote from "@/components/ui/EnglishNote";
import { festivals, itineraries, places, projects } from "@/lib/content";
import { guideBySlug, guidePhoto, guides, localizeGuide } from "@/lib/guides";
import { LOCALES, locales, type Locale } from "@/lib/i18n/locales";
import { absolute, alternatesFor, breadcrumbLd, itinerarySlug, pageUrl } from "@/lib/pages";
import { getPhoto } from "@/lib/photos";
import { BRAND, SITE_URL } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) => guides.map((g) => ({ locale, slug: g.slug })));
}

const devanagari = (l: Locale) => LOCALES[l].script === "devanagari";
const nameOf = (l: Locale, x: { name_en: string; name_hi: string }) => (devanagari(l) ? { name: x.name_hi, secondary: x.name_en } : { name: x.name_en, secondary: x.name_hi });

export async function generateMetadata({ params }: PageProps<"/[locale]/guides/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const g = guideBySlug(slug);
  if (!g) return {};
  const loc = locale as Locale;
  const l = localizeGuide(g, loc);
  const photo = guidePhoto(g, loc);
  const image = photo ? `${photo.src}-${photo.widths.at(-1)}.webp` : `/media/og/og-${locale}.png`;
  const path = `/guides/${slug}`;
  return {
    title: l.title,
    description: l.description,
    alternates: alternatesFor(locale, path),
    openGraph: { type: "article", title: l.title, description: l.description, url: `/${locale}${path}`, publishedTime: g.published, modifiedTime: g.updated, images: [{ url: image, alt: photo?.alt ?? l.title }] },
    twitter: { card: "summary_large_image", title: l.title, description: l.description, images: [image] },
  };
}

/** Related pages as link cards, in the order places, festivals, projects, itineraries. */
function relatedCards(g: NonNullable<ReturnType<typeof guideBySlug>>, loc: Locale): LinkCard[] {
  const out: LinkCard[] = [];
  for (const id of g.related.places ?? []) {
    const p = places.find((x) => x.id === id);
    if (p) out.push({ href: pageUrl(loc, "places", id), ...nameOf(loc, p), photo: getPhoto(`places/${id}`, loc), faith: p.faith[0] ?? "secular", type: p.type });
  }
  for (const id of g.related.festivals ?? []) {
    const f = festivals.find((x) => x.id === id);
    if (f) out.push({ href: pageUrl(loc, "festivals", id), ...nameOf(loc, f), photo: getPhoto(`festivals/${id}`, loc), faith: f.faith[0] ?? "secular" });
  }
  for (const id of g.related.projects ?? []) {
    const p = projects.find((x) => x.id === id);
    if (p) out.push({ href: pageUrl(loc, "projects", id), ...nameOf(loc, p), photo: getPhoto(`projects/${id}`, loc), faith: "secular" });
  }
  for (const slug of g.related.itineraries ?? []) {
    const it = itineraries.find((x) => itinerarySlug(x) === slug);
    if (it) out.push({ href: pageUrl(loc, "itineraries", slug), ...nameOf(loc, { name_en: it.title_en, name_hi: it.title_hi }), photo: null, faith: "secular" });
  }
  return out;
}

/**
 * A guide: breadcrumb, bilingual H1 with byline and dates, lead, sections
 * (each with its cited sources and an "unconfirmed" flag where needed), FAQ,
 * all sources, and related pages. Article + FAQPage + BreadcrumbList JSON-LD.
 */
export default async function GuidePage({ params }: PageProps<"/[locale]/guides/[slug]">) {
  const { locale, slug } = await params;
  const g = guideBySlug(slug);
  if (!g) notFound();
  setRequestLocale(locale);
  const loc = locale as Locale;
  const [t, tp, common] = await Promise.all([
    getTranslations({ locale, namespace: "guides" }),
    getTranslations({ locale, namespace: "page" }),
    getTranslations({ locale, namespace: "common" }),
  ]);
  const l = localizeGuide(g, loc);
  const photo = guidePhoto(g, loc);
  const path = `/guides/${slug}`;
  const home = `/${locale}`;
  const crumbs = [
    { name: tp("home"), href: home },
    { name: t("title"), href: `${home}/guides` },
    { name: l.title, href: `${home}${path}` },
  ];
  const fmt = new Intl.DateTimeFormat(LOCALES[loc].bcp47, { dateStyle: "long", timeZone: "UTC" });
  const date = (d: string) => fmt.format(new Date(d + "T00:00:00Z"));
  const url = absolute(`${home}${path}`);
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "@id": `${url}#article`,
      headline: l.title.slice(0, 110),
      description: l.description,
      image: [absolute(photo ? `${photo.src}-${photo.widths.at(-1)}.webp` : `/media/og/og-${locale}.png`)],
      datePublished: g.published,
      dateModified: g.updated,
      inLanguage: l.lang === "hi" ? "hi-IN" : "en-IN",
      mainEntityOfPage: url,
      author: { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: BRAND, url: SITE_URL },
      publisher: { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: BRAND, logo: { "@type": "ImageObject", url: `${SITE_URL}/icon-512.png` } },
      citation: g.sources.map((s) => s.url),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: l.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
    breadcrumbLd(loc, crumbs.map((c) => ({ name: c.name, path: c.href }))),
  ];
  const related = relatedCards(g, loc);

  return (
    <>
      <LdJson data={ld} />
      <PageShell
        locale={loc}
        path={path}
        crumbs={crumbs}
        faith="secular"
        title={l.title}
        secondary={l.lang === "hi" ? g.title_en : g.title_hi}
        subtitle={
          <p className="text-sm text-kashi-ash/75">
            {t("by", { brand: BRAND })} · <time dateTime={g.published}>{t("published", { date: date(g.published) })}</time>
            {g.updated !== g.published && (
              <>
                {" "}· <time dateTime={g.updated}>{t("updated", { date: date(g.updated) })}</time>
              </>
            )}
          </p>
        }
        lead={<p lang={l.lang}>{l.lead}</p>}
        photo={photo}
        after={
          <>
            {related.length > 0 && <LinkCards title={t("related")} items={related} />}
          </>
        }
      >
        <div className="space-y-12" lang={l.lang}>
          {l.lang === "en" && locale !== "en" && <EnglishNote text={common("englishNote")} />}
          {l.sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <h2 className="text-h3 text-kashi-white">{s.heading}</h2>
              {s.unconfirmed && (
                <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-kashi-marigold/50 px-3 py-1 text-xs text-kashi-marigold">⚠ {t("unconfirmed")}</p>
              )}
              <div className="mt-4 space-y-4 leading-relaxed text-kashi-ash/90">
                {s.body.map((p) => (
                  <p key={p.slice(0, 40)}>{p}</p>
                ))}
                {s.list.length > 0 && (
                  <ul className="list-disc space-y-2 pl-5">
                    {s.list.map((li) => (
                      <li key={li.slice(0, 40)}>{li}</li>
                    ))}
                  </ul>
                )}
              </div>
              {s.sources.length > 0 && (
                <p className="mt-3 text-xs text-kashi-ash/60">
                  {t("sources")}:{" "}
                  {s.sources.map((src, i) => (
                    <span key={src.url + i}>
                      {i > 0 && " · "}
                      <a href={`#source-${src.n}`} className="underline decoration-kashi-diya/40 underline-offset-2 hover:text-kashi-diya">[{src.n}]</a>
                    </span>
                  ))}
                </p>
              )}
            </section>
          ))}
          <section id="faq" className="scroll-mt-24">
            <h2 className="text-h3 text-kashi-white">{t("faq")}</h2>
            <div className="mt-4 divide-y divide-kashi-rudraksha/50 rounded-kashi border border-kashi-rudraksha/60 bg-kashi-indigo/40">
              {l.faq.map((f) => (
                <details key={f.q} className="group px-5">
                  <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 py-3 text-kashi-white">
                    {f.q}
                    <span aria-hidden="true" className="text-kashi-diya transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="pb-4 text-kashi-ash/90">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        </div>
        <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
          <nav aria-label={t("contents")} className="rounded-kashi border border-kashi-rudraksha/60 bg-kashi-indigo/40 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-kashi-diya">{t("contents")}</p>
            <ol className="mt-3 space-y-1 text-sm" lang={l.lang}>
              {l.sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="inline-flex min-h-11 items-center text-kashi-ash/85 hover:text-kashi-white">{s.heading}</a>
                </li>
              ))}
              <li>
                <a href="#faq" className="inline-flex min-h-11 items-center text-kashi-ash/85 hover:text-kashi-white">{t("faq")}</a>
              </li>
            </ol>
          </nav>
          <section aria-labelledby="sources-title">
            <h2 id="sources-title" className="text-xs uppercase tracking-[0.18em] text-kashi-diya">{t("sources")}</h2>
            <ol className="mt-3 space-y-2 text-xs text-kashi-ash/70">
              {g.sources.map((s, i) => (
                <li key={s.url} id={`source-${i + 1}`} className="scroll-mt-24">
                  [{i + 1}]{" "}
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline decoration-kashi-diya/40 underline-offset-2 hover:text-kashi-diya">{s.title}</a>
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </PageShell>
    </>
  );
}
