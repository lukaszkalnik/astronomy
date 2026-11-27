/** Canvas 2D helpers shared by pages. */

/** Device pixel ratios above this are not worth the extra pixels. */
const MAX_DPR = 2;

export interface FittedCanvas {
  ctx: CanvasRenderingContext2D;
  /** Size in CSS pixels. */
  w: number;
  h: number;
}

/**
 * Resize the canvas backing store to its CSS size × device pixel ratio
 * (capped at 2) and scale the context so drawing uses CSS pixels.
 */
export function fitCanvas(canvas: HTMLCanvasElement): FittedCanvas {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
  canvas.width = Math.max(1, Math.round(rect.width * dpr));
  canvas.height = Math.max(1, Math.round(rect.height * dpr));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context not available");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w: rect.width, h: rect.height };
}

/** Set the context font to IBM Plex Mono at `px` CSS pixels. */
export function setMonoFont(ctx: CanvasRenderingContext2D, px: number, weight = 400): void {
  ctx.font = `${weight} ${px}px 'IBM Plex Mono', monospace`;
}

/** Full circle for `ctx.arc`. */
export const FULL_CIRCLE = Math.PI * 2;
