/** Moon phase search and phase names. Moved as-is (task 0002). */

import { normDeg } from "./angles";
import { ephemeris } from "./ephemeris";
import { MS_PER_HOUR as H } from "./time";

/**
 * Time (ms) when the Moon's elongation (Moon − Sun longitude) next reaches
 * `targetDeg` (0 new, 90 first quarter, 180 full, 270 last quarter), searching
 * from `t0Ms` forwards (`dir` 1) or backwards (`dir` -1). Steps 6 h until the
 * sign change, then bisects 30 times. Returns `t0Ms` if nothing is found.
 */
export function findPhase(t0Ms: number, targetDeg: number, dir: 1 | -1): number {
  const f = (tMs: number): number => {
    const e = ephemeris(tMs);
    return normDeg(e.moonLonDeg - e.sunLonDeg - targetDeg + 180) - 180;
  };
  let a = t0Ms + dir * H;
  let fa = f(a);
  for (let i = 0; i < 200; i++) {
    const b = a + dir * 6 * H;
    const fb = f(b);
    const lo = dir > 0 ? fa : fb;
    const hi = dir > 0 ? fb : fa;
    if (lo < 0 && hi >= 0 && hi - lo < 90) {
      let x = Math.min(a, b);
      let y = Math.max(a, b);
      for (let j = 0; j < 30; j++) {
        const m = (x + y) / 2;
        if (f(m) < 0) x = m;
        else y = m;
      }
      return (x + y) / 2;
    }
    a = b;
    fa = fb;
  }
  return t0Ms;
}

/** German phase name (UI text; moves to the i18n catalogs in task 0014). */
export function phaseName(k: number, waxing: boolean): string {
  if (k < 0.03) return "Neumond";
  if (k > 0.97) return "Vollmond";
  if (k > 0.45 && k < 0.55) return waxing ? "Zunehmender Halbmond" : "Abnehmender Halbmond";
  return (waxing ? "Zunehmend" : "Abnehmend") + (k < 0.5 ? "e Sichel" : "er Mond");
}
