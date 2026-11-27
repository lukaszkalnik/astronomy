# 0003 – Migrate Sonnenuntergang page into Vite structure

- **Status:** done
- **Phase:** 0
- **Depends on:** 0001
- **Estimate:** M

## Goal
Same as 0002 for `sunset.html` (~460 lines of JS, Canvas 2D,
animation loop, pointer dragging) – no visible or behavioural change.

## Context
`sunset.html:310–772`: constants (`EPS`, `SUNDIA`), colour table `C`,
state `S`, math (`decl`, `geom`, `sunVec`, vector helpers), canvas helpers
(`fit`, `mono`, `camera`), renderers `drawSky` (incl. inset), `drawHorizon`,
`drawOrbit`, `refresh()`, `loop()` with `requestAnimationFrame`, `raceMax()`,
pointer handling for the orbit and sky.

## Requirements
1. Page shell `sunset.html` + `src/pages/sunset/main.ts` + `style.css`.
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
9. **Security (from 0016):** the readouts (`durEq`, `durSel`, `gam`, `rate`,
   `az`, today `innerHTML` with numbers + `<small>`) are built with
   `textContent` and element builders from `src/i18n/dom.ts`. Once inline
   script and style are gone, add the same CSP `<meta>` as 0002.

## Out of scope
Visual changes, unifying the design with the Mondbahn page (0008).

## Acceptance criteria
- [x] Screenshot comparison old vs. new at 1280 px and 360 px for several
      latitudes (0°, 51°, 66°, 70°) and seasons
- [x] Orbit dragging, sky dragging, chips, latitude slider, play/pause and
      "again" work as before, with mouse and touch
- [x] Polar day / polar night states render as before
- [x] No `innerHTML` with data; CSP meta in place, no CSP violations in the console
- [x] `npm run check` and `npm run build` green

## Open questions
- None.

## Notes / log
- 2026-11-27 – Implemented.
  - **Layout.** `sunset.html` is markup only (+ CSP meta, `fonts.css` link,
    module script). Page code in `src/pages/sunset/`: `main.ts` (entry),
    `state.ts` (typed `SunsetState`: `latDeg`, `eclLonDeg`, camera, hour
    angle, `playing`, `raceMin`), `elements.ts` (typed lookup; chips parsed
    once into `{ button, value }`), `theme.ts` (canvas colours), `scene.ts`
    (declination + both geometries derived from the state, `raceMaxMin`),
    `update.ts` (readouts + orbit + sky; legacy `refresh()`), `animation.ts`
    (rAF loop), `controls.ts` (events, both drags), `orbitGeometry.ts`
    (λ ↔ orbit figure, approximate date for λ),
    `render/{sky,skyInset,horizon,orbit}.ts`, `style.css`.
  - **Math** in `src/lib/astro/`: `declination.ts` (`OBLIQUITY_DEG`,
    `solarDeclinationDeg`), `sunsetGeometry.ts` (`SUN_DIAMETER_DEG`,
    `sunsetGeometry` with the discriminated union, `sunVector`, and
    `sunPathTangent` – the tangent formula that was inline in the legacy
    `angleArc`), `vec3.ts` (`dot`, `cross`, `normalize`, `scale`).
    `angles.ts` gained `DEG_PER_RAD` (legacy multiplies by `180/π`; using the
    same constant keeps results bit-identical). Field names are explicit
    (`azFromNorthDeg`, `rateDegPerHour`, `durationMin`, `hourAngleSetDeg`…).
    Note for 0004: the obliquity constant now exists in `declination.ts`
    (sunset) and in `ephemeris.ts` (moon path, time-dependent) – unify there.
  - **Shared helpers:** `src/lib/canvas.ts` (`fitCanvas` with DPR cap 2,
    `setMonoFont`, `FULL_CIRCLE`), `src/lib/color.ts` (`hexToRgba`),
    `src/lib/format.ts` (`formatDecimal` – Intl, no digit grouping, same
    output as `toFixed().replace(".", ",")`; `formatDayMonthShort`).
    `ctx.arc(…, 0, 7)` became `0, 2π` (same full circle per the canvas spec).
  - **Colours:** CSS custom properties in `style.css` are the single source;
    canvas-only colours were added as tokens (`--earth`, `--dusk-top`,
    `--dusk-mid`, `--dusk-low`); translucent fills use
    `theme.alpha(colour, a)`. No hex values in TS.
  - **Readouts** built with `textContent` + a `<small>` element
    (`replaceChildren`), no `innerHTML`. Inline `style="…"` attributes became
    classes (`.panel-bd.flush`, `.ctl.ctl-lat`, `.panel.race`).
  - **CSP** `<meta>` identical to `index.html`. Checked in Chromium (build
    and dev server): no CSP violations or console errors; an injected inline
    script is blocked. No horizontal scroll at 360 px.
  - **Animation:** unchanged logic (dt capped at 50 ms, so a hidden tab –
    where rAF does not run – resumes without a jump; reduced motion starts
    paused with "Abspielen").
  - **Characterisation.** `scripts/legacy-sunset-fixtures.mjs` runs the math
    part of the legacy script from commit `e93f17e` in a Node `vm` and wrote
    `tests/fixtures/sunset-legacy.json` (decl, geom incl. night/midnight
    states, sunVec, vector helpers, `dateFor`; rounded to 1e-9). Tests:
    `src/lib/astro/sunsetLegacy.test.ts`, `src/pages/sunset/orbitGeometry.test.ts`.
    Plus reference/property tests in `sunsetGeometry.test.ts` (equinox angle
    90° − φ, equator duration, polar states, unit vectors, tangent).
  - **Comparison** (Playwright/Chromium, legacy file from git vs. `vite
    preview` of the build, 1280 and 360 px): with reduced motion (static
    frame) for latitudes 0/51/66/70 × the four season chips + two orbit
    clicks each, three latitude chips, an orbit drag and a sky drag: canvas
    pixels (`toDataURL`), readout DOM, chip states, play button and full-page
    screenshots identical. Animated (fake clock, play / pause / again /
    drags) identical as well. A one-frame offset at start-up comes only from
    the module script running ~2 ms later than the legacy inline script
    (`performance.now()` origin), invisible to users. Touch: orbit and sky
    drag via CDP touch events and tapping play work (Pixel 7 emulation).
  - **Intended difference:** the orbit date label uses `Intl` (de-DE), which
    abbreviates September as "Sept." instead of the legacy "Sep." (visible
    only for λ ≈ 165°–195°). All other labels are unchanged.
  - **Pre-existing, not changed:** the em dash in the H1 ("Nicht die Sonne
    wird langsamer — die Bahn …") renders as a gap in both the legacy and the
    new page (glyph apparently missing in the self-hosted Bodoni Moda
    subset). Hand to 0008 (shared design) or 0017 (fonts).
