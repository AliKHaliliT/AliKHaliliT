# 0030. Dispose of the style's eight new records

Status: Accepted
Date: 2026-11-26

## Context

The style moved twelve commits past the pin this project carried, from 48c2f30 to
964c295, and gained eight records, 0139 through 0146. The last of them adopts the
entry this project sent upstream. The style also superseded its record 0086 by its
record 0144, so the inherited copy's status line moves with it, the one edit a carried
record takes besides a dead link's target. A re-alignment writes a record of the child's
own naming every record the inherited folder gained, with what it bound in the tree and
what changed, or that it bound nothing and why, and this is that record.

## Evidence

On the final tree the docs audit agreed with its conventions, its selftest reported every
rule firing, and the edition tool's selftest, the lint, the type check, the suites, and the
build passed. The lint ran the new rule over every slice and found nothing to refuse.

## Options considered

- **Hold the new lint rule with the template's own suite for its configuration.** That
  suite names the template's own slices, and this project's ledger already holds its lint
  rules by the message the configuration prints, so the new row names the message.
  Refused.

## Decision

Recopy the audit and its selftest, carry the eight records and the superseding status line
into the inherited folder, take the lint configuration's sliced layers, name the prose law
in the link that opens it, re-pin both scripts in CI, and move the pin. The upstream
file's one entry is deleted, since the style adopted it. Each gained record is
disposed of below.

| Record | What it bound here |
| --- | --- |
| [0139, Let the request door send a PUT](../inherited/0139-let-the-request-door-send-a-put.md) | Nothing. The record binds the style's demo request door, which this site does not carry. |
| [0140, Let the request door carry an abort signal](../inherited/0140-let-the-request-door-carry-an-abort-signal.md) | Nothing. The record binds the style's demo request door, which this site does not carry. |
| [0141, Keep a field's error out of its accessible name](../inherited/0141-keep-a-field-s-error-out-of-its-accessible-name.md) | Nothing. The record binds the style's demo text field, which this site does not carry. |
| [0142, Refuse an import between slices of one layer](../inherited/0142-refuse-an-import-between-slices-of-one-layer.md) | The lint configuration's layer table, which now names each sliced layer and refuses its alias inside it, and a ledger row. The lint found no slice importing another of its own layer. |
| [0143, Judge a path beyond a link by the ancestor git answers for](../inherited/0143-judge-a-path-beyond-a-link-by-the-ancestor-git-answers-for.md) | The recopied audit and selftest. |
| [0144, Hand the spelling tool the files git tracks by name](../inherited/0144-hand-the-spelling-tool-the-files-git-tracks-by-name.md) | The recopied audit, which hands codespell the tracked files by name, and the style's record 0086 in the inherited folder, whose status line now names it superseded. |
| [0145, Prove a queued entry's age on a history the selftest makes](../inherited/0145-prove-a-queued-entry-s-age-on-a-history-the-selftest-makes.md) | The recopied selftest. |
| [0146, Name the prose law in the link that opens it](../inherited/0146-name-the-prose-law-in-the-link-that-opens-it.md) | The rules of conduct's prose bullet, whose link now names the prose law it opens. This project's upstream entry asked for it, and the entry is deleted. |

## Consequences

A slice that imports another of its own layer now fails the lint rather than waiting for a
review to notice it, and the rules of conduct send a reader to the document their prose
link opens.
