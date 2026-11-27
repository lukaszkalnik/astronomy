# 0006 – Deploy to GitHub Pages

- **Status:** todo
- **Phase:** 0
- **Depends on:** 0005
- **Estimate:** S

## Goal
The `main` branch is automatically published as a static site.

## Requirements
1. Workflow `deploy.yml` on push to `main` (and manual `workflow_dispatch`):
   build → `actions/upload-pages-artifact` → `actions/deploy-pages`.
   Deploy only if CI checks pass (reuse the CI workflow or `needs:`).
2. Vite `base` set to `/astronomy-website/` (or `/` if a custom domain is used)
   via env var so local dev keeps `/`.
3. Links between pages are relative and work under the base path.
4. Add `404.html`, a favicon, `<meta name="description">` and Open Graph tags
   (title, description, preview image) per page.
5. README states the public URL.

## Acceptance criteria
- [ ] Both pages reachable on the Pages URL, cross-links work
- [ ] Fonts and assets load (no 404 in network tab)

## Open questions
- Custom domain? (owner to decide; affects `base`)
- GitHub Pages must be enabled in repo settings ("Source: GitHub Actions") by the owner.
