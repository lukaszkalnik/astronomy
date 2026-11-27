/** Event wiring: every handler updates the state, then calls `render()`. */

import { findPhase } from "../../lib/astro/phases";
import {
  localDayStartMs,
  MS_PER_DAY as D,
  MS_PER_HOUR as H,
  MS_PER_MINUTE,
} from "../../lib/astro/time";
import type { Elements } from "./elements";
import { PLACES } from "./places";
import { timeAt } from "./render/cycle";
import { dayAt } from "./render/year";
import { saveLocation, type MondbahnState } from "./state";
import type { Layouts } from "./update";

const PLAY_INTERVAL_MS = 160;
const PLAY_LABEL = "Tage abspielen";
const STOP_LABEL = "Anhalten";

/** The local date of `dateMs` with the local clock time of `clockMs`. */
function withClockOf(dateMs: number, clockMs: number): number {
  const o = new Date(clockMs);
  const n = new Date(dateMs);
  return new Date(
    n.getFullYear(),
    n.getMonth(),
    n.getDate(),
    o.getHours(),
    o.getMinutes(),
  ).getTime();
}

/** Round to the 5-minute grid of the time slider. */
const toSliderGrid = (tMs: number): number => Math.round(tMs / 300_000) * 300_000;

/** Fill the place menu: presets plus a disabled "custom latitude" entry. */
export function fillPlaces(select: HTMLSelectElement): void {
  const options = PLACES.map((p, i) => new Option(p.name, String(i)));
  const custom = new Option("Eigene Breite", "x");
  custom.disabled = true;
  select.replaceChildren(...options, custom);
}

export function wireControls(
  el: Elements,
  st: MondbahnState,
  layouts: Layouts,
  render: () => void,
  nowMs: () => number,
): void {
  const setLocation = (latDeg: number, lonDeg: number): void => {
    st.latDeg = latDeg;
    st.lonDeg = lonDeg;
    saveLocation(st);
    render();
  };

  el.place.addEventListener("change", () => {
    const p = PLACES[Number(el.place.value)];
    if (p) setLocation(p.latDeg, p.lonDeg);
  });
  // Latitude slider keeps the longitude of the current place (as before).
  el.lat.addEventListener("input", () => setLocation(Number(el.lat.value), st.lonDeg));

  el.date.addEventListener("change", () => {
    const v = el.date.value.split("-").map(Number);
    const [y, m, d] = v;
    if (v.length < 3 || !y || m === undefined || d === undefined) return;
    const o = new Date(st.tMs);
    st.tMs = new Date(y, m - 1, d, o.getHours(), o.getMinutes()).getTime();
    render();
  });
  el.time.addEventListener("input", () => {
    st.tMs = localDayStartMs(st.tMs) + Number(el.time.value) * MS_PER_MINUTE;
    render();
  });
  el.doy.addEventListener("input", () => {
    const o = new Date(st.tMs);
    st.tMs = new Date(
      o.getFullYear(),
      0,
      1 + Number(el.doy.value),
      o.getHours(),
      o.getMinutes(),
    ).getTime();
    render();
  });

  el.nextFull.addEventListener("click", () => {
    st.tMs = toSliderGrid(findPhase(st.tMs + 12 * H, 180, 1));
    render();
  });
  el.prevFull.addEventListener("click", () => {
    st.tMs = toSliderGrid(findPhase(st.tMs - 12 * H, 180, -1));
    render();
  });
  el.minus.addEventListener("click", () => {
    st.tMs = withClockOf(st.tMs - D, st.tMs);
    render();
  });
  el.plus.addEventListener("click", () => {
    st.tMs = withClockOf(st.tMs + D, st.tMs);
    render();
  });
  el.now.addEventListener("click", () => {
    st.tMs = nowMs();
    render();
  });
  el.play.addEventListener("click", () => {
    if (st.playTimer !== null) {
      clearInterval(st.playTimer);
      st.playTimer = null;
      el.play.textContent = PLAY_LABEL;
    } else {
      st.playTimer = window.setInterval(() => {
        st.tMs = withClockOf(st.tMs + D, st.tMs);
        render();
      }, PLAY_INTERVAL_MS);
      el.play.textContent = STOP_LABEL;
    }
  });

  el.year.addEventListener("click", (e) => {
    const layout = layouts.year;
    if (!layout) return;
    const d = dayAt(layout, e.clientX - el.year.getBoundingClientRect().left);
    if (d === null) return;
    const o = new Date(st.tMs);
    st.tMs = new Date(layout.year, 0, 1 + d, o.getHours(), o.getMinutes()).getTime();
    render();
  });
  el.cyc.addEventListener("click", (e) => {
    const layout = layouts.cycle;
    if (!layout) return;
    const tt = timeAt(layout, e.clientX - el.cyc.getBoundingClientRect().left);
    if (tt === null) return;
    st.tMs = withClockOf(tt, st.tMs);
    render();
  });
}
