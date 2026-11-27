# 0005 – CI pipeline on GitHub Actions

- **Status:** todo
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
- [ ] Workflow green on the branch
- [ ] A deliberately failing test makes the workflow red (verify once)
