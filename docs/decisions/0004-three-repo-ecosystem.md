# 0004. A three-repository ecosystem bridged by files

Status: Accepted
Date: 2026-07-24

## Context

The resume builder was already a self-contained in-repo app fed by an exported `portfolio.json`
(decision [0003](0003-self-contained-resume-builder.md)), and the admin panel was in-repo but
staged for its own extraction, importing the shared site core in the meantime. Keeping both
inside the site repo meant the published static site still carried editing machinery it never
runs (the rich-text editor stack, the export code, the builder's drag-and-drop), and every
"eventual extraction" note was debt that never came due. The site is going public as a
template, which is the moment to make the boundary real rather than aspirational.

## Options considered

- **Keep admin and builder in-repo, lazy-loaded.** Rejected: the published site ships and
  serves code no visitor uses, the "extract later" boundary keeps rotting, and a template
  fork inherits three apps when it wanted one.
- **One repo, multiple build targets (monorepo/workspaces).** Rejected: it couples release
  cadence and tooling across three apps that have no reason to move together, for a
  single-maintainer project; the coordination cost buys nothing here.
- **Three independent repositories bridged by files.** Chosen. It matches how the pieces
  already talked (seed files and `portfolio.json`), so extraction is a move, not a rewrite.

## Decision

VITA is three repositories: the public **site** (this repo), the **admin panel**, and the
**resume builder**. `src/admin/` and `src/resume/` are removed from this repo. The site ships
no editing machinery and depends on neither companion; the companions carry their own copies
of anything shared (content types, helpers, the portfolio contract). All coupling is by file:

- The admin panel produces the seed files under `src/content/` (content Markdown, `profile.md`,
  `site.json`, `palette.json`); publishing an edit is committing a file and rebuilding.
- The site exports `portfolio.json` (contract in `src/types/portfolio.ts`, builder
  `src/services/portfolioSnapshot.ts`, format `vita-portfolio`, versioned); the builder imports
  it. Each side keeps its own copy of the contract, and `format`/`version` keep them honest.

Dependencies only the extracted apps used (the Quill rich-text stack, Showdown, Turndown) are
dropped from the site's manifest.

## Consequences

Easier: the published bundle is smaller and contains only what a visitor renders; the template
fork gets a clean site; each app versions and deploys on its own. The "no personal strings in
source" rule now has teeth, since the only writer of owner data is a separate tool. Harder:
a change to the shared content model or the portfolio contract must be propagated to the
companion repos by hand, and there is no longer a compile-time check that the builder accepts
the site's export, only the shape assertions in `portfolioSnapshot.test.ts`. Editing the live
site now requires the companion admin panel rather than a built-in `/admin` route.
