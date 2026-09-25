import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import type { Locale } from "./locales";

type Messages = Record<string, unknown>;

/**
 * Deep-merge locale messages over the English fallback so a missing key in a
 * regional locale degrades to English instead of throwing. Phase 7 fills every
 * locale; until then this keeps all 13 routes building.
 */
function deepMerge(base: Messages, override: Messages): Messages {
  const out: Messages = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const baseValue = out[key];
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      baseValue &&
      typeof baseValue === "object" &&
      !Array.isArray(baseValue)
    ) {
      out[key] = deepMerge(baseValue as Messages, value as Messages);
    } else {
      out[key] = value;
    }
  }
  return out;
}

async function loadMessages(locale: Locale): Promise<Messages> {
  const fallback = (await import("../../messages/en.json")).default as Messages;
  if (locale === "en") return fallback;
  try {
    const own = (await import(`../../messages/${locale}.json`)).default as Messages;
    return deepMerge(fallback, own);
  } catch {
    return fallback;
  }
}

export default getRequestConfig(async ({ locale: explicit, requestLocale }) => {
  // `locale` is set when a server function passes it explicitly (route handlers);
  // otherwise it comes from the [locale] segment.
  const requested = explicit ?? (await requestLocale);
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: await loadMessages(locale),
    timeZone: "Asia/Kolkata",
  };
});
