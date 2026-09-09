# 0016. Align with the prose law and the mechanical security rules

Status: Accepted
Date: 2026-08-30

## Context

The style moved past the baseline this project froze at its last alignment, and the
family refuses ratcheting, so the wave lands complete or not at all. Since then the
template named its prose law inside the rulebook, replaced the em-dash ban with a
budget of two per tracked file, split checks into verdicts and advice, adopted the
mechanical security rules with three advisory heuristics, added Adversary honesty as
the delivery gate's nineteenth item, bound every rule to the jurisdiction its text
claims, and required the Node version story to be one number. The reasoning lives in
the style's records 0024 through 0034, once, and is not repeated here.

## Evidence

The frozen rulebook and the pinned audit script were re-copied from the template and
their CI pins updated; `sha256sum` over both copies reproduces the pinned values. The
new lint rules ran against the whole tree and reported nothing, and a planted
`Math.random()` defect in a scratch source file drew `sonarjs/pseudo-random` before
the clean result was trusted. `npm run docs`, `npm run typecheck`, `npm test`
(107 passing), and `npm run build` all passed against the final tree.

## Options considered

- Adopt the security rules but keep `pseudo-random` on everywhere. Lost because the
  ambient canvas rolls decorative jitter and the rule would either break the build or
  breed suppression comments; a narrow file waiver that names its reason is the
  pattern the style's own record prescribes.
- Keep the total em-dash ban as a stricter local rule. Lost because a derived project
  never diverges from the rulebook in either direction; the budget is the law now.
- Leave the Node story as it was, with CI on 24, deploy on 22, and the README claiming
  20. Lost because the audit now holds floor claims against `engines`, and three
  numbers for one floor is drift already visible.

## Decision

Re-copy `docs/CONVENTIONS.md` and `scripts/audit-docs.mjs` from the template and
re-pin both in CI. Replace CI's em-dash ban with the two-per-file budget and add the
advisory vocabulary grep. Carry the style's new hard rules and the two-level check
contract in AGENTS.md verbatim, add Adversary honesty to the gate, and extend The
commands to cover advisory findings. Adopt the mechanical security lint block with
its three warnings, waiving `pseudo-random` only for the ambient canvas with the
reason written beside the waiver. Declare `engines.node >= 24` and say 24 everywhere
a floor is claimed. Append the file-shape paragraph to the README's Conventions and
carry the template's clause-level prose corrections into the baseline document.

## Consequences

CI now counts em dashes instead of banning them, so review inherits the judgment of
fit the ban used to make trivial. Warnings are part of delivery, read and answered in
the change that produced them, never suppressed. A trust-boundary change owes one
written sentence about its adversary. The pins mean the next style move fails CI here
until the next complete wave, which is the alignment working as intended.
