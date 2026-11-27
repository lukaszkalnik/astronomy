/**
 * Tiny, safe DOM helpers. Text goes in via `textContent`, attributes via
 * `setAttribute` – never through HTML strings (CLAUDE.md "Security & privacy").
 */

const SVG_NS = "http://www.w3.org/2000/svg";

/** `document.getElementById` that checks the element type and throws a clear error if it is missing. */
export function byId<T extends Element>(id: string, type: abstract new () => T): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Element #${id} not found`);
  if (!(el instanceof type)) throw new Error(`Element #${id} is not a ${type.name}`);
  return el;
}

export type SvgAttrs = Record<string, string | number>;

/** Create an SVG element with attributes and children (nodes or plain text). */
export function svgEl<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: SvgAttrs = {},
  children: readonly (Node | string)[] = [],
): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attrs)) el.setAttribute(name, String(value));
  for (const child of children) el.append(child);
  return el;
}
