# 0004 – Astronomy core library with unit tests

- **Status:** todo
- **Phase:** 0
- **Depends on:** 0002, 0003 (guarded by 0007 smoke tests and 0019 screenshots)
- **Estimate:** M

## Goal
Turn the moved-as-is math into a clean, documented, fully unit-tested library in
`src/lib/astro/` that both pages share, verified against external reference data.

## Context
After 0002/0003 the math lives in `src/lib/astro/` but still mirrors the old
code (terse names, implicit units, duplicate constants e.g. obliquity in both
pages, two different `norm` functions). Models: Sun & Moon after Paul Schlyter's
"How to compute planetary positions" with main lunar perturbation terms;
sunset geometry analytical.

## Requirements
1. Public API with explicit units and JSDoc, e.g.
   - `julianDate(tMs)`, `localSiderealTimeDeg(tMs, lonDeg)`
   - `sunEcliptic(tMs)`, `moonEcliptic(tMs)` → `{ lonDeg, latDeg, distEarthRadii }`
   - `eclipticToEquatorial(…)`, `equatorialToHorizontal(…)`
   - `sunMoonPosition(tMs, latDeg, lonDeg)` (today's `pos()`)
   - `findLunarPhase(tMs, targetElongationDeg, direction)`
   - `moonPhaseName(illum, waxing)` returns a phase **key**
     (e.g. `"waxingCrescent"`), never a display string – texts come from
     `src/i18n/` (0014)
   - `sunsetGeometry(latDeg, declDeg)` (today's `geom()`)
2. Single source for shared constants (obliquity, deg↔rad, ms per day).
   Since 0003 the obliquity exists twice: `OBLIQUITY_DEG = 23.4392811`
   (J2000 constant, `declination.ts`, sunset page) and
   `23.4393 − 3.563e-7·d` (time-dependent, inline in `ephemeris.ts`, moon
   path). Decide one model (e.g. `obliquityDeg(jd)` + the J2000 constant for
   the timeless sunset explainer) and explain any change against the sunset
   fixtures (`tests/fixtures/sunset-legacy.json`). Also `angles.ts` now has
   both `RAD_PER_DEG` and `DEG_PER_RAD`, and `vec3.ts` has `normalize` –
   keep these as the shared helpers.
3. Unit tests:
   - characterisation tests from 0002/0003 still pass (or deviations explained)
   - ≥ 10 reference checks against external data, each with source and date in
     the test: full/new moon times (tolerance ±30 min), Sun & Moon
     altitude/azimuth for Köln and Sydney (±0.5° Moon, ±0.1° Sun), solar
     declination at solstices/equinoxes, sunset duration at the equator vs. 51° N
   - edge cases: polar day/night, lat = ±90°, azimuth wrap-around at 0/360°,
     year boundaries, DST change days in Europe/Berlin
   - coverage ≥ 90 % lines for `src/lib/**`
4. No DOM or `Date.now()` inside `src/lib/astro/` (enforce with an ESLint
   `no-restricted-globals` rule scoped to that folder).
5. Performance: `yearData` (≈ 365 × 288 evaluations) stays under ~50 ms on a
   laptop; add a simple Vitest `bench` to watch it.

## Out of scope
Improving the model (refraction etc. → 0011).

## Acceptance criteria
- [ ] Both pages use only the public API of `src/lib/astro`
- [ ] All tests green, coverage threshold met
- [ ] A short `src/lib/astro/README.md` lists models, sources and accuracy
- [ ] Pages visually unchanged

## Open questions
- Branded unit types (`Deg`, `Rad`) – adopt or keep naming convention only?
  Decide during implementation, record in Notes.
