# 0001 – Tooling setup: Vite, TypeScript, ESLint, Prettier, Vitest

- **Status:** done
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
- [x] `npm ci && npm run check && npm run build` succeeds on a clean checkout
- [x] `npm run dev` serves both pages unchanged and working
- [x] `dist/` contains both pages and they work via `npm run preview`
- [x] Lint fails on an introduced `any` (verify once, don't commit)
- [x] README has a "Development" section pointing to CLAUDE.md commands

## Open questions
- None.

## Notes / log
- 2026-11-27 – Implemented. Versions installed: vite 8, typescript 6, vitest 5,
  eslint 10, typescript-eslint 8, prettier 3. `@types/node` pinned to 22 to
  match the Node LTS in `.nvmrc` / `engines` (`>=22 <23`).
- **Base path:** `vite.config.ts` reads `BASE_PATH` from the environment
  (default `/`). Task 0006 sets `BASE_PATH=/astronomy-website/` in the deploy
  build. (`BASE_URL` is avoided because Vite reserves it in `import.meta.env`.)
- **Two TS projects:** `tsconfig.json` covers `src/` and `tests/` (browser
  libs, `vite/client` types); `tsconfig.node.json` covers the config files
  (Node types, `checkJs` for `eslint.config.js`). `npm run typecheck` runs
  both; ESLint uses `tsconfig.node.json` as default project for the config
  files.
- Extra strictness beyond the task list: `noUnusedLocals`,
  `noUnusedParameters`, `verbatimModuleSyntax`, `isolatedModules`.
- **Prettier ignores `*.md`** as well as the legacy HTML pages: running it over
  the docs reflowed hand-written tables and lists. Revisit if wanted.
- `npm run check` does not include `format:check` (CLAUDE.md defines check as
  lint + typecheck + test); CI (0005) should run `format:check` separately.
- `TZ=Europe/Berlin` is set both via `process.env` in `vitest.config.ts` and
  `test.env`; the example test asserts it.
- Legacy pages keep their inline `<script>`/`<style>`; Vite's build leaves them
  inline. Verified with Playwright (fixed clock): raw file, `npm run dev` and
  `npm run preview` render pixel-identical at 1200 px and 360 px, no console
  errors, range controls change the figures, cross-links work. (One first run
  showed ~900 px differences from web-font load timing; a re-run was identical.)
- Lint verified to fail on an introduced `any` (`no-explicit-any`,
  `no-unsafe-return`); not committed.
