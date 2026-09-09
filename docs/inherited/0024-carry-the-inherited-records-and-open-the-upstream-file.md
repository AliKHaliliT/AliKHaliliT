# 0024. Carry the inherited records and open the upstream file

Status: Accepted
Date: 2026-09-09

## Context

The style moved eight commits past the pin this project carried, and the family
refuses ratcheting, so the wave lands complete or not at all. Three of those
commits reshape what a derived project holds. The template's own decision records
now travel as one `inherited/` folder under `docs/`, byte-identical at the pin, so
`docs/decisions/` holds this project's own decisions and nothing else. The
upstream report stops being a document written once and becomes `UPSTREAM.md`, a
living document with a fixed schema that also carries defects, meaning anything
worked around in template-owned bytes or behavior, and that resolves its own
entries at each re-alignment rather than waiting for a reply. The alignment pin
moves out of the README attribution onto that file's first line. The reasoning
lives in the style's records 0041 through 0050, once, and is not repeated here.

## Evidence

The re-copied audit reported one finding, the new upstream file unregistered in
the index, and passed once its row was added. The docs audit, lint, type-check,
the 130 suites, and the build all passed against the final tree. The advisory
spell check the style added runs `codespell` through `pipx`, which this machine
cannot run because its only Python is the Windows Store stub, so its first
findings are read from the CI log rather than locally.

## Options considered

- Keep the pin in the README attribution as well as the upstream file. Lost
  because two copies of one fact is the drift the single-source rule forbids, and
  the style moved the pin deliberately so a re-alignment reads and writes it in
  one place.
- Open the upstream file with `Nothing open.` Lost because it would have been
  false. Two waivers of style-owned rules already stand in this tree, and the new
  rule says a workaround of template-prescribed behavior earns an entry whatever
  its size and whether or not the child is sure it is a defect.
- Carry only the style's records this project cites. Lost because the folder is
  carried whole or it is not the template's folder; a subset would drift silently
  and the audit would not see it.

## Decision

Re-copy `docs/CONVENTIONS.md` and `scripts/audit-docs.mjs` from the style and
re-pin both in CI, and add the advisory spell check beside the prose grep. Carry
the style's fifty decision records into `docs/inherited/`, registered by one index
row and never edited here. Open `docs/UPSTREAM.md` with the alignment pin on its
first line and two honest entries, the decorative use of randomness that has to
waive the weak-randomness rule, and the advisory rules having nowhere to record a
dismissal. Rewrite the guide's upstream section to the new law, add Upstream
honesty to the delivery gate, carry the baseline's six README schema changes, and
replace the README's pin with the template attribution the schema now fixes.

## Consequences

This project now says out loud what it works around, and the two entries are
handed to the style at its next reading rather than living as comments in a lint
configuration. A number is unique within its folder, so the style's records and
this project's never collide, and a citation says whose record it holds by where
it sits. The pin has one home, and the next re-alignment starts by reading it and
ends by moving it.
