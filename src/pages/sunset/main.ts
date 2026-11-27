/** Entry point of the sunset page ("Sonnenuntergang", sunset.html). */

import "./style.css";
import { startAnimation } from "./animation";
import { wireControls } from "./controls";
import { getElements } from "./elements";
import { createState } from "./state";
import { readTheme } from "./theme";
import { update } from "./update";

const el = getElements();
const theme = readTheme();
const st = createState(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
const render = (): void => update(el, st, theme);

wireControls(el, st, theme, render);
// Canvas text uses IBM Plex Mono: redraw once the web fonts are ready.
void document.fonts.ready.then(render);

render();
startAnimation(el, st, theme);
