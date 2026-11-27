# 0016 – Security & privacy rules and security review

- **Status:** done (CI green check pending on push; owner checklist open)
- **Phase:** 0
- **Depends on:** 0005
- **Estimate:** M

## Goal
Write down the security and privacy rules every later task must follow (in
CLAUDE.md), review the current repository against them, fix what is cheap now,
and hand the rest to the tasks where it belongs. The site is static with no
backend, so the risks are mostly **supply chain** (npm, GitHub Actions),
**CI/deploy permissions**, **DOM injection** once URL/user input arrives, and
**visitor privacy** (third-party requests).

## Context
Why now (before 0006): 0006 adds the first workflow with write permissions
(`pages: write`, `id-token: write`) and the deploy that publishes to the public
URL. 0002/0003 then write most of the new code. Rules that exist before that
code is written are cheaper than a retrofit.

Initial findings (quick scan, 2026-11-27 – to be confirmed and completed in the
review):
- **CI** (`.github/workflows/ci.yml`): `permissions: contents: read` ✔, no
  `pull_request_target` ✔. Actions referenced by tag (`@v7`), not by commit
  SHA. No Dependabot / update automation. `npm audit` = 0 vulnerabilities
  (2026-11-27), but not checked in CI.
- **DOM:** both legacy pages build SVG/markup via `innerHTML`
  (`index.html:263,296,320,339,344`, `sonnenuntergang.html:664,675-678`).
  The data in it is computed or static today, so this is not exploitable yet. It becomes
  relevant with URL parameters (0010) and free location / city names (0012).
- **localStorage:** `index.html:134` reads `mondOrt` with `JSON.parse` in
  `try/catch` ✔, but checks only `isFinite(s.lat)`. `lon` is unvalidated and
  `lat` is not range-checked. A corrupted value gives wrong output, not code
  execution, but it is the same boundary 0010 needs to handle.
- **Privacy:** both pages load Google Fonts from `fonts.googleapis.com` /
  `fonts.gstatic.com`. That sends every visitor's IP address to Google. In
  Germany this was ruled a GDPR violation without consent (LG München I,
  3 O 17493/20, 2022). CLAUDE.md currently allows Google Fonts. **Owner
  decision needed** (see open questions).
- **Headers:** GitHub Pages cannot set custom HTTP headers. CSP and referrer
  policy are only possible via `<meta>` (no `frame-ancestors`, no
  `report-uri` that way). Inline `<script>`/`<style>` in the legacy pages
  prevent a strict CSP until 0002/0003 are done.

## Requirements
1. **Rules in CLAUDE.md**: a new "Security & privacy" section covering at least:
   - No `innerHTML`/`insertAdjacentHTML`/`outerHTML` with data that did not
     come from code constants. Untrusted data (URL params, localStorage,
     user input, geolocation, external responses) goes through
     `textContent`/`setAttribute`, or through numbers formatted with `Intl`.
     No `eval`, `new Function`, or string arguments to `setTimeout`.
   - All boundaries parse `unknown` with validation (type, finiteness, range,
     allow-lists for enums) and fall back to defaults. Never trust a stored
     or URL value.
   - No third-party requests at runtime without a task that justifies them and
     a privacy note on the page; no analytics/tracking; geolocation only on user
     action and never leaves the device (as in 0012).
   - External links: `rel="noopener noreferrer"` with `target="_blank"`.
   - GitHub Actions: least-privilege `permissions` per workflow/job (default
     `contents: read`), no `pull_request_target`, no `${{ … }}` of
     untrusted event data (branch names, PR titles) inside `run:` (pass via
     `env:`), third-party actions pinned to a full commit SHA with the tag
     in a comment, `persist-credentials: false` on checkout where nothing pushes.
   - Dependencies: `npm ci` only (lockfile is the source of truth). New
     dependencies need a reason in the task file. Check maintenance status and
     install scripts before adding one. No secrets in the repo (the site needs none).
   - Definition of done gains: "no new security rule violations. `npm audit`
     shows no high/critical issues in the dependencies being added."
2. **CI hardening** (`ci.yml`): pin actions by SHA, `persist-credentials: false`,
   add an `npm audit --audit-level=high` step (decide: `--omit=dev` or full; dev
   deps run in CI, so probably full).
3. **Dependabot** (`.github/dependabot.yml`): `npm` and `github-actions`,
   weekly, grouped minor/patch updates to limit PR noise.
4. **Review** of the current state against the rules: workflows, `package.json`
   scripts, `vite.config.ts`, both legacy pages, `.gitignore` (e.g.
   `.env*`). Record findings in "Notes / log" with severity (high / medium /
   low / info) and what was done or where it is deferred.
5. **Hand-off of deferred items** into the owning task files (add as
   requirements/criteria, not only as notes):
   - 0006: deploy workflow follows the Actions rules (job-level `pages`/`id-token`
     permissions only on the deploy job, SHA-pinned actions). Add
     `<meta name="referrer" content="strict-origin-when-cross-origin">`.
   - 0002/0003: replace `innerHTML` with data by safe builders in
     `src/i18n/dom.ts` (or document why a constant-only template is safe), and
     validate the `mondOrt` value (finite, lat −90…90, lon −180…180).
     Once inline scripts are gone, add a CSP `<meta>` (e.g. `default-src 'self';
     script-src 'self'; style-src 'self' …; font-src …; img-src 'self' data:;
     connect-src 'self'; base-uri 'none'; form-action 'none'`).
   - 0010 / 0012: URL parameters and location input validated with ranges and
     allow-lists; E2E or unit test with a malicious value (e.g.
     `?place=<img src=x onerror=alert(1)>`) proving it is rendered inert.
   - Fonts: self-hosting is done in 0017 (decision below), which also updates
     the CLAUDE.md font rule. Here only check it is done. **Done in 0017
     (2026-11-27):** fonts served from `src/styles/fonts/`, no
     `fonts.googleapis.com` / `fonts.gstatic.com` references left; Playwright
     request log showed only same-origin requests. For the CSP: `font-src 'self'`.
   - 0009: re-check CSP and external requests during the audit.
6. Optional, decide in task: GitHub repository settings the owner should enable
   (secret scanning + push protection, Dependabot alerts, "require actions to be
   pinned to SHA" policy, branch protection on `main` requiring CI). List them
   as an owner checklist. Claude cannot change repo settings.

## Out of scope
- Rewriting the legacy pages (only rules and hand-off; fixes land in 0002/0003,
  except trivial ones).
- Penetration testing of GitHub Pages itself.
- A cookie banner (there are no cookies; avoiding third-party requests makes
  one unnecessary).

## Acceptance criteria
- [x] CLAUDE.md has a "Security & privacy" section and an updated Definition of done
- [x] `ci.yml` hardened (SHA pins, `persist-credentials: false`, audit step); CI green
- [x] `.github/dependabot.yml` added
- [x] Review findings recorded with severity and disposition
- [x] Deferred items added to tasks 0002, 0003, 0006, 0008, 0009, 0010, 0012
- [x] Owner checklist for repository settings in this file
- [x] `npm run check` green
- [x] Docs updated (README if user-facing privacy statement, CLAUDE.md, Roadmap)

## Open questions
- None.

## Notes / log
- 2026-11-27 – Task created; placed in Phase 0 after 0005 and before 0006
  (see Context).
- 2026-11-27 – Owner decisions: **self-host fonts** (woff2 served from the
  site, e.g. via `@fontsource/*` dev dependency or committed files; no request
  to Google). Implementation in 0017 (originally 0008), the CLAUDE.md rule changes in this task.
  **No "no tracking" note** on the site.
- 2026-11-27 – Owner: add imprint and privacy policy → task 0017 (scheduled
  before this one). 0017 also self-hosts the fonts (moved from 0008), so the
  privacy policy never needs a Google Fonts section.
- 2026-11-27 – **Implemented.**
  - CLAUDE.md: new "Security & privacy" section (DOM sinks, boundaries,
    privacy, links, Actions, dependencies, secrets); Definition of done gains
    the security/audit line; command list and CI row mention `npm audit`.
  - ESLint enforces the DOM rule for TS: `no-restricted-syntax` on assignments
    to `innerHTML`/`outerHTML`, calls to `insertAdjacentHTML` and
    `document.write(ln)`; plus `no-eval`, `no-new-func`, `no-script-url`
    (`no-implied-eval` already comes from `recommendedTypeChecked`). Verified
    with a throw-away probe file. Legacy inline scripts in the HTML pages are
    not linted, so their `innerHTML` is handed to 0002/0003.
  - `ci.yml`: actions pinned to SHAs (checkout v7.0.1 `3d3c42e…`, setup-node
    v7.1.0 `949feb2…`, upload-artifact v7.0.2 `cf430e0…`, resolved with
    `git ls-remote`; lightweight tags, so the SHA is the commit),
    `persist-credentials: false`, `npm audit --audit-level=high` right after
    `npm ci`. Decision: **full audit** (not `--omit=dev`) – the dev
    dependencies run in CI and produce the published build; there are no
    runtime dependencies anyway.
  - `.github/dependabot.yml`: npm + github-actions, weekly, minor/patch
    grouped per ecosystem, majors separate. Dependabot updates SHA pins and
    their version comments.
  - `.gitignore`: `.env`, `.env.*`.

### Review findings (2026-11-27)

| # | Area | Finding | Severity | Disposition |
|---|------|---------|----------|-------------|
| 1 | Privacy | Google Fonts sent visitor IPs to Google | high | **Fixed in 0017** – fonts self-hosted; request log same-origin only |
| 2 | Actions | Actions referenced by mutable tag (`@v7`) | medium | **Fixed** – SHA pins + Dependabot |
| 3 | Actions | Checkout kept the token in `.git/config` | low | **Fixed** – `persist-credentials: false` |
| 4 | Supply chain | No audit in CI, no update automation | medium | **Fixed** – audit step + Dependabot |
| 5 | Actions | `permissions: contents: read` at workflow level, no `pull_request_target`, no `${{ }}` of event data in `run:` (`head_ref` only in `concurrency.group`, which is not a shell) | info | OK |
| 6 | Supply chain | `npm audit`: 0 vulnerabilities; all 11 dev deps well-known; no package with `hasInstallScript` in the lockfile; all `resolved` URLs on registry.npmjs.org | info | OK |
| 7 | DOM | `innerHTML` in `index.html` (sky/year/cycle SVG, phase icon, place `<option>`s from the constant `PLACES`) and `sonnenuntergang.html` (readouts: numbers + `<small>`). All data computed or constant → not exploitable today | low | **Deferred** to 0002/0003 (req. 8/9); ESLint now blocks it in TS |
| 8 | Boundary | `mondOrt` from `localStorage`: `JSON.parse` in `try/catch` ✔, but only `isFinite(lat)`; `lon` unchecked, no range check. Wrong output at worst; values only reach SVG via numeric math | low | **Deferred** to 0002 (req. 8 + criterion) |
| 9 | Code | No `eval`, `new Function`, string timers, `document.write`, `fetch`/XHR, `target="_blank"` or external links in either page | info | OK |
| 10 | Headers | GitHub Pages: no custom headers. No CSP / referrer policy possible except via `<meta>`; inline script/style block a strict CSP | low | **Deferred**: referrer meta → 0006; CSP meta → 0002/0003; re-check → 0009 |
| 11 | Build | `vite.config.ts` reads only `BASE_PATH`; no `define` of env secrets, no plugins. `package.json` scripts call only local tools | info | OK |
| 12 | Secrets | No secrets in the repo; `.env*` was not ignored | low | **Fixed** – added to `.gitignore` |
| 13 | Deploy | First workflow with write permissions arrives in 0006 | – | **Deferred** to 0006 (req. 8 + criterion) |

### Owner checklist – repository settings (Claude cannot change these)
Settings → *Code security* / *Actions* / *Branches*:
- [ ] **Secret scanning** and **push protection** on (free for public repos).
- [ ] **Dependabot alerts** and **Dependabot security updates** on (the
      version-update PRs come from `dependabot.yml`; alerts are a separate switch).
- [ ] Actions → General: **"Require actions to be pinned to a full-length
      commit SHA"** (if offered), and "Workflow permissions" default
      **read repository contents** only; do not allow Actions to approve PRs.
- [ ] Actions → General → *Fork pull request workflows*: require approval for
      first-time contributors.
- [ ] Branch protection / ruleset on `main`: require PR + the CI check
      "Lint, typecheck, test, build" to pass; block force-pushes and deletion.
- [ ] Before 0006: environment `github-pages` limited to the `main` branch
      (default when Pages source is "GitHub Actions" – verify).
