# 0019 – Visual regression snapshots (screenshot comparisons)

- **Status:** todo
- **Phase:** 0 (before 0004: the snapshots guard that refactor)
- **Depends on:** 0007
- **Estimate:** M

## Goal
Catch unintended visual changes in the figures and the page layout. The 0007
smoke tests check that something is drawn and that the readouts change, but
not *what* is drawn: a wrong curve, a mirrored moon icon, a shifted label or a
broken colour would pass. Screenshot comparisons (`toHaveScreenshot`) close
that gap where no textual oracle exists.

## Context
- 0007 req. 4 (optional snapshots) was deferred to this task.
- Determinism we already have: fixed clock (`page.clock`), `timezoneId`,
  `locale`, self-hosted fonts (no system-font variance once
  `document.fonts.ready`), `reducedMotion: "reduce"` freezes the sunset page.
- Canvas backing store follows `devicePixelRatio` (capped at 2,
  `src/lib/canvas.ts`), so desktop (DPR 1) and Pixel 7 (DPR 2.625 → 2) render
  different pixels; both are worth covering (HiDPI bugs).
- Pixel output depends on the Chromium build (Skia, font rasteriser). The
  cloud container's pre-installed Chromium (`/opt/pw-browsers`, Playwright
  1.63) is **not** the one CI uses (Playwright 1.65 bundle), so snapshots
  generated in the container may not match CI. Baselines must come from the
  same environment that compares them.
- Upcoming tasks change visuals **on purpose** (0008 design tokens and
  navigation, 0014 translated labels, 0011 refraction); they update the
  affected baselines in the same change and the reviewer looks at the diff
  images.

## Where screenshots are appropriate (and where not)
Use a screenshot when the output is graphical and has no simple assertion;
keep text assertions for text.

| Page | Target | States | Why |
|------|--------|--------|-----|
| Mondbahn | `#sky` (element) | fixed time, Köln; same time, Sydney (southern sky) | curves, hour dots, weekday labels, break line |
| Mondbahn | `#year` (element) | Köln 2026 | daily dots, full-moon circles, sun line |
| Mondbahn | `#cyc` (element) | default | 18.6-year envelope, sun dashes |
| Mondbahn | `#phase` (element) | new, waxing half, full, waning crescent; one state at `lat < 0` | icon geometry and southern mirroring (CLAUDE.md gotcha) |
| Sunset | `#sky` canvas | default frame (reduced motion), 70° midnight sun | sphere, arcs, projection |
| Sunset | `#orbit` canvas | each season chip | Earth position, axis |
| Sunset | `#horizon` canvas | t = 0 and after `runFor` a fixed time (paused clock) | race, two suns, horizon cut |
| both | full page | desktop 1280 and 360 px | layout, wrapping, cards, no overflow |

Not snapshotted: readout values (asserted as text in 0007), focus rings and
hover states (0009 audit), animation in motion (only frozen frames),
anything that depends on "now" without a fixed clock.

Full-page shots are few (one per page and project) because any copy change
touches them; element shots are the main safety net.

## Requirements
1. Specs in `tests/e2e/visual/*.spec.ts`, tagged `@visual`, reusing the 0007
   helpers. Each test: fixed clock, `reducedMotion: "reduce"`, wait for
   `document.fonts.ready` and two animation frames before shooting.
2. `toHaveScreenshot` defaults in `playwright.config.ts`:
   `animations: "disabled"`, `caret: "hide"`, `scale: "css"` only where DPR
   is not the point, and an explicit tolerance (start with
   `maxDiffPixelRatio: 0.002`, `threshold: 0.2`; tighten or loosen with a
   reason in the notes). No `mask` unless a region is genuinely
   nondeterministic – note each one.
3. Baselines under `tests/e2e/__screenshots__/{projectName}/…` via
   `snapshotPathTemplate`, committed for **Linux/Chromium only**. On other
   platforms the `@visual` tests are skipped (they still run in CI).
4. One reproducible way to (re)generate baselines in the CI environment:
   a `workflow_dispatch` workflow ("Update screenshots") that runs
   `npx playwright test --grep @visual --update-snapshots` and uploads the PNGs
   as an artifact (read-only permissions; it does **not** push). The owner or
   a session downloads, reviews and commits them. If the official Playwright
   container image for the pinned version gives identical pixels locally,
   document that as an alternative.
5. Scripts: `npm run test:visual` (`playwright test --grep @visual`) and
   `npm run test:visual:update`. `npm run test:e2e` keeps running everything,
   so CI compares on every push and deploy.
6. Dependabot bumps of `@playwright/test` can change rendering: document that
   such a PR needs regenerated baselines (and reviewed diffs) before merge.
7. Keep the repo light: element shots at their natural size, full-page shots
   only where listed; total baselines < 5 MB.

## Out of scope
- Other browsers (Firefox, WebKit) – may come with 0009.
- Snapshots per locale – added with 0014 if the translated layouts need them.
- Pixel comparison against the legacy pages (done once in 0003).

## Acceptance criteria
- [ ] `@visual` tests green in CI on both projects; total E2E runtime still < 1 min
- [ ] A deliberate visual change (e.g. swap two colours in
      `src/pages/sunset/style.css`, or drop the southern mirroring of the
      phase icon) fails the suite with a readable diff in the uploaded report;
      a harmless re-run does not flake (run the suite 3× in CI)
- [ ] "Update screenshots" workflow produces baselines that pass unchanged
- [ ] `npm run check` green
- [ ] Docs updated: CLAUDE.md (commands, rule "intended visual change ⇒
      regenerate and review baselines in the same change"), README, Roadmap

## Open questions
- Can baselines be generated in the cloud container (install the matching
  Chromium with `npx playwright install chromium`, if the network allows) so a
  session can update them without the workflow round trip? Try it first; fall
  back to the workflow.
- Is 0.002 the right tolerance for canvas antialiasing at DPR 2? Decide from
  the 3× flake check.

## Notes / log
