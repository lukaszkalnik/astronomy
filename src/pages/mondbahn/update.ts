/** Renders the whole page from state: controls, readouts and the three figures. */

import { findPhase, phaseName } from "../../lib/astro/phases";
import { sunMoonPosition } from "../../lib/astro/position";
import { localDayStartMs, MS_PER_DAY as D } from "../../lib/astro/time";
import {
  formatDate,
  formatDeg,
  formatLatitude,
  formatLongDate,
  formatTime,
} from "../../lib/format";
import type { Elements } from "./elements";
import { PLACES } from "./places";
import { drawCycle, type CycleLayout } from "./render/cycle";
import { moonIcon } from "./render/phaseIcon";
import { drawSky } from "./render/sky";
import { maxBy, MOON_STEP_MS } from "./render/skyGeometry";
import { drawYear, type YearLayout } from "./render/year";
import type { MondbahnState } from "./state";

/** Layouts of the clickable charts from the last render that had a size. */
export interface Layouts {
  year: YearLayout | null;
  cycle: CycleLayout | null;
}

const pad = (n: number): string => String(n).padStart(2, "0");

export function update(el: Elements, st: MondbahnState, layouts: Layouts): void {
  const o = new Date(st.tMs);
  const now = sunMoonPosition(st.tMs, st.latDeg, st.lonDeg);
  el.date.value = `${o.getFullYear()}-${pad(o.getMonth() + 1)}-${pad(o.getDate())}`;
  el.time.value = String(o.getHours() * 60 + o.getMinutes());
  el.timeLbl.textContent = formatTime(st.tMs);
  el.doy.value = String(
    Math.round((localDayStartMs(st.tMs) - new Date(o.getFullYear(), 0, 1).getTime()) / D),
  );
  el.lat.value = String(st.latDeg);
  el.latLbl.textContent = formatLatitude(st.latDeg);
  const placeIndex = PLACES.findIndex((p) => p.latDeg === st.latDeg && p.lonDeg === st.lonDeg);
  el.place.value = placeIndex < 0 ? "x" : String(placeIndex);
  el.when.textContent = `${formatLongDate(st.tMs)}, ${formatTime(st.tMs)} Uhr`;

  const sky = drawSky(el.sky, st);
  if (sky) {
    const m = sky.dayMoonMax.moon;
    el.moonMax.textContent = formatDeg(m.altDeg);
    el.moonMaxT.textContent =
      m.altDeg > 0
        ? `um ${formatTime(localDayStartMs(st.tMs) + sky.dayPts.indexOf(sky.dayMoonMax) * MOON_STEP_MS)} Uhr`
        : "Der Mond geht an diesem Tag nicht auf";
    el.sunMax.textContent = formatDeg(maxBy(sky.dayPts, (q) => q.sun.altDeg).sun.altDeg);
  }
  el.moonNow.textContent =
    now.moon.altDeg > 0 ? `${formatDeg(now.moon.altDeg)} hoch` : "unter dem Horizont";
  el.sunNow.textContent =
    now.sun.altDeg > 0 ? `${formatDeg(now.sun.altDeg)} hoch` : "unter dem Horizont";
  el.phaseTxt.textContent = `${phaseName(now.k, now.waxing)}, ${Math.round(now.k * 100)} %`;
  el.phase.replaceChildren(moonIcon(38, 38, 32, now.k, now.waxing, st.latDeg));
  el.nf.textContent = formatDate(findPhase(st.tMs, 180, 1));
  layouts.year = drawYear(el.year, st) ?? layouts.year;
  layouts.cycle = drawCycle(el.cyc, st) ?? layouts.cycle;
}
