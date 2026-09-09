# 0002. Appearance and identity follow the content model as file seeds

Status: Accepted
Date: 2026-07-18

## Context

The template must be brandable by people who do not edit source, and eventually by a
separated admin that pushes files rather than code. The deployed default has to be correct on
the very first paint, before any JavaScript runs, so a search crawler and a first-time
visitor both see the real colors and title. Hardcoding tokens and identity strings in source
contradicts both the template goal and the rule that no personal strings live in source code.

## Options considered

- **Hardcode tokens and identity in `index.css` and source.** Rejected: not brandable
  without code edits, and it puts owner-specific strings in source.
- **Store everything in `localStorage` only.** Rejected: per-browser, so new visitors and
  crawlers see nothing, and the first paint is wrong.
- **A three-layer file seed.** Chosen.

## Decision

Palette and site identity both follow the content model. A JSON file under
`src/content/settings/` (`palette.json`, `site.json`) is the deployed seed, baked into
`index.html` at build time by a Vite plugin (`paletteSeed`, `siteSeed`) so the first paint
matches. `localStorage` (`os_palette`, `os_site`) is the per-browser override applied after
the seed. The `index.css` literals are a cosmetic, non-load-bearing fallback. Admin edits the
override live and downloads the exact seed-file format for committing. Details in
[../ARCHITECTURE.md](../ARCHITECTURE.md) and [../THEMING.md](../THEMING.md).

## Consequences

Changing what visitors see is replacing one file and rebuilding, which is exactly what a
separated admin will push, the same way it pushes content markdown. First paint always
matches the deployed default, and no component needs to know palettes exist because
everything reads CSS variables. Harder: there are three layers to reason about, and the seed
files must stay valid, so tests pin seed validity and that a seed matches its named preset.
