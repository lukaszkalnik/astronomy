/** Mapping between the Earth's position λ and the orbit figure. Pure functions. */

import { DEG_PER_RAD, RAD_PER_DEG, normDeg } from "../../lib/astro/angles";

/** The orbit circle is drawn as an ellipse: vertical radius = this × horizontal radius. */
export const ORBIT_FLATTEN = 0.42;

/** Angle on the drawn ellipse (radians, canvas convention, y down) for ecliptic longitude λ. */
export function orbitAngleRad(eclLonDeg: number): number {
  return (eclLonDeg + 90) * RAD_PER_DEG;
}

/** Ecliptic longitude λ (0…360°) for a point relative to the orbit centre, in CSS pixels. */
export function eclLonFromOrbitPoint(dx: number, dy: number): number {
  const psiDeg = Math.atan2(dy / ORBIT_FLATTEN, dx) * DEG_PER_RAD;
  return normDeg(psiDeg - 90);
}

/** Day of the year (0 = 1 January) of the March equinox used for the date label. */
const EQUINOX_DAY_OF_YEAR = 79;

/**
 * Approximate calendar date for λ in a common year (2025, local time): the
 * equinox plus λ/360 of a year. Only day and month are meant to be shown.
 */
export function approxDateForEclLon(eclLonDeg: number): Date {
  const doy = Math.round(EQUINOX_DAY_OF_YEAR + (eclLonDeg / 360) * 365.25) % 365;
  const date = new Date(2025, 0, 1);
  date.setDate(date.getDate() + doy);
  return date;
}
