# Mondbahn am Himmel

[![CI](https://github.com/lukaszkalnik/astronomy-website/actions/workflows/ci.yml/badge.svg)](https://github.com/lukaszkalnik/astronomy-website/actions/workflows/ci.yml)

Interaktive Seite, die zeigt, wie hoch Mond und Sonne im Lauf eines Tages, eines Jahres und des 18,6-Jahre-Zyklus stehen.

- Alles in `index.html` (HTML, CSS, JavaScript), kein Build-Schritt. Zum Anschauen einfach im Browser öffnen.
- `eph()` berechnet Sonnen- und Mondposition (vereinfachte Bahnformeln, Genauigkeit etwa 0,5°).
- `findPhase()` sucht Voll- und Neumondzeitpunkte.
- Uhrzeiten in der Zeitzone des Geräts, Orte in `PLACES`.

## Sonnenuntergang

`sonnenuntergang.html` zeigt, warum der Sonnenuntergang je nach Jahreszeit und Breitengrad unterschiedlich lange dauert: Erdbahn (ziehbar), drehbare Himmelskugel mit Winkellupe für den Schnittwinkel γ und ein Horizontblick, in dem zwei Sonnen gleichzeitig untergehen. Ebenfalls eine einzelne Datei ohne Build-Schritt.

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
(`.github/workflows/ci.yml`: format check, lint, typecheck, unit tests with
coverage, build); coverage and `dist/` are uploaded as artifacts.

The full command list, project rules and target architecture are in
[CLAUDE.md](CLAUDE.md); planned work is in [docs/Roadmap.md](docs/Roadmap.md).
