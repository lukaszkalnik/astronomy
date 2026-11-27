/** Year figure: daily highest Moon (dots, brighter = fuller), full moons (rings), Sun at noon (line). */

import { localDayStartMs, MS_PER_DAY as D } from "../../../lib/astro/time";
import { svgEl } from "../../../i18n/dom";
import { yearData } from "../data";
import type { MoonPathState } from "../state";
import { altitudeGrid, axisLabel, chartFrame, cursorLine } from "./chartAxes";

const MONTHS = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
const MONTHS_NARROW = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

/** What a click needs to map an x position back to a day of the year. */
export interface YearLayout {
  year: number;
  dayCount: number;
  l: number;
  r: number;
  W: number;
}

export function drawYear(svg: SVGSVGElement, st: MoonPathState): YearLayout | null {
  const W = svg.clientWidth;
  const H = svg.clientHeight;
  if (!W) return null;
  const yd = yearData(st.tMs, st.latDeg, st.lonDeg);
  const n = yd.days.length;
  const lo = Math.min(0, ...yd.days.map((d) => Math.min(d.moonMaxAltDeg, d.sunNoonAltDeg))) - 2;
  const f = chartFrame(W, H, 14, lo);
  const { l, r, y } = f;
  const x = (d: number): number => l + (d / n) * (W - l - r);

  const nodes = altitudeGrid(f);
  (f.narrow ? MONTHS_NARROW : MONTHS).forEach((m, i) => {
    const d = (new Date(yd.year, i, 1).getTime() - yd.yearStartMs) / D;
    nodes.push(axisLabel(x(d + 15), f, m));
  });
  nodes.push(
    svgEl("path", {
      d: yd.days
        .map((d, i) => (i ? "L" : "M") + x(i).toFixed(1) + "," + y(d.sunNoonAltDeg).toFixed(1))
        .join(""),
      fill: "none",
      stroke: "var(--sun)",
      "stroke-width": 2.5,
    }),
  );
  yd.days.forEach((d, i) => {
    nodes.push(
      svgEl("circle", {
        cx: x(i).toFixed(1),
        cy: y(d.moonMaxAltDeg).toFixed(1),
        r: (1.2 + d.k * 2).toFixed(2),
        fill: "var(--moon)",
        opacity: (0.25 + 0.75 * d.k).toFixed(2),
      }),
    );
  });
  for (const fm of yd.fullMoons) {
    nodes.push(
      svgEl("circle", {
        cx: x(fm.dayOffset).toFixed(1),
        cy: y(fm.maxAltDeg).toFixed(1),
        r: 7,
        fill: "none",
        stroke: "var(--moon)",
        "stroke-width": 2,
      }),
    );
  }
  nodes.push(cursorLine(x((localDayStartMs(st.tMs) - yd.yearStartMs) / D), f));
  svg.replaceChildren(...nodes);
  return { year: yd.year, dayCount: n, l, r, W };
}

/** Day index (0-based) under a click at `offsetX` px from the figure's left edge, or null outside. */
export function dayAt(layout: YearLayout, offsetX: number): number | null {
  const d = Math.round(((offsetX - layout.l) / (layout.W - layout.l - layout.r)) * layout.dayCount);
  return d < 0 || d >= layout.dayCount ? null : d;
}
