/** Angle helpers. Pure functions, no DOM or global state. */

/** Radians per degree. */
export const RAD_PER_DEG = Math.PI / 180;

/** Degrees per radian. */
export const DEG_PER_RAD = 180 / Math.PI;

/** Normalise an angle in degrees to the range [0, 360). */
export function normDeg(deg: number): number {
  const r = deg % 360;
  // `+ 0` turns -0 into 0.
  return (r < 0 ? r + 360 : r) + 0;
}
