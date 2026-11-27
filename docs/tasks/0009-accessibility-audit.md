# 0009 – Accessibility audit and fixes

- **Status:** todo
- **Phase:** 1
- **Depends on:** 0007
- **Estimate:** M

## Goal
Both pages meet WCAG 2.2 AA where reasonably possible for interactive figures.

## Requirements
1. Add `@axe-core/playwright` checks to the E2E suite; zero serious/critical
   violations.
2. Keyboard: all controls reachable in logical order; draggable figures
   (orbit, sky globe, year chart click) have a keyboard alternative (arrow keys
   or an equivalent slider).
3. Figures: `aria-label` reflects the current state (e.g. "Mond 34° hoch im
   Südosten, Vollmond"), or a visually hidden live text summary
   (`aria-live="polite"`, throttled).
4. Contrast AA for all text including chart labels; check muted greys.
5. `lang="de"` and heading hierarchy correct; links have descriptive text.
6. Works at 200 % zoom without loss of content.

## Acceptance criteria
- [ ] axe checks green in CI
- [ ] Manual keyboard-only walkthrough documented in Notes
- [ ] Screen reader spot check (VoiceOver or NVDA) documented in Notes
