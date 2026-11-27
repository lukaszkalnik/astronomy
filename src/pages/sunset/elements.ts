/** Typed references to the page's elements (throws early if the markup changed). */

import { byId } from "../../i18n/dom";

/** A button carrying a numeric `data-*` value (season or latitude chip). */
export interface ValueChip {
  button: HTMLButtonElement;
  value: number;
}

function chips(selector: string, attr: "lam" | "lat"): ValueChip[] {
  return [...document.querySelectorAll(selector)].map((button) => {
    const value = Number(button instanceof HTMLButtonElement ? button.dataset[attr] : NaN);
    if (!(button instanceof HTMLButtonElement) || !Number.isFinite(value)) {
      throw new Error(`Chip ${selector} has no numeric data-${attr}`);
    }
    return { button, value };
  });
}

export function getElements() {
  return {
    sky: byId("sky", HTMLCanvasElement),
    orbit: byId("orbit", HTMLCanvasElement),
    horizon: byId("horizon", HTMLCanvasElement),
    seasonChips: chips("#seasonChips .chip[data-lam]", "lam"),
    latChips: chips(".chip[data-lat]", "lat"),
    lat: byId("lat", HTMLInputElement),
    latVal: byId("latVal", HTMLSpanElement),
    dLabel: byId("dLabel", HTMLSpanElement),
    durEq: byId("durEq", HTMLSpanElement),
    durSel: byId("durSel", HTMLSpanElement),
    gam: byId("gam", HTMLSpanElement),
    rate: byId("rate", HTMLSpanElement),
    az: byId("az", HTMLSpanElement),
    factor: byId("factor", HTMLDivElement),
    factorCap: byId("factorCap", HTMLDivElement),
    warn: byId("warn", HTMLParagraphElement),
    clock: byId("clock", HTMLSpanElement),
    play: byId("play", HTMLButtonElement),
    again: byId("again", HTMLButtonElement),
  };
}

export type Elements = ReturnType<typeof getElements>;
