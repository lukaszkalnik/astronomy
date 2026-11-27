# 0015 – Language menu

- **Status:** todo
- **Phase:** 1
- **Depends on:** 0014, 0008 (shared header)
- **Estimate:** S

## Goal
Users can switch the language manually, independent of their browser setting.

## Requirements
1. Language menu in the shared header on every page (landing page and all
   explainers): shows the current language, lists the others by their own name
   (Deutsch, English, Français, Polski) – no flags.
2. Switching goes to the same page in the other locale and keeps the URL state
   (0010) and saved settings (location).
3. The choice is remembered in `localStorage` and overrides browser detection
   on the root `/` redirect (0014).
4. Accessible: a native `<select>` or a disclosure button + list with proper
   ARIA; links carry `hreflang` and `lang` attributes; keyboard operable;
   44 px touch target; fits at 360 px.

## Acceptance criteria
- [ ] E2E: switch de → pl → en on each page, page and state preserved
- [ ] Remembered choice wins over `navigator.languages` on next visit to `/`
- [ ] axe checks green
