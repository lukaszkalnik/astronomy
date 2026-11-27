/** Figure 3: the Earth's orbit around the Sun; the Earth can be dragged along it. */

import { RAD_PER_DEG } from "../../../lib/astro/angles";
import { OBLIQUITY_DEG } from "../../../lib/astro/declination";
import { FULL_CIRCLE, fitCanvas, setMonoFont } from "../../../lib/canvas";
import { formatDayMonthShort, formatDecimal } from "../../../lib/format";
import { approxDateForEclLon, ORBIT_FLATTEN, orbitAngleRad } from "../orbitGeometry";
import type { Scene } from "../scene";
import type { SunsetState } from "../state";
import type { Theme } from "../theme";

/** Equinoxes and solstices, marked on the orbit. */
const CARDINAL_ECL_LON_DEG = [0, 90, 180, 270] as const;

export function drawOrbit(
  canvas: HTMLCanvasElement,
  st: SunsetState,
  scene: Scene,
  c: Theme,
): void {
  const { ctx, w, h } = fitCanvas(canvas);
  ctx.clearRect(0, 0, w, h);
  const cx = w / 2;
  const cy = h / 2;
  const rx = Math.min(w * 0.36, 86);
  const ry = rx * ORBIT_FLATTEN;

  // Orbit ellipse
  ctx.strokeStyle = c.line;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, FULL_CIRCLE);
  ctx.stroke();

  // Sun
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 16);
  g.addColorStop(0, c.alpha(c.sun, 0.55));
  g.addColorStop(1, c.alpha(c.sun, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, 16, 0, FULL_CIRCLE);
  ctx.fill();
  ctx.fillStyle = c.sun;
  ctx.beginPath();
  ctx.arc(cx, cy, 5, 0, FULL_CIRCLE);
  ctx.fill();

  // Marks of the four cardinal points
  for (const lam of CARDINAL_ECL_LON_DEG) {
    const psi = orbitAngleRad(lam);
    const x = cx + Math.cos(psi) * rx;
    const y = cy + Math.sin(psi) * ry;
    ctx.fillStyle = c.line;
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, FULL_CIRCLE);
    ctx.fill();
  }

  // Earth
  const psi = orbitAngleRad(st.eclLonDeg);
  const ex = cx + Math.cos(psi) * rx;
  const ey = cy + Math.sin(psi) * ry;
  ctx.fillStyle = c.earth;
  ctx.beginPath();
  ctx.arc(ex, ey, 7, 0, FULL_CIRCLE);
  ctx.fill();
  ctx.strokeStyle = c.ivory;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Axis, fixed in space: tilted by ε towards the right of the figure
  const tilt = OBLIQUITY_DEG * RAD_PER_DEG;
  const aL = 15;
  const ax = Math.sin(tilt) * aL;
  const ay = -Math.cos(tilt) * aL;
  ctx.strokeStyle = c.brass;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(ex - ax, ey - ay);
  ctx.lineTo(ex + ax, ey + ay);
  ctx.stroke();
  ctx.fillStyle = c.brass;
  ctx.beginPath();
  ctx.arc(ex + ax, ey + ay, 1.8, 0, FULL_CIRCLE);
  ctx.fill();

  // Labels
  const date = formatDayMonthShort(approxDateForEclLon(st.eclLonDeg).getTime());
  setMonoFont(ctx, 10.5, 500);
  ctx.fillStyle = c.brass;
  ctx.fillText(`λ = ${Math.round(st.eclLonDeg)}°   ≈ ${date}`, 12, h - 24);
  ctx.fillStyle = c.dim;
  setMonoFont(ctx, 10.5, 400);
  ctx.fillText(`Deklination δ = ${formatDecimal(scene.declDeg, 1)}°`, 12, h - 9);
}
