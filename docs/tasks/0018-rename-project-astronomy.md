# 0018 – Rename the project to "astronomy"

- **Status:** in progress (code/docs renamed; waiting for the owner to rename the GitHub repository)
- **Phase:** 0
- **Depends on:** 0016
- **Estimate:** S

## Goal
The project is called **"astronomy"** instead of "astronomy-website" (owner
request, 2026-11-27). Do this before 0006, so the deploy workflow, the Vite base
path and all docs use the final name from the start.

## Context
"astronomy-website" appears today in:
- `package.json` / `package-lock.json` `name`
- README CI badge URL, CLAUDE.md hosting row, Roadmap, tasks 0001, 0006, 0017
  (URL `https://lukaszkalnik.github.io/astronomy-website/` and base path
  `/astronomy-website/`), the `vite.config.ts` comment
- the **GitHub repository name** `lukaszkalnik/astronomy-website`

Renaming the GitHub repository changes the GitHub Pages URL to
`https://lukaszkalnik.github.io/astronomy/`. GitHub redirects the **git
remote and web URLs** of a renamed repo, but **not the Pages site**: the old
`…/astronomy-website/` URL stops working (404) unless something serves a
redirect there. Existing links and bookmarks would break.

## Requirements
1. Decide the scope with the owner (see open questions): code/docs name only,
   or the GitHub repository too.
2. Code and docs: `package.json` `name` → `astronomy` (and the lockfile via
   `npm install --package-lock-only`); every "astronomy-website" reference in
   docs, comments and the README badge updated to the final name and URL.
3. If the repository is renamed (owner does it in Settings → General; Claude
   cannot): local `git remote set-url`, base path `/astronomy/` in 0006 and
   the Vite config comment; a plan for the old URL (options: accept the
   break, or keep a tiny repo/page named `astronomy-website` that redirects
   with `<meta http-equiv="refresh">` + `rel="canonical"`; decide).
4. The display name of the site ("Everyday Astronomy Page") is **not** changed
   unless the owner says so.

## Out of scope
- Changing page titles or UI copy.
- Custom domain (0006 open question).

## Acceptance criteria
- [x] Scope decided and recorded in Notes
- [x] No stale "astronomy-website" references left (`grep -rn`), except where
      the old URL is intentionally kept (redirect)
- [ ] If the repo was renamed: CI badge works, pushes go to the new remote,
      0006 uses the new base path
- [ ] `npm run check` and `npm run build` green; CI green
- [ ] Docs updated (README / CLAUDE.md / Roadmap)

## Open questions
- ~~Rename the GitHub repository as well?~~ → **yes** (owner, 2026-11-27).
- ~~Redirect the old Pages URL?~~ → **no, accept the break** (owner).
- ~~Change the visible site name?~~ → **no**, "Everyday Astronomy Page" stays.

## Notes / log
- 2026-11-27 – Task created on owner request; scheduled right after 0016 and
  before 0006.
- 2026-11-27 – Owner decisions: rename repo + package + docs; old
  `…/astronomy-website/` Pages URL may break (no redirect repo); display name
  unchanged.
- 2026-11-27 – Renamed in code and docs: `package.json` / lockfile `name`,
  README CI badge, CLAUDE.md hosting URL, Roadmap, `vite.config.ts` comment
  (`BASE_PATH=/astronomy/`), tasks 0001, 0006 (base path, URL list, note
  about the accepted break), 0017 (context URL, base path). Intentionally
  left: the 0017 log entry recording the font verification with
  `BASE_PATH=/astronomy-website/` (history), and this task file.
  `npm run check`, `npm run build` green.
- **Owner step still open:** Settings → General → Repository name →
  `astronomy`. Then: `git remote set-url origin` to the new URL, confirm a
  push and the CI badge, and that the Pages site serves `/astronomy/`.
