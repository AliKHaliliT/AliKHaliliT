# The rules for records

The rulebook's rules for decision records. Part of the rulebook, [CONVENTIONS.md](CONVENTIONS.md), and frozen with it: owned by the style, changed only inside the template, never edited in a project built from it. Read before writing a record.

## Rules for records (decision records)

Write a decision record when a choice shapes future work and its reasoning would otherwise be lost: an architectural boundary, a convention, a rejected-but-tempting alternative, a reversal of an earlier decision, a dead end. Records live in `docs/decisions/`, named `NNNN-short-kebab-title.md` with a zero-padded sequence number, and follow this template:

```markdown
# NNNN. Title stating the decision

Status: Accepted
Date: YYYY-MM-DD

## Context

The situation that forced a decision, and the constraints that shaped it.

## Evidence

What was run or measured and what came back. This section appears only where
the decision rests on something measured or run; a record resting on reasoning
alone omits it. The results the decision rested on are quoted here in full,
never pointed at, because a record must stay accurate after the tree it
measured moves on.

## Options considered

Each realistic option with the one-or-two-line reason it lost. This section is the highest-value part of the record, because it is what stops the same alternative from being re-proposed a year later.

## Decision

What was decided, stated plainly.

## Consequences

What becomes easier, what becomes harder, and what future work this implies.
```

An accepted record is immutable. When a decision changes, write a new record explaining why, and flip the old record's `Status:` line to `Superseded by [NNNN](NNNN-the-new-record.md)`; that status line and the repair of a dead link's target are the only edits an accepted record may ever receive, and the docs audit decides the second, holding that the changed lines differ inside link targets alone and that every new target resolves. A defect found in a record after it merged stays, a wording, a figure or a mark of punctuation alike. A later record supersedes it where the defect changes what was decided, and nothing supersedes a wording, because a record is evidence of its day and never a precedent for new writing; the law a new record is held to is this rulebook's, not an older record's.

A dead end is written when its evidence arrives, not when work completes. A reverted approach leaves no bytes in the tree, so nothing else will remember it, and the finding is lost exactly when it is most worth keeping. Where the attempt cost real effort or could plausibly be retried, its record names the evidence that killed it, the condition that would reopen it, and the commit that held the attempt, which after the revert is the only surviving proof the attempt existed. Ordinary iteration earns no record; the test is whether someone might plausibly walk back in a month later.
