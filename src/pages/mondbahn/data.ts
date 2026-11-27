/** Data series for the year and 18.6-year figures (pure, cached). */

import { eclipticToEquatorial } from "../../lib/astro/coords";
import { ephemeris } from "../../lib/astro/ephemeris";
import { findPhase } from "../../lib/astro/phases";
import { sunMoonPosition } from "../../lib/astro/position";
import { MS_PER_DAY as D, MS_PER_HOUR as H } from "../../lib/astro/time";

export interface DayMax {
  /** Highest Moon altitude of the day (sampled every 30 min), degrees. */
  moonMaxAltDeg: number;
  /** Illuminated fraction at that moment. */
  k: number;
  /** Sun altitude at local noon (90° − |lat − dec|), degrees. */
  sunNoonAltDeg: number;
}

export interface FullMoon {
  /** Days since 1 January 00:00 local time (fractional). */
  dayOffset: number;
  /** Highest Moon altitude within ±12 h of full moon, degrees. */
  maxAltDeg: number;
  tMs: number;
}

export interface YearData {
  key: string;
  year: number;
  /** 1 January 00:00 local time. */
  yearStartMs: number;
  days: DayMax[];
  fullMoons: FullMoon[];
}

let yearCache: YearData | null = null;

/** Daily maxima and full moons of the local calendar year containing `tMs`; cached by year + location. */
export function yearData(tMs: number, latDeg: number, lonDeg: number): YearData {
  const year = new Date(tMs).getFullYear();
  const key = `${year}|${latDeg}|${lonDeg}`;
  if (yearCache?.key === key) return yearCache;
  const yearStartMs = new Date(year, 0, 1).getTime();
  const days: DayMax[] = [];
  for (let d = 0; ; d++) {
    const t0 = new Date(year, 0, 1 + d).getTime();
    if (new Date(t0).getFullYear() !== year) break;
    let best = -99;
    let bestK = 0;
    for (let j = 0; j < 48; j++) {
      const p = sunMoonPosition(t0 + j * 1_800_000, latDeg, lonDeg);
      if (p.moon.altDeg > best) {
        best = p.moon.altDeg;
        bestK = p.k;
      }
    }
    const sunDecDeg = sunMoonPosition(t0 + 12 * H, latDeg, lonDeg).sun.decDeg;
    days.push({ moonMaxAltDeg: best, k: bestK, sunNoonAltDeg: 90 - Math.abs(latDeg - sunDecDeg) });
  }
  const fullMoons: FullMoon[] = [];
  let t = yearStartMs - D;
  for (let i = 0; i < 15; i++) {
    const f = findPhase(t, 180, 1);
    if (new Date(f).getFullYear() > year) break;
    if (f >= yearStartMs) {
      let best = -99;
      for (let j = -24; j <= 24; j++)
        best = Math.max(best, sunMoonPosition(f + j * 1_800_000, latDeg, lonDeg).moon.altDeg);
      fullMoons.push({ dayOffset: (f - yearStartMs) / D, maxAltDeg: best, tMs: f });
    }
    t = f + D;
  }
  yearCache = { key, year, yearStartMs, days, fullMoons };
  return yearCache;
}

/** Range of the 18.6-year figure: 2015-01-01 to 2041-01-01 (UTC). */
export const CYCLE_START_MS = Date.UTC(2015, 0, 1);
export const CYCLE_END_MS = Date.UTC(2041, 0, 1);

export interface CycleWindow {
  /** Middle of the 27-day window. */
  tMs: number;
  hiDecDeg: number;
  loDecDeg: number;
}

let cycleCache: CycleWindow[] | null = null;

/** Highest and lowest Moon declination per 27-day window (one value per day at 00:00 UTC). */
export function cycleData(): CycleWindow[] {
  if (cycleCache) return cycleCache;
  const decs: number[] = [];
  for (let t = CYCLE_START_MS; t < CYCLE_END_MS; t += D) {
    const e = ephemeris(t);
    decs.push(eclipticToEquatorial(e.moonLonDeg, e.moonLatDeg, e.obliquityRad).decDeg);
  }
  const out: CycleWindow[] = [];
  for (let i = 0; i + 27 <= decs.length; i += 27) {
    const w = decs.slice(i, i + 27);
    out.push({
      tMs: CYCLE_START_MS + (i + 13.5) * D,
      hiDecDeg: Math.max(...w),
      loDecDeg: Math.min(...w),
    });
  }
  cycleCache = out;
  return out;
}
