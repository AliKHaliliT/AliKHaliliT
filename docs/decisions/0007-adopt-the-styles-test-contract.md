# 0007. Adopt the style's test contract

Status: Accepted
Date: 2026-08-05

## Context

The Helm template specified its test contract on 2026-08-05, after a review found that tests were the one part of the style family with no rule anywhere. The frozen rulebook and the repository baseline mentioned tests zero times in all three styles, and two of the three held an empty `tests/` folder that claimed a shape while demonstrating none.

This project was not one of those two. Its 9 suites already mirrored `src/`, already named themselves after the units they cover, and contained no module mocking at all. So the gap here was never the practice; it was that nothing stated the practice. An example without a rule leaves the next person under time pressure nothing to point at, and leaves an agent writing a new suite with something to imitate rather than something to follow.

One local divergence survives this record unchanged. The loader suite here is adapted to the real record, where some collections are legitimately empty, so it asserts an array for every collection and items only for the populated ones. That adaptation concerns which assertions are true of this data, not where a suite lives or what it substitutes, so it satisfies the style's contract rather than bending it.

The five-command contract landed in the same review. This project answered its fifth command with a bare `npx tsc -b` rather than a named script, and its CI workflow called `tsc` directly. Both work, and both let the workflow and the guide drift apart, because a change to one has no reason to reach the other.

## Options considered

- **Rely on the suites as their own documentation.** Rejected: an example without a stated rule gets copied without its reasoning, and the reasoning is what pushes back at the moment a module mock looks like the quick way through.
- **Write a test rule of this project's own.** Rejected: the rulebook is owned by the style, so a rule invented here would be exactly the divergence that ownership forbids. The style has the rule now, so this project carries the style's.
- **Adopt the style's contract and name the type-check command.** Accepted.

## Decision

The style's three rules are carried in AGENTS.md and described against this project's own structure in the architecture map. Suites live in `tests/` mirroring the source tree, one suite named after the unit it covers. A collaborator is replaced only at an architectural seam, by a hand-written fake satisfying the contract it stands in for, and never by mocking a module's internals. No coverage threshold is imposed, so breadth stays a judgment call while placement and substitution do not.

The frozen rulebook is refreshed to a byte-identical copy of the style's, which now states that test files stand outside the every-export doc-comment rule, since a case documents itself through its name and its assertion.

A `typecheck` script is added, the command table names it instead of the bare tool, and CI runs it.

## Consequences

Nothing about the suites changed, because they already complied. That is the strongest form this kind of record takes, since the rule describes what the project does rather than promising what it will do.

Two details travelled the other way, from here into the style, which is the upstream path in AGENTS.md working as intended. This project and its siblings fire CI on every push rather than only on the default branch, which catches a feature branch with no pull request yet, and the style adopted that trigger as written. They also documented why a type-check must be `tsc -b` when the root tsconfig is solution-style, a note the style's own guide lacked, and the style took it. The style declined the third difference, the workflow calling `tsc` directly, for the reason this record adopts a named script.
