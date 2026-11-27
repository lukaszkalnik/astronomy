/** Sky figure labels: hourly dots on the moon path and the marker where the ±12 h window wraps. */

import { normDeg } from "../../../lib/astro/angles";
import type { SunMoonPosition } from "../../../lib/astro/position";
import { formatTime, formatWeekdayShort } from "../../../lib/format";
import { svgEl } from "../../../i18n/dom";
import { at, first, moonFade, MOON_HALF_STEPS, MOON_STEP_MS, type SkyFrame } from "./skyGeometry";

const LABEL_HALO = { stroke: "#0b1220", "stroke-width": 3, "paint-order": "stroke" } as const;

/** A dot at each full hour on the moon path; every 3rd (narrow: 6th) hour labelled unless crowded. */
export function hourMarks(
  f: SkyFrame,
  tMs: number,
  mpts: readonly SunMoonPosition[],
  now: SunMoonPosition,
  windowMoonMax: SunMoonPosition,
): SVGElement[] {
  const { W, x, y } = f;
  const out: SVGElement[] = [];
  const MXn = x(now.moon.azDeg);
  const MYn = y(now.moon.altDeg);
  const mc = windowMoonMax.moon;
  const CX = x(mc.azDeg);
  const CY = y(mc.altDeg);
  const step = f.narrow ? 6 : 3;
  const ends = [first(mpts), at(mpts, mpts.length - 1)];
  let prevHour: number | null = null;
  for (let i = 0; i < mpts.length; i++) {
    const tt = tMs + (i - MOON_HALF_STEPS) * MOON_STEP_MS;
    const h = new Date(tt).getHours();
    if (prevHour !== null && h !== prevHour) {
      const q = at(mpts, i).moon;
      const X = x(q.azDeg);
      const Y = y(q.altDeg);
      const a = moonFade(i) * (q.altDeg > 0 ? 1 : 0.45);
      out.push(
        svgEl("circle", {
          cx: X.toFixed(1),
          cy: Y.toFixed(1),
          r: 2.6,
          fill: "var(--moon)",
          opacity: a.toFixed(2),
        }),
      );
      const near =
        Math.hypot(X - MXn, Y - MYn) < 34 ||
        ends.some(
          (p) => Math.abs(X - x(p.moon.azDeg)) < 105 && Math.abs(Y - y(p.moon.altDeg)) < 30,
        ) ||
        (mc.altDeg > 0 && Math.hypot(X - CX, Y - CY) < 46);
      if (h % step === 0 && !near && a > 0.15) {
        const txt = h === 0 ? `${formatWeekdayShort(tt)} 0:00` : `${h}:00`;
        const anc = X < 40 ? "start" : X > W - 40 ? "end" : "middle";
        out.push(
          svgEl(
            "text",
            {
              x: X.toFixed(1),
              y: (Y - 9).toFixed(1),
              "text-anchor": anc,
              "font-size": 12,
              "font-weight": h === 0 ? 600 : 500,
              fill: "#fff",
              "fill-opacity": Math.min(1, a + 0.1).toFixed(2),
              ...LABEL_HALO,
              "stroke-opacity": ".55",
            },
            [txt],
          ),
        );
      }
    }
    prevHour = h;
  }
  return out;
}

/** Signed direction of the shortest azimuth step a → b. */
const azDir = (a: number, b: number): 1 | -1 => (((b - a + 540) % 360) - 180 >= 0 ? 1 : -1);

/**
 * Dashed vertical line where the start and end of the ±12 h window meet, plus
 * "ab …" / "bis …" labels at both ends of the moon path.
 */
export function gapMarker(
  f: SkyFrame,
  tMs: number,
  mpts: readonly SunMoonPosition[],
): { lines: SVGElement[]; labels: SVGElement[] } {
  const { W, x, y, top, H, bot } = f;
  const n1 = mpts.length - 1;
  const p0 = first(mpts).moon;
  const p1 = at(mpts, n1).moon;
  const amDeg = normDeg(p0.azDeg + (((p1.azDeg - p0.azDeg + 540) % 360) - 180) / 2);
  const GX = Math.min(W - 2, Math.max(2, x(amDeg)));
  const fmt = (t: number): string => `${formatWeekdayShort(t)} ${formatTime(t)}`;
  const vline = (X: string | number): SVGElement =>
    svgEl("line", {
      x1: X,
      x2: X,
      y1: top,
      y2: H - bot,
      stroke: "#fff",
      "stroke-opacity": ".45",
      "stroke-width": 1.5,
      "stroke-dasharray": "5 4",
    });
  const lines = [vline(GX.toFixed(1))];
  if (Math.abs(x(p0.azDeg) - x(p1.azDeg)) > W / 2) lines.push(vline(GX > W / 2 ? 2 : W - 2));

  const span = MOON_HALF_STEPS * MOON_STEP_MS;
  const E0 = {
    X: x(p0.azDeg),
    Y: y(p0.altDeg),
    dir: azDir(p0.azDeg, at(mpts, 1).moon.azDeg),
    txt: `ab ${fmt(tMs - span)}`,
  };
  const E1 = {
    X: x(p1.azDeg),
    Y: y(p1.altDeg),
    dir: -azDir(at(mpts, n1 - 1).moon.azDeg, p1.azDeg),
    txt: `bis ${fmt(tMs + span)}`,
  };
  const higher = E0.Y < E1.Y ? E0 : E1;
  const labels: SVGElement[] = [];
  for (const e of [E0, E1]) {
    // Rough text width (12 px font) to keep the label inside the figure.
    const w = e.txt.length * 7;
    let ax: number;
    let an: "start" | "end";
    if (e.dir > 0) {
      ax = e.X + 6;
      an = "start";
      if (ax + w > W - 4) {
        ax = e.X - 6;
        an = "end";
      }
    } else {
      ax = e.X - 6;
      an = "end";
      if (ax - w < 4) {
        ax = e.X + 6;
        an = "start";
      }
    }
    const yy = e === higher ? e.Y - 10 : e.Y + 19;
    labels.push(
      svgEl("circle", {
        cx: e.X.toFixed(1),
        cy: e.Y.toFixed(1),
        r: 3.5,
        fill: "none",
        stroke: "#fff",
        "stroke-width": 1.5,
      }),
      svgEl(
        "text",
        {
          x: ax.toFixed(1),
          y: yy.toFixed(1),
          "text-anchor": an,
          "font-size": 12,
          "font-weight": 600,
          fill: "#fff",
          ...LABEL_HALO,
          "stroke-opacity": ".6",
        },
        [e.txt],
      ),
    );
  }
  return { lines, labels };
}
