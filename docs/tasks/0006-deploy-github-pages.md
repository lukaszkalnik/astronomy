# 0006 – Deploy to GitHub Pages

- **Status:** todo
- **Phase:** 0
- **Depends on:** 0005
- **Estimate:** S

## Goal
The `main` branch is automatically published as a static site at
https://lukaszkalnik.github.io/astronomy-website/ – built from `dist/`, not from
the raw sources.

## Context
GitHub Pages is already active with **classic publishing** (deploy from branch),
serving the repository files as they are. That works today because both pages
are self-contained HTML. Once 0002/0003 land, the HTML loads TypeScript modules
that only work after `npm run build`, so serving raw `main` would **break the
live site**. This task must be done before (or in the same merge as) the first
migrated page reaches `main`.

Options considered:
- **A – Pages source "GitHub Actions"** + `deploy.yml` (build → `upload-pages-artifact`
  → `deploy-pages`). Recommended by GitHub; no build output in git. Requires
  switching the Pages source in repo settings (one click, owner).
- **B – Keep classic publishing, serve a `gh-pages` branch.** A CI job builds and
  pushes `dist/` to `gh-pages`; Pages source set to `gh-pages` / root. Pages
  stays "classic", but a workflow is still needed to produce the branch.
- C – Commit built files into `main` – rejected: build output in history, merge
  conflicts, and `/docs` is already used for project docs.

**Decision:** B (owner prefers classic publishing) – unless the owner switches
to A. Record changes here.

## Requirements
1. Workflow `deploy.yml` on push to `main` (and `workflow_dispatch`), runs only
   after CI checks pass (`needs:` on the CI job or `workflow_run`):
   `npm ci` → `npm run build` → push `dist/` to branch `gh-pages`
   (e.g. `peaceiris/actions-gh-pages` or plain `git` with `GITHUB_TOKEN`,
   `permissions: contents: write`), single squashed commit per deploy is fine.
2. `dist/` contains `.nojekyll` (so Jekyll doesn't drop files/folders starting
   with `_`, e.g. Vite's assets).
3. Vite `base` = `/astronomy-website/` for production builds (via env/mode), `/`
   for local dev; all internal links relative or `import.meta.env.BASE_URL`-based.
4. Owner switches Pages source from `main` to `gh-pages` / root **after** the
   first successful deploy to `gh-pages` (step in Notes, no downtime).
5. Keep existing URLs reachable: `/astronomy-website/` and
   `/astronomy-website/sonnenuntergang.html` (redirect once 0013 moves pages).
6. `404.html`, favicon, `<meta name="description">` and Open Graph tags per page.
7. README states the public URL and how deployment works.

## Acceptance criteria
- [ ] Push to `main` → site updated within a few minutes, built version served
- [ ] Both pages reachable, cross-links, fonts and assets load (no 404s)
- [ ] A failing CI run does not deploy

## Open questions
- Option A or B? Default B (classic publishing from `gh-pages`).
- Custom domain? (affects `base`; currently none)
