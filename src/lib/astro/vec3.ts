/** Small 3-vector helpers. Pure functions, no DOM or global state. */

export type Vec3 = readonly [number, number, number];

export function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

export function cross(a: Vec3, b: Vec3): Vec3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

/** Unit vector in the direction of `a`; the zero vector stays zero. */
export function normalize(a: Vec3): Vec3 {
  const m = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / m, a[1] / m, a[2] / m];
}

export function scale(a: Vec3, f: number): Vec3 {
  return [a[0] * f, a[1] * f, a[2] * f];
}
