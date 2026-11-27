# 0001 – Tooling setup: Vite, TypeScript, ESLint, Prettier, Vitest

- **Status:** todo
- **Phase:** 0
- **Depends on:** –
- **Estimate:** S

## Goal
Turn the repository into a Node/TypeScript project with a dev server, build,
linter, formatter and test runner, without touching the existing pages yet.

## Context
Today the repo contains two self-contained HTML files and a README; there is no
`package.json`. See CLAUDE.md "Tech stack" for the chosen tools.

## Requirements
1. `package.json` with `"type": "module"`, `"private": true`, `engines.node`
   set to the current LTS major; `.nvmrc` with the same major.
2. Dev dependencies (latest stable): `vite`, `typescript`, `vitest`,
   `@vitest/coverage-v8`, `eslint`, `@eslint/js`, `typescript-eslint`,
   `eslint-config-prettier`, `prettier`, `globals`.
3. `tsconfig.json`: `strict`, `noUncheckedIndexedAccess`,
   `exactOptionalPropertyTypes`, `noImplicitOverride`, `noFallthroughCasesInSwitch`,
   `module`/`moduleResolution` = `ESNext`/`Bundler`, `target` ES2022,
   `lib` `["ES2022","DOM","DOM.Iterable"]`, `noEmit`.
4. `vite.config.ts` configured as multi-page app with both HTML files as inputs
   and a `base` that works on GitHub Pages (configurable, see 0006).
5. `vitest` config: `environment: "node"` by default, `TZ=Europe/Berlin` set for
   test runs, coverage provider v8 with thresholds for `src/lib/**` (90 % lines).
6. `eslint.config.js` (flat config) using `typescript-eslint` type-checked
   recommended rules + `eslint-config-prettier`. Ignore `dist/`, `coverage/`.
7. `.prettierrc` (e.g. `printWidth: 100`, `singleQuote: false`) and
   `.prettierignore`. Do **not** reformat the legacy HTML files yet
   (ignore them until migrated in 0002/0003).
8. `.editorconfig`, `.gitignore` (`node_modules`, `dist`, `coverage`,
   `playwright-report`, `test-results`).
9. npm scripts as listed in CLAUDE.md "Commands" (`dev`, `build`, `preview`,
   `lint`, `format`, `format:check`, `typecheck`, `test`, `test:watch`,
   `check`). `test:e2e` comes with 0007.
10. One trivial example module + test (e.g. `src/lib/astro/angles.ts`
    with `normDeg()`) to prove the pipeline works.

## Out of scope
Moving page code (0002/0003), CI (0005), Playwright (0007).

## Acceptance criteria
- [ ] `npm ci && npm run check && npm run build` succeeds on a clean checkout
- [ ] `npm run dev` serves both pages unchanged and working
- [ ] `dist/` contains both pages and they work via `npm run preview`
- [ ] Lint fails on an introduced `any` (verify once, don't commit)
- [ ] README has a "Development" section pointing to CLAUDE.md commands

## Open questions
- None.
