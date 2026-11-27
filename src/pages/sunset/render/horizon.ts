/** Figure 2: view of the western horizon – the race of the two setting suns. */

import { RAD_PER_DEG } from "../../../lib/astro/angles";
import { SUN_DIAMETER_DEG, type SunsetGeometry } from "../../../lib/astro/sunsetGeometry";
import { FULL_CIRCLE, fitCanvas, setMonoFont } from "../../../lib/canvas";
import { formatDecimal } from "../../../lib/format";
import type { Scene } from "../scene";
import type { Theme } from "../theme";

/** Width of the view in degrees along the horizon. */
const VIEW_WIDTH_DEG = 6;

/**
 * Draw the race at `raceMin` minutes after both upper limbs touched the
 * horizon. Returns the longest duration of the suns drawn (minutes, 0 if none).
 */
export function drawHorizon(
  canvas: HTMLCanvasElement,
  raceMin: number,
  scene: Scene,
  c: Theme,
): number {
  const { ctx, w, h } = fitCanvas(canvas);

  // Sky
  const sk = ctx.createLinearGradient(0, 0, 0, h);
  sk.addColorStop(0, c.duskTop);
  sk.addColorStop(0.62, c.duskMid);
  sk.addColorStop(1, c.duskLow);
  ctx.fillStyle = sk;
  ctx.fillRect(0, 0, w, h);

  const groundY = h * 0.8;
  const degPx = w / VIEW_WIDTH_DEG;
  const cxs = w * 0.3; // start point (upper limb touches the horizon)
  const rSun = (SUN_DIAMETER_DEG / 2) * degPx;

  // Ground and horizon line
  ctx.fillStyle = c.ink;
  ctx.fillRect(0, groundY, w, h - groundY);
  ctx.strokeStyle = c.brassDim;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, groundY + 0.5);
  ctx.lineTo(w, groundY + 0.5);
  ctx.stroke();

  /** One sun sinking along its path; `side` +1 runs to the right, −1 to the left. */
  function run(g: SunsetGeometry, col: string, side: 1 | -1): number {
    if (g.state !== "ok") return 0;
    const gam = g.gammaDeg * RAD_PER_DEG;
    const dropDegPerMin = g.rateDegPerHour / 60;
    const total = g.durationMin;
    const tt = Math.min(raceMin, total);
    // Start: upper limb on the horizon ⇒ centre at altitude +diameter/2
    const startAlt = SUN_DIAMETER_DEG / 2;
    const alt = startAlt - dropDegPerMin * tt;
    const travel = (startAlt - alt) / Math.sin(gam); // distance along the path, degrees
    const x = cxs + travel * Math.cos(gam) * degPx * side;
    const y = groundY - alt * degPx;

    // Path: straight line through the start point with slope γ
    ctx.strokeStyle = col;
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    const L = 3.2 * degPx;
    ctx.beginPath();
    const y0 = groundY - startAlt * degPx;
    ctx.moveTo(cxs - Math.cos(gam) * L * side, y0 - Math.sin(gam) * L);
    ctx.lineTo(cxs + Math.cos(gam) * L * side, y0 + Math.sin(gam) * L);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;

    // Disc with glow, clipped at the horizon
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, w, groundY);
    ctx.clip();
    const gr = ctx.createRadialGradient(x, y, rSun * 0.2, x, y, rSun * 2.4);
    gr.addColorStop(0, c.alpha(c.sun, 0.42));
    gr.addColorStop(1, c.alpha(c.sun, 0));
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.arc(x, y, rSun * 2.4, 0, FULL_CIRCLE);
    ctx.fill();
    ctx.fillStyle = c.sun;
    ctx.beginPath();
    ctx.arc(x, y, rSun, 0, FULL_CIRCLE);
    ctx.fill();
    ctx.strokeStyle = col;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Finish label
    const done = raceMin >= total;
    setMonoFont(ctx, 11, 500);
    ctx.fillStyle = col;
    ctx.textAlign = "center";
    ctx.fillText(
      `${done ? "✓ " : ""}${formatDecimal(total, 2)} min`,
      x,
      groundY + (side > 0 ? 20 : 36),
    );
    ctx.textAlign = "left";
    return total;
  }

  const tEq = run(scene.eq, c.cyan, 1);
  const tSel = scene.showSel ? run(scene.sel, c.rose, -1) : 0;

  // Scale note
  setMonoFont(ctx, 10, 400);
  ctx.fillStyle = c.dim;
  ctx.fillText("Bildbreite ≈ 6° am Horizont · Sonnenscheibe 0,533°", 14, 18);

  return Math.max(tEq, tSel);
}
