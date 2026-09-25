import { getTranslations } from "next-intl/server";
import Reveal from "@/components/motion/Reveal";
import StaggerCards from "@/components/motion/StaggerCards";
import SectionHeading from "@/components/ui/SectionHeading";
import type { Locale } from "@/lib/i18n/locales";

const ICONS = {
  air: "M3 14l18-9-4 16-5-6-9-1z",
  rail: "M6 4h12v11H6zM6 15l-2 5M18 15l2 5M8 9h8M9 12h.01M15 12h.01",
  road: "M5 20L9 4h6l4 16M12 6v3M12 12v3M12 18v2",
  season: "M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
};

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

export default async function Practical({ locale }: { locale: Locale }) {
  const t = await getTranslations("practical");
  const etiquette = t.raw("etiquette.items") as string[];
  const cards = (["air", "rail", "road", "season"] as const).map((k) => ({ k, title: t(`${k}.title`), text: t(`${k}.text`) }));

  return (
    <section id="practical" aria-labelledby="practical-title" className="section-kashi scroll-mt-4">
      <div className="container-kashi text-center">
        <SectionHeading id="practical-title" locale={locale} title={t("title")} secondary={t("titleSecondary")} />
        <Reveal>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-kashi-ash/90">{t("intro")}</p>
        </Reveal>
      </div>
      <StaggerCards className="container-kashi mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <article key={c.k} className="rounded-kashi border border-kashi-rudraksha/60 bg-kashi-indigo/40 p-6">
            <div className="flex items-center gap-3 text-kashi-diya">
              <Icon d={ICONS[c.k]} />
              <h3 className="text-[1.2rem] text-kashi-white">{c.title}</h3>
            </div>
            <p className="mt-3 text-sm text-kashi-ash/90">{c.text}</p>
          </article>
        ))}
      </StaggerCards>
      <Reveal className="container-kashi mt-10">
        <div className="grain mx-auto max-w-3xl rounded-kashi border border-kashi-diya/25 bg-kashi-indigo/40 p-6 sm:p-8">
          <h3 className="text-[1.3rem] text-kashi-white">{t("etiquette.title")}</h3>
          <ul className="mt-4 space-y-2.5 text-kashi-ash/90">
            {etiquette.map((line) => (
              <li key={line} className="flex gap-3">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-kashi-diya" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </section>
  );
}
