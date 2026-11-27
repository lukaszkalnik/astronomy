# 0003 – Migrate Sonnenuntergang page into Vite structure

- **Status:** todo
- **Phase:** 0
- **Depends on:** 0001
- **Estimate:** M

## Goal
Same as 0002 for `sonnenuntergang.html` (~460 lines of JS, Canvas 2D,
animation loop, pointer dragging) – no visible or behavioural change.

## Context
`sonnenuntergang.html:310–772`: constants (`EPS`, `SUNDIA`), colour table `C`,
state `S`, math (`decl`, `geom`, `sunVec`, vector helpers), canvas helpers
(`fit`, `mono`, `camera`), renderers `drawSky` (incl. inset), `drawHorizon`,
`drawOrbit`, `refresh()`, `loop()` with `requestAnimationFrame`, `raceMax()`,
pointer handling for the orbit and sky.

## Requirements
1. Page shell `sonnenuntergang.html` + `src/pages/sonnenuntergang/main.ts` + `style.css`.
2. Split into `state.ts`, `render/sky.ts`, `render/horizon.ts`,
   `render/orbit.ts`, `animation.ts` (loop, play/pause, reduced-motion),
   `controls.ts`.
3. Pure math (`decl`, `geom`, `sunVec`, vector helpers) moves to
   `src/lib/astro/` (`declination.ts`, `sunsetGeometry.ts`, `vec3.ts`) with
   characterisation tests first.
4. `geom()` gets a discriminated-union return type
   (`{state:"ok", …} | {state:"night"} | {state:"midnight"}`).
5. Colours: CSS custom properties stay the source of truth; the JS colour table
   `C` reads them via `getComputedStyle` or a single typed `theme.ts` – no
   duplicated hex values.
6. Canvas helpers (`fit` with DPR cap, font helper) go to `src/lib/canvas.ts`.
7. Animation stops when the tab is hidden and respects `prefers-reduced-motion`
   exactly as today.

8. All identifiers and comments in the migrated code are English (translate
   German comments such as `/* Zustand */`, `// Schiefe der Ekliptik`); UI
   text stays as is until 0014.

## Out of scope
Visual changes, unifying the design with the Mondbahn page (0008).

## Acceptance criteria
- [ ] Screenshot comparison old vs. new at 1280 px and 360 px for several
      latitudes (0°, 51°, 66°, 70°) and seasons
- [ ] Orbit dragging, sky dragging, chips, latitude slider, play/pause and
      "again" work as before, with mouse and touch
- [ ] Polar day / polar night states render as before
- [ ] `npm run check` and `npm run build` green

## Open questions
- None.
