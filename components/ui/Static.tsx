import { createHash } from "node:crypto";
import { Fragment, createElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { putStaticHtml } from "@/lib/staticHtml";
import StaticChildren from "./StaticChildren";
import StaticSlot from "./StaticSlot";

/**
 * Server-rendered markup that React neither hydrates nor ships twice.
 *
 * The App Router serialises every server component's output into the RSC
 * payload, which is inlined in the HTML for hydration. Text-only sections
 * therefore sent all their words twice: once as markup, once in the payload.
 * Here the children are rendered to an HTML string in the server-component
 * pass and handed to <StaticSlot> by key, so the payload carries only the key
 * and the HTML carries the markup once. In the browser the slot keeps the
 * server markup without hydrating it (see StaticSlot).
 *
 * Only put server components with no interactivity and no hooks inside:
 * they are called as plain (possibly async) functions. Links, native
 * details/summary and CSS all keep working; scroll reveals are driven from
 * outside by <RevealController>. If the markup cannot be rendered to a string
 * (a client component inside, or no react-dom/server in this runtime), it
 * falls back to <StaticChildren>, which ships the children in the payload.
 */
export default async function Static({ children, className = "contents" }: { children: ReactNode; className?: string }) {
  const id = await toHtml(children);
  if (!id) return <StaticChildren className={className}>{children}</StaticChildren>;
  return <StaticSlot id={id} className={className} />;
}

/** Renders the children to HTML and stores it; returns its key, or null to fall back. */
async function toHtml(children: ReactNode): Promise<string | null> {
  try {
    const render = await renderer();
    const html = render(createElement(Fragment, null, await resolve(children)));
    const id = createHash("sha1").update(html).digest("base64url").slice(0, 16);
    putStaticHtml(id, html);
    return id;
  } catch (e) {
    if (process.env.NODE_ENV !== "production") console.warn("[Static] falling back:", (e as Error).message);
    return null;
  }
}

type Render = (node: ReactElement) => string;
let cached: Promise<Render> | null = null;
/**
 * react-dom/server loaded through Node's own require: bundlers refuse it in
 * the server-component graph, but here it only turns an already-resolved tree
 * of host elements into a string (no components, no hooks run inside it).
 */
function renderer(): Promise<Render> {
  cached ??= (async () => {
    const { createRequire } = await import("node:module");
    const req = createRequire(process.cwd() + "/package.json");
    const mod = req("react-dom/server") as { renderToStaticMarkup: Render };
    return mod.renderToStaticMarkup;
  })();
  return cached;
}

const CLIENT_REF = Symbol.for("react.client.reference");

/** Calls server components (sync or async) until only host elements remain. */
async function resolve(node: ReactNode): Promise<ReactNode> {
  if (node == null || typeof node === "boolean" || typeof node === "string" || typeof node === "number") return node;
  if (Array.isArray(node)) return Promise.all(node.map(resolve));
  if (node instanceof Promise) return resolve(await node);
  if (!isValidElement(node)) throw new Error("unsupported node in <Static>");
  const el = node as ReactElement<{ children?: ReactNode } & Record<string, unknown>>;
  const { type, props } = el;
  if (type === Static || type === StaticChildren) return resolve(props.children);
  if (type === Fragment) return createElement(Fragment, { key: el.key }, await resolve(props.children));
  if (typeof type === "string") {
    if (props.children === undefined) return el;
    return createElement(type, { ...props, key: el.key }, await resolve(props.children));
  }
  if (typeof type === "function" && (type as { $$typeof?: symbol }).$$typeof !== CLIENT_REF) {
    return resolve(await (type as (p: typeof props) => ReactNode | Promise<ReactNode>)(props));
  }
  throw new Error("client component inside <Static>");
}
