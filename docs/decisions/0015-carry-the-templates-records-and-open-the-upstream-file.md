# 0015. Carry the template's records and open the upstream file

Status: Accepted
Date: 2026-09-09

## Context

The style moved eight commits past the pin this deployment carried, and the
family refuses ratcheting, so the wave lands complete or not at all. Three of
those commits reshape what a derived project holds. The template's own decision
records now travel as one `inherited/` folder under `docs/`, byte-identical at
the pin, leaving `docs/decisions/` for this deployment's own choices alone. The
upstream report becomes `UPSTREAM.md`, a living document with a fixed schema that
carries defects as well as improvements and resolves its own entries at each
re-alignment rather than waiting for a reply. The alignment pin moves onto that
file's first line. The template landed the same wave in its decision 0024; this
repository carries that template change, as its charter requires a deployment
commit to say. The reasoning lives in the style's records 0041 through 0050,
once, and is not repeated here.

## Evidence

The re-copied audit passed against the final tree once the two new index rows
were added, and so did lint, the type-check, the 129 suites, and the build. The
sweep the re-alignment requires compared this repository's lint selection against
the style's rule by rule and found no rule held here that the style lacks. The
advisory spell check the style added runs `codespell` through `pipx`, which this
machine cannot run because its only Python is the Windows Store stub, so its
first findings are read from the CI log rather than locally.

## Options considered

- Carry the style's own fifty records in `inherited/` rather than the template's
  twenty-four. Lost because this repository's template is VITA, not Helm, and the
  folder exists so a writer can check what their own template already ruled on;
  the style's records sit one link further up, inside the template's own
  inherited folder, for anyone who needs them.
- Put the pin in the README beside the template link. Lost because this README is
  the GitHub profile page and the baseline exempts it from the schema, which is
  exactly why the pin needed a home of its own; the upstream file is now it.
- Open the file with an entry for the ambient canvas waiving the weak-randomness
  rule. Lost because that waiver lives in the template's own lint configuration
  and the template has already reported it upstream; this deployment inherits it
  rather than working around anything, and reporting it again would be noise.

## Decision

Re-copy `docs/CONVENTIONS.md` and `scripts/audit-docs.mjs` from the style and
re-pin both in CI, and add the advisory spell check beside the prose grep. Carry
the template's twenty-four decision records into `docs/inherited/`, registered by
one index row and never edited here. Open `docs/UPSTREAM.md` with the alignment
pin on its first line and the words `Nothing open.`, since the adaptations this
repository holds, the real record in place of the demo seed and the loader suite
that follows it, are ones the template asks a deployment to make. Rewrite the
guide's upstream section to the new law, naming both roads, and add Upstream
honesty to the delivery gate.

## Consequences

The pin is written down for the first time in a file rather than living in a
decision record's prose, so a re-alignment reads and moves it in one place. The
inherited folder makes the template's reasoning readable here without a network
round trip, at the cost of twenty-four files that must be recopied whole at every
re-alignment rather than edited.
