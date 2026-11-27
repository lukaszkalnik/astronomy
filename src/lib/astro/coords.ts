/** Coordinate transforms: ecliptic → equatorial → horizontal. Moved as-is (task 0002). */

import { normDeg, RAD_PER_DEG as R } from "./angles";
import { julianDate } from "./time";

export interface Equatorial {
  raDeg: number;
  decDeg: number;
}

export interface Horizontal {
  altDeg: number;
  /** Degrees from North, clockwise. */
  azDeg: number;
}

export function eclipticToEquatorial(
  lonDeg: number,
  latDeg: number,
  obliquityRad: number,
): Equatorial {
  const l = lonDeg * R;
  const b = latDeg * R;
  const x = Math.cos(b) * Math.cos(l);
  const y =
    Math.cos(b) * Math.sin(l) * Math.cos(obliquityRad) - Math.sin(b) * Math.sin(obliquityRad);
  const z =
    Math.cos(b) * Math.sin(l) * Math.sin(obliquityRad) + Math.sin(b) * Math.cos(obliquityRad);
  return { raDeg: normDeg(Math.atan2(y, x) / R), decDeg: Math.asin(z) / R };
}

/**
 * Equatorial → horizontal for an observer at (latDeg, lonDeg, east positive).
 * Local sidereal time from the GMST formula (Meeus, Astronomical Algorithms, eq. 12.4).
 */
export function equatorialToHorizontal(
  raDeg: number,
  decDeg: number,
  tMs: number,
  latDeg: number,
  lonDeg: number,
): Horizontal {
  const lstDeg = normDeg(280.46061837 + 360.98564736629 * (julianDate(tMs) - 2451545) + lonDeg);
  const h = (lstDeg - raDeg) * R;
  const d = decDeg * R;
  const p = latDeg * R;
  const altDeg = Math.asin(Math.sin(p) * Math.sin(d) + Math.cos(p) * Math.cos(d) * Math.cos(h)) / R;
  const azDeg = normDeg(
    Math.atan2(
      -Math.cos(d) * Math.sin(h),
      Math.sin(d) * Math.cos(p) - Math.cos(d) * Math.cos(h) * Math.sin(p),
    ) / R,
  );
  return { altDeg, azDeg };
}
