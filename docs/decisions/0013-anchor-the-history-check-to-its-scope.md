# 0013. Anchor the history check to its scope

Status: Accepted
Date: 2026-09-04

## Context

The style moved one commit past the pin this project carried, and the family
refuses ratcheting, so the wave lands complete or not at all. The docs audit's
record-immutability check used to date its own arrival by searching history for
an identifier, which a child's past could already carry, so a widened scope could
reach behind the commit that widened it and turn a green tree red over commits
written before the rule existed. The check now searches for a sentence that
states its scope, and that sentence moves forward whenever the scope changes. The
guide gains the general rule behind it, a gate item for sweeping what a retired
rule required, and the instruction that a red gate over older commits is a defect
to send upstream rather than a reason to rewrite history. The reasoning lives in
the style's record 0040, once, and is not repeated here.

## Evidence

The re-copied audit and the whole check ladder passed against the final tree. The
sweep the new gate item asks for was carried out by comparing this project's lint
selection against the style's, rule by rule: every rule the style ships is present here, and the only setting this project holds that the style does not is the underscore exemption on unused variables, which permits rather than requires, so it left nothing in the tree to sweep.

## Options considered

- Keep the old identifier anchor, since nothing had gone red here yet. Lost
  because the defect is latent rather than absent; the next scope widening
  upstream would have reached behind its own arrival in this tree too.

## Decision

Re-copy `scripts/audit-docs.mjs` from the style and re-pin it in CI; the rulebook
is unchanged this time and keeps its hash. Carry the guide's new clauses, the
history-anchor sentence on the rule that a check may never imply more than it
decides, and the re-alignment instruction to sweep what a retired rule required.
The README is the profile page, so this record is the alignment point rather than a line in it.

## Consequences

The immutability check now binds this project from the commit that carries the
scope sentence, which is the re-alignment commit itself, so history written
before it is never re-litigated. A later scope widening upstream will move the
anchor again rather than reaching backward.
