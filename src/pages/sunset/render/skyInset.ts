/**
 * Inset in the sky figure ("Winkellupe"): the angle γ between path and horizon
 * in true shape, independent of the camera projection.
 */

import { RAD_PER_DEG } from "../../../lib/astro/angles";
import type { SunsetGeometry } from "../../../lib/astro/sunsetGeometry";
import { setMonoFont } from "../../../lib/canvas";
import { formatDecimal } from "../../../lib/format";
import type { Scene } from "../scene";
import type { Theme } from "../theme";

export function drawAngleInset(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  scene: Scene,
  c: Theme,
): void {
  const bw = Math.min(178, w * 0.44);
  const bh = bw * 0.66;
  const bx = w - bw - 14;
  const by = h - bh - 14;
  ctx.fillStyle = c.alpha(c.ink, 0.92);
  ctx.strokeStyle = c.line;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.rect(bx, by, bw, bh);
  ctx.fill();
  ctx.stroke();

  const vx = bx + 18;
  const vy = by + bh - 24;
  const L = bw - 42;
  // Horizon line
  ctx.strokeStyle = c.brassDim;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(vx - 8, vy);
  ctx.lineTo(vx + L, vy);
  ctx.stroke();

  function ray(g: SunsetGeometry, col: string, rad: number): void {
    if (g.state !== "ok") return;
    const a = g.gammaDeg * RAD_PER_DEG;
    ctx.strokeStyle = col;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(vx, vy);
    ctx.lineTo(vx + Math.cos(a) * L, vy - Math.sin(a) * L);
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.75;
    ctx.beginPath();
    ctx.arc(vx, vy, rad, -a, 0);
    ctx.stroke();
    ctx.globalAlpha = 1;
    setMonoFont(ctx, 10.5, 500);
    ctx.fillStyle = col;
    ctx.fillText(
      `${formatDecimal(g.gammaDeg, 1)}°`,
      vx + Math.cos(a / 2) * (rad + 7),
      vy - Math.sin(a / 2) * (rad + 7) + 3,
    );
  }
  ray(scene.eq, c.cyan, 34);
  if (scene.showSel) ray(scene.sel, c.rose, 54);

  setMonoFont(ctx, 9, 500);
  ctx.fillStyle = c.brass;
  ctx.fillText("WINKELLUPE γ · WAHRE GESTALT", bx + 12, by + 16);
}
