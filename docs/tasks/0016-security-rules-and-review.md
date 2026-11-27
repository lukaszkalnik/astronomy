# 0016 – Security & privacy rules and security review

- **Status:** todo
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
   - 0008: self-host the fonts (decision below); no request to Google.
     Replace the CLAUDE.md line allowing Google Fonts in this task already.
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
- [ ] CLAUDE.md has a "Security & privacy" section and an updated Definition of done
- [ ] `ci.yml` hardened (SHA pins, `persist-credentials: false`, audit step); CI green
- [ ] `.github/dependabot.yml` added
- [ ] Review findings recorded with severity and disposition
- [ ] Deferred items added to tasks 0002, 0003, 0006, 0008, 0009, 0010, 0012
- [ ] Owner checklist for repository settings in this file
- [ ] `npm run check` green
- [ ] Docs updated (README if user-facing privacy statement, CLAUDE.md, Roadmap)

## Open questions
- Legal: does the site need an imprint (DDG §5) and a privacy policy (GDPR
  Art. 13) because GitHub Pages logs visitor IPs? Owner to decide or get advice;
  not blocking this task.

## Notes / log
- 2026-11-27 – Task created; placed in Phase 0 after 0005 and before 0006
  (see Context).
- 2026-11-27 – Owner decisions: **self-host fonts** (woff2 served from the
  site, e.g. via `@fontsource/*` dev dependency or committed files; no request
  to Google). Implementation in 0008, the CLAUDE.md rule changes in this task.
  **No "no tracking" note** on the site.
