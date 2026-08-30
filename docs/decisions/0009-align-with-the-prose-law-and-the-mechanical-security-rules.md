# 0009. Align with the prose law and the mechanical security rules

Status: Accepted
Date: 2026-08-30

## Context

The style moved past the baseline this deployment froze at its last alignment, and the
family refuses ratcheting, so the wave lands complete or not at all. Since then the
template named its prose law inside the rulebook, replaced the em-dash ban with a
budget of two per tracked file, split checks into verdicts and advice, adopted the
mechanical security rules with three advisory heuristics, added Adversary honesty as
the delivery gate's nineteenth item, bound every rule to the jurisdiction its text
claims, and required the Node version story to be one number. The reasoning lives in
the style's records 0024 through 0034, once, and is not repeated here. The VITA
template landed the same wave in its decision 0016; this repository carries that
template change, as its charter requires a deployment commit to say.

## Evidence

The frozen rulebook and the pinned audit script were re-copied from the style and
their CI pins updated; `sha256sum` over both copies reproduces the pinned values. The
CI workflow, the lint configuration, and the deploy workflow were byte-identical to
the template's before the wave, verified by diff, so the template's finished versions
were copied whole. The new lint rules ran against this tree and reported nothing, and
the template proved them against a planted `Math.random()` defect before trusting the
clean run. The docs audit, typecheck, tests, and build all passed against the final
tree.

## Options considered

- Adopt the security rules but keep `pseudo-random` on everywhere. Lost because the
  ambient canvas rolls decorative jitter and the rule would either break the build or
  breed suppression comments; the narrow file waiver naming its reason is the pattern
  the style's own record prescribes.
- Keep the total em-dash ban as a stricter local rule. Lost because a derived project
  never diverges from the rulebook in either direction; the budget is the law now.
- Leave the Node story split between CI on 24 and deploy on 22. Lost because the audit
  now holds floor claims against `engines`, and two numbers for one floor is drift
  already visible.

## Decision

Re-copy `docs/CONVENTIONS.md` and `scripts/audit-docs.mjs` from the style and re-pin
both in CI. Take the template's finished CI workflow, lint configuration, and deploy
workflow whole, which brings the em-dash budget, the advisory vocabulary grep, the
mechanical security lint block with its `pseudo-random` waiver for the ambient
canvas, and the Node 24 deploy. Carry the style's new hard rules, the two-level check
contract, the Adversary honesty gate item, and the widened commands item in AGENTS.md
verbatim. Declare `engines.node >= 24` and correct the clause-splice sentences the
baseline document carried.

## Consequences

CI now counts em dashes instead of banning them, so review inherits the judgment of
fit the ban used to make trivial. Warnings are part of delivery, read and answered in
the change that produced them, never suppressed. A trust-boundary change owes one
written sentence about its adversary. The pins mean the next style move fails CI here
until the next complete wave, which is the alignment working as intended.
