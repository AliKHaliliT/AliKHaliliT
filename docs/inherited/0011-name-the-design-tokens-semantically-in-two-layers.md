# 0011. Name the design tokens semantically in two layers

Status: Accepted
Date: 2026-08-04

## Context

The token layer had grown up as a single `@theme` block of physical names:
`--color-background`, `--color-text-primary`, `--color-border-strong`,
`--color-input-bg`. Components then spelled them the long way, as
`bg-[var(--color-card)]`, roughly a thousand times across the family. The theme
switched by toggling a `dark` class on the root element.

Three things were wrong with that. Physical names describe the value rather than the
job, so nothing in `--color-background` says whether a panel or a page should use it.
The arbitrary-value spelling meant a token and a hand-rolled value looked identical at
the call site, which is exactly the distinction the token rule exists to make. And a
naive shortening was not available: with these names the Tailwind utilities would have
read `text-text-primary` and `border-border`.

The client template in the style family had already settled a better shape, and the
site now follows it.

## Options considered

- **Shorten the spelling and keep the names.** Rejected: it produces
  `text-text-primary` and `bg-input-bg`, which is worse than what it replaces.
- **Rename the palette data keys as well**, so `palette.json` and the palette carried
  in the portfolio contract use the new words. Rejected: those keys are a published file
  format shared across three repositories, and a cosmetic rename is not worth a contract
  version and a migration.
- **Rename the CSS variables only, in two layers.** Accepted.

## Decision

Raw variables hold the values and are re-pointed under `[data-theme="dark"]`; an
`@theme inline` block maps each to a utility. The mapping is inline rather than a
copy because the runtime palette override rewrites the raw layer, and only an inline
mapping carries that through to the utilities.

The vocabulary is semantic: `surface`, `card`, `ink`, `muted`, `line`,
`line-strong`, `well`, `signal`, `field`, `pulse`, `footer`, `footer-ink`.
Components write `bg-surface` and `text-ink`; the variable itself appears only inside
a composite value such as a `color-mix()`. The theme is an attribute rather than a
class, which is also what the palette override and the ambient artwork now read.

The palette editor keys are untouched. `paletteCss.ts` maps them onto the new
variables, so `palette.json`, the `os_palette` override, and the portfolio contract
all keep working unchanged. The legacy `canopy` alias of the accent is gone, since
nothing consumed it.

## Consequences

A token and a hand-rolled value no longer look alike at the call site, and the names
say what they are for. The palette presets in src/entities/site/palette.ts and the
editor that drives them needed no changes, because the data keys never moved.

The cost is a vocabulary that no longer matches the palette editor's field names, so
src/entities/site/palette.ts now carries the mapping between the two. That indirection
is the price of leaving a published contract alone, and the mapping table is the one
place the two vocabularies meet.
