/** Typed access to the legacy moon path characterisation fixture (see scripts/legacy-moon-path-fixtures.mjs). */

import raw from "./moon-path-legacy.json";

interface BodyFixture {
  altDeg: number;
  azDeg: number;
  decDeg: number;
}

export interface MoonPathLegacyFixture {
  source: string;
  pos: {
    tMs: number;
    place: string;
    latDeg: number;
    lonDeg: number;
    sun: BodyFixture;
    moon: BodyFixture;
    k: number;
    waxing: boolean;
  }[];
  findPhase: { tMs: number; targetDeg: number; dir: 1 | -1; resultMs: number }[];
  yearData: {
    tMs: number;
    place: string;
    latDeg: number;
    lonDeg: number;
    year: number;
    yearStartMs: number;
    dayCount: number;
    days: { i: number; moonMaxAltDeg: number; k: number; sunNoonAltDeg: number }[];
    fullMoons: { dayOffset: number; maxAltDeg: number; tMs: number }[];
  }[];
  cycle: {
    count: number;
    samples: { i: number; tMs: number; hiDecDeg: number; loDecDeg: number }[];
  };
  phasePath: { latDeg: number; k: number; waxing: boolean; d: string }[];
}

export const legacy = raw as MoonPathLegacyFixture;

/** Fixture numbers are rounded to 1e-6; allow that plus float noise. */
export function expectClose(actual: number, expected: number, tol = 1.5e-6): void {
  if (!(Math.abs(actual - expected) <= tol)) {
    throw new Error(`expected ${actual} to be within ${tol} of ${expected}`);
  }
}
