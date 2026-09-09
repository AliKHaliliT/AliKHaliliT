# 0020. Align with the adoption gate and the mechanical tree checks

Status: Accepted
Date: 2026-09-03

## Context

The style moved past the commit this project was aligned to, and the family
refuses ratcheting, so the wave lands complete or not at all. Since that pin the
style defined when an adoption or a re-alignment is done, moved the code-level
documentation convention out of the README and into the rulebook, widened the
record species to any dated document, shortened the `Now` horizon to thirty
days, and taught the docs audit to hold the tree itself: every directory and
root file needs a room in the map or the baseline, every document under `docs/`
a registration, and every record its immutability across git history. The
reasoning lives in the style's records 0035 through 0037, once, and is not
repeated here.

## Evidence

The re-copied audit reported five findings against this tree before any fix: the
`scripts/` directory and the four root configuration files had no room in the
map. The new `jsdoc/check-param-names` rule found one real drift, a
`@param nowIso` documenting a parameter named `exportedAt` in the portfolio
snapshot builder. After the fixes the docs audit, lint, type-check, the suites,
and the build all passed against the final tree.

## Options considered

- Draw the missing rooms in the README's condensed tree instead of the map.
  Lost because the audit reads the map and the baseline, which is where the rule
  says a room lives; the README tree is a summary and stays one.
- Silence the parameter-name rule for the one file it flagged. Lost because the
  rule found a true statement gone false, which is exactly the class of rot the
  check exists to catch, and the fix was one word.
- Keep the README's five convention paragraphs beside the rulebook's copy. Lost
  because the baseline now fixes the section at two paragraphs pointing at the
  rulebook, and two copies of a law is the drift the single-source rule forbids.

## Decision

Re-copy `docs/CONVENTIONS.md` and `scripts/audit-docs.mjs` from the style and
re-pin both in CI, where the verify job now clones full history so record
immutability can be checked and the audit runs after the install. Draw the
missing rooms into the map, add an Exemplars section naming the files a new
artifact is cut from, and adopt `jsdoc/check-param-names`. Carry the baseline's
two README schema changes, collapse the README's Conventions section to the two
canonical paragraphs, and name the template commit in the attribution. Carry the
guide's new clauses: the doc-comment pointer into the rulebook, the counting
fake at a seam for an invariant with no output, the reply that travels down as a
re-alignment order, and re-alignment as one refactor rather than a trickle.

## Consequences

The tree is now held mechanically where it used to be held by attention: a new
directory or root file fails the audit until the map admits it, and a record
edited beyond its Status line fails against history. CI clones full history,
which costs a little time and buys the immutability check. The README carries no
law of its own, so a convention question has exactly one home, and the pinned
commit in the attribution is where the next re-alignment starts.
