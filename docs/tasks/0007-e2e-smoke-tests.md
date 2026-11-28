# 0007 – E2E smoke tests with Playwright

- **Status:** done
- **Phase:** 0 (moved from 1: lands before 0004 to guard that refactor)
- **Depends on:** 0002, 0003
- **Estimate:** M

## Goal
Catch broken pages and broken interactions automatically.

## Requirements
1. `@playwright/test` with Chromium; `playwright.config.ts` starts
   `vite preview` as `webServer`; `timezoneId: "Europe/Berlin"`,
   `locale: "de-DE"` (after 0014: run the smoke spec once per locale); fixed clock via `page.clock` so dates are deterministic.
2. Projects: desktop (1280×800) and mobile (e.g. Pixel 7 emulation).
3. Specs per page:
   - loads without console errors or failed requests (except fonts offline)
   - every figure (SVG/canvas) is non-empty
   - no horizontal scroll at 360 px
   - Mondbahn: changing place / date / time updates the readouts; "Vollmond ›"
     jumps to a full moon date; location survives reload
   - Sonnenuntergang: latitude slider changes the shown duration; play/pause
     toggles; with `reducedMotion: "reduce"` nothing autoplays
4. Optional: visual snapshots (`toHaveScreenshot`) for key states with a
   tolerance, committed for Linux/Chromium only.
5. `npm run test:e2e` script; wire into CI (see 0005).

## Acceptance criteria
- [x] Suite green locally and in CI, runtime < 1 min
- [x] Breaking a renderer (e.g. throw in `drawYear`) makes the suite fail

## Notes / log
- 2026-11-28 – Hints from the 0003 old-vs-new comparison (sunset page):
  - Canvas "non-empty": compare `canvas.toDataURL()` before/after an
    interaction, or sample pixels with `getImageData`; a blank canvas has
    one known data URL per size.
  - Static frame: `reducedMotion: "reduce"` starts the page paused
    (button reads "Abspielen"), so the sky and horizon do not move.
  - Animation: `page.clock.install()` **and** `page.clock.pauseAt(…)` before
    `goto`, then `page.clock.runFor(ms)` – install alone lets time run in
    real time. Fake rAF ticks every 16 ms; the clock readout `#clock` then
    advances deterministically (≈ 0.9 min per second).
  - CSS `.chip` has `transition: .15s` (real time, not the fake clock) –
    wait ~300 ms or assert on attributes (`aria-pressed`) instead of
    screenshots right after clicking.
  - Touch drags: Playwright has no touch-move API; use a CDP session
    (`Input.dispatchTouchEvent` touchStart/touchMove/touchEnd) on the orbit
    and sky canvases with a device profile such as Pixel 7.
  - Polar states: latitude 70° + "Sommersonnenwende" → midnight sun
    (`#warn.on`, factor "∞"); 70° + "Wintersonnenwende" → polar night.
- 2026-11-28 – Implemented.
  - Dependency: `@playwright/test` ^1.65.1 (dev only; Microsoft, ~millions of
    weekly downloads, no install scripts in the lockfile; `npm audit` clean).
  - `playwright.config.ts`: projects `desktop` (1280×800) and `mobile`
    (Pixel 7); `timezoneId: "Europe/Berlin"`, `locale: "de-DE"`, trace off.
    `webServer` runs `vite build && vite preview --port 4173`; with `CI` set
    it skips the build and serves the existing `dist/`. `baseURL` includes
    `BASE_PATH`, so `BASE_PATH=/astronomy/` tests the Pages build (verified
    locally, green).
  - Specs: `tests/e2e/moon-path.spec.ts`, `tests/e2e/sunset.spec.ts`, shared
    helpers in `tests/e2e/helpers.ts` (console errors, page errors, failed
    requests and HTTP ≥ 400 – CSP violations show up as console errors;
    SVG non-empty = has child elements; canvas non-empty = `toDataURL()`
    differs from a blank canvas of the same size; no horizontal scroll at
    360 px). 12 tests × 2 projects = 24, ≈ 8–10 s locally.
  - Moon path: fixed time via `page.clock.setFixedTime` (2026-03-15 21:00
    Berlin); place / date / time change readouts; „Vollmond ›“ lands on the
    date `#nf` announced and the phase reads "Vollmond"; location survives
    reload; a malicious stored location falls back to Köln without dialogs
    or errors.
  - Sunset: clock `install` + `pauseAt`, then `runFor`; latitude slider and
    chips; polar states (70° midnight sun / polar night); play/pause freezes
    the race clock and sky canvas; `reducedMotion: "reduce"` starts paused,
    nothing moves.
  - Verified the suite fails when `drawYear` throws (8 moon-path tests red)
    and when `drawHorizon` silently draws nothing ("#horizon is blank").
  - CI: steps in the existing `check` job after `npm run build`:
    `npx playwright install --with-deps chromium`, `npm run test:e2e` (same
    `BASE_PATH`), Playwright report uploaded on failure. The deploy workflow
    reuses ci.yml, so E2E also guards every deploy.
  - Local cloud container: pre-installed Chromium (`/opt/pw-browsers`) is for
    Playwright 1.63; `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` points the config at
    it (documented in CLAUDE.md).
  - Observed (unchanged legacy behaviour, not a bug of this task): the
    sunset latitude chips set e.g. 69.7°, but the range input snaps to its
    0.5 step and shows 69.5 while the readout says 69,7° N. Candidate for
    0009 (accessibility/UI audit).
  - Not done: optional visual snapshots (req. 4) – skipped; they add
    maintenance (font rendering per OS) for little gain over the pixel and
    readout checks; revisit with 0008 if layout regressions appear.
    → Planned as task 0019 (visual regression snapshots), before 0004.
    Per-locale runs follow with 0014.
