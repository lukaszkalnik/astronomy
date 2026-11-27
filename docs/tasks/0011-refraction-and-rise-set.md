# 0011 – Atmospheric refraction and rise/set times

- **Status:** todo
- **Phase:** 2
- **Depends on:** 0004
- **Estimate:** M

## Goal
More realistic horizon behaviour and new readouts: moonrise/moonset and
sunrise/sunset times.

## Context
Currently no refraction is applied (stated on the page). Near the horizon
refraction lifts objects by ~0.57°, which shifts rise/set by several minutes
and matters for the sunset-duration explainer.

## Requirements
1. `refractionDeg(altDeg)` (Bennett/Sæmundsson formula), applied optionally;
   the page text explains it.
2. `riseSetTimes(body, dayStartMs, latDeg, lonDeg)` returning rise, transit,
   set or `"alwaysUp" | "alwaysDown"`; standard altitudes −0.833° (Sun) and
   Moon with parallax/semidiameter.
3. Mondbahn shows "Mondaufgang / Monduntergang / Sonnenaufgang /
   Sonnenuntergang" in the readout card.
4. Tests against timeanddate.com/USNO for Köln, Nordkap (polar cases),
   Quito, Sydney: Sun ±2 min, Moon ±5 min.
5. Update accuracy notes on both pages.

## Acceptance criteria
- [ ] Reference tests pass
- [ ] Polar day/night handled in UI with explanatory text
