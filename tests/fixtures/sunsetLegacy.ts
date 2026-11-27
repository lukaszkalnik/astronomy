/** Typed access to the legacy sunset characterisation fixture (see scripts/legacy-sunset-fixtures.mjs). */

import raw from "./sunset-legacy.json";

type V3 = [number, number, number];

export interface SunsetLegacyFixture {
  source: string;
  declination: { eclLonDeg: number; declDeg: number }[];
  geometry: (
    | {
        latDeg: number;
        declDeg: number;
        state: "ok";
        A: number;
        azSet: number;
        rate: number;
        gamma: number;
        dur: number;
        H0: number;
      }
    | { latDeg: number; declDeg: number; state: "night" | "midnight" }
  )[];
  sunVector: { latDeg: number; declDeg: number; hourAngleDeg: number; v: V3 }[];
  vectors: { a: V3; b: V3; dot: number; cross: V3; norm: V3 }[];
  orbitDate: { eclLonDeg: number; label: string }[];
}

export const sunsetLegacy = raw as SunsetLegacyFixture;
