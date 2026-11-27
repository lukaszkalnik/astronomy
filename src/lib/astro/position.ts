/** Topocentric Sun and Moon positions plus Moon phase. Moved as-is (task 0002). */

import { normDeg, RAD_PER_DEG as R } from "./angles";
import { eclipticToEquatorial, equatorialToHorizontal, type Horizontal } from "./coords";
import { ephemeris } from "./ephemeris";

export interface BodyPosition extends Horizontal {
  decDeg: number;
}

export interface SunMoonPosition {
  sun: BodyPosition;
  /** Altitude corrected for topocentric parallax; no refraction. */
  moon: BodyPosition;
  /** Illuminated fraction of the Moon's disc, 0…1. */
  k: number;
  /** True while the Moon's elongation is below 180° (first half of the lunation). */
  waxing: boolean;
}

export function sunMoonPosition(tMs: number, latDeg: number, lonDeg: number): SunMoonPosition {
  const e = ephemeris(tMs);
  const s = eclipticToEquatorial(e.sunLonDeg, 0, e.obliquityRad);
  const m = eclipticToEquatorial(e.moonLonDeg, e.moonLatDeg, e.obliquityRad);
  const sun = equatorialToHorizontal(s.raDeg, s.decDeg, tMs, latDeg, lonDeg);
  const moon = equatorialToHorizontal(m.raDeg, m.decDeg, tMs, latDeg, lonDeg);
  // Parallax in altitude: asin(1/r)·cos(alt), r in Earth radii.
  moon.altDeg -= (Math.asin(1 / e.moonDistEarthRadii) / R) * Math.cos(moon.altDeg * R);
  const elongationDeg = normDeg(e.moonLonDeg - e.sunLonDeg);
  return {
    sun: { ...sun, decDeg: s.decDeg },
    moon: { ...moon, decDeg: m.decDeg },
    k: (1 - Math.cos(e.moonLatDeg * R) * Math.cos(elongationDeg * R)) / 2,
    waxing: elongationDeg < 180,
  };
}
