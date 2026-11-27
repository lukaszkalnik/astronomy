# 0002 – Migrate Mondbahn page into Vite structure

- **Status:** done
- **Phase:** 0
- **Depends on:** 0001
- **Estimate:** M

## Goal
Split `index.html` (inline CSS + ~240 lines of JS) into a page shell, a
stylesheet and typed TypeScript modules – with **no visible or behavioural change**.

## Context
`index.html:126–364` contains everything: constants and `PLACES`, state `st`,
ephemeris (`eph`, `eq`, `horiz`, `pos`), `findPhase`, formatting, phase icon,
and renderers `drawSky`, `drawYear`, `drawCycle`, `update()` plus event wiring.
Location is persisted in `localStorage["mondOrt"]`.

## Requirements
1. `index.html` keeps markup only and loads `src/pages/mondbahn/main.ts` as a module.
2. CSS moves to `src/pages/mondbahn/style.css` (imported from `main.ts`).
3. JS is converted to TypeScript and split roughly as:
   - `state.ts` – typed state (`{ tMs, latDeg, lonDeg, playTimer }`) + load/save
     of the location (same `mondOrt` key, `try/catch`, validated input)
   - `places.ts` – the `PLACES` list as typed records `{ name, latDeg, lonDeg }`
   - `render/sky.ts`, `render/year.ts`, `render/cycle.ts`, `render/phaseIcon.ts`
   - `controls.ts` – event wiring
   - astronomy functions go to `src/lib/astro/` **as-is** (proper API cleanup
     and tests happen in 0004), formatting helpers to `src/lib/format.ts`
4. Before moving the math, add characterisation tests capturing the current
   output of `pos()`, `findPhase()` and `yearData()` for a few fixed timestamps
   and locations (snapshot the numbers, rounded to 1e-6).
5. The year-data cache keeps working (keyed by year + location).
6. No `any`; DOM lookups go through a typed helper that throws a clear error
   if an element is missing.

7. All identifiers and comments in the migrated code are English (translate
   German comments and names such as `Zustand`, `Mathematik`); UI text stays
   as is until 0014.
8. **Security (from 0016):** no `innerHTML` with data – build SVG/markup via
   safe builders in `src/i18n/dom.ts` (`textContent`/`setAttribute`), or keep
   a constant-only template with a one-line `eslint-disable` and the reason
   (ESLint `no-restricted-syntax` enforces this). The `mondOrt` value is
   parsed from `unknown`: finite numbers, `latDeg` −90…90, `lonDeg` −180…180,
   otherwise defaults. Once the inline script and style are gone, add a CSP
   `<meta http-equiv="Content-Security-Policy">` (e.g. `default-src 'self';
   script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data:;
   connect-src 'self'; base-uri 'none'; form-action 'none'`; check what Vite
   dev needs) and verify no CSP errors in the console.

> **Deployment:** since 0006, `main` is built and deployed by
> `.github/workflows/deploy.yml` (Pages source "GitHub Actions"), so migrated
> pages can be merged to `main`.

> **Known bug (found in 0006):** at 360 px the legacy page scrolls ~22 px
> horizontally (`scrollTo(1000,0)` → `scrollX` 22) although `body` has
> `overflow-x: clip`. Pin it as a known difference, then fix it here or in 0007
> (E2E rule: no horizontal scroll at 360 px).

## Out of scope
Changing visuals, texts or the astronomy model; shared design tokens (0008).

## Acceptance criteria
- [x] Side-by-side comparison (old file from git vs. new build) at 1280 px and
      360 px for at least: today, a full moon in December, Nordkap in June,
      Sydney – screenshots identical or differences explained
- [x] All controls (date, place, time, day-of-year, lat, ±day, full-moon jumps,
      play, now, click in year chart) behave as before
- [x] Saved location from the old version is still picked up
- [x] Characterisation tests pass
- [x] Unit tests for the `mondOrt` parser: valid, out-of-range, non-numeric,
      malformed JSON → defaults
- [x] No `innerHTML` with data; CSP meta in place, no CSP violations in the console
- [x] `npm run check` and `npm run build` green; legacy file removed from
      `.prettierignore`

## Open questions
- None.

## Notes / log
- 2026-11-27 – Implemented.
  - **Layout.** `index.html` is markup only (+ CSP meta, `fonts.css` link,
    module script). Page code in `src/pages/mondbahn/`: `main.ts` (entry),
    `state.ts` (typed state, `mondOrt` load/save/parse), `places.ts`,
    `elements.ts` (typed element lookup via `byId`), `update.ts` (the single
    render function: controls, readouts, figures), `controls.ts` (event
    wiring), `data.ts` (year data cached by year + location, 18.6-year cycle
    data, both pure), `render/{sky,skyLabels,skyGeometry,year,cycle,chartAxes,phaseIcon}.ts`,
    `style.css`. Astronomy as-is in `src/lib/astro/`: `time.ts`, `angles.ts`
    (+ `RAD_PER_DEG`), `ephemeris.ts` (legacy `eph`, Sun and Moon together –
    split into `sun.ts`/`moon.ts` is 0004), `coords.ts` (`eq`, `horiz`),
    `position.ts` (`pos` → `sunMoonPosition`), `phases.ts` (`findPhase`,
    German `phaseName` until 0014). Formatting in `src/lib/format.ts` (Intl,
    locale fixed to de-DE until 0014). DOM helpers in `src/i18n/dom.ts`
    (`byId`, `svgEl`).
  - **No HTML strings.** All SVG is built with `svgEl` (createElementNS +
    setAttribute, text as text nodes); place `<option>`s via `new Option`.
    No `innerHTML` and no eslint-disable needed.
  - **CSP** `<meta>` in `index.html`: `default-src 'self'; script-src 'self';
    style-src 'self'; font-src 'self'; img-src 'self' data:; connect-src
    'self'; base-uri 'none'; form-action 'none'; object-src 'none'`. All
    inline `style="…"` attributes became classes at the end of `style.css`
    (CSP blocks style attributes). Vite dev injects CSS as `<style>`, so a
    serve-only plugin in `vite.config.ts` (`relaxCspInDev`) adds
    `'unsafe-inline'` to `style-src` in dev; builds keep the policy as
    written. Checked in Chromium: build and dev load without CSP errors; an
    injected inline script is blocked. (`frame-ancestors` cannot be set via
    `<meta>`.)
  - **Characterisation.** `scripts/legacy-mondbahn-fixtures.mjs` runs the
    legacy inline script from commit `640ff7f` in a Node `vm` and wrote
    `tests/fixtures/mondbahn-legacy.json` (pos, findPhase, yearData, cycle
    data, phasePath; rounded to 1e-6). Tests: `src/lib/astro/legacy.test.ts`,
    `src/pages/mondbahn/data.test.ts`. The new code uses `normDeg` instead of
    the legacy `((a%360)+360)%360`; differences are ~1e-13 (below the
    fixture precision, invisible in the SVG).
  - **`mondOrt`** is parsed from `unknown`: numbers only (no numeric
    strings), finite, lat −90…90, lon −180…180, else Cologne. Format
    unchanged (`{"lat":…,"lon":…}`), so old saved values load.
  - **Comparison** (Playwright, Chromium, TZ Europe/Berlin, clock fixed to
    2026-11-27 20:00; legacy file from git vs. `vite preview` of the build):
    for today / full moon 24 Dec / Nordkap 21 June / Sydney at 1280 and
    360 px, the canonicalised SVG of all four figures, all readouts and input
    values are identical; full-page screenshots are pixel-identical at
    1280 px and at 360 px for the December case. A sequence of date, place,
    time, day-of-year, latitude, ±1 day, full-moon jumps, year-chart click,
    cycle-chart click, place, now and play/stop gives identical state after
    every step. A value saved by the legacy page (`{"lat":71.17,"lon":25.78}`)
    selects Nordkap in the new page; a malicious value falls back to Cologne.
  - **Bug fixed (intended difference):** the 22 px (56 px at Nordkap in June)
    horizontal scroll at 360 px came from `dd { white-space: nowrap }` with
    long phase names ("Zunehmender Halbmond, 48 %"). The phase value now
    may wrap (`dd.can-wrap`); other values keep `nowrap` so their layout is
    unchanged. Affected 360 px screenshots (today, Nordkap, Sydney) differ
    only in that line wrapping (+25 px height); no horizontal scroll left.
  - ESLint: `scripts/**/*.mjs` lint without type-aware rules (one-off Node
    scripts outside any tsconfig).
  - Hand-off: 0004 can rely on the fixtures above; 0007 should assert no
    horizontal scroll at 360 px (now fixed for this page).
