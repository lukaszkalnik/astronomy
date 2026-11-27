# 0005 – CI pipeline on GitHub Actions

- **Status:** done
- **Phase:** 0
- **Depends on:** 0001
- **Estimate:** S

## Goal
Every push and pull request is checked automatically.

## Requirements
1. `.github/workflows/ci.yml` triggered on `push` and `pull_request`.
2. Steps: checkout → setup-node (version from `.nvmrc`, npm cache) → `npm ci`
   → `npm run format:check` → `npm run lint` → `npm run typecheck`
   → `npm test -- --coverage` → `npm run build`.
3. Upload `coverage/` and `dist/` as artifacts.
4. When 0007 lands: add a job running Playwright against `vite preview`
   (`--trace off`, upload report on failure).
5. Concurrency group per branch cancels superseded runs.
6. CI badge in README.

## Out of scope
Deployment (0006).

## Acceptance criteria
- [x] Workflow green on the branch
- [x] A deliberately failing test makes the workflow red (verify once)

## Notes / log
- 2026-11-27 – Implemented `.github/workflows/ci.yml` (one `check` job).
  Actions: `actions/checkout@v7`, `actions/setup-node@v7` (Node from `.nvmrc`,
  npm cache), `actions/upload-artifact@v7` – the current majors at the time.
- Concurrency group `ci-<workflow>-<head_ref || ref>`, `cancel-in-progress: true`.
  `permissions: contents: read` only.
- Coverage is uploaded even when tests fail (`!cancelled()`), so a coverage
  threshold failure can be inspected; `dist/` only after a successful build.
- Verified: run #1 green (~25 s); run #2 with a deliberately failing test was
  red; that commit was reverted (both stay in history, marked "TEMP").
- Requirement 4 (Playwright job) is still open – it belongs to task 0007.
- The README badge shows the latest run on the default branch, so it only
  becomes meaningful once the workflow is on `main`.
