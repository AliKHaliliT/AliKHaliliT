# 0003. The resume builder is a self-contained app with a file bridge

Status: Superseded by [0004](0004-three-repo-ecosystem.md)
Date: 2026-07-18

## Context

The resume and CV builder is headed for its own repository, the same path the admin will
take. While it lived inside the admin it read live site content through `ContentService`,
which will not exist once it moves out. The move needs to happen in a way that leaves nothing
to untangle later.

## Options considered

- **Keep it as an admin tab reading `ContentService`.** Rejected: it couples the builder to
  the site's runtime, so it cannot move cleanly.
- **Share the content types and helpers by import.** Rejected: any shared import is a tie
  that must be severed at extraction time; the owner chose to copy shared files instead.
- **A fully self-contained `src/resume/` fed by an exported file.** Chosen.

## Decision

`src/resume/` imports only npm packages, never anything from the rest of `src/`; it carries
its own copies of `cn`, `safeSetItem`, the localStorage test mock, and a versioned portfolio
contract. The bridge is a file: the site exports `portfolio.json` (format `vita-portfolio`,
versioned) from Admin, Settings, and the builder imports and validates it, persisting it
under `os_resume_portfolio`. No import means blank documents and disabled sync. Both sides
keep their own copy of the contract; `format` and `version` keep them honest. Details in
[../ARCHITECTURE.md](../ARCHITECTURE.md).

## Consequences

Extraction later is copying the folder plus repo scaffolding, with a single cross-contract
test assertion to drop; nothing else ties the builder to the site. The builder behaves
identically whether embedded or standalone. Harder: two copies of the contract can drift, so
a test cross-checks that the site's export passes the builder's validator, and there is no
live content, so an export and import step is required to move data across.
