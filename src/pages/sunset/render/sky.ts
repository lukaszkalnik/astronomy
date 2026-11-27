/** Figure 1: the celestial sphere with both daily paths, seen from a draggable camera. */

import { RAD_PER_DEG } from "../../../lib/astro/angles";
import { sunPathTangent, sunVector, type SunsetGeometry } from "../../../lib/astro/sunsetGeometry";
import { cross, dot, normalize, scale, type Vec3 } from "../../../lib/astro/vec3";
import { FULL_CIRCLE, fitCanvas, setMonoFont } from "../../../lib/canvas";
import { formatDecimal } from "../../../lib/format";
import type { Scene } from "../scene";
import type { SunsetState } from "../state";
import type { Theme } from "../theme";
import { drawAngleInset } from "./skyInset";

/** Orthographic camera looking at the origin: forward, right and up unit vectors. */
interface Camera {
  f: Vec3;
  r: Vec3;
  u: Vec3;
}

function camera(azDeg: number, elDeg: number): Camera {
  const az = azDeg * RAD_PER_DEG;
  const el = elDeg * RAD_PER_DEG;
  const pos: Vec3 = [Math.cos(el) * Math.sin(az), Math.cos(el) * Math.cos(az), Math.sin(el)];
  const f = scale(pos, -1);
  const r = normalize(cross(f, [0, 0, 1]));
  const u = cross(r, f);
  return { f, r, u };
}

type Pt = readonly [number, number];

/** Step of the hour angle when sampling a daily path, degrees. */
const PATH_STEP_DEG = 1.5;

export function drawSky(canvas: HTMLCanvasElement, st: SunsetState, scene: Scene, c: Theme): void {
  const { ctx, w, h } = fitCanvas(canvas);
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = c.ink2;
  ctx.fillRect(0, 0, w, h);

  const cam = camera(st.camAzDeg, st.camElDeg);
  const R = Math.min(w, h) * 0.4;
  const cx = w / 2;
  const cy = h * 0.53;
  const P = (v: Vec3): Pt => [cx + R * dot(v, cam.r), cy - R * dot(v, cam.u)];
  const depth = (v: Vec3): number => dot(v, cam.f);
  const line = (p1: Pt, p2: Pt): void => {
    ctx.beginPath();
    ctx.moveTo(p1[0], p1[1]);
    ctx.lineTo(p2[0], p2[1]);
    ctx.stroke();
  };

  const { latDeg: phi, declDeg: d } = scene;

  // Star field (fixed pseudo-random pattern)
  ctx.save();
  ctx.globalAlpha = 0.5;
  for (let i = 0; i < 70; i++) {
    const a = i * 2.399;
    const rr = R * 1.45 * Math.sqrt((i % 37) / 37);
    const x = cx + Math.cos(a * 3.1) * rr;
    const y = cy + Math.sin(a * 2.3) * rr * 0.75;
    ctx.fillStyle = c.line;
    ctx.fillRect(x, y, 1, 1);
  }
  ctx.restore();

  /** Sample a daily path and draw its part below the horizon dashed. */
  function track(dd: number, col: string): Vec3[] {
    const pts: Vec3[] = [];
    for (let H = 0; H <= 360; H += PATH_STEP_DEG) pts.push(sunVector(phi, dd, H));
    ctx.lineWidth = 1.6;
    eachSegment(pts, (a, b) => {
      if (!(a[2] < 0 && b[2] < 0)) return;
      ctx.strokeStyle = col;
      ctx.globalAlpha = 0.22;
      ctx.setLineDash([3, 4]);
      line(P(a), P(b));
    });
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
    return pts;
  }
  const ptsEq = track(0, c.cyan);
  const ptsSel = track(d, c.rose);

  // Horizon disc
  const hp: Pt[] = [];
  for (let a = 0; a <= 360; a += 3) {
    const t = a * RAD_PER_DEG;
    hp.push(P([Math.sin(t), Math.cos(t), 0]));
  }
  ctx.beginPath();
  hp.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
  ctx.closePath();
  ctx.fillStyle = c.alpha(c.ink, 0.86);
  ctx.fill();
  ctx.strokeStyle = c.brassDim;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Celestial axis
  const pole: Vec3 = [0, Math.cos(phi * RAD_PER_DEG), Math.sin(phi * RAD_PER_DEG)];
  const a1 = P(scale(pole, -1.25));
  const a2 = P(scale(pole, 1.25));
  ctx.strokeStyle = c.brassDim;
  ctx.setLineDash([5, 5]);
  ctx.lineWidth = 1;
  line(a1, a2);
  ctx.setLineDash([]);
  ctx.fillStyle = c.brass;
  setMonoFont(ctx, 9.5, 500);
  ctx.fillText("HIMMELSACHSE", a2[0] + 7, a2[1] + 3);

  // Cardinal directions (German labels: O = Ost = East)
  const dirs: [string, Vec3][] = [
    ["N", [0, 1, 0]],
    ["O", [1, 0, 0]],
    ["S", [0, -1, 0]],
    ["W", [-1, 0, 0]],
  ];
  setMonoFont(ctx, 10.5, 500);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const [label, v] of dirs) {
    const p = P([v[0] * 1.1, v[1] * 1.1, 0]);
    ctx.fillStyle = label === "W" ? c.brass : c.dim;
    ctx.fillText(label, p[0], p[1]);
  }
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  /** The part of a path above the horizon; the far side of the sphere is faded. */
  function upper(pts: Vec3[], col: string): void {
    ctx.strokeStyle = col;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 1;
    eachSegment(pts, (a, b) => {
      if (a[2] < 0 || b[2] < 0) return;
      ctx.globalAlpha = depth(a) > 0 ? 0.45 : 1;
      line(P(a), P(b));
    });
    ctx.globalAlpha = 1;
  }
  upper(ptsEq, c.cyan);
  upper(ptsSel, c.rose);

  /** Mark the setting point and the (projected) angle between path and horizon. */
  function angleArc(dd: number, g: SunsetGeometry, col: string): void {
    if (g.state !== "ok") return;
    const H0 = g.hourAngleSetDeg;
    const p0 = sunVector(phi, dd, H0);
    const t = sunPathTangent(phi, dd, H0);
    // Horizon tangent in the same direction of travel
    let hgt = normalize([-p0[1], p0[0], 0]);
    if (dot(hgt, t) < 0) hgt = [-hgt[0], -hgt[1], 0];
    // Arc from the horizon to the path
    const rr = 0.2;
    const steps = 18;
    ctx.strokeStyle = col;
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const f = i / steps;
      const v = normalize([
        hgt[0] + (t[0] - hgt[0]) * f,
        hgt[1] + (t[1] - hgt[1]) * f,
        hgt[2] + (t[2] - hgt[2]) * f,
      ]);
      const q = P([p0[0] + v[0] * rr, p0[1] + v[1] * rr, p0[2] + v[2] * rr]);
      if (i) ctx.lineTo(q[0], q[1]);
      else ctx.moveTo(q[0], q[1]);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
    const sp = P(p0);
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(sp[0], sp[1], 2.6, 0, FULL_CIRCLE);
    ctx.fill();
  }
  angleArc(0, scene.eq, c.cyan);
  if (scene.showSel) angleArc(d, scene.sel, c.rose);

  /** One of the two moving suns; faded while below the horizon. */
  function sunDot(dd: number, col: string): void {
    const v = sunVector(phi, dd, st.hourAngleDeg);
    const p = P(v);
    const up = v[2] >= 0;
    ctx.globalAlpha = up ? 1 : 0.28;
    if (up) {
      const gr = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], 13);
      gr.addColorStop(0, c.alpha(c.sun, 0.55));
      gr.addColorStop(1, c.alpha(c.sun, 0));
      ctx.fillStyle = gr;
      ctx.beginPath();
      ctx.arc(p[0], p[1], 13, 0, FULL_CIRCLE);
      ctx.fill();
    }
    ctx.fillStyle = up ? c.sun : col;
    ctx.beginPath();
    ctx.arc(p[0], p[1], 4.2, 0, FULL_CIRCLE);
    ctx.fill();
    ctx.strokeStyle = col;
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  sunDot(0, c.cyan);
  sunDot(d, c.rose);

  drawAngleInset(ctx, w, h, scene, c);

  // Caption inside the figure
  setMonoFont(ctx, 10, 400);
  ctx.fillStyle = c.dim;
  ctx.fillText(`φ = ${formatDecimal(st.latDeg, 1)}°   δ = ${formatDecimal(d, 1)}°`, 14, h - 14);
}

function eachSegment(pts: Vec3[], fn: (a: Vec3, b: Vec3) => void): void {
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    if (a && b) fn(a, b);
  }
}

/** Camera drag: degrees of azimuth / elevation per CSS pixel. */
export const DRAG_AZ_PER_PX = 0.45;
export const DRAG_EL_PER_PX = 0.35;
