# 0002 – Migrate Mondbahn page into Vite structure

- **Status:** todo
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

> **Deployment guard:** GitHub Pages currently serves `main` as-is (classic
> publishing). Do not merge this task to `main` before 0006 is in place,
> otherwise the live site breaks. (0006 is implemented; check the owner has
> finished its switch-over steps.)

> **Known bug (found in 0006):** at 360 px the legacy page scrolls ~22 px
> horizontally (`scrollTo(1000,0)` → `scrollX` 22) although `body` has
> `overflow-x: clip`. Pin it as a known difference, then fix it here or in 0007
> (E2E rule: no horizontal scroll at 360 px).

## Out of scope
Changing visuals, texts or the astronomy model; shared design tokens (0008).

## Acceptance criteria
- [ ] Side-by-side comparison (old file from git vs. new build) at 1280 px and
      360 px for at least: today, a full moon in December, Nordkap in June,
      Sydney – screenshots identical or differences explained
- [ ] All controls (date, place, time, day-of-year, lat, ±day, full-moon jumps,
      play, now, click in year chart) behave as before
- [ ] Saved location from the old version is still picked up
- [ ] Characterisation tests pass
- [ ] Unit tests for the `mondOrt` parser: valid, out-of-range, non-numeric,
      malformed JSON → defaults
- [ ] No `innerHTML` with data; CSP meta in place, no CSP violations in the console
- [ ] `npm run check` and `npm run build` green; legacy file removed from
      `.prettierignore`

## Open questions
- None.
