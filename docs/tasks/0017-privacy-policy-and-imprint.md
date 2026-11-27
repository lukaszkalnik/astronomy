# 0017 – Privacy policy and imprint

- **Status:** todo
- **Phase:** 0
- **Depends on:** 0001
- **Estimate:** M

## Goal
The public site has a German imprint and privacy policy, reachable from every
page. The privacy policy matches what the site actually does. To keep it short
and true, the fonts are self-hosted in the same change, so the site makes no
third-party requests.

## Context
- The site is live at https://lukaszkalnik.github.io/astronomy-website/ and
  is run by a person in Germany. Owner decision (2026-11-27): add both pages.
- **Imprint:** § 5 DDG (Digitale-Dienste-Gesetz, successor of § 5 TMG). If
  the content counts as journalistic-editorial, § 18 Abs. 2 MStV also applies.
  Popular-science explainers plausibly do, so name a responsible person.
- **Privacy policy:** GDPR Art. 13. The site sets no cookies and has no
  tracking, but:
  - the host (GitHub Pages, GitHub Inc., USA) processes visitor IP addresses in
    server logs → controller info, legal basis Art. 6 (1) (f), third-country
    transfer (check GitHub/Microsoft certification under the EU-US Data
    Privacy Framework at implementation time and cite it);
  - `index.html` stores the chosen location in `localStorage` (`mondOrt`). It stays on
    the device and is never transmitted. Under § 25 (2) Nr. 2 TDDDG it is
    strictly necessary for a function the user explicitly asks for, so no
    consent is needed. Say so in the policy;
  - Google Fonts are loaded today (see 0016), which transmits IPs to Google.
    **Owner decision: self-host.** Done here (req. 4), so the policy never has
    to describe Google Fonts.
  - later: geolocation (0012) must be added to the policy in that task.
- This is not legal advice. The texts follow common German templates. Have them
  checked, or generate them with a reputable generator, if in doubt.

## Requirements
1. **Pages** `imprint.html` and `privacy.html` (English file names per the
   code rule; German titles "Impressum" / "Datenschutzerklärung"). Static,
   self-contained like the legacy pages until migration, simple readable
   styling, added to `build.rollupOptions.input` in `vite.config.ts`. Relative
   links so they work under `/astronomy-website/` and on classic publishing.
   `<meta name="robots" content="noindex">` is optional (decide).
2. **Imprint** content: full name, postal address that can receive legal service (no
   P.O. box), e-mail address, plus "Verantwortlich für den Inhalt nach § 18
   Abs. 2 MStV" with name and address. **The owner supplies the personal data.**
   Never invent or guess it. If it is missing, the task stays blocked; do not publish
   placeholders.
3. **Privacy policy** content: controller (as imprint); hosting by GitHub Pages
   (data, purpose, legal basis, storage period as far as GitHub states it,
   third-country transfer, link to GitHub's privacy statement); no cookies, no
   tracking, no analytics; local storage of the chosen location (what, why,
   § 25 TDDDG, how to delete: browser site data); self-hosted fonts (no
   transfer); data-subject rights (Art. 15–21) and the right to lodge a complaint
   with a supervisory authority (name the one for the owner's federal state);
   date of last change.
4. **Self-host fonts** on `index.html` and `sonnenuntergang.html`: `woff2`
   files for exactly the families/weights in use (Outfit 500/600, Inter
   400/500/600; Bodoni Moda 400/500/700 with `opsz`, IBM Plex Mono 400/500,
   IBM Plex Sans 300/400/500/600), latin + latin-ext subsets (Polish
   characters for 0014). They are served from the site (e.g. `public/fonts/`) with
   `@font-face` + `font-display: swap`. Remove all `fonts.googleapis.com` /
   `fonts.gstatic.com` references. Check the font licences (SIL OFL) and commit
   the licence files. Visual output must not change (screenshot comparison
   before/after at 1200 px and 360 px; tiny anti-aliasing differences acceptable).
5. **Links:** a small footer on every page (both explainers + the two legal
   pages) with "Impressum · Datenschutz", and a link back to the start page.
   Touch targets ≥ 44 px, visible focus.
6. **Rules:** CLAUDE.md – replace "fonts via Google Fonts … are acceptable"
   with "fonts are self-hosted; no third-party requests". Add: "every new page
   links imprint and privacy policy in its footer; any new processing of
   personal data (e.g. geolocation, new storage) updates `privacy.html` in the
   same change."
7. **Hand-off:** 0008 (fonts already self-hosted; move them into shared
   structure), 0013 (landing page footer links + new URLs), 0014 (translate
   the legal pages; German stays the binding version. Note this on the
   translations), 0012 (geolocation section in the privacy policy), 0016
   (Google Fonts finding resolved here).

## Out of scope
- Cookie banner (no cookies, no consent-requiring storage).
- Translations of the legal texts (0014).
- Legal review by a lawyer (owner's call).

## Acceptance criteria
- [ ] Owner's imprint data received and filled in (no placeholders published)
- [ ] `imprint.html` and `privacy.html` exist, are in the build, and render at 360 px without horizontal scroll
- [ ] Every page has footer links to both; links work in dev, preview and the deployed base path
- [ ] No request to any third-party host when loading any page (verified with Playwright request log)
- [ ] Explainer pages look unchanged after font self-hosting (screenshots)
- [ ] Font licence files committed
- [ ] CLAUDE.md rules updated; hand-off items added to 0008, 0012, 0013, 0014, 0016
- [ ] `npm run check` and `npm run build` green; CI green
- [ ] Docs updated (README, CLAUDE.md, Roadmap)

## Open questions
- **Owner data for the imprint:** full name, postal address, e-mail. Consider a
  separate e-mail alias for the site. Imprint data is public and gets scraped.
- Federal state (for the supervisory authority in the privacy policy).
- `noindex` on the legal pages? (Recommendation: yes. It keeps name and address
  out of search results somewhat, and the pages stay reachable via links.)

## Notes / log
- 2026-11-27 – Task created on owner request; scheduled first in the remaining
  Phase 0 because the live site is affected now.
