/** 18.6-year figure: monthly highest and lowest noon altitude of the Moon, 2015–2040, Sun for comparison. */

import { svgEl } from "../../../i18n/dom";
import { CYCLE_END_MS as C1, CYCLE_START_MS as C0, cycleData, type CycleWindow } from "../data";
import type { MondbahnState } from "../state";
import { altitudeGrid, axisLabel, chartFrame, cursorLine } from "./chartAxes";

/** Mean obliquity used for the Sun's solstice altitudes. */
const OBLIQUITY_DEG = 23.44;

export interface CycleLayout {
  l: number;
  r: number;
  W: number;
}

export function drawCycle(svg: SVGSVGElement, st: MondbahnState): CycleLayout | null {
  const W = svg.clientWidth;
  const H = svg.clientHeight;
  if (!W) return null;
  const cyc = cycleData();
  // Noon (culmination) altitude for a declination.
  const culm = (decDeg: number): number => 90 - Math.abs(st.latDeg - decDeg);
  const data = cyc.map((c) => ({ tMs: c.tMs, hi: culm(c.hiDecDeg), lo: culm(c.loDecDeg) }));
  const lo = Math.min(0, ...data.map((d) => Math.min(d.hi, d.lo))) - 2;
  const f = chartFrame(W, H, 26, lo);
  const { l, r, t, y } = f;
  const x = (tt: number): number => l + ((tt - C0) / (C1 - C0)) * (W - l - r);

  const nodes = altitudeGrid(f);
  for (let yr = 2015; yr <= 2040; yr += f.narrow ? 10 : 5)
    nodes.push(axisLabel(x(Date.UTC(yr, 0, 1)), f, String(yr)));
  const line = (k: "hi" | "lo"): string =>
    data.map((d, i) => (i ? "L" : "M") + x(d.tMs).toFixed(1) + "," + y(d[k]).toFixed(1)).join("");
  const back = data
    .slice()
    .reverse()
    .map((d) => x(d.tMs).toFixed(1) + "," + y(d.lo).toFixed(1))
    .join("L");
  nodes.push(
    svgEl("path", { d: `${line("hi")}L${back}Z`, fill: "var(--moon)", "fill-opacity": ".1" }),
    svgEl("path", { d: line("hi"), fill: "none", stroke: "var(--moon)", "stroke-width": 2 }),
    svgEl("path", { d: line("lo"), fill: "none", stroke: "var(--moon)", "stroke-width": 2 }),
  );
  for (const v of [culm(OBLIQUITY_DEG), culm(-OBLIQUITY_DEG)]) {
    nodes.push(
      svgEl("line", {
        x1: l,
        x2: W - r,
        y1: y(v),
        y2: y(v),
        stroke: "var(--sun)",
        "stroke-width": 1.5,
        "stroke-dasharray": "6 5",
      }),
    );
  }

  // Major lunar standstill (largest declination) and the minor one in the 2030s.
  let big: CycleWindow | undefined = cyc[0];
  let small: CycleWindow | null = null;
  for (const c of cyc) {
    if (!big || c.hiDecDeg > big.hiDecDeg) big = c;
    const yr = new Date(c.tMs).getUTCFullYear();
    if (yr >= 2030 && yr <= 2038 && (!small || c.hiDecDeg < small.hiDecDeg)) small = c;
  }
  const label = (c: CycleWindow, txt: string): SVGElement[] => {
    const X = x(c.tMs);
    const anc = X < 80 ? "start" : X > W - 80 ? "end" : "middle";
    return [
      svgEl(
        "text",
        {
          x: X,
          y: t - 8,
          "text-anchor": anc,
          "font-size": 12,
          "font-weight": 600,
          fill: "var(--moon)",
        },
        [`${txt} ${new Date(c.tMs).getUTCFullYear()}`],
      ),
      svgEl("line", {
        x1: X,
        x2: X,
        y1: t - 4,
        y2: y(culm(c.hiDecDeg)) - 4,
        stroke: "var(--moon)",
        "stroke-opacity": ".4",
      }),
    ];
  };
  if (big) nodes.push(...label(big, f.narrow ? "groß" : "große Mondwende"));
  if (small) nodes.push(...label(small, f.narrow ? "klein" : "kleine Mondwende"));
  if (st.tMs >= C0 && st.tMs < C1) nodes.push(cursorLine(x(st.tMs), f));
  svg.replaceChildren(...nodes);
  return { l, r, W };
}

/** Time under a click at `offsetX` px from the figure's left edge, or null outside 2015–2040. */
export function timeAt(layout: CycleLayout, offsetX: number): number | null {
  const tt = C0 + ((offsetX - layout.l) / (layout.W - layout.l - layout.r)) * (C1 - C0);
  return tt < C0 || tt >= C1 ? null : tt;
}
