/** Angle helpers. Pure functions, no DOM or global state. */

/** Normalise an angle in degrees to the range [0, 360). */
export function normDeg(deg: number): number {
  const r = deg % 360;
  // `+ 0` turns -0 into 0.
  return (r < 0 ? r + 360 : r) + 0;
}
