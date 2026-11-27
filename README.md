# Mondbahn am Himmel

[![CI](https://github.com/lukaszkalnik/astronomy/actions/workflows/ci.yml/badge.svg)](https://github.com/lukaszkalnik/astronomy/actions/workflows/ci.yml)
[![Deploy](https://github.com/lukaszkalnik/astronomy/actions/workflows/deploy.yml/badge.svg)](https://github.com/lukaszkalnik/astronomy/actions/workflows/deploy.yml)

Live: **https://lukaszkalnik.github.io/astronomy/**

Interaktive Seite, die zeigt, wie hoch Mond und Sonne im Lauf eines Tages, eines Jahres und des 18,6-Jahre-Zyklus stehen.

- `index.html` enthält nur das Markup; Code in TypeScript unter `src/pages/moon-path/` (Seite) und `src/lib/astro/` (Rechnung). Zum Anschauen `npm run dev` (siehe Development).
- `ephemeris()` berechnet Sonnen- und Mondposition (vereinfachte Bahnformeln, Genauigkeit etwa 0,5°), `sunMoonPosition()` daraus Höhe und Richtung am Ort.
- `findPhase()` sucht Voll- und Neumondzeitpunkte.
- Uhrzeiten in der Zeitzone des Geräts, Orte in `src/pages/moon-path/places.ts`. Der gewählte Ort bleibt im Browser gespeichert (`localStorage`, verlässt das Gerät nicht).

## Sonnenuntergang

`sunset.html` zeigt, warum der Sonnenuntergang je nach Jahreszeit und Breitengrad unterschiedlich lange dauert: Erdbahn (ziehbar), drehbare Himmelskugel mit Winkellupe für den Schnittwinkel γ und ein Horizontblick, in dem zwei Sonnen gleichzeitig untergehen. Ebenfalls eine einzelne Datei ohne Build-Schritt.

## Development

Requires Node 22 (LTS, see `.nvmrc`). Setup and everyday commands:

```
npm ci            # install exact dependencies
npm run dev       # dev server with both pages
npm run check     # lint + typecheck + unit tests – run before every commit
npm run build     # production build into dist/
npm run preview   # serve dist/
```

Every push and pull request runs the same checks in GitHub Actions
(`.github/workflows/ci.yml`: dependency audit, format check, lint, typecheck,
unit tests with coverage, build); coverage and `dist/` are uploaded as
artifacts. Dependabot proposes weekly updates for npm packages and Actions.
Security & privacy rules for contributors are in CLAUDE.md.

## Deployment

Every push to `main` publishes the site to GitHub Pages
(https://lukaszkalnik.github.io/astronomy/) via
`.github/workflows/deploy.yml`: it runs the full CI workflow with
`BASE_PATH=/astronomy/`, and only if that passes deploys the built `dist/`
(Pages source: "GitHub Actions"). It can also be started by hand
(Actions → Deploy → Run workflow). To try the production build locally:
`BASE_PATH=/astronomy/ npm run build`, then
`BASE_PATH=/astronomy/ npm run preview` and open
http://localhost:4173/astronomy/.

Fonts are self-hosted (`src/styles/fonts.css`, files and SIL OFL licences in
`src/styles/fonts/`), so the pages make no requests to third-party servers.

The full command list, project rules and target architecture are in
[CLAUDE.md](CLAUDE.md); planned work is in [docs/Roadmap.md](docs/Roadmap.md).
