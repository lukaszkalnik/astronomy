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
   - root `/` picks the best match from `navigator.languages`; **fallback is
     English** (`en`); redirect is client-side with a plain `<noscript>` list
     of language links
   - `<html lang>`, `hreflang` alternate links (`x-default` → `en`) and
     `og:locale` per page
   - a visible language menu is **not** part of this task → 0015
4. **Formatting – depends on the user's locale:** all dates, times, weekdays,
   months and numbers via `Intl`. The formatting locale is the most specific
   entry of `navigator.languages` matching the page language (e.g. `en-US` →
   "December 15, 2026, 9:00 PM", `en-GB` → "15 December 2026, 21:00",
   `fr-CA`, `de-AT` …); if none matches, the page language's default
   (`de-DE`, `en-GB`, `fr-FR`, `pl-PL`). **Spelling** follows the same rule:
   `en.ts` is written in British English; an optional partial `en-US.ts`
   override catalog holds the few US variants (colour → color, centre →
   center …) and is applied when the formatting locale is `en-US`. Remove hand-written month arrays
   in favour of `Intl.DateTimeFormat`. Degrees: `34°` everywhere; French puts a
   narrow no-break space before `:` `?` `!`.
5. **Domain strings:**
   - site name: en **"Everyday Astronomy Page"** (canonical); localized
     variants de "Astronomie im Alltag", fr "L'astronomie au quotidien",
     pl "Astronomia na co dzień" (proposal, owner may veto)
   - compass points (N, NE, E, SE, S, SW, W, NW):
     de N/NO/O/SO/S/SW/W/NW, en N/NE/E/SE/S/SW/W/NW,
     fr N/NE/E/SE/S/SO/O/NO, **pl Pn/PnW/W/PdW/Pd/PdZ/Z/PnZ**
     (Pn = północ, W = wschód, Pd = południe, Z = zachód)
   - Moon phase names, place names (Köln → Cologne / Cologne / Kolonia,
     Nordkap → North Cape / Cap Nord / Przylądek Północny, Rom → Rome / Rome /
     Rzym, Kairo → Cairo / Le Caire / Kair …)
6. **Layout robustness:** French and Polish strings are often 20–30 % longer –
   buttons, chips, legends and SVG/canvas labels must not overflow at 360 px.
   Canvas/SVG text measures or truncates instead of assuming German length.
7. **Translation quality:** translations are written **and reviewed by Claude**
   (no external review). Review pass per language, separate from drafting:
   natural phrasing for lay people (not literal), consistent terminology,
   established astronomy terms (e.g. "lunar standstill / nodal cycle" –
   "lunistice / cycle draconitique" – "cykl węzłowy / lunistycjum",
   "ecliptic" – "écliptique" – "ekliptyka"), correct grammar/diacritics,
   French typography. Keep a short glossary in `src/i18n/GLOSSARY.md` and
   record the review in this file's Notes.
8. **Tests:**
   - unit: catalogs complete and no empty strings; `t()` interpolation and
     Polish plurals (1, 2, 5, 22, 25); formatting helpers per locale
   - E2E: each page in each locale loads without console errors, no
     untranslated key leaks (`/\b[a-z]+\.[a-zA-Z.]+\b/` key pattern not visible),
     no horizontal scroll at 360 px; browser language detection (incl. fallback
     to English) works

## Out of scope
Right-to-left languages; translating code comments or docs (those are English).

## Acceptance criteria
- [ ] No user-visible hard-coded string left in HTML/TS (ESLint rule or test
      that flags string literals in render code, with allowlist for symbols)
- [ ] All four languages complete; en/fr/pl review pass done and noted
- [ ] Locale-specific URLs and `hreflang` working; unknown browser language → English
- [ ] en-US vs en-GB browser shows the respective date format and spelling
- [ ] CLAUDE.md documents how to add a string and a new language

## Open questions
- None (decided: name "Everyday Astronomy Page", locale-dependent formatting and
  spelling, English fallback, Polish compass Pn/W/Pd/Z, review by Claude).
