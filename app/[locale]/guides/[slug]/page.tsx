import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LinkCards, type LinkCard } from "@/components/pages/Blocks";
import LdJson from "@/components/pages/LdJson";
import FactStrip from "@/components/pages/FactStrip";
import PageShell from "@/components/pages/PageShell";
import EnglishNote from "@/components/ui/EnglishNote";
import Icon, { type IconName } from "@/components/ui/Icon";
import { festivals, itineraries, places, projects } from "@/lib/content";
import { guideBySlug, guidePhoto, guides, guideTranslations, localizeGuide } from "@/lib/guides";
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
  const l = localizeGuide(g, loc, await guideTranslations(loc));
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

const ICONS = new Set<string>(["clock", "calendar", "ticket", "hourglass", "people", "camera", "camera-off", "dress", "walk", "train", "plane", "car", "pin", "sunrise", "leaf", "boat", "info", "tip", "shield", "photos"]);
const asIcon = (name: string): IconName => (ICONS.has(name) ? (name as IconName) : "info");

/** An icon for a guide section, from the words in its id. */
function sectionIcon(id: string): IconName {
  const rules: [RegExp, IconName][] = [
    [/price|fare|cost|ticket|budget|save/, "ticket"],
    [/boat|cruise|river/, "boat"],
    [/month|date|festival|day-|calendar|special/, "calendar"],
    [/timing|hour|aarti|night|morning|evening|sunrise|mangala|sapta|status/, "clock"],
    [/board|where|route|ghat|station|distance|getting|connection|nearby|map|gate/, "pin"],
    [/rule|safety|etiquette|tout|crowd|cremation|practical|gi|real|fog/, "shield"],
    [/food|eat/, "leaf"],
    [/stay|hotel/, "walk"],
    [/book|on-the-day|carry/, "tip"],
    [/winter|summer|monsoon|weather/, "sunrise"],
  ];
  return rules.find(([re]) => re.test(id))?.[1] ?? "info";
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
  const l = localizeGuide(g, loc, await guideTranslations(loc));
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
      inLanguage: LOCALES[l.lang as Locale]?.bcp47 ?? "en-IN",
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
        variant="visual"
        longTitle
        locale={loc}
        path={path}
        crumbs={crumbs}
        faith="secular"
        chips={
          <span className="inline-flex items-center gap-1 rounded-full border border-kashi-diya/40 bg-kashi-night/60 px-2 py-0.5 text-kashi-diya">
            <Icon name="tip" className="h-3.5 w-3.5" />
            {t("title")}
          </span>
        }
        title={l.title}
        secondary={locale === "en" ? g.title_hi : g.title_en}
        subtitle={
          <p className="text-sm text-kashi-ash/85">
            {t("by", { brand: BRAND })} · <time dateTime={g.updated}>{t("updated", { date: date(g.updated) })}</time>
          </p>
        }
        strip={l.facts.length ? <FactStrip className="fact-strip-3" items={l.facts.map((f) => ({ icon: asIcon(f.icon), label: f.label, value: f.value }))} /> : undefined}
        lead={
          <div lang={l.lang}>
            <p>{l.lead}</p>
            <nav aria-label={t("contents")} className="guide-jump mt-6">
              {l.sections.map((s) => (
                <a key={s.id} href={`#${s.id}`} className="guide-jump-chip">
                  <Icon name={sectionIcon(s.id)} className="h-4 w-4 shrink-0 text-kashi-diya" />
                  <span>{s.heading}</span>
                </a>
              ))}
              <a href="#faq" className="guide-jump-chip">
                <Icon name="info" className="h-4 w-4 shrink-0 text-kashi-diya" />
                <span>{t("faq")}</span>
              </a>
            </nav>
          </div>
        }
        photo={photo}
        after={
          <>
            {related.length > 0 && <LinkCards title={t("related")} items={related} />}
          </>
        }
      >
        <div className="space-y-8" lang={l.lang}>
          {!l.translated && <EnglishNote text={common("englishNote")} />}
          {l.sections.map((s) => {
            const [first, ...rest] = s.body;
            return (
              <section key={s.id} id={s.id} className="guide-card scroll-mt-24">
                <h2 className="flex items-start gap-3 text-h3 text-kashi-white">
                  <span className="guide-card-icon"><Icon name={sectionIcon(s.id)} className="h-5 w-5" /></span>
                  <span>{s.heading}</span>
                </h2>
                {s.unconfirmed && (
                  <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-kashi-marigold/50 px-3 py-1 text-xs text-kashi-marigold">
                    <Icon name="info" className="h-3.5 w-3.5" />
                    {t("unconfirmed")}
                  </p>
                )}
                {first && <p className="mt-4 leading-relaxed text-kashi-ash/90">{first}</p>}
                {s.list.length > 0 && (
                  <ul className={`guide-list mt-5 ${s.list.length > 4 ? "sm:grid-cols-2" : ""}`}>
                    {s.list.map((li) => (
                      <li key={li.slice(0, 40)}>
                        <Icon name="chevron" className="mt-1 h-4 w-4 shrink-0 text-kashi-diya" />
                        <span>{li}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {rest.length > 0 && (
                  <details className="story-details mt-4">
                    <summary>
                      <Icon name="chevron" className="icon-chevron h-4 w-4" />
                      {tp("readMore")}
                    </summary>
                    <div className="mt-3 space-y-4 leading-relaxed text-kashi-ash/90">
                      {rest.map((para) => (
                        <p key={para.slice(0, 40)}>{para}</p>
                      ))}
                    </div>
                  </details>
                )}
                {s.sources.length > 0 && (
                  <p className="mt-4 text-xs text-kashi-ash/60">
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
            );
          })}
          <section id="faq" className="scroll-mt-24">
            <h2 className="flex items-center gap-3 text-h3 text-kashi-white">
              <span className="guide-card-icon"><Icon name="info" className="h-5 w-5" /></span>
              {t("faq")}
            </h2>
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
          <nav aria-label={t("contents")} className="hidden rounded-kashi border border-kashi-rudraksha/60 bg-kashi-indigo/40 p-5 lg:block">
            <p className="text-xs uppercase tracking-[0.18em] text-kashi-diya">{t("contents")}</p>
            <ol className="mt-3 space-y-1 text-sm" lang={l.lang}>
              {l.sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="inline-flex min-h-11 items-center gap-2 text-kashi-ash/85 hover:text-kashi-white">
                    <Icon name={sectionIcon(s.id)} className="h-4 w-4 shrink-0 text-kashi-diya/80" />
                    {s.heading}
                  </a>
                </li>
              ))}
              <li>
                <a href="#faq" className="inline-flex min-h-11 items-center gap-2 text-kashi-ash/85 hover:text-kashi-white">
                  <Icon name="info" className="h-4 w-4 shrink-0 text-kashi-diya/80" />
                  {t("faq")}
                </a>
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
