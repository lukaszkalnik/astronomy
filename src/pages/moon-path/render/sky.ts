/** Sky figure: horizon from N over S to N with the day path of the Sun and the Moon's ±12 h path. */

import { sunMoonPosition, type SunMoonPosition } from "../../../lib/astro/position";
import { localDayStartMs } from "../../../lib/astro/time";
import { formatDeg } from "../../../lib/format";
import { svgEl } from "../../../i18n/dom";
import type { MoonPathState } from "../state";
import { moonIcon } from "./phaseIcon";
import { gapMarker, hourMarks } from "./skyLabels";
import {
  first,
  maxBy,
  moonFade,
  MOON_HALF_STEPS,
  MOON_STEP_MS,
  skyFrame,
  trace,
  type SkyFrame,
} from "./skyGeometry";

export interface SkyResult {
  /** Positions every 5 min over the local day of the shown time (289 samples). */
  dayPts: SunMoonPosition[];
  /** Sample of `dayPts` with the highest Moon. */
  dayMoonMax: SunMoonPosition;
}

/** Linear mix of two "#rrggbb" colours → "rgb(r,g,b)". */
function mix(a: string, b: string, f: number): string {
  const parse = (hex: string): number[] => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const A = parse(a);
  const B = parse(b);
  return "rgb(" + A.map((v, i) => Math.round(v + ((B[i] ?? 0) - v) * f)).join(",") + ")";
}

/** Fixed pseudo-random star field: [x 0…1, y 0…1, radius]. */
const STARS: readonly (readonly [number, number, number])[] = Array.from({ length: 70 }, (_, i) => [
  (((Math.sin(i * 12.9898) * 43758.5453) % 1) + 1) % 1,
  (((Math.sin(i * 78.233) * 12345.678) % 1) + 1) % 1,
  0.6 + ((i * 37) % 10) / 12,
]);

const COMPASS = ["N", "NO", "O", "SO", "S", "SW", "W", "NW", "N"];

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

function background(f: SkyFrame, sunAltDeg: number): SVGElement[] {
  const { W, H, hy, y } = f;
  let sk1: string;
  let sk2: string;
  if (sunAltDeg >= 0) {
    const t = clamp01(sunAltDeg / 8);
    sk1 = mix("#1d3566", "#3d78b3", t);
    sk2 = mix("#8a7f9a", "#a9cbe8", t);
  } else {
    const t = clamp01((sunAltDeg + 12) / 12);
    sk1 = mix("#060b18", "#1d3566", t ** 1.5);
    sk2 = mix("#15254a", "#8a7f9a", t ** 1.5);
  }
  const out: SVGElement[] = [
    svgEl("defs", {}, [
      svgEl("linearGradient", { id: "skg", x1: 0, y1: 0, x2: 0, y2: 1 }, [
        svgEl("stop", { offset: 0, "stop-color": sk1 }),
        svgEl("stop", { offset: 1, "stop-color": sk2 }),
      ]),
      svgEl("clipPath", { id: "up" }, [svgEl("rect", { x: 0, y: 0, width: W, height: hy })]),
      svgEl("radialGradient", { id: "glow" }, [
        svgEl("stop", { offset: 0, "stop-color": "#ff8a5c", "stop-opacity": ".55" }),
        svgEl("stop", { offset: 1, "stop-color": "#ff8a5c", "stop-opacity": 0 }),
      ]),
    ]),
    svgEl("rect", { width: W, height: hy, fill: "url(#skg)" }),
  ];
  const starOp = clamp01((-sunAltDeg - 1) / 7) * 0.75;
  if (starOp > 0) {
    for (const [a, b, r] of STARS) {
      if (b * hy < hy - 20) {
        out.push(
          svgEl("circle", {
            cx: (a * W).toFixed(1),
            cy: (b * (hy - 20)).toFixed(1),
            r: r.toFixed(2),
            fill: "#fff",
            opacity: starOp.toFixed(2),
          }),
        );
      }
    }
  }
  for (const a of [30, 60]) {
    out.push(
      svgEl("line", {
        x1: 0,
        x2: W,
        y1: y(a),
        y2: y(a),
        stroke: "#fff",
        "stroke-opacity": ".12",
        "stroke-dasharray": "3 5",
      }),
      svgEl("text", { x: 8, y: y(a) - 5, "font-size": 12, fill: "#fff", "fill-opacity": ".6" }, [
        `${a}°`,
      ]),
    );
  }
  out.push(
    svgEl("rect", { y: hy, width: W, height: H - hy, fill: "#101724" }),
    svgEl("line", { x1: 0, x2: W, y1: hy, y2: hy, stroke: "#4a5a7a" }),
  );
  COMPASS.forEach((l, i) => {
    if (f.narrow && i % 2) return;
    const X = Math.min(W - 10, Math.max(10, f.x(i * 45)));
    out.push(
      svgEl(
        "text",
        { x: X, y: H - 12, "text-anchor": "middle", "font-size": 13, fill: "#9aa6bf" },
        [l],
      ),
    );
  });
  return out;
}

/** Moon path in segments of 6 samples, fading towards both ends. */
function moonSegments(
  f: SkyFrame,
  mpts: readonly SunMoonPosition[],
  width: number,
  op: number,
): SVGElement[] {
  const out: SVGElement[] = [];
  for (let i = 0; i < mpts.length - 1; i += 6) {
    const seg = mpts.slice(i, i + 7);
    const a = moonFade(i + 3) * op;
    out.push(
      svgEl("path", {
        d: trace(f, "moon", seg),
        fill: "none",
        stroke: "var(--moon)",
        "stroke-opacity": a.toFixed(3),
        "stroke-width": width,
      }),
    );
  }
  return out;
}

export function drawSky(svg: SVGSVGElement, st: MoonPathState): SkyResult | null {
  const W = svg.clientWidth;
  const H = svg.clientHeight;
  if (!W) return null;
  const f = skyFrame(W, H);
  const { x, y } = f;
  const pos = (tMs: number): SunMoonPosition => sunMoonPosition(tMs, st.latDeg, st.lonDeg);
  const now = pos(st.tMs);
  const d0 = localDayStartMs(st.tMs);
  const dayPts: SunMoonPosition[] = [];
  for (let i = 0; i <= 288; i++) dayPts.push(pos(d0 + i * MOON_STEP_MS));
  const mpts: SunMoonPosition[] = [];
  for (let i = -MOON_HALF_STEPS; i <= MOON_HALF_STEPS; i++)
    mpts.push(pos(st.tMs + i * MOON_STEP_MS));

  const nodes: SVGElement[] = background(f, now.sun.altDeg);
  const sunPath = trace(f, "sun", dayPts);
  // Faint full paths (also below the horizon), then bright copies clipped to the sky.
  nodes.push(
    svgEl("path", {
      d: sunPath,
      fill: "none",
      stroke: "var(--sun)",
      "stroke-opacity": ".25",
      "stroke-width": 2,
      "stroke-dasharray": "4 5",
    }),
    ...moonSegments(f, mpts, 2, 0.22),
    svgEl("g", { "clip-path": "url(#up)" }, [
      svgEl("path", {
        d: sunPath,
        fill: "none",
        stroke: "var(--sun)",
        "stroke-width": 2.5,
        "stroke-dasharray": "6 5",
      }),
      ...moonSegments(f, mpts, 3, 1),
    ]),
  );

  const dayMoonMax = maxBy(dayPts, (q) => q.moon.altDeg);
  const windowMoonMax = maxBy(mpts, (q) => q.moon.altDeg);
  nodes.push(...hourMarks(f, st.tMs, mpts, now, windowMoonMax));
  const gap = gapMarker(f, st.tMs, mpts);
  nodes.push(...gap.lines);

  // Label at the highest point of the moon path, unless it would collide with the end labels.
  const ends = [first(mpts), mpts[mpts.length - 1] ?? first(mpts)];
  const nearEnd = (X: number, Y: number): boolean =>
    ends.some((p) => Math.abs(X - x(p.moon.azDeg)) < 110 && Math.abs(Y - y(p.moon.altDeg)) < 34);
  const mc = windowMoonMax.moon;
  if (mc.altDeg > 0 && !nearEnd(x(mc.azDeg), y(mc.altDeg))) {
    const X = x(mc.azDeg);
    const Y = y(mc.altDeg);
    const anc = X < 70 ? "start" : X > W - 70 ? "end" : "middle";
    nodes.push(
      svgEl("circle", { cx: X, cy: Y, r: 3.5, fill: "var(--moon)" }),
      svgEl(
        "text",
        {
          x: X,
          y: Y - 12,
          "text-anchor": anc,
          "font-size": 13,
          "font-weight": 600,
          fill: "var(--moon)",
        },
        [`Mond ${formatDeg(mc.altDeg)}`],
      ),
    );
  }

  const SX = x(now.sun.azDeg);
  const SY = y(now.sun.altDeg);
  nodes.push(
    svgEl("g", { opacity: now.sun.altDeg > 0 ? 1 : 0.35 }, [
      svgEl("circle", { cx: SX, cy: SY, r: 28, fill: "url(#glow)" }),
      svgEl("circle", { cx: SX, cy: SY, r: 10, fill: "var(--sun)" }),
    ]),
  );
  const MX = x(now.moon.azDeg);
  const MY = y(now.moon.altDeg);
  const up = now.moon.altDeg > 0;
  nodes.push(
    svgEl("circle", { cx: MX, cy: MY, r: 16, fill: "#dfe6f2", opacity: up ? 0.12 : 0 }),
    moonIcon(MX, MY, 11, now.k, now.waxing, st.latDeg, up ? 1 : 0.4),
  );
  if (!up) {
    nodes.push(
      svgEl(
        "text",
        {
          x: Math.min(W - 8, Math.max(8, MX)),
          y: MY + 28,
          "text-anchor": MX < 60 ? "start" : MX > W - 60 ? "end" : "middle",
          "font-size": 12,
          fill: "#9aa6bf",
        },
        ["Mond unter dem Horizont"],
      ),
    );
  }
  nodes.push(...gap.labels);
  svg.replaceChildren(...nodes);
  return { dayPts, dayMoonMax };
}
