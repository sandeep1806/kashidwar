/**
 * Locales whose long-form prose (tips, stories, project/food/itinerary texts)
 * is fully translated. Elsewhere those fields fall back to English and the UI
 * shows a small localized "shown in English" note.
 */
const FULL_PROSE = new Set(["hi", "en"]);
export const proseFallsBack = (locale: string) => !FULL_PROSE.has(locale);
