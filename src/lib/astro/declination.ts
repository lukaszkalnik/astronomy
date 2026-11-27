/** Solar declination from the Sun's ecliptic longitude. Pure, no DOM or global state. */

import { DEG_PER_RAD, RAD_PER_DEG } from "./angles";

/** Obliquity of the ecliptic ε in degrees (J2000; Meeus, *Astronomical Algorithms*, ch. 22). */
export const OBLIQUITY_DEG = 23.4392811;

/**
 * Declination δ of the Sun in degrees for ecliptic longitude λ (0° = March
 * equinox): sin δ = sin ε · sin λ (circular orbit, ecliptic latitude 0).
 */
export function solarDeclinationDeg(eclLonDeg: number): number {
  return (
    Math.asin(Math.sin(OBLIQUITY_DEG * RAD_PER_DEG) * Math.sin(eclLonDeg * RAD_PER_DEG)) *
    DEG_PER_RAD
  );
}
