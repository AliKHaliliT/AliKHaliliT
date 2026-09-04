# 0014. Drop the unused-parameter exemption

Status: Accepted
Date: 2026-09-04

## Context

The style's configuration is carried law, and the sweep the last re-alignment
required found one setting this project held that the style does not: an
underscore exemption on the unused-variables rule, letting a parameter named
`_thing` sit unused without the linter objecting. The style configures no such
escape and takes the rule's own defaults, and the style states that a rule absent
upstream is a refusal rather than an oversight.

## Evidence

This tree used no underscore-prefixed identifiers at all, so removing the exemption removed a permission nothing exercised. A parameter named `_style` planted in a scratch file drew
`'_style' is defined but never used` from the rule once the exemption was gone,
so the check fires where it used to be silent. The docs audit, lint, type-check,
the suites, and the build all passed against the final tree.

## Options considered

- Keep the exemption and report the case upstream, proposing the style adopt it.
  Lost because the case is weak on its merits: the exemption is a blanket
  permission across the whole tree bought to preserve a symmetry nothing reads,
  and arguing to keep a silencer is the opposite of what the report exists for.
  A genuine case, a callback or an interface whose signature this project does
  not control, would be worth reporting; none exists here.
- Keep the parameters and have the functions read the style needlessly. Lost
  because a value read to satisfy a linter is worse than the parameter it saves.

## Decision

Remove `argsIgnorePattern` and `varsIgnorePattern` from the unused-variables
rule, so the rule keeps the defaults the style inherits, and remove whatever the
exemption was permitting.

## Consequences

An unused parameter is an error here now, with no underscore escape, which is the
point: the linter finds the argument nobody reads instead of being told to ignore
it. If a signature this project does not control ever needs an ignored parameter,
that is a real case for an upstream report rather than a local exemption.
