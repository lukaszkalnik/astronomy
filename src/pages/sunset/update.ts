/** Readouts and the figures that change only with the state (not every animation frame). */

import { formatDecimal } from "../../lib/format";
import type { Elements } from "./elements";
import { drawOrbit } from "./render/orbit";
import { drawSky } from "./render/sky";
import { sceneOf, SAME_AS_EQUINOX_DEG } from "./scene";
import type { SunsetState } from "./state";
import type { Theme } from "./theme";

const NO_VALUE = "—";

/** Value plus a small unit: `12,34 <small>min</small>` built from nodes, no HTML strings. */
function setValue(el: HTMLElement, value: string, unit: string, space = true): void {
  const small = document.createElement("small");
  small.textContent = unit;
  el.replaceChildren(space ? `${value} ` : value, small);
}

/** Whether two ecliptic longitudes are within 0.6° of each other (wrapping at 360°). */
function sameEclLon(aDeg: number, bDeg: number): boolean {
  return Math.abs(((((aDeg - bDeg) % 360) + 540) % 360) - 180) > 179.4;
}

export function update(el: Elements, st: SunsetState, c: Theme): void {
  const scene = sceneOf(st);
  const { eq, sel, declDeg: d } = scene;

  el.latVal.textContent = `${formatDecimal(st.latDeg, 1)}° N`;
  el.dLabel.textContent = `δ = ${formatDecimal(d, 1)}°`;
  if (eq.state === "ok") setValue(el.durEq, formatDecimal(eq.durationMin, 2), "min");
  else el.durEq.textContent = NO_VALUE;

  el.warn.classList.toggle("on", sel.state !== "ok");
  if (sel.state === "midnight") {
    el.warn.textContent =
      "Mitternachtssonne: Bei dieser Breite und Deklination bleibt die Sonne über dem Horizont — es gibt keinen Untergang.";
  } else if (sel.state === "night") {
    el.warn.textContent =
      "Polarnacht: Die Sonne kommt bei dieser Breite und Deklination nicht über den Horizont.";
  } else {
    el.warn.textContent = "";
  }

  if (sel.state === "ok") {
    setValue(el.durSel, formatDecimal(sel.durationMin, 2), "min");
    setValue(el.gam, formatDecimal(sel.gammaDeg, 1), "°", false);
    setValue(el.rate, formatDecimal(sel.rateDegPerHour, 2), "°/h");
    setValue(el.az, formatDecimal(sel.azSetDeg, 1), "° (ab N)", false);
    el.factor.textContent =
      eq.state === "ok" ? `× ${formatDecimal(sel.durationMin / eq.durationMin, 2)}` : NO_VALUE;
    el.factorCap.textContent =
      Math.abs(d) < SAME_AS_EQUINOX_DEG
        ? "identisch — die Bahn steht hier am steilsten"
        : "länger als zur Tagundnachtgleiche";
  } else {
    for (const v of [el.durSel, el.gam, el.rate, el.az]) v.textContent = NO_VALUE;
    el.factor.textContent = "∞";
    el.factorCap.textContent = "kein Untergang bei dieser Konstellation";
  }

  for (const chip of el.seasonChips) {
    chip.button.setAttribute("aria-pressed", String(sameEclLon(st.eclLonDeg, chip.value)));
  }

  drawOrbit(el.orbit, st, scene, c);
  drawSky(el.sky, st, scene, c);
}
