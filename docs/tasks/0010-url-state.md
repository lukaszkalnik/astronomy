# 0010 – Shareable state via URL parameters

- **Status:** todo
- **Phase:** 1
- **Depends on:** 0004
- **Estimate:** S

## Goal
A user can share a link that opens the page in exactly the state they see
(e.g. "Vollmond am 15.12.2026 in Köln").

## Requirements
1. Mondbahn: `?d=2026-12-15T21:00&lat=50.94&lon=6.96` (or `place=koeln`).
   Sonnenuntergang: `?lat=51&day=172`.
2. State → URL via `history.replaceState` (debounced, no history spam);
   URL → state on load; invalid params are ignored, never crash.
3. Priority: URL params > `localStorage` > defaults.
4. Parsing/serialising is a pure, unit-tested module (`src/lib/urlState.ts`).
5. Optional "Link kopieren" button using the Clipboard API with fallback.

## Acceptance criteria
- [ ] Round-trip unit tests (state → URL → state)
- [ ] E2E: open a URL with params, readouts match
