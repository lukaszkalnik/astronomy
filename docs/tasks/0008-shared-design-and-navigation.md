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
2. `src/styles/tokens.css`: shared semantic token **names** (`--bg`,
   `--surface`, `--text`, `--text-muted`, `--accent`, `--sun`, `--moon`,
   `--line`, `--font-display`, `--font-body`). **Each page keeps its own look**
   (decided): Mondbahn maps the tokens to night blue / moon silver / sun coral
   with Outfit + Inter, Sonnenuntergang to ink / brass / ivory with Bodoni Moda +
   IBM Plex. Shared components (header, footer) use only the tokens, so they
   adopt each page's style automatically.
3. Shared header/nav component (plain TS that renders into a `<nav>` or static
   markup) listing all explainers, marking the current one; shared footer with
   accuracy note and source/repo link.
4. Fonts: keep each page's fonts; load only the fonts a page uses. Since 0017
   the fonts are self-hosted in `src/styles/fonts.css` (+ `fonts/*.woff2`),
   one shared stylesheet linked by both pages; browsers only download faces a
   page actually uses. Move/split it into the shared styles structure here
   (e.g. per-page font CSS) and keep the greek subset for IBM Plex Sans/Inter.

## Out of scope
Rewriting page content.

## Acceptance criteria
- [ ] Both pages use base + tokens; no duplicated reset/control CSS
- [ ] Navigation works on mobile and with keyboard
- [ ] Pages look unchanged apart from the new header/footer
- [ ] Screenshots reviewed and approved by the owner

## Open questions
- None. Decided: keep the two distinct styles for now; revisit unification
  later as a separate task if wanted.
