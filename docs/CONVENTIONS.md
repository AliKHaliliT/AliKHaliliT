# Documentation Conventions

This file is the rulebook for this project's technical documentation: which documents exist, what species each one is, how each species is written, and where a "why" belongs. It is normative and frozen: **do not modify this file**. If a rule ever has to change, the change is made deliberately, by the style's owner, inside the template itself in the My-Styles repository, and recorded as a new decision record superseding [0001](decisions/0001-adopt-the-documentation-system.md), which is also where the rationale behind this whole system lives. A project derived from this template never edits its copy of this file and never diverges from it, however much better a local rule looks from below; a case for changing a rule travels upstream through the report described in AGENTS.md, and the rule then changes for every project or for none.

## The two species of documents

Every technical document is exactly one of two species, and the species dictates all of its rules.

**Living documents** describe the present. They are edited in place, they are always current, and they are bounded in size. A living document never contains history: no dates, no "previously", no "we changed X to Y" narration. When reality changes, the document is rewritten to match it and the old text disappears; git remembers what it used to say. `AGENTS.md`, `STATE.md`, and `docs/ARCHITECTURE.md` are living documents.

**Records** describe one past event. A record is written once, dated, and never edited again. It is not updated to stay current, because its job is to remain an accurate account of a moment. When reality moves past a record, a new record is written that supersedes the old one. Everything under `docs/decisions/` is a record.

Nearly every documentation failure is a species violation. A history file that grows until it is unusable is record-species content forced into one ever-growing living file. An architecture document that rots is a living document treated as append-only. Never mix the two species in one file.

## The spine and the organic zone

Every project carries this fixed spine:

| Document | Species | Role |
| --- | --- | --- |
| `AGENTS.md` | Living | Vendor-neutral agent entry point: the operating manual and the single documentation index. |
| `STATE.md` | Living | Current project state: what is in flight, queued, deferred, or blocked. |
| `CHANGELOG.md` | Records | Curated per-release summary for consumers; present only where consumers upgrade through releases (the trigger lives in BASELINE.md). |
| `docs/ARCHITECTURE.md` | Living | The map of the system as it is today. |
| `docs/CONVENTIONS.md` | Living, frozen | This rulebook. |
| `docs/decisions/` | Records | The decision log; the durable home of rationale. |

Assistant-specific instruction files (a `CLAUDE.md`, a `GEMINI.md`, tool rule files) do not exist in this project. Every assistant reads `AGENTS.md` directly. If a tool ever genuinely cannot read `AGENTS.md`, it gets a one-line shim that does nothing but import or point to `AGENTS.md` in whatever include syntax the tool understands. A shim is not a document: it is not indexed, it carries no content of its own, and it never grows a second line.

Beyond the spine, documentation grows organically. Any further document the project needs is added under `docs/` (UPPERCASE markdown, one subject per file, one species per file) and registered in the index. Growth changes the number of documents, never the species rules of an existing one.

## The index contract

`AGENTS.md` holds the single index of all technical documents, each with a one-line description of what it contains and when to read it. A document that is not listed there does not exist. No reader can be expected to find it, and no agent will. Creating a document and registering it in the index happen in the same change, as does delisting on removal.

## Rules for living documents

- Present tense only; describe what is, never what was or how it got here.
- No dates and no changelog narration (`STATE.md` entries are the one exception; each carries an absolute date). A `STATE.md` date is the entry's last-verified stamp, not its birthday. Re-dating requires actually re-verifying the entry against the tree or the world; touching the text does not count. An entry older than 90 days is expired, meaning nothing may rely on it or repeat it until it is re-verified and then re-dated or removed, and the docs audit fails on it so the sweep cannot be forgotten.
- Record intent and decisions, never inventory the tree can answer. A premise like "the app has no icon of its own" is the tree's fact and rots silently the day someone adds one; state the wish and let the tree carry the facts.
- A sentence in a living document is a claim, not a fact. Verify a claim before relying on it or repeating it, and end every change by sweeping `STATE.md` for entries the change completed or invalidated. Both halves bind agents and humans alike.
- Rewrite in place; never append-and-preserve. Deleting stale text is the job; git is the archive.
- Size budgets come in two classes. `AGENTS.md` and `docs/ARCHITECTURE.md` grow with the system rather than against a number, since a manual and a map must cover whatever exists; they still say everything as briefly as it can be said, and an agent guide that keeps growing usually means the project's boundary was drawn too wide, which is a scoping problem no budget fixes. Every other living document is bounded at 150 lines, the docs audit fails one that exceeds its bound, and the remedy is fission, a split by subject into child documents, each registered in the index and each bounded itself. `README.md` stands outside both classes; its shape is governed by the README schema in BASELINE.md. Growth happens by fission, never by accretion.
- The mechanical half of freshness is checked rather than reviewed. The docs audit verifies that every repository path a living document names exists, that every relative link resolves, that no `STATE.md` entry has outlived its horizon, that no bounded document exceeds its budget, that every document under `docs/` is registered in the index, and that names and the STATE schema hold their shapes. Decision records are exempt from every rule in this section; they describe the past, which does not rot.

### The STATE.md schema

`STATE.md` has exactly four sections: `Now` (in flight), `Next` (queued), `Deferred` (consciously postponed), and `Blocked` (waiting on something external). An entry earns `Now` only while its work is genuinely unfinished, or while it names a condition future work must honor that no other document carries. Completing the work deletes the entry in the same change, and a narration of the landing never replaces it, because finished work is git's memory, not STATE.md's. Every entry is one line, ends with its last-verified date (YYYY-MM-DD), and is deleted, not struck through, when it no longer applies. The file is swept at both ends of every change. Before starting anything new, delete entries describing finished work and re-verify or delete any entry the tree no longer confirms. After finishing, sweep for entries the change completed or invalidated. The docs audit caps `Now` at five entries, so accretion fails the build instead of accumulating quietly. Re-verifying an entry means re-checking its claim or re-making its choice, never re-stamping; a `Deferred` or `Blocked` entry re-affirmed unchanged across several horizons is a decision record trying to be born, and moves there. After a long absence, expired stamps everywhere are the horizon working as intended, and the first task back is the sweep, not new work.

## Rules for records (decision records)

Write a decision record when a choice shapes future work and its reasoning would otherwise be lost: an architectural boundary, a convention, a rejected-but-tempting alternative, a reversal of an earlier decision. Records live in `docs/decisions/`, named `NNNN-short-kebab-title.md` with a zero-padded sequence number, and follow this template:

```markdown
# NNNN. Title stating the decision

Status: Accepted
Date: YYYY-MM-DD

## Context

The situation that forced a decision, and the constraints that shaped it.

## Options considered

Each realistic option with the one-or-two-line reason it lost. This section is the highest-value part of the record, because it is what stops the same alternative from being re-proposed a year later.

## Decision

What was decided, stated plainly.

## Consequences

What becomes easier, what becomes harder, and what future work this implies.
```

An accepted record is immutable. When a decision changes, write a new record explaining why, and flip the old record's `Status:` line to `Superseded by [NNNN](NNNN-the-new-record.md)`; that status line is the only edit an accepted record may ever receive.

## Where a "why" belongs

Rationale has exactly two homes here, chosen by reach:

1. A "why" that fits in a sentence or two and only explains one change goes in the **commit message body**.
2. A "why" that will shape future decisions, or that would be re-litigated without a record, becomes a **decision record**.

A changelog exists only where consumers upgrade through releases, so a project that versions none maintains none (the trigger lives in BASELINE.md). A versioned artifact, such as a packaged library, adds `CHANGELOG.md` as a third home, carrying the curated per-release summary for its consumers; it summarizes impact, not reasoning.

Chronology itself is never documented. Git already is the complete log, and any document that re-narrates it degenerates into a worse git log.

## Naming

Spine and organic technical documents use UPPERCASE basenames at predictable locations (`STATE.md`, `docs/ARCHITECTURE.md`), matching the ecosystem convention that uppercase markdown means "meta-document about the project". Decision records use `NNNN-short-kebab-title.md` because they are many, ordered, and cited by number.

## Code-level documentation

Doc comments are governed separately by the TSDoc convention in the [README's Conventions section](../README.md#conventions): one-sentence summaries on every export, the `@param`/`@returns`/`@throws` trio on fully documented functions, direct-only `@throws`, and runnable `@example` blocks on complex components and services.

Test files stand outside the every-export rule, because a suite documents itself through the name of each case and the assertion it makes. A comment belongs in a test only where the reason a case exists is invisible from its name, as with a regression guard that should name the defect it pins.
