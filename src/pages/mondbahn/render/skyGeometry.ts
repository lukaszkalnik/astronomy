/** Shared geometry of the sky figure: azimuth → x, altitude → y, moon path samples. */

import type { SunMoonPosition } from "../../../lib/astro/position";

/** Moon path samples: every 5 min, ±149 steps (≈ ±12.4 h) around the shown time. */
export const MOON_STEP_MS = 300_000;
export const MOON_HALF_STEPS = 149;

export interface SkyFrame {
  W: number;
  H: number;
  narrow: boolean;
  top: number;
  bot: number;
  /** y of the horizon. */
  hy: number;
  x: (azDeg: number) => number;
  y: (altDeg: number) => number;
}

export function skyFrame(W: number, H: number): SkyFrame {
  const narrow = W < 520;
  const top = 14;
  const bot = narrow ? 34 : 40;
  const altMin = -18;
  const y = (alt: number): number => top + ((90 - alt) / (90 - altMin)) * (H - top - bot);
  return { W, H, narrow, top, bot, hy: y(0), x: (az) => (az / 360) * W, y };
}

/** SVG path through the sun or moon positions; breaks where the azimuth wraps past North. */
export function trace(f: SkyFrame, body: "sun" | "moon", arr: readonly SunMoonPosition[]): string {
  let p = "";
  let prev: number | null = null;
  for (const q of arr) {
    const o = q[body];
    const X = f.x(o.azDeg).toFixed(1);
    const Y = f.y(o.altDeg).toFixed(1);
    p += (prev === null || Math.abs(o.azDeg - prev) > 180 ? "M" : "L") + X + "," + Y;
    prev = o.azDeg;
  }
  return p;
}

/** Fade of the moon path towards both ends of the ±12 h window (i = sample index). */
export function moonFade(i: number): number {
  const f = Math.abs(i - MOON_HALF_STEPS) / MOON_HALF_STEPS;
  return 1 - 0.7 * f ** 3;
}

export function first<T>(arr: readonly T[]): T {
  const v = arr[0];
  if (v === undefined) throw new Error("empty array");
  return v;
}

export function at<T>(arr: readonly T[], i: number): T {
  const v = arr[i];
  if (v === undefined) throw new Error(`index ${i} out of range`);
  return v;
}

/** First element with the largest score. */
export function maxBy<T>(arr: readonly T[], score: (v: T) => number): T {
  let best = first(arr);
  for (const v of arr) if (score(v) > score(best)) best = v;
  return best;
}
