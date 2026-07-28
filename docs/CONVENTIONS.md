# Documentation Conventions

The rulebook for how this repository documents itself. It is frozen: never edit it to fit a
new document; change it only through a decision record that supersedes the relevant rule.
Everything here is inherited from a shared house style, with only truth-preserving edits for
this project's stack.

## The two species of documents

Every document is exactly one of two kinds, and the kind never mixes inside one file.

- A **living document** describes what is true now. It is rewritten in place as reality
  changes; the stale text is deleted, not struck through or preserved. It never contains
  history: no dates, no "previously", no "we changed X to Y". Git is the archive of what it
  used to say.
- A **record** is written once, dated, and never edited again (except a single status line).
  Its job is to remain an accurate account of a moment, so it must not be updated to stay
  current. Decision records and CHANGELOG entries are records.

The two failure modes this guards against: a record that keeps growing until it is an
unreadable log, and a living document that rots because nobody rewrites it.

## The spine and the organic zone

The **spine** is the fixed set of required documents, each with an assigned species:

| Document | Species | Purpose |
| -------- | ------- | ------- |
| `AGENTS.md` | living | The entry point and the single documentation index |
| `STATE.md` | living | Current status: Now, Next, Deferred, Blocked |
| `CHANGELOG.md` | records | Curated per-release summary for people who fork the template |
| `docs/BASELINE.md` | living | Which root files must exist, and the rules for changing them |
| `docs/ARCHITECTURE.md` | living | The system map as it exists today |
| `docs/CONVENTIONS.md` | living, frozen | This rulebook |
| `docs/decisions/` | records | Durable architectural and process rationale |

The **organic zone** is any further document under `docs/` (for example `THEMING.md`,
`CONTENT-MODEL.md`, `ROADMAP.md`, `SETUP.md`). Each such file covers one subject, declares
one species, uses an UPPERCASE Markdown filename, and is registered in the AGENTS.md index
in the same change that creates it.

## Size and growth

A document targets roughly 150 lines: one comfortable read. When a subject outgrows that,
it splits into a child document indexed separately. Growth happens by fission, never by
accretion. One subject per file; one species per file.

## The index contract

AGENTS.md holds the only index of technical documents, each with a one-line note on its
contents and when to read it. A document that is not listed there does not exist, because no
reader can be expected to find it. Registering happens with creation; delisting happens with
removal.

## Rules for records: decision records

A decision record captures a choice that shapes future work, or reasoning that would
otherwise be re-litigated later. It lives at `docs/decisions/NNNN-short-kebab-title.md` with
a zero-padded sequence number, and follows this template:

```markdown
# NNNN. Title stated as a noun phrase

Status: Accepted
Date: YYYY-MM-DD

## Context

The situation and constraints that forced a decision.

## Options considered

- **Option name.** One or two lines, with the reason it was rejected. This is the
  highest-value part of the record: it stops the rejected idea from being re-proposed.

## Decision

What was decided, stated plainly.

## Consequences

What becomes easier, what becomes harder, and what future work it implies.
```

A record is never edited after acceptance. When a later decision replaces it, only its
status line changes, to `Superseded by [NNNN](NNNN-title.md)`; the body stays as the
historical artifact. Records cite one another by relative link and number.

## The STATE.md schema

STATE.md is the one document in the spine permitted to carry dates. It has exactly four
level-2 sections, in order: `Now` (in flight), `Next` (queued and ready), `Deferred`
(consciously postponed), `Blocked` (waiting on something external). Each item is a single
dash bullet ending in an absolute date in parentheses, `(YYYY-MM-DD)`, which is the
recording date. An item is deleted when it no longer applies; finished work goes to git
history, not to a "Done" section. An empty section still shows a placeholder line.

## Where a rationale belongs

Rationale has exactly three homes, by scope:

- **The commit message body**, for a one-or-two-sentence reason explaining a single change.
- **A decision record**, for reasoning that shapes future decisions or would be
  re-litigated.
- **CHANGELOG.md**, for the consumer-facing "what changed and why it matters" of a release.

Chronology itself is never documented in prose: git already is the complete log. No document
re-narrates git history.

## Prose style

- **No em dashes anywhere.** Use a colon for an explanatory clause, a semicolon to join two
  independent clauses, or parentheses for an aside.
- Present tense and an objective register in living documents.
- Markdown is the universal format. Fenced blocks carry a language identifier; lists and
  fences are surrounded by blank lines (MD031, MD032, MD040).

## Code-level documentation

Code documents its public surface, not its internals. Exported functions, components, and
types whose failure modes or contracts are not obvious carry a short doc comment stating
what they do and what they assume; purely internal helpers keep a one-line summary at most.
Match the comment density of the surrounding file. A comment states a constraint the code
cannot show; it never narrates what the next line does or where the code came from.
