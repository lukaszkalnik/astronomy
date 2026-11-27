# 0012 – Free location choice

- **Status:** todo
- **Phase:** 2
- **Depends on:** 0010
- **Estimate:** M

## Goal
Users can use their own location instead of the fixed `PLACES` list.

## Requirements
1. "Mein Standort" button using the Geolocation API (only on user action,
   coordinates rounded to 0.1° before storing; nothing leaves the device).
2. Manual input of latitude/longitude with validation.
3. Optional city search – only with a privacy-friendly, key-less service or a
   bundled small city list (decide in this task; no third-party tracking).
4. Longitude matters for times: ensure the device timezone vs. chosen location
   mismatch is explained (times stay in device timezone, or display the
   location's timezone via `Intl` – decide and document).

## Acceptance criteria
- [ ] Works with permission denied / unavailable (clear German message)
- [ ] Location persists (localStorage) and is reflected in the URL (0010)

## Open questions
- Show times in device timezone or in the location's timezone?
- Bundled city list vs. geocoding service?
