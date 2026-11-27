/** Typed references to the page's elements (throws early if the markup changed). */

import { byId } from "../../i18n/dom";

export function getElements() {
  return {
    skyFig: byId("skyFig", HTMLDivElement),
    sky: byId("sky", SVGSVGElement),
    yearFig: byId("yearFig", HTMLDivElement),
    year: byId("year", SVGSVGElement),
    cycFig: byId("cycFig", HTMLDivElement),
    cyc: byId("cyc", SVGSVGElement),
    phase: byId("phase", SVGSVGElement),
    when: byId("when", HTMLDivElement),
    date: byId("date", HTMLInputElement),
    place: byId("place", HTMLSelectElement),
    time: byId("time", HTMLInputElement),
    timeLbl: byId("timeLbl", HTMLSpanElement),
    doy: byId("doy", HTMLInputElement),
    lat: byId("lat", HTMLInputElement),
    latLbl: byId("latLbl", HTMLSpanElement),
    prevFull: byId("prevFull", HTMLButtonElement),
    nextFull: byId("nextFull", HTMLButtonElement),
    minus: byId("minus", HTMLButtonElement),
    plus: byId("plus", HTMLButtonElement),
    play: byId("play", HTMLButtonElement),
    now: byId("now", HTMLButtonElement),
    moonMax: byId("moonMax", HTMLDivElement),
    moonMaxT: byId("moonMaxT", HTMLDivElement),
    moonNow: byId("moonNow", HTMLElement),
    phaseTxt: byId("phaseTxt", HTMLElement),
    sunMax: byId("sunMax", HTMLElement),
    sunNow: byId("sunNow", HTMLElement),
    nf: byId("nf", HTMLElement),
  };
}

export type Elements = ReturnType<typeof getElements>;
