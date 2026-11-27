# 0007 – E2E smoke tests with Playwright

- **Status:** todo
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
- [ ] Suite green locally and in CI, runtime < 1 min
- [ ] Breaking a renderer (e.g. throw in `drawYear`) makes the suite fail
