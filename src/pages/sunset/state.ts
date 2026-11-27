/** Typed state of the sunset page. Rendering reads it; event handlers change it. */

export interface SunsetState {
  /** Observer latitude φ in degrees (slider range 0…72). */
  latDeg: number;
  /** Earth's orbital position as the Sun's ecliptic longitude λ in degrees (0 = March equinox). */
  eclLonDeg: number;
  /** Camera of the celestial-sphere view: azimuth and elevation in degrees. */
  camAzDeg: number;
  camElDeg: number;
  /** Hour angle of the two animated suns on the sphere, degrees. */
  hourAngleDeg: number;
  /** Whether the animation runs (off by default with prefers-reduced-motion). */
  playing: boolean;
  /** Elapsed minutes of the sunset race in the horizon view. */
  raceMin: number;
}

/** Camera elevation limits for dragging the sphere, degrees. */
export const CAM_EL_MIN_DEG = 4;
export const CAM_EL_MAX_DEG = 78;

export function createState(reducedMotion: boolean): SunsetState {
  return {
    latDeg: 51,
    eclLonDeg: 90,
    camAzDeg: 208,
    camElDeg: 20,
    hourAngleDeg: 40,
    playing: !reducedMotion,
    raceMin: 0,
  };
}
