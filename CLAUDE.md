# CLAUDE.md

Guidance for working in this repository. Read this first, then `docs/Roadmap.md`
and the task file you are working on in `docs/tasks/`.

## What this project is

**Everyday Astronomy Page** – a physics & astronomy website of interactive
explainers for lay people. UI languages: German (source), English (fallback),
French, Polish (see task 0014).

- Landing page with a contents index of all explainers (task 0013, planned).
- `index.html` – **Mondbahn**: how high Sun and Moon stand over a day, a year and
  the 18.6-year nodal cycle.
- `sonnenuntergang.html` – **Sonnenuntergang**: why sunsets last longer or shorter
  depending on season and latitude.

The pages are static and run entirely in the browser. No backend, no tracking, no
accounts. Computation is done client-side with simplified orbital formulas
(~0.5° accuracy).

> Current state: each page is a single self-contained HTML file with inline CSS
> and JS. The roadmap (Phase 0) migrates this to the structure described below.
> Until a page is migrated, keep editing it in place and do not partially split it.

## Tech stack (target)

| Concern       | Choice                                   | Why |
|---------------|------------------------------------------|-----|
| Language      | **TypeScript**, `strict: true`           | The math is full of degrees/radians, ms/days, lat/lon – types catch unit mix-ups. |
| Build / dev   | **Vite** (multi-page app, vanilla TS)    | Zero-config dev server, static output, one entry per page. |
| UI            | **No framework.** DOM + SVG strings / Canvas 2D | Pages are small; a framework adds weight without benefit. Revisit only via a roadmap task. |
| Unit tests    | **Vitest**                               | Native to Vite, fast, TS out of the box. |
| E2E / smoke   | **Playwright**                           | Pages render, no console errors, key interactions work. |
| Lint          | **ESLint** (flat config) + `typescript-eslint` (type-checked rules) | |
| Format        | **Prettier**                             | No style debates. |
| CI            | GitHub Actions                           | lint → typecheck → test → build → e2e |
| Hosting       | GitHub Pages, published via GitHub Actions (`dist/` artifact) | https://lukaszkalnik.github.io/astronomy-website/ |
| Node          | LTS (22.x), pinned via `.nvmrc` and `engines` | |

Do not add runtime dependencies without a clear reason written in the task file.
Dev dependencies are fine. Prefer the platform (Intl, SVG, Canvas) over libraries.

## Target layout

```
index.html                  # page shell only: markup, <script type="module" src>
sonnenuntergang.html
src/
  lib/
    astro/                  # PURE astronomy math – no DOM, no Date.now(), no globals
      time.ts               # julian date, day start, unit constants
      angles.ts             # deg/rad, normalisation
      sun.ts  moon.ts       # ephemerides
      coords.ts             # ecliptic → equatorial → horizontal
      phases.ts             # findPhase, phase names
      *.test.ts             # unit tests next to the code
    format.ts               # locale-aware formatting helpers (Intl)
  i18n/                     # message catalogs de.ts (source), en.ts, fr.ts, pl.ts
    dom.ts                  # tiny DOM helpers ($, svg builders)
  pages/
    mondbahn/               # main.ts, state.ts, render/*.ts, style.css
    sonnenuntergang/
  styles/                   # shared tokens/base CSS
tests/e2e/                  # Playwright specs
docs/
  Roadmap.md
  tasks/NNNN-task-name.md
```

## Commands

(available once task 0001 is done – keep this list in sync with `package.json`)

```
npm ci                 # install exact deps
npm run dev            # Vite dev server
npm run build          # typecheck + production build into dist/
npm run preview        # serve dist/
npm run lint           # eslint
npm run format         # prettier --write
npm run typecheck      # tsc --noEmit
npm test               # vitest run (unit)
npm run test:watch
npm run test:e2e       # playwright (pass --trace off unless debugging)
npm run check          # lint + typecheck + test – run before every commit
```

## Development rules

### Workflow
1. Every non-trivial change belongs to a task in `docs/tasks/`. If none exists,
   write one first (copy `docs/tasks/0000-template.md`), then implement.
2. Work through the task's acceptance criteria; tick them off in the task file
   and set its `Status`. Update `docs/Roadmap.md` when a task is done.
3. `npm run check` must be green before committing. Do not commit with failing
   tests, lint errors or `// @ts-ignore` / `eslint-disable` without a comment why.
4. Small, focused commits. Commit messages in English, imperative mood, prefixed
   with the task id when applicable: `0004: extract moon ephemeris into src/lib/astro`.

### Architecture
- **Separate math from rendering.** Everything in `src/lib/astro/` is a pure
  function of its inputs: no DOM, no `window`, no `Date.now()`, no module state.
  Time is always passed in explicitly. This is what makes it testable.
- **Page state is explicit.** One typed state object per page; rendering reads
  state, event handlers update state and call a single `render()`/`update()`.
- **Refactors preserve behaviour.** When moving code, first pin current output
  with characterisation tests, then move. Visual output must not change unless
  the task says so.
- No hidden globals. Export what is shared; keep the rest module-private.
- Keep files small and cohesive (guideline: < 300 lines). Split render code by
  figure (sky, year, cycle, orbit, horizon …).

### TypeScript
- `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` on.
- No `any`. Use `unknown` + narrowing at boundaries (e.g. `localStorage`, URL params).
- Name units in identifiers or types: `altDeg`, `azDeg`, `tMs`, `jd`, `latDeg`,
  `rad`. Consider branded types (`type Deg = number & {__unit:"deg"}`) for the
  core API. Never mix degrees and radians silently.
- Prefer `const`, small pure functions, early returns. Explain non-obvious
  formulas with a short comment and a source (e.g. "Schlyter, *How to compute
  planetary positions*", Meeus chapter).

### Testing
- **Unit-test all of `src/lib/`.** Target ≥ 90 % line coverage there; rendering
  code is covered by E2E smoke tests instead.
- Astronomy tests compare against authoritative reference values (JPL Horizons,
  USNO, timeanddate.com for rise/set and phase times) with an explicit tolerance
  that reflects the model accuracy, e.g. `expect(altDeg).toBeCloseTo(ref, 0)` or
  a custom `toBeWithinDeg(ref, 0.5)`. Record the source in the test.
- Tests involving local time must set the timezone explicitly
  (`TZ=Europe/Berlin` in the Vitest config) – never depend on the machine's TZ.
- Bug fix ⇒ first a failing test that reproduces it.
- E2E: each page loads without console errors, main figures render non-empty,
  core controls change the output, layout has no horizontal scroll at 360 px.

### UI, content and accessibility
- **English in code:** all identifiers (variables, functions, types, CSS
  classes, ids, file names), code comments, commit messages and docs are
  **English**. The legacy pages still contain German names/comments
  (e.g. `/* Zustand */`, `mondOrt`); translate them when touching or migrating
  that code (except persisted keys like `mondOrt`, which must stay or be migrated).
- UI copy is written for lay people: calm, clear, no jargon without explanation.
  German is the source language; every user-visible string comes from the
  i18n catalogs (`src/i18n/`), never hard-coded in HTML or TS once 0014 is done.
  New strings need all four languages (de, en, fr, pl) in the same change –
  the type of the catalog enforces complete keys.
- Mobile-first: must work at 360 px width, touch targets ≥ 44 px, no horizontal
  page scroll.
- Respect `prefers-reduced-motion` (no autoplay animation when set).
- Every figure has `role="img"` and a meaningful `aria-label`; all controls have
  labels and are keyboard operable; visible `:focus-visible` styles.
- Colour contrast WCAG AA for text. Do not encode information by colour alone.
- Dates, times, numbers and plurals via `Intl` with the active locale
  (`Intl.PluralRules` – Polish has several plural forms); times are shown in the
  device timezone. Never format numbers by string concatenation (decimal comma
  in de/fr/pl).
- `localStorage` access always wrapped in `try/catch` (private mode, blocked storage).
- Keep pages fast: no blocking third-party scripts; fonts via Google Fonts with
  `display=swap` are acceptable.

### Domain notes / gotchas
- Time is handled as Unix ms (`t`). Julian date: `t / 86_400_000 + 2440587.5`.
- Azimuth convention: degrees from North, clockwise (N=0, E=90, S=180, W=270).
- Moon altitude includes topocentric parallax correction; no atmospheric
  refraction yet (see roadmap). Document any change in accuracy on the page.
- The Moon-phase icon is mirrored on the southern hemisphere (`lat < 0`).
- `index.html` persists the chosen location in `localStorage` key `mondOrt` –
  keep the key (or migrate it) so users don't lose their setting.
- Polar day/night: `geom()` in the sunset page returns `state: "night" | "midnight"`;
  every consumer must handle those states.

## Definition of done
- Acceptance criteria in the task file met and ticked.
- `npm run check` and `npm run build` green; E2E green if UI changed.
- Checked visually in the browser at desktop and 360 px width (screenshot via
  Playwright if no browser at hand).
- Docs updated: README (user-facing), CLAUDE.md (if rules/commands changed),
  Roadmap + task status.
