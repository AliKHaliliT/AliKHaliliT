# 0011. Align with the adoption gate and the mechanical tree checks

Status: Accepted
Date: 2026-09-03

## Context

The style moved past the commit this deployment was aligned to, and the family
refuses ratcheting, so the wave lands complete or not at all. Since that pin the
style defined when a re-alignment is done, moved the code-level documentation
convention out of the README and into the rulebook, shortened the `Now` horizon
to thirty days, and taught the docs audit to hold the tree itself: every
directory and root file needs a room in the map or the baseline, and every
record its immutability across git history. The template landed the same wave in
its decision 0020; this repository carries that template change, as its charter
requires a deployment commit to say.

## Evidence

The re-copied audit reported seven findings against this tree before any fix: the
`public/`, `scripts/`, and `src/assets/` directories and the four root
configuration files had no room in the map. The new `jsdoc/check-param-names`
rule found the same docstring drift the template carried, a `@param nowIso`
documenting a parameter named `exportedAt`. After the fixes the docs audit, lint,
type-check, the suites, and the build all passed against the final tree.

## Options considered

- Point the guide's doc-comment rule at the template's README, as it did before.
  Lost because the convention no longer lives there; the rulebook's code-level
  section is its home, and a pointer at a section that moved is drift with a
  link on it.
- Reuse the template's exemplar paths verbatim. Lost because this record holds
  real entries rather than the demo seed, so the exemplar for a record entry
  names a file that exists here.

## Decision

Re-copy `docs/CONVENTIONS.md` and `scripts/audit-docs.mjs` from the style and
take the template's finished CI workflow and lint configuration, which brings the
full-history clone, the audit after the install, the new pins, and the
parameter-name rule. Draw the missing rooms into the map, add an Exemplars
section naming this deployment's own files, point the guide's doc-comment rule at
the rulebook, and carry the guide's new clauses on the counting fake at a seam
and on re-alignment as one refactor. The README stays untouched, since it is the
profile page and the baseline exempts it from the template's README schema.

## Consequences

A new directory or root file here now fails the audit until the map admits it,
and a record edited beyond its Status line fails against history. The profile
README carries no template attribution and no pinned commit, so this repository's
alignment point is the record you are reading rather than a line in the README.
