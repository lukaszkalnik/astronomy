/**
 * Geometry of the Sun's daily path where it crosses the horizon. Purely
 * geometric: centre of the solar disc, spherical Earth, no refraction.
 * Pure functions, no DOM or global state.
 */

import { DEG_PER_RAD, RAD_PER_DEG } from "./angles";
import { normalize, type Vec3 } from "./vec3";

/** Apparent diameter of the solar disc in degrees (≈ 32′). */
export const SUN_DIAMETER_DEG = 0.5333;

/** Degrees of hour angle per hour (Earth's rotation relative to the Sun). */
const DEG_PER_HOUR = 15;

export type SunsetGeometry =
  | {
      state: "ok";
      /** Sunset azimuth measured from North towards West, 0…180°. */
      azFromNorthDeg: number;
      /** Sunset azimuth in the usual convention (from North, clockwise), 180…360°. */
      azSetDeg: number;
      /** Rate at which the altitude drops at the horizon, °/h. */
      rateDegPerHour: number;
      /** Angle γ between the daily path and the horizon, degrees. */
      gammaDeg: number;
      /** Time for the Sun to sink by one disc diameter, minutes. */
      durationMin: number;
      /** Hour angle of sunset H₀, degrees. */
      hourAngleSetDeg: number;
    }
  /** Polar night: the Sun stays below the horizon all day. */
  | { state: "night" }
  /** Midnight sun: the Sun stays above the horizon all day. */
  | { state: "midnight" };

/**
 * Sunset geometry for latitude φ and declination δ (both degrees).
 * cos H₀ = −tan φ · tan δ; cos A = sin δ / cos φ (A from North);
 * dh/dt = 15°/h · cos φ · sin A; sin γ = cos φ · sin A / cos δ.
 */
export function sunsetGeometry(latDeg: number, declDeg: number): SunsetGeometry {
  const cosLat = Math.cos(latDeg * RAD_PER_DEG);
  const cosDecl = Math.cos(declDeg * RAD_PER_DEG);
  const sinDecl = Math.sin(declDeg * RAD_PER_DEG);
  const cosH0 = -Math.tan(latDeg * RAD_PER_DEG) * Math.tan(declDeg * RAD_PER_DEG);
  if (cosH0 >= 1) return { state: "night" };
  if (cosH0 <= -1) return { state: "midnight" };
  const cosA = Math.max(-1, Math.min(1, sinDecl / cosLat));
  const azFromNorthDeg = Math.acos(cosA) * DEG_PER_RAD;
  const sinA = Math.sin(azFromNorthDeg * RAD_PER_DEG);
  const rateDegPerHour = DEG_PER_HOUR * cosLat * sinA;
  const gammaDeg = Math.asin(Math.min(1, (cosLat * sinA) / cosDecl)) * DEG_PER_RAD;
  return {
    state: "ok",
    azFromNorthDeg,
    azSetDeg: 360 - azFromNorthDeg,
    rateDegPerHour,
    gammaDeg,
    durationMin: (SUN_DIAMETER_DEG / rateDegPerHour) * 60,
    hourAngleSetDeg: Math.acos(cosH0) * DEG_PER_RAD,
  };
}

/** Unit vector to the Sun in horizon coordinates (East, North, Zenith). */
export function sunVector(latDeg: number, declDeg: number, hourAngleDeg: number): Vec3 {
  const cosLat = Math.cos(latDeg * RAD_PER_DEG);
  const sinLat = Math.sin(latDeg * RAD_PER_DEG);
  const cosDecl = Math.cos(declDeg * RAD_PER_DEG);
  const sinDecl = Math.sin(declDeg * RAD_PER_DEG);
  const cosH = Math.cos(hourAngleDeg * RAD_PER_DEG);
  const sinH = Math.sin(hourAngleDeg * RAD_PER_DEG);
  return [
    -cosDecl * sinH,
    cosLat * sinDecl - sinLat * cosDecl * cosH,
    sinLat * sinDecl + cosLat * cosDecl * cosH,
  ];
}

/**
 * Unit tangent of the daily path at hour angle H, pointing in the direction of
 * motion (derivative of `sunVector` with respect to H, normalised).
 */
export function sunPathTangent(latDeg: number, declDeg: number, hourAngleDeg: number): Vec3 {
  const cosDecl = Math.cos(declDeg * RAD_PER_DEG);
  const cosLat = Math.cos(latDeg * RAD_PER_DEG);
  const sinLat = Math.sin(latDeg * RAD_PER_DEG);
  const cosH = Math.cos(hourAngleDeg * RAD_PER_DEG);
  const sinH = Math.sin(hourAngleDeg * RAD_PER_DEG);
  return normalize([-cosDecl * cosH, sinLat * cosDecl * sinH, -cosLat * cosDecl * sinH]);
}
