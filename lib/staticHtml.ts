/**
 * Hand-off for <Static>: the server-component pass renders static markup to an
 * HTML string and stores it here under a content hash; the SSR pass of
 * <StaticSlot> (same process, same request) takes it back out. Entries are
 * reference-counted so identical markup on pages rendered in parallel is safe.
 */
type Entry = { html: string; refs: number };
const g = globalThis as typeof globalThis & { __kashiStaticHtml?: Map<string, Entry> };
const store = (g.__kashiStaticHtml ??= new Map<string, Entry>());

export function putStaticHtml(id: string, html: string) {
  const e = store.get(id);
  if (e) e.refs++;
  else store.set(id, { html, refs: 1 });
}

export function takeStaticHtml(id: string): string | undefined {
  const e = store.get(id);
  if (!e) return undefined;
  if (--e.refs <= 0) store.delete(id);
  return e.html;
}
