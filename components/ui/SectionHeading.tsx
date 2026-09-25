import TextReveal from "@/components/motion/TextReveal";
import { LOCALES, type Locale } from "@/lib/i18n/locales";

/**
 * Bilingual H2 per DESIGN.md: primary in the active locale (SplitText reveal),
 * secondary small-caps line in English, or Hindi when the locale is English.
 */
export default function SectionHeading({
  id,
  locale,
  title,
  secondary,
  align = "center",
  as: Tag = "h2",
}: {
  id: string;
  locale: Locale;
  title: string;
  secondary: string;
  align?: "center" | "left";
  as?: "h1" | "h2" | "h3";
}) {
  const script = LOCALES[locale].script;
  const secondaryIsLatin = script !== "latin";
  return (
    <Tag id={id} className={align === "center" ? "text-center" : "text-left"}>
      <TextReveal text={title} script={script} className="text-glow" />
      <span
        className={secondaryIsLatin ? "bilingual-secondary" : "bilingual-secondary-indic"}
        lang={secondaryIsLatin ? "en" : "hi"}
      >
        {secondary}
      </span>
    </Tag>
  );
}
