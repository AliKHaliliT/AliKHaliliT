# 0012. Shape the docs subfolders and carry the tool configuration

Status: Accepted
Date: 2026-09-04

## Context

The style moved one commit past the pin this project carried, and the family
refuses ratcheting, so the wave lands complete or not at all. The style decided
two things. A subfolder under `docs/` is a record folder and nothing else, so a
living organic document stays a flat uppercase file at the top where the naming
and budget rules can see it, and a record folder beyond `decisions/` holds dated
documents named `YYYY-MM-DD-short-kebab-title.md`. And the tool configuration is
style-owned law rather than a local choice, because an adopting project had
widened its lint selection until it mechanically forbade the docstring rhythm the
exemplars carry, with no rule objecting. The reasoning lives in the style's
records 0038 and 0039, once, and is not repeated here.

## Evidence

This tree holds only `decisions/` under `docs/`, so the record-folder rules bind nothing new here, and the lint configuration is the template's copy, which already matched the style's two jsdoc rules exactly. The README is the profile page, so this record is the alignment point rather than a line in it. The docs audit, lint, type-check, the suites, and the build all passed
against the final tree.

## Options considered

- Treat the tool configuration as local, as it had been. Lost because that is
  exactly the gap the style closed: a child free to rewrite its lint selection can
  silently drop the rules the dialect depends on, and nothing would fail.

## Decision

Re-copy `docs/CONVENTIONS.md` and `scripts/audit-docs.mjs` from the style and
re-pin both in CI. Carry the guide's clause that re-alignment recopies the
tool-configuration blocks with only project names re-adapted, since the lint and
type-check settings and the comments giving their reasons are carried law. Move
the pin the attribution names.

## Consequences

The record-immutability check now reads every subfolder of `docs/`, not just
`decisions/`, so any record folder added later is immutable from birth. A future
change to the lint selection here is a divergence from carried law rather than a
local preference, and the next re-alignment recopies it.
