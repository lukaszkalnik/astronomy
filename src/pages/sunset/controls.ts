/** Event wiring: sliders, chips, play/pause, dragging the sphere and the Earth. */

import type { Elements } from "./elements";
import { eclLonFromOrbitPoint } from "./orbitGeometry";
import { DRAG_AZ_PER_PX, DRAG_EL_PER_PX, drawSky } from "./render/sky";
import { sceneOf } from "./scene";
import { CAM_EL_MAX_DEG, CAM_EL_MIN_DEG, type SunsetState } from "./state";
import type { Theme } from "./theme";

function showPlaying(play: HTMLButtonElement, playing: boolean): void {
  play.textContent = playing ? "Pause" : "Abspielen";
  play.setAttribute("aria-pressed", String(playing));
}

export function wireControls(el: Elements, st: SunsetState, c: Theme, render: () => void): void {
  el.lat.addEventListener("input", () => {
    st.latDeg = Number(el.lat.value);
    st.raceMin = 0;
    render();
  });
  for (const chip of el.latChips) {
    chip.button.addEventListener("click", () => {
      st.latDeg = chip.value;
      el.lat.value = String(st.latDeg);
      st.raceMin = 0;
      render();
    });
  }
  for (const chip of el.seasonChips) {
    chip.button.addEventListener("click", () => {
      st.eclLonDeg = chip.value;
      st.raceMin = 0;
      render();
    });
  }

  showPlaying(el.play, st.playing);
  el.play.addEventListener("click", () => {
    st.playing = !st.playing;
    showPlaying(el.play, st.playing);
  });
  el.again.addEventListener("click", () => {
    st.raceMin = 0;
  });

  // Rotate the celestial sphere
  let drag: { x: number; y: number; azDeg: number; elDeg: number } | null = null;
  el.sky.addEventListener("pointerdown", (e) => {
    drag = { x: e.clientX, y: e.clientY, azDeg: st.camAzDeg, elDeg: st.camElDeg };
    el.sky.setPointerCapture(e.pointerId);
  });
  el.sky.addEventListener("pointermove", (e) => {
    if (!drag) return;
    st.camAzDeg = drag.azDeg - (e.clientX - drag.x) * DRAG_AZ_PER_PX;
    st.camElDeg = Math.max(
      CAM_EL_MIN_DEG,
      Math.min(CAM_EL_MAX_DEG, drag.elDeg + (e.clientY - drag.y) * DRAG_EL_PER_PX),
    );
    drawSky(el.sky, st, sceneOf(st), c);
  });
  const endSkyDrag = (): void => {
    drag = null;
  };
  el.sky.addEventListener("pointerup", endSkyDrag);
  el.sky.addEventListener("pointercancel", endSkyDrag);

  // Drag the Earth along its orbit
  const orbit = el.orbit;
  const setFromPointer = (e: PointerEvent): void => {
    const r = orbit.getBoundingClientRect();
    st.eclLonDeg = eclLonFromOrbitPoint(
      e.clientX - r.left - r.width / 2,
      e.clientY - r.top - r.height / 2,
    );
    st.raceMin = 0;
    render();
  };
  let orbitDrag = false;
  orbit.addEventListener("pointerdown", (e) => {
    orbitDrag = true;
    orbit.classList.add("drag");
    orbit.setPointerCapture(e.pointerId);
    setFromPointer(e);
  });
  orbit.addEventListener("pointermove", (e) => {
    if (orbitDrag) setFromPointer(e);
  });
  const endOrbitDrag = (): void => {
    orbitDrag = false;
    orbit.classList.remove("drag");
  };
  orbit.addEventListener("pointerup", endOrbitDrag);
  orbit.addEventListener("pointercancel", endOrbitDrag);

  window.addEventListener("resize", render);
}
