/** Entry point of the Mondbahn page (index.html). */

import "./style.css";
import { getElements } from "./elements";
import { fillPlaces, wireControls } from "./controls";
import { createState } from "./state";
import { update, type Layouts } from "./update";

const el = getElements();
const st = createState(Date.now());
const layouts: Layouts = { year: null, cycle: null };
const render = (): void => update(el, st, layouts);

fillPlaces(el.place);
wireControls(el, st, layouts, render, () => Date.now());
const ro = new ResizeObserver(() => render());
ro.observe(el.skyFig);
ro.observe(el.yearFig);
ro.observe(el.cycFig);
render();
