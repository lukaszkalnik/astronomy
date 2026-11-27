# 0008 – Shared design tokens, base styles and site navigation

- **Status:** todo
- **Phase:** 1
- **Depends on:** 0002, 0003
- **Estimate:** M

## Goal
The pages feel like one site: shared base styles, consistent navigation,
common footer – while each explainer may keep its own character.

## Context
The pages use different design languages today: Mondbahn (Outfit + Inter,
night blue / moon silver / sun coral) and Sonnenuntergang (Bodoni Moda + IBM
Plex, ink / brass / ivory). Cross-links are ad hoc (a link in the Mondbahn
header, a "back" link on the sunset page).

## Requirements
1. `src/styles/base.css`: reset, box-sizing, focus styles, form control base,
   spacing scale, breakpoints – imported by every page.
2. `src/styles/tokens.css`: shared semantic tokens (`--bg`, `--surface`,
   `--text`, `--text-muted`, `--accent`, `--sun`, `--moon`, `--line`); a page
   may override them.
3. Shared header/nav component (plain TS that renders into a `<nav>` or static
   markup) listing all explainers, marking the current one; shared footer with
   accuracy note and source/repo link.
4. Fonts: reduce to at most 3 families site-wide if possible.

## Out of scope
Rewriting page content.

## Acceptance criteria
- [ ] Both pages use base + tokens; no duplicated reset/control CSS
- [ ] Navigation works on mobile and with keyboard
- [ ] Screenshots reviewed and approved by the owner

## Open questions
- **Unify the visual style or keep two distinct looks?** Needs a decision
  from the owner before implementation.
