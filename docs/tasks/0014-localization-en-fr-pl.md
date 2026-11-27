# 0014 – Localization: English, French, Polish

- **Status:** todo
- **Phase:** 1
- **Depends on:** 0002, 0003 (best done before 0013 content is finalised)
- **Estimate:** L

## Goal
All user-visible texts are available in German (source), English, French and
Polish, with locale-correct formatting of dates, times and numbers.

## Context
All copy is German and hard-coded: in HTML (headings, explanations, tips,
labels, aria-labels, legends, notes) and in JS (phase names such as
"Zunehmende Sichel", compass labels `N/NO/O/SO/S/SW/W/NW`, month abbreviations
`Jan…Dez` / `Jan.…Dez.`, "Mond", "Vollmond", place names like "Köln",
`toLocaleDateString("de-DE")`).

## Requirements
1. **No i18n library**; a small typed solution in `src/i18n/`:
   - `de.ts` is the source catalog; `en.ts`, `fr.ts`, `pl.ts` are typed as
     `Messages = typeof de` (or a `satisfies` check) so a missing or extra key is
     a **compile error**
   - `t(key, params?)` with named interpolation (`{deg}`) and plural support via
     `Intl.PluralRules` (Polish needs `one/few/many/other`)
   - catalogs split per page/namespace (`common`, `landing`, `mondbahn`,
     `sonnenuntergang`) so each page only loads what it needs
2. **URL scheme:** path prefix per language – `/de/…`, `/en/…`, `/fr/…`, `/pl/…`.
   Static HTML is generated per locale at build time (small Vite plugin or build
   script that fills `data-i18n` placeholders from the catalogs), so content is
   indexable and works before JS runs. JS-rendered strings (figures, readouts)
   use `t()` with the page's locale from `<html lang>`.
3. **Language selection:**
   - root `/` picks the best match from `navigator.languages` (fallback `de`),
     remembered choice in `localStorage` overrides; redirect is client-side
     with a plain `<noscript>` list of language links
   - language switcher in the shared header (0008), keeps the current page and
     URL state (0010)
   - `<html lang>`, `hreflang` alternate links and `og:locale` per page
4. **Formatting:** all dates, times, weekdays, months and numbers via `Intl`
   with the active locale (decimal comma in de/fr/pl, `24 h` in de/fr/pl, en
   uses `en-GB` style unless decided otherwise). Remove hand-written month arrays
   in favour of `Intl.DateTimeFormat`. Degrees: `34°` everywhere; French puts a
   narrow no-break space before `:` `?` `!`.
5. **Domain strings:** compass points per language (de N/NO/O/SO/S/SW/W/NW,
   en N/NE/E/SE/S/SW/W/NW, fr N/NE/E/SE/S/SO/O/NO, pl N/NE/E/SE/S/SW/W/NW
   or Pn/Pd… – decide), Moon phase names, place names (Köln → Cologne / Cologne /
   Kolonia, Gliwice, Nordkap → North Cape / Cap Nord / Przylądek Północny, Rom →
   Rome / Rome / Rzym …).
6. **Layout robustness:** French and Polish strings are often 20–30 % longer –
   buttons, chips, legends and SVG/canvas labels must not overflow at 360 px.
   Canvas/SVG text measures or truncates instead of assuming German length.
7. **Translation quality:** initial translations may be drafted by Claude, but
   astronomy terms must be checked against established terminology (e.g.
   "nodal cycle"/"cycle draconitique"/"cykl węzłowy", "ecliptic"/"écliptique"/
   "ekliptyka") and each language reviewed by a native speaker before release.
   Track review status per catalog in this file's Notes.
8. **Tests:**
   - unit: catalogs complete and no empty strings; `t()` interpolation and
     Polish plurals (1, 2, 5, 22, 25); formatting helpers per locale
   - E2E: each page in each locale loads without console errors, no
     untranslated key leaks (`/\b[a-z]+\.[a-zA-Z.]+\b/` key pattern not visible),
     no horizontal scroll at 360 px; language switch keeps page and state

## Out of scope
Right-to-left languages; translating code comments or docs (those are English).

## Acceptance criteria
- [ ] No user-visible hard-coded string left in HTML/TS (ESLint rule or test
      that flags string literals in render code, with allowlist for symbols)
- [ ] All four languages complete; en/fr/pl reviewed by native speakers
- [ ] Locale-specific URLs, `hreflang`, language switcher working
- [ ] Saved settings (location, URL state) survive a language switch
- [ ] CLAUDE.md documents how to add a string and a new language

## Open questions
- English variant: en-GB or en-US (date format, spelling)?
- Default language for unknown browsers: German or English?
- Polish compass abbreviations: international (N/E/S/W) or Polish (Pn/Wsch/Pd/Zach)?
- Who reviews French and Polish?
