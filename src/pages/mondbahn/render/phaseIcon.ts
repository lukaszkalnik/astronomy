/** Moon phase icon: dark disc plus the lit part as an SVG path. */

import { svgEl } from "../../../i18n/dom";

/**
 * SVG path of the lit part of the Moon disc. `k` is the illuminated fraction.
 * On the southern hemisphere (`latDeg < 0`) the icon is mirrored.
 */
export function phasePath(
  cx: number,
  cy: number,
  r: number,
  k: number,
  waxing: boolean,
  latDeg: number,
): string {
  const w = latDeg < 0 ? !waxing : waxing;
  const rx = (Math.abs(1 - 2 * k) * r).toFixed(2);
  if (w)
    return `M${cx},${cy - r}A${r},${r} 0 0 1 ${cx},${cy + r}A${rx},${r} 0 0 ${k < 0.5 ? 0 : 1} ${cx},${cy - r}Z`;
  return `M${cx},${cy - r}A${r},${r} 0 0 0 ${cx},${cy + r}A${rx},${r} 0 0 ${k < 0.5 ? 1 : 0} ${cx},${cy - r}Z`;
}

export function moonIcon(
  cx: number,
  cy: number,
  r: number,
  k: number,
  waxing: boolean,
  latDeg: number,
  opacity = 1,
): SVGGElement {
  return svgEl("g", { opacity }, [
    svgEl("circle", { cx, cy, r, fill: "#2a3550" }),
    svgEl("path", { d: phasePath(cx, cy, r, k, waxing, latDeg), fill: "var(--moon)" }),
  ]);
}
