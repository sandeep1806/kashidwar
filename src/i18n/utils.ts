/**
 * Tiny vanilla i18n helpers — no astro:i18n runtime, no library.
 * English lives at the root; hi/ta/te are path-prefixed (/hi, /ta, /te).
 */
import { ui, defaultLang, type Lang, type UiKey } from './ui';

export const locales: Lang[] = ['en', 'hi', 'ta', 'te'];

/** First path segment, if it is a non-default locale; else the default. */
export function getLangFromUrl(url: URL): Lang {
  const seg = url.pathname.split('/').filter(Boolean)[0];
  return (locales as string[]).includes(seg) && seg !== defaultLang ? (seg as Lang) : defaultLang;
}

/** t('map.heading') with graceful fallback to English. */
export function useTranslations(lang: Lang) {
  return function t(key: UiKey): string {
    return ui[lang][key] ?? ui[defaultLang][key];
  };
}

/**
 * Prefix an absolute site path for the given locale, preserving the trailing
 * slash the rest of the site uses. localizedPath('/map/', 'hi') -> '/hi/map/'.
 */
export function localizedPath(path: string, lang: Lang): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (lang === defaultLang) return clean;
  return `/${lang}${clean}`;
}

/** hreflang alternates for one logical path across all locales + x-default. */
export function alternatesFor(path: string): { hreflang: string; href: string }[] {
  const list = locales.map((l) => ({ hreflang: l, href: localizedPath(path, l) }));
  list.push({ hreflang: 'x-default', href: localizedPath(path, defaultLang) });
  return list;
}

/** BCP-47 og:locale value per language. */
export const ogLocale: Record<Lang, string> = {
  en: 'en_IN',
  hi: 'hi_IN',
  ta: 'ta_IN',
  te: 'te_IN',
};

/** Which font-family utility class a locale's script needs. */
export const scriptClass: Record<Lang, string> = {
  en: '',
  hi: 'devanagari',
  ta: 'tamil',
  te: 'telugu',
};
