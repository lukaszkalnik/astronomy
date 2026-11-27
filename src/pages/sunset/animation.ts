/**
 * Animation loop: moves the suns on the sphere and runs the sunset race.
 * Uses requestAnimationFrame, so it pauses by itself while the tab is hidden;
 * a long gap counts as at most one 50 ms step.
 */

import { formatDecimal } from "../../lib/format";
import type { Elements } from "./elements";
import { drawHorizon } from "./render/horizon";
import { drawSky } from "./render/sky";
import { raceMaxMin, sceneOf } from "./scene";
import type { SunsetState } from "./state";
import type { Theme } from "./theme";

/** Longest frame step in seconds (after a hidden tab or a stall). */
const MAX_STEP_S = 0.05;
/** Hour angle of the suns on the sphere, degrees per second of animation. */
const HOUR_ANGLE_DEG_PER_S = 22;
/** Race time in minutes per second of animation. */
const RACE_MIN_PER_S = 0.9;
/** Pause after the last sun has set before the race restarts, minutes. */
const RACE_RESTART_AFTER_MIN = 1.4;

export function startAnimation(el: Elements, st: SunsetState, c: Theme): void {
  let last = performance.now();
  const frame = (now: number): void => {
    const dt = Math.min((now - last) / 1000, MAX_STEP_S);
    last = now;
    const scene = sceneOf(st);
    if (st.playing) {
      st.hourAngleDeg = (st.hourAngleDeg + dt * HOUR_ANGLE_DEG_PER_S) % 360;
      st.raceMin += dt * RACE_MIN_PER_S;
      if (st.raceMin > raceMaxMin(scene) + RACE_RESTART_AFTER_MIN) st.raceMin = 0;
      drawSky(el.sky, st, scene, c);
    }
    const maxMin = drawHorizon(el.horizon, st.raceMin, scene, c);
    el.clock.textContent = `${formatDecimal(Math.min(st.raceMin, maxMin), 2)} min`;
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
