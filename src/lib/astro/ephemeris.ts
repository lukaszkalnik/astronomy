/**
 * Low-precision Sun and Moon ephemeris (~0.5° accuracy), moved as-is from the
 * legacy moon path page (task 0002). API cleanup and reference tests: task 0004.
 *
 * Source: Paul Schlyter, "How to compute planetary positions"
 * (https://stjarnhimlen.se/comp/ppcomp.html): mean orbital elements, Kepler's
 * equation and the main lunar perturbation terms. Day number `d` counts from
 * 1999-12-31T00:00 TT (JD 2451543.5).
 */

import { normDeg, RAD_PER_DEG as R } from "./angles";
import { julianDate } from "./time";

export interface Ephemeris {
  /** Geocentric ecliptic longitude of the Sun, degrees. */
  sunLonDeg: number;
  /** Geocentric ecliptic longitude of the Moon, degrees [0, 360). */
  moonLonDeg: number;
  /** Geocentric ecliptic latitude of the Moon, degrees. */
  moonLatDeg: number;
  /** Earth–Moon distance in Earth radii. */
  moonDistEarthRadii: number;
  /** Obliquity of the ecliptic, radians. */
  obliquityRad: number;
}

export function ephemeris(tMs: number): Ephemeris {
  const d = julianDate(tMs) - 2451543.5;
  const s = Math.sin;
  const c = Math.cos;

  // Sun: argument of perihelion, eccentricity, mean anomaly.
  const ws = 282.9404 + 4.70935e-5 * d;
  const es = 0.016709 - 1.151e-9 * d;
  const Ms = normDeg(356.047 + 0.9856002585 * d);
  const Es = Ms + (es / R) * s(Ms * R) * (1 + es * c(Ms * R));
  const sunLonDeg = normDeg(
    Math.atan2(Math.sqrt(1 - es * es) * s(Es * R), c(Es * R) - es) / R + ws,
  );

  // Moon: ascending node, inclination, argument of perigee, semi-major axis
  // (Earth radii), eccentricity, mean anomaly.
  const N = 125.1228 - 0.0529538083 * d;
  const inc = 5.1454 * R;
  const wm = 318.0634 + 0.1643573223 * d;
  const a = 60.2666;
  const e = 0.0549;
  const Mm = normDeg(115.3654 + 13.0649929509 * d);
  let E = Mm + (e / R) * s(Mm * R) * (1 + e * c(Mm * R));
  for (let k = 0; k < 3; k++) E = E - (E - (e / R) * s(E * R) - Mm) / (1 - e * c(E * R));
  const xv = a * (c(E * R) - e);
  const yv = a * Math.sqrt(1 - e * e) * s(E * R);
  const v = Math.atan2(yv, xv) / R;
  let r = Math.hypot(xv, yv);
  const u = (v + wm) * R;
  const n = N * R;
  const xh = r * (c(n) * c(u) - s(n) * s(u) * c(inc));
  const yh = r * (s(n) * c(u) + c(n) * s(u) * c(inc));
  const zh = r * s(u) * s(inc);
  let lm = Math.atan2(yh, xh) / R;
  let bm = Math.atan2(zh, Math.hypot(xh, yh)) / R;

  // Perturbations: mean longitudes, elongation Dd, argument of latitude F.
  const Ls = Ms + ws;
  const Lm = Mm + wm + N;
  const Dd = (Lm - Ls) * R;
  const F = (Lm - N) * R;
  const M = Mm * R;
  const S = Ms * R;
  lm +=
    -1.274 * s(M - 2 * Dd) +
    0.658 * s(2 * Dd) -
    0.186 * s(S) -
    0.059 * s(2 * M - 2 * Dd) -
    0.057 * s(M - 2 * Dd + S) +
    0.053 * s(M + 2 * Dd) +
    0.046 * s(2 * Dd - S) +
    0.041 * s(M - S) -
    0.035 * s(Dd) -
    0.031 * s(M + S) -
    0.015 * s(2 * F - 2 * Dd) +
    0.011 * s(M - 4 * Dd);
  bm +=
    -0.173 * s(F - 2 * Dd) -
    0.055 * s(M - F - 2 * Dd) -
    0.046 * s(M + F - 2 * Dd) +
    0.033 * s(F + 2 * Dd) +
    0.017 * s(2 * M + F);
  r += -0.58 * c(M - 2 * Dd) - 0.46 * c(2 * Dd);

  return {
    sunLonDeg,
    moonLonDeg: normDeg(lm),
    moonLatDeg: bm,
    moonDistEarthRadii: r,
    obliquityRad: (23.4393 - 3.563e-7 * d) * R,
  };
}
