/** Values derived from the state that every figure needs. */

import { solarDeclinationDeg } from "../../lib/astro/declination";
import { sunsetGeometry, type SunsetGeometry } from "../../lib/astro/sunsetGeometry";
import type { SunsetState } from "./state";

/** Below this |δ| (degrees) the selected path counts as the equinox path and is not drawn twice. */
export const SAME_AS_EQUINOX_DEG = 0.6;

export interface Scene {
  latDeg: number;
  declDeg: number;
  /** Geometry of the equinox path (δ = 0) and of the selected path. */
  eq: SunsetGeometry;
  sel: SunsetGeometry;
  /** True when the selected path differs visibly from the equinox path. */
  showSel: boolean;
}

export function sceneOf(st: SunsetState): Scene {
  const declDeg = solarDeclinationDeg(st.eclLonDeg);
  return {
    latDeg: st.latDeg,
    declDeg,
    eq: sunsetGeometry(st.latDeg, 0),
    sel: sunsetGeometry(st.latDeg, declDeg),
    showSel: Math.abs(declDeg) > SAME_AS_EQUINOX_DEG,
  };
}

/** Longest sunset of the two paths in minutes (0 if neither sets). */
export function raceMaxMin(scene: Scene): number {
  return Math.max(
    scene.eq.state === "ok" ? scene.eq.durationMin : 0,
    scene.sel.state === "ok" ? scene.sel.durationMin : 0,
  );
}
