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
6. **Security (from 0016):** every parameter is parsed from `string | null`
   with validation: finite numbers, ranges (`lat` −90…90, `lon` −180…180,
   `day` 1…366, date within a sane window), `place` only from an allow-list of
   known slugs. Values reach the DOM only via `textContent`/`setAttribute`.
   Unknown parameters are ignored.

## Acceptance criteria
- [ ] Round-trip unit tests (state → URL → state)
- [ ] E2E: open a URL with params, readouts match
- [ ] Unit + E2E test with malicious values (e.g.
      `?place=<img src=x onerror=alert(1)>&lat=1e999&lon=NaN`): defaults used,
      nothing injected, no dialog, no console error
