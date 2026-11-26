# 0020. Dispose of the template's eight-record re-alignment

Status: Accepted
Date: 2026-11-26

## Context

The template moved one commit past the pin this deployment carried, from 078907d to
4122834, re-aligning with its style, which had gained eight records. The inherited folder
gains the template's decision 0030, which disposes of those eight. A re-alignment writes a
record of the child's own naming every record the inherited folder gained, with what it
bound here and what changed, and this is that record.

## Evidence

The template's audit, its selftest, its lint configuration, its rules of conduct, and its
workflow came over byte for byte, and the ledger was merged from the template's diff. On
the final tree the docs audit, its selftest, the edition tool's selftest, the lint, the
type check, the suites, and the build passed, and the lint found no slice importing
another of its own layer.

## Options considered

- **Wait for a change of this deployment's own to carry it.** A re-alignment folded into
  other work hides which change caused what. Refused.

## Decision

The template's change is carried whole, as this deployment's decision 0006 requires.

| Record | What it bound here |
| --- | --- |
| [the template's 0030, Dispose of the style's eight new records](../inherited/0030-dispose-of-the-styles-eight-new-records.md) | The recopied audit and selftest under new pins, the lint configuration's sliced layers and the ledger row that names them, and the rules of conduct's link, which now names the prose law it opens. |

## Consequences

A slice that imports another of its own layer fails the lint here as it does in the
template.
