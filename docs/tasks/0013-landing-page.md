# 0013 – Landing page with contents index

- **Status:** todo
- **Phase:** 1
- **Depends on:** 0002, 0003 (ideally together with 0008)
- **Estimate:** M

## Goal
A start page for the physics & astronomy site that introduces it and lists all
explainers as cards, each with a small thumbnail and a very short description.

## Context
Today `index.html` *is* the Mondbahn page, and the two pages link to each other
ad hoc. There is no site-level entry point, title or branding.

## Requirements
1. **URLs:** the landing page becomes `index.html` (site root). Mondbahn moves to
   `mondbahn/index.html` (→ `/mondbahn/`), Sonnenuntergang to
   `sonnenuntergang/index.html` (→ `/sonnenuntergang/`). Old URLs keep working:
   `sonnenuntergang.html` redirects (meta refresh + `rel=canonical`) to the new
   path. Old bookmarks of the root land on the landing page, which links
   prominently to Mondbahn.
2. **Content:**
   - site title **"Everyday Astronomy Page"** + one-sentence intro (wording in
     all languages via 0014; localized site names, see 0014 req. 5)
   - contents index as a responsive card grid (1 column on 360 px, 2–3 on desktop)
   - each card: thumbnail (16:10, ~320×200 CSS px), title, description of
     **max. ~120 characters / one sentence**, whole card is one link
   - optional grouping by topic (Astronomie / Physik) once there are physics pages
   - footer with accuracy/about note and repo link
3. **Single source of truth for the index:** a typed registry
   `src/content/explainers.ts`:
   ```ts
   type Explainer = {
     slug: "mondbahn" | "sonnenuntergang";
     topic: "astronomy" | "physics";
     thumbnail: string;            // path to image asset
     titleKey: MessageKey;         // i18n keys (0014); plain strings before 0014
     descriptionKey: MessageKey;
   };
   ```
   The landing page cards and the shared navigation (0008) are both rendered from it.
   A unit test ensures every registry entry has an existing page, thumbnail and
   texts in all locales.
4. **Thumbnails:**
   - generated, not hand-made: `npm run thumbnails` runs a Playwright script that
     opens each page in a fixed, attractive state (fixed clock, fixed location,
     animation paused), screenshots the main figure and writes
     `src/assets/thumbnails/<slug>.webp` (640×400 for 2× displays, < 40 KB each)
   - committed to the repo (not generated in CI) so builds stay deterministic
   - `<img>` with `width`/`height`, `loading="lazy"` and a meaningful `alt`
5. Landing page uses shared base styles/tokens (0008); fast: no JS required to
   render the index (static HTML generated from the registry at build time, or
   a tiny module – decide in implementation, prefer static).
6. SEO/sharing: `<title>`, meta description, Open Graph image (can reuse a
   thumbnail collage or the first thumbnail).

## Out of scope
New explainers; localization itself (0014) – but no hard-coded strings that
would block it.

## Acceptance criteria
- [ ] Landing page lists both explainers with thumbnail + short description
- [ ] Cards work with keyboard, have visible focus, pass axe checks
- [ ] Old URL `sonnenuntergang.html` still reaches the page
- [ ] Adding a third explainer requires only a registry entry, a page and a
      thumbnail run (documented in CLAUDE.md)
- [ ] E2E: landing page loads, each card link opens the right page
- [ ] Looks good at 360 px and 1280 px (screenshots reviewed by owner)

## Open questions
- Keep the two distinct page styles (see 0008) – the landing page then needs a
  neutral style that fits both.
