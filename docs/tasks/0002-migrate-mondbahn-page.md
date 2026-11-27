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
- [ ] `npm run check` and `npm run build` green; legacy file removed from
      `.prettierignore`

## Open questions
- None.
