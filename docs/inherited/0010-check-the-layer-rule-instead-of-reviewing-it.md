# 0010. Check the layer rule instead of reviewing it

Status: Accepted
Date: 2026-08-04

## Context

The site adopted one-way sliced layers, and the rule that makes them worth
anything is that imports point downward only. That rule was enforced by review
alone. A reviewer who does not know the layer order cannot catch a violation, and
the violation that matters is invisible in a diff: an import line looks the same
whether it points down or up.

The record deferring this said the rule should prove itself in practice first. It
has, and a rule that is understood is exactly the point at which a machine should
take it over.

## Options considered

- **Leave it to review.** Rejected: the discipline is only as good as the reviewer's
  memory of the layer order, and it degrades silently.
- **Add a dedicated boundary plugin** (`eslint-plugin-boundaries` or similar).
  Rejected, though it was the obvious candidate and is a good tool. It would be a new
  dependency for a rule this project can already express, and this repository is
  deliberately thin on dependencies.
- **Express the rule with ESLint's built-in `no-restricted-imports`.** Accepted.

## Decision

`eslint.config.js` declares the layer order once and derives one config block per
layer, each forbidding the layers above it and forbidding any import that reaches
past a slice's `index.ts`. Cross-slice imports always travel through the `@/`
alias, which is what makes them matchable; a slice's own files use relative paths
and are left alone. Suites live outside `src/` and are exempt by construction.

The two halves of the rule travel in a single `no-restricted-imports` entry per
layer, because a later ESLint config block replaces the same rule rather than adding
to it. Splitting them into separate blocks silently disables the first.

## Consequences

An upward import and a reach past a slice door both fail the lint script and the
CI job, so the layer rule now holds without depending on who reads the diff. It cost
no new dependency.

The check is a pattern match on import specifiers, so it has a known blind spot: a
deep relative path that climbs out of a slice (`../../other-slice/file`) is not
matched. The convention is that anything crossing a slice boundary uses the alias,
and that convention is what the patterns rely on.
