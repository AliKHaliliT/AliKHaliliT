# 0006. Track the refactored template

Status: Accepted
Date: 2026-08-04

## Context

This repository is a deployment of the VITA template rather than a fork of it, so the two share no git history and every template change has always been applied here by hand. That worked while changes were small and local, which is what the "Sync the ..." commits in this history are.

The template then changed shape rather than detail. Its source tree moved from folders grouped by technical kind to one-way sliced layers, the layer rule became machine-checked, the design tokens took semantic names in a two-layer structure keyed on a theme attribute, both ways into the record gained contract checks, the documentation rulebook became owned at the style level, and every export gained a doc comment. Applied one at a time, that is not a sync; it is the same refactor performed twice, with the second performance certain to drift from the first.

Staying behind was the other option and a worse one. The whole point of this repository is to be the template running on real data, so a deployment that lags the template stops being evidence that the template works.

## Options considered

- **Keep hand-applying changes one at a time.** Rejected: a structural refactor reapplied by hand diverges in the details that matter, and the layer rule is only worth having if it is the same rule.
- **Rebase this repository onto the template as a fork.** Rejected: the histories are unrelated, and this deployment's real record and profile README are not the template's, so a fork relationship would make every future update a conflict rather than a copy.
- **Take the template's source tree wholesale and re-apply this repository's own divergences.** Accepted.

## Decision

The template's refactored source tree, its suites, and its build and lint configuration are copied in whole. The record under `src/content/`, the assets, the profile README, the manifest's own scripts, and the deploy workflows stay as they are, because those are this deployment's and not the template's.

One divergence is re-applied deliberately after every such copy: the loader suite is adapted to the real record, where some collections are legitimately empty, so it asserts an array for every collection and items only for the populated ones. The template's version assumes the demo seed fills every folder and would fail here for a reason that is not a defect. That adaptation is now stated in AGENTS.md so it survives the next copy.

Two things this repository was behind on came along with the copy and are adopted rather than reverted: the palette now rides inside the portfolio snapshot, so an export carries the owner's look to the resume builder, and the palette module's own note about the editor having moved out to the admin panel is now accurate here too.

## Consequences

This deployment and the template are now the same application again, which is what makes it worth pointing at as proof the template works. A future template change of this size is a copy plus a re-application of the adaptation above, rather than a second refactor.

The cost is that the copy is wholesale, so anything this repository quietly changed in the shared source would have been overwritten by it. Nothing was, because the two trees were identical apart from the four files this record accounts for, but that is a fact about today rather than a guarantee. A deliberate local change to shared source has to be recorded here, or the next copy will silently take it away.
