# Roadmap – Everyday Astronomy Page

Status legend: ⬜ todo · 🟦 in progress · ✅ done · ⏸ parked

Each item links to a task file in [`tasks/`](tasks/). Items in later phases
without a task file are ideas; write the task file (from
[`0000-template.md`](tasks/0000-template.md)) before starting them.

## Phase 0 – Foundation (make it a project)

Goal: same two pages, same look and behaviour, but built from typed, tested,
linted modules and deployed automatically.

| # | Task | Status |
|---|------|--------|
| 0001 | [Tooling setup: Vite, TypeScript, ESLint, Prettier, Vitest](tasks/0001-tooling-setup.md) | ⬜ |
| 0002 | [Migrate Mondbahn page into Vite structure](tasks/0002-migrate-mondbahn-page.md) | ⬜ |
| 0003 | [Migrate Sonnenuntergang page into Vite structure](tasks/0003-migrate-sonnenuntergang-page.md) | ⬜ |
| 0004 | [Extract astronomy core into `src/lib/astro` with unit tests](tasks/0004-astro-core-library.md) | ⬜ |
| 0005 | [CI pipeline on GitHub Actions](tasks/0005-ci-pipeline.md) | ⬜ |
| 0006 | [Deploy to GitHub Pages](tasks/0006-deploy-github-pages.md) | ⬜ |

Order: 0001 → (0002, 0003 in either order) → 0004 → 0005 → 0006.
Live site: https://lukaszkalnik.github.io/astronomy-website/ (Pages, classic
publishing from `main` today). **0006 must be live before migrated pages reach
`main`** – otherwise the raw TypeScript sources would be served. Either do
0005 + 0006 right after 0001, or keep 0002–0004 on a branch until then.
0005 can start right after 0001 and grow with each task.

## Phase 1 – Quality

Goal: confidence that changes don't break pages; accessible and consistent.

| # | Task | Status |
|---|------|--------|
| 0007 | [E2E smoke tests with Playwright](tasks/0007-e2e-smoke-tests.md) | ⬜ |
| 0008 | [Shared design tokens, base styles and site navigation](tasks/0008-shared-design-and-navigation.md) | ⬜ |
| 0009 | [Accessibility audit and fixes](tasks/0009-accessibility-audit.md) | ⬜ |
| 0010 | [Shareable state via URL parameters](tasks/0010-url-state.md) | ⬜ |
| 0013 | [Landing page with contents index](tasks/0013-landing-page.md) | ⬜ |
| 0014 | [Localization: English, French, Polish](tasks/0014-localization-en-fr-pl.md) | ⬜ |
| 0015 | [Language menu](tasks/0015-language-menu.md) | ⬜ |

Suggested order: 0013 together with/after 0008 (shared navigation);
0014 early in Phase 1 – the later it comes, the more strings must be retrofitted.

## Phase 2 – Better astronomy

| # | Task | Status |
|---|------|--------|
| 0011 | [Atmospheric refraction and rise/set times](tasks/0011-refraction-and-rise-set.md) | ⬜ |
| 0012 | [Free location choice (geolocation + map/coordinates input)](tasks/0012-free-location.md) | ⬜ |
| — | Accuracy page: document model, sources, error vs. JPL Horizons | idea |
| — | Twilight phases (civil / nautical / astronomical) on the sunset page | idea |

## Phase 3 – More content

Ideas, not yet specified:

- Moon phases explained (why the terminator is curved, earthshine)
- Analemma / equation of time
- Eclipses: why not every full moon (ties in with the 18.6-year cycle)
- Planet visibility tonight
- Physics explainers (the site is physics & astronomy), e.g. pendulum and
  Foucault pendulum, tides, orbits/Kepler's laws, why the sky is blue

## Principles

- Every new explainer ships in all four languages and gets an entry on the
  landing page (thumbnail + one-line description).
- Every phase ends in a deployable state.
- Refactoring (Phase 0) must not change what users see.
- Prefer depth (explaining one phenomenon well) over breadth.
