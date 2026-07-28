# 0001. Adopt the two-species documentation system

Status: Accepted
Date: 2026-07-18

## Context

The repository kept its guidance in a single `CLAUDE.md` plus a set of lowercase docs that
had drifted from the code more than once. The project is going public as a template that
other people and other agents will read and fork. There was no vendor-neutral entry point,
no live status board, no home for durable rationale, and no rule stopping history from
accreting inside documents that are supposed to describe only the present.

## Options considered

- **Keep `CLAUDE.md` as the single guide.** Rejected: it is tool-specific to one assistant,
  it had grown unbounded, and it mixed current rules with historical narration.
- **Add more ad hoc docs without a rulebook.** Rejected: the docs drifted before precisely
  because nothing defined document species, a size budget, or a discoverability index.
- **Adopt a two-species system with a fixed spine.** Chosen.

## Decision

Adopt the shared documentation system: `AGENTS.md` as the vendor-neutral entry point and the
single index, `STATE.md` for live status, a frozen `docs/CONVENTIONS.md` rulebook, decision
records for durable rationale, `CHANGELOG.md` for releases, and `BASELINE.md` for root-file
governance. Living documents are rewritten in place; records are
never edited. `CLAUDE.md` is removed entirely rather than left as a pointer shim, per the
owner's instruction. The full rules live in [../CONVENTIONS.md](../CONVENTIONS.md).

## Consequences

Every contributor, human or agent, has one entry point and one index. Living documents
cannot accrete history, and rationale now has a defined home by scope. A document that
outgrows its budget splits by fission. Harder: an assistant that auto-loads only `CLAUDE.md`
no longer picks up project instructions on its own and must be pointed at `AGENTS.md`; this
is the accepted cost of a vendor-neutral convention that works across tools. Contributors
must register each new document in the `AGENTS.md` index and keep `STATE.md` current.
