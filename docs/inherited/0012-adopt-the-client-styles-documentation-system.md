# 0012. Adopt the client style's documentation system

Status: Accepted
Date: 2026-08-04

## Context

The documentation system adopted in [0001](0001-adopt-the-documentation-system.md) was assembled before the style family had a client template. Its rulebook was adapted by hand from the package template's rulebook, which left this project holding a private variant of a file the family treats as frozen. The variant carried real divergences, not just different words. It defined the changelog's audience as people who fork the template, where the style's rule keys the changelog to consumers who upgrade through releases, and this project versions no releases, so its changelog had accumulated only an ever-growing Unreleased section, which is the second-history-file failure mode the species rules exist to prevent. The index table carried an extra species column the style does not use, and nothing anywhere said who owns the rulebook, so the copy could drift while appearing authoritative.

The Helm template now exists, states the client form, and owns its rulebook at the style level. A derived project holding an adapted rulebook is exactly the divergence that ownership rule forbids.

## Options considered

- **Keep the adapted system and document the differences.** Rejected: a documented divergence in a frozen file is still a divergence, and every future alignment would re-litigate whose wording wins.
- **Keep the changelog under the fork-audience definition.** Rejected: that definition lived only in the local variant of the rulebook, the project has no releases for anyone to upgrade through, and the file's own content had already degenerated into an unreleased history pile.
- **Adopt the style's system wholesale.** Accepted.

## Decision

The rulebook is replaced with a byte-identical copy of the Helm template's `docs/CONVENTIONS.md`, which is instance-neutral by the style's own decision and owned at the style level; this project never edits it again. `CHANGELOG.md` is removed, because the baseline trigger for it (a versioned package that consumers upgrade through) is not met; its content remains in git history. The documentation index takes the style's two-column shape, AGENTS.md gains the upstream-report path for improvements that belong to the style, and the baseline is rewritten to the style's text with this project's own truths (the Pages deploy workflows, the icon exports, the browser-automation scratch) carried over.

This record supersedes [0001](0001-adopt-the-documentation-system.md): the system it adopted remains, but its grounding, its rulebook, and its changelog clause are replaced by the style's.

## Consequences

The rulebook can now be diffed against the template's byte for byte, so "is this project aligned" stops being a judgment call. Whether a changelog exists is answered by the baseline trigger rather than by a local redefinition of the audience, and future rule changes arrive by pulling the template's rulebook rather than by editing here. The cost is that this project gave up the authority to tune the rulebook to itself, which is the point: a genuinely needed change now travels through the upstream report and lands for every project or for none.
