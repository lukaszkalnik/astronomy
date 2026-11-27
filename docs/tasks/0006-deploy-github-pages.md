# 0006 – Deploy to GitHub Pages

- **Status:** done on branch (owner switch-over open, see "Owner steps")
- **Phase:** 0
- **Depends on:** 0005
- **Estimate:** S

## Goal
The `main` branch is automatically published as a static site at
https://lukaszkalnik.github.io/astronomy/ – built from `dist/`, not from
the raw sources.

## Context
GitHub Pages is currently active with **classic publishing** (deploy from branch),
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

**Decision:** A – publish via GitHub Actions (owner agreed, 2026-11-27): more
sustainable, no generated branch to maintain, deployments visible in the
`github-pages` environment with history and rollback.

## Requirements
1. Workflow `.github/workflows/deploy.yml` on push to `main` and
   `workflow_dispatch`; deploys only if CI passes (deploy job `needs:` the
   check job, or one workflow with `check` → `build` → `deploy` jobs).
2. Jobs: `npm ci` → `npm run build` → `actions/configure-pages` →
   `actions/upload-pages-artifact` (path `dist`) → `actions/deploy-pages`.
   Permissions `pages: write`, `id-token: write`, `contents: read`;
   environment `github-pages`; `concurrency: { group: pages, cancel-in-progress: false }`.
   Use current major versions of the actions.
3. Vite `base` = `/astronomy/` for production builds (via env/mode), `/`
   for local dev; internal links relative or `import.meta.env.BASE_URL`-based.
4. **Switch-over without downtime** (owner, in Settings → Pages):
   1. merge the workflow to `main` while the source is still "Deploy from a branch"
      (the deploy job will fail or be skipped – expected)
   2. set Source to **GitHub Actions**
   3. re-run the workflow (`workflow_dispatch`) and verify the site
   Do this before any migrated page (0002/0003) reaches `main`.
5. Keep URLs reachable: `/astronomy/` and `/astronomy/sonnenuntergang.html`
   (redirect once 0013 moves pages). The old `/astronomy-website/` URLs broke
   with the repo rename in 0018; the owner accepted that (no redirect).
6. `404.html`, favicon, `<meta name="description">` and Open Graph tags per page.
7. README states the public URL and how deployment works.
8. **Security (from 0016):** `deploy.yml` follows the Actions rules in
   CLAUDE.md: workflow-level `permissions: contents: read`; `pages: write` and
   `id-token: write` **only on the deploy job**; every action pinned to a full
   commit SHA with the tag in a comment; `persist-credentials: false` on
   checkout; `npm audit --audit-level=high` before the build (or reuse the CI
   job via `needs:`); no untrusted `${{ … }}` in `run:`. Add
   `<meta name="referrer" content="strict-origin-when-cross-origin">` to every
   page (and to `404.html`).

## Acceptance criteria
- [ ] Push to `main` → site updated within a few minutes, built version served
      *(owner: verify after merge + switch-over)*
- [x] Both pages reachable, cross-links, fonts and assets load (no 404s) –
      verified locally on the `/astronomy/` build with a Pages-like server
      (dist under `/astronomy/`, `404.html` for misses), Playwright at 1280 and
      360 px; re-check on the live site after the switch-over
- [x] A failing CI run does not deploy – `deploy` `needs: check` (the reused
      CI workflow); the deployed `dist/` is the artifact CI built and tested
- [ ] Pages source is "GitHub Actions"; old branch publishing no longer used
      *(owner, Settings → Pages)*
- [x] `deploy.yml`: job-level write permissions, SHA-pinned actions; referrer meta on all pages
- [x] `npm run check`, `npm run build`, `format:check`, `npm audit` green

## Owner steps (switch-over without downtime)
1. Merge the branch into `main` while Pages still says "Deploy from a
   branch". The Deploy workflow runs; its deploy job fails – expected. The
   live site keeps serving the raw files (still self-contained, works).
2. Settings → Pages → Build and deployment → Source: **GitHub Actions**.
3. Actions → Deploy → **Run workflow** on `main`; open
   https://lukaszkalnik.github.io/astronomy/ and `…/sonnenuntergang.html`,
   check fonts, favicon and a missing URL (404 page).
4. Settings → Environments → `github-pages`: deployment branches limited to
   `main` (0016 owner checklist).

## Open questions
- Custom domain? (affects `base`; currently none)

## Notes / log
- 2026-11-27 – Implemented. Decisions:
  - `ci.yml` got a `workflow_call` trigger with input `base-path`
    (default `/`). `deploy.yml` reuses it (`check` job, `base-path:
    /astronomy/`), then the `deploy` job downloads the `dist` artifact →
    `configure-pages` → `upload-pages-artifact` → `deploy-pages`. So the
    deployed files are exactly the tested build, without a second build; a
    push to `main` runs CI twice (ci.yml on push + inside Deploy) – accepted
    for simplicity.
  - Versions (latest majors, 2026-11-27): configure-pages v6.0.0,
    upload-pages-artifact v5.0.0, deploy-pages v5.0.1, download-artifact
    v8.0.2; all SHA-pinned (Dependabot updates them). The deploy job has no
    checkout, so no credentials to persist.
  - Base stays env-driven (`BASE_PATH`, default `/`), so dev/preview and CI on
    branches build for `/`.
  - `404.html` is a third Vite entry (`src/pages/not-found/style.css`, fonts).
    All its URLs are root-absolute (`/favicon.svg`, `/src/...`,
    `%BASE_URL%`) because Pages serves it at any depth. German text plus a
    one-line English fallback until 0014; `noindex`.
  - Favicon: `public/favicon.svg` (crescent moon, Mondbahn colours). SVG only;
    no PNG/apple-touch icon yet.
  - Open Graph: `og:type`, `site_name`, `title`, `description`, `url`
    (absolute, hard-coded to the Pages URL – change with a custom domain),
    `locale`. **No `og:image` yet** (needs a share image; idea for 0013).
  - Legacy pages only got `<head>` additions (description, referrer, OG,
    favicon); no visual change.
- Found while checking: `index.html` already scrolls 22 px horizontally at
  360 px (same in the version before this task) → noted in 0002.
