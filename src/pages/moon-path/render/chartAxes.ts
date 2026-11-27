/** Shared parts of the year and cycle charts. */

import { svgEl } from "../../../i18n/dom";

export interface ChartFrame {
  W: number;
  H: number;
  narrow: boolean;
  /** Left / right / top / bottom margins in px. */
  l: number;
  r: number;
  t: number;
  b: number;
  /** Altitude (degrees) → y. */
  y: (altDeg: number) => number;
}

export function chartFrame(W: number, H: number, t: number, loDeg: number): ChartFrame {
  const narrow = W < 520;
  const l = narrow ? 30 : 38;
  const r = 10;
  const b = 30;
  return { W, H, narrow, l, r, t, b, y: (a) => t + ((90 - a) / (90 - loDeg)) * (H - t - b) };
}

/** Horizontal grid lines and labels at 0°, 30°, 60°, 90°. */
export function altitudeGrid(f: ChartFrame): SVGElement[] {
  const out: SVGElement[] = [];
  for (let a = 0; a <= 90; a += 30) {
    out.push(
      svgEl("line", {
        x1: f.l,
        x2: f.W - f.r,
        y1: f.y(a),
        y2: f.y(a),
        stroke: "#fff",
        "stroke-opacity": a ? 0.08 : 0.25,
      }),
      svgEl(
        "text",
        { x: f.l - 6, y: f.y(a) + 4, "text-anchor": "end", "font-size": 12, fill: "#9aa6bf" },
        [`${a}°`],
      ),
    );
  }
  return out;
}

export function axisLabel(X: number, f: ChartFrame, text: string): SVGElement {
  return svgEl(
    "text",
    { x: X, y: f.H - 10, "text-anchor": "middle", "font-size": 12, fill: "#9aa6bf" },
    [text],
  );
}

/** Vertical line marking the shown date. */
export function cursorLine(X: number, f: ChartFrame): SVGElement {
  return svgEl("line", {
    x1: X,
    x2: X,
    y1: f.t,
    y2: f.H - f.b,
    stroke: "var(--acc)",
    "stroke-width": 1.5,
  });
}
