# 0008. Align with the delivery gate and the tightened enforcement

Status: Accepted
Date: 2026-08-18

## Context

The style moved several times after this project last aligned with it, and the changes were not local polish. The Helm template gained a delivery gate, a list of named items every change is weighed against before it counts as delivered. It sharpened what `Now` means in a STATE file, because the section had been accreting narrations of finished work in the style and in every project derived from it, this one included. It tightened enforcement after a review found that the system checked everything except itself. And it ruled on two performance questions, one about growth rates and one about when speed is worth buying.

This project carried the older form of all of it. Its STATE file held ten entries under `Now`, none of which described unfinished work; each was a report of something already landed, which is precisely the disease the style's ruling names. Its agent guide had no gate at all, so the judgment half of the family's law was carried nowhere. Its CI pinned the rulebook's hash but not the hash of the audit script that does the checking, which leaves the checker editable by the project it judges. Its workflows referenced actions by moving tags, so a compromised tag would have run here with no signal.

## Options considered

- **Adopt only the parts that cost nothing here.** Rejected: the family refuses ratcheting, which is applying a new rule to touched code only, because two coexisting standards is drift by another name. A wave lands whole or it is not a wave.
- **Wait for the next feature change and align alongside it.** Rejected: an alignment folded into feature work hides which change caused what, and the gate's two-hats item forbids exactly that mixing.
- **Restate the style's reasoning in this project's records.** Rejected: the reasoning is the style's and belongs there once. This record states what landed here and points upstream for why.
- **Align wholesale in one dedicated change.** Accepted.

## Decision

The frozen rulebook is refreshed to a byte-identical copy of the style's, and its pin updates with it. The delivery gate is carried verbatim in AGENTS.md, eighteen items, because the gate is shared law and a locally reworded copy is a fork of it. The STATE discipline is adopted in the hard rules and applied at once: `Now` holds only genuinely unfinished work or a condition no other document carries, completing work deletes its entry rather than replacing it with a narration of the landing, and the file is swept at both ends of every change. The audit script now caps `Now` at five entries, so accretion fails the build instead of accumulating quietly.

Enforcement gains four guards. The audit script is pinned beside the rulebook, and both pins are checked before the audit runs, because a checker the checked project can edit is no checker at all. Every action in every workflow is pinned by commit rather than by tag. Secret scanning runs over the full history. A grep bans module mocking, so the test contract's substitution rule is machine-held rather than remembered.

Two rulings arrive as lint at no new cost beyond one development dependency. A local assigned and immediately returned is forbidden, and a regular expression that can backtrack exponentially is forbidden, the second being the same accident one level down. The gate's growth-honesty item carries the judgment half, since what a loop's cost grows with is visible in the code and invisible to any measurement taken on today's data.

The reasoning for all of it lives in the style's decision records, 0018 through 0023 in Helm.

## Consequences

This project is level with the style again, and the parts of the family's law that were carried by memory here are now carried by text or by a check. The STATE file lost thirty-five lines of finished work, which git still holds, and what remains is short enough to be read before every change rather than skimmed. The two new pins mean a future style move turns this project's CI red until the alignment runs, which is the intended signal and not a defect. Nothing in this project's own form changed, because the style's law governs shape and process, never the subject this project serves.

The code was weighed against the two new items, not only the documents. Growth honesty found one accident: the search modal looked up each result's position by scanning the flat result list once per rendered row, so the render cost grew with the square of the result count where a single pass places every result. It is one pass now, and the fix needed no measurement, because a growth rate is visible in the code and a measurement taken on today's content would have reported both forms as instant. The measured line binds the changes that come next rather than demanding a retroactive measurement for choices already made, so it produced nothing to repair here.
