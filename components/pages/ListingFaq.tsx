import faqs from "@/content/faqs.json";
import ghatsList from "@/content/ghats-list.json";
import LdJson from "@/components/pages/LdJson";
import Icon from "@/components/ui/Icon";
import type { Locale } from "@/lib/i18n/locales";
import { placeCount } from "@/lib/content";
import { absolute } from "@/lib/pages";

type FaqKey = "places" | "ghats" | "temples" | "itineraries" | "home";
interface FaqItem { q_en: string; a_en: string; q_hi: string; a_hi: string; [k: string]: string }
const FAQS = faqs as unknown as Record<FaqKey, { sources: { title: string; url: string }[]; items: FaqItem[] }>;

/** The FAQ text exists in Hindi and English; every other locale reads the English. */
export const faqLang = (locale: Locale): "hi" | "en" => (locale === "hi" ? "hi" : "en");

/**
 * Questions people search for, answered from the site's own data, as native
 * <details> plus FAQPage JSON-LD. Hook-free; renders inside <Static>.
 */
export default function ListingFaq({ locale, kind, title, path, sourcesLabel }: { locale: Locale; kind: FaqKey; title: string; path: string; sourcesLabel: string }) {
  const { items, sources } = FAQS[kind];
  // Regional translations live beside the English and Hindi as q_<locale> / a_<locale>.
  const own = items.every((it) => it[`q_${locale}`] && it[`a_${locale}`]);
  const lang = own ? locale : faqLang(locale);
  // "{count}" in an answer is the current number of places, in that text's own digits.
  const fill = (text: string) => text.replaceAll("{count}", placeCount(lang));
  const qa = items.map((it) => ({ q: fill(it[`q_${lang}`] ?? it.q_en), a: fill(it[`a_${lang}`] ?? it.a_en) }));
  const ld = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": absolute(`${path}#faq`),
    mainEntity: qa.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <section id="faq" className="container-kashi mt-16 scroll-mt-24" lang={lang}>
      <LdJson data={ld} />
      <h2 className="text-h3 text-kashi-white">{title}</h2>
      <div className="mt-6 divide-y divide-kashi-diya/10 rounded-kashi border border-kashi-rudraksha/60 bg-kashi-indigo/40">
        {qa.map((f) => (
          <details key={f.q} className="faq-item group">
            <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-5 py-3 text-kashi-white">
              <Icon name="chevron" className="icon-chevron h-4 w-4 shrink-0 text-kashi-diya transition-transform group-open:rotate-90" />
              <span className="font-display text-lg leading-snug">{f.q}</span>
            </summary>
            <p className="px-5 pb-5 pl-12 leading-relaxed text-kashi-ash/90">{f.a}</p>
          </details>
        ))}
      </div>
      <p className="mt-3 text-xs text-kashi-ash/60">
        {sourcesLabel}:{" "}
        {sources.map((s, i) => (
          <span key={s.url}>
            {i > 0 && " · "}
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline decoration-kashi-diya/40 underline-offset-2 hover:text-kashi-diya">{s.title}</a>
          </span>
        ))}
      </p>
    </section>
  );
}

/**
 * All 84 traditional ghats (plus Namo Ghat) from south to north, with links to
 * the ones the site covers. Names in Devanagari for Devanagari locales.
 */
export function GhatsIndex({ locale, title, note, hrefFor }: { locale: Locale; title: string; note: string; hrefFor: (id: string) => string }) {
  const devanagari = locale === "hi" || locale === "mr" || locale === "sa";
  const list = (ghatsList as { ghats: { en: string; hi: string; id?: string }[]; source: { title: string; url: string } }).ghats;
  const src = (ghatsList as { source: { title: string; url: string } }).source;
  return (
    <section id="all-ghats" className="container-kashi mt-16 scroll-mt-24">
      <h2 className="text-h3 text-kashi-white">{title}</h2>
      <p className="mt-2 text-sm text-kashi-ash/70">{note} <a href={src.url} target="_blank" rel="noopener noreferrer" className="underline decoration-kashi-diya/40 underline-offset-2 hover:text-kashi-diya">{src.title}</a></p>
      <ol className="ghats-index mt-6 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2 lg:grid-cols-3">
        {list.map((g, i) => (
          <li key={g.en} className="flex gap-2 text-kashi-ash/85">
            <span className="w-7 shrink-0 text-right tabular-nums text-kashi-diya/70">{i + 1}.</span>
            {g.id ? <a href={hrefFor(g.id)} className="text-kashi-diya underline decoration-kashi-diya/40 underline-offset-2 hover:text-kashi-marigold">{devanagari ? g.hi : g.en}</a> : <span>{devanagari ? g.hi : g.en}</span>}
          </li>
        ))}
      </ol>
    </section>
  );
}
