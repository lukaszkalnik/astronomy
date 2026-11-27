# Roadmap – Everyday Astronomy Page

Status legend: ⬜ todo · 🟦 in progress · ✅ done · ⏸ parked

Each item links to a task file in [`tasks/`](tasks/). Items in later phases
without a task file are ideas; write the task file (from
[`0000-template.md`](tasks/0000-template.md)) before starting them.

## Phase 0 – Foundation (make it a project)

Goal: same two pages, same look and behaviour, but built from typed, tested,
linted modules and deployed automatically.

Rows are listed in the order to work on them. Task numbers are IDs, not the
order (they stay stable so commit prefixes and cross-references keep working).

| Step | # | Task | Depends on | Status |
|------|---|------|------------|--------|
| 1 | 0001 | [Tooling setup: Vite, TypeScript, ESLint, Prettier, Vitest](tasks/0001-tooling-setup.md) | – | ✅ |
| 2 | 0005 | [CI pipeline on GitHub Actions](tasks/0005-ci-pipeline.md) | 0001 | ✅ |
| 3 | 0017 | [Privacy policy and imprint (+ self-hosted fonts)](tasks/0017-privacy-policy-and-imprint.md) | 0001 | 🟦 fonts done; privacy policy waits for owner data |
| 4 | 0016 | [Security & privacy rules and security review](tasks/0016-security-rules-and-review.md) | 0005 | ✅ (owner checklist open) |
| 5 | 0018 | [Rename the project to "astronomy"](tasks/0018-rename-project-astronomy.md) | 0016 | 🟦 waiting for owner to rename the repo |
| 6 | 0006 | [Deploy to GitHub Pages](tasks/0006-deploy-github-pages.md) | 0005, 0018 | ⬜ |
| 7 | 0002 | [Migrate Mondbahn page into Vite structure](tasks/0002-migrate-mondbahn-page.md) | 0001 | ⬜ |
| 8 | 0003 | [Migrate Sonnenuntergang page into Vite structure](tasks/0003-migrate-sonnenuntergang-page.md) | 0001 | ⬜ |
| 9 | 0007 | [E2E smoke tests with Playwright](tasks/0007-e2e-smoke-tests.md) | 0002, 0003 | ⬜ |
| 10 | 0004 | [Extract astronomy core into `src/lib/astro` with unit tests](tasks/0004-astro-core-library.md) | 0002, 0003 | ⬜ |

Why this order:
- **0005 → 0006 first.** The live site
  (https://lukaszkalnik.github.io/astronomy/) is served by classic
  publishing from `main`. Once a page is migrated, its HTML loads TypeScript
  that only works after `npm run build`, so **0006 must be live before any
  migrated page reaches `main`**. Doing CI and deploy first removes that risk;
  CI then grows with each task (e2e job when 0007 lands).
- **0017 first of the rest.** The live site already needs an imprint and
  privacy policy. It also self-hosts the fonts, so the policy can say the site
  makes no third-party requests.
- **0018 before 0006.** The rename may change the repository name and so
  the Pages URL and base path; the deploy should be built on the final name.
- **0016 between CI and deploy.** The deploy workflow is the first with write
  permissions, and 0002/0003 write most of the new code. Security & privacy
  rules (Actions hardening, safe DOM, input validation, no third-party
  requests) should exist before both. The review's deferred fixes are handed to
  the tasks that touch that code.
- **0002, 0003** in either order; each pins current behaviour with
  characterisation tests before moving code.
- **0007 before 0004.** 0004 is the largest refactor (shared astronomy core
  used by both pages); E2E smoke tests on both pages catch regressions in it.
  (0007 was moved from Phase 1 for this reason.)

## Phase 1 – Quality

Goal: confidence that changes don't break pages; accessible and consistent.

| Step | # | Task | Depends on | Status |
|------|---|------|------------|--------|
| 11 | 0014 | [Localization: English, French, Polish](tasks/0014-localization-en-fr-pl.md) | 0002, 0003 | ⬜ |
| 12 | 0008 | [Shared design tokens, base styles and site navigation](tasks/0008-shared-design-and-navigation.md) | 0002, 0003 | ⬜ |
| 13 | 0013 | [Landing page with contents index](tasks/0013-landing-page.md) | 0002, 0003 (with/after 0008) | ⬜ |
| 14 | 0015 | [Language menu](tasks/0015-language-menu.md) | 0014, 0008 | ⬜ |
| 15 | 0010 | [Shareable state via URL parameters](tasks/0010-url-state.md) | 0004 | ⬜ |
| 16 | 0009 | [Accessibility audit and fixes](tasks/0009-accessibility-audit.md) | 0007 | ⬜ |

Why this order:
- **0014 first:** every later task adds UI strings; the later localization
  comes, the more strings must be retrofitted. 0013's content then ships in
  all four languages from the start.
- **0008 → 0013 → 0015:** the landing page uses the shared navigation; the
  language menu lives in the shared header and needs the catalogs from 0014.
- **0010** after the UI structure is settled, so URL parameters cover the
  final controls (and 0012 builds on it).
- **0009 last:** audit the finished Phase 1 UI once instead of re-auditing
  after each change. Accessibility rules in CLAUDE.md still apply to every
  task before that.

## Phase 2 – Better astronomy

| Step | # | Task | Depends on | Status |
|------|---|------|------------|--------|
| 17 | 0011 | [Atmospheric refraction and rise/set times](tasks/0011-refraction-and-rise-set.md) | 0004 | ⬜ |
| 18 | 0012 | [Free location choice (geolocation + map/coordinates input)](tasks/0012-free-location.md) | 0010 | ⬜ |
| — | — | Accuracy page: document model, sources, error vs. JPL Horizons | 0011 | idea |
| — | — | Twilight phases (civil / nautical / astronomical) on the sunset page | 0011 | idea |

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
