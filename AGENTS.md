# VITA · Ali's deployment

This repository is Ali Khalili's personal deployment of the
[VITA template](https://github.com/AliKHaliliT/VITA), the same app seeded with the real
record instead of the demo. React and Vite, deployed statically to GitHub Pages. Content
is Markdown files bundled at build time, with no server and no database. The README is
Ali's GitHub profile page and is not governed by the template's README rules; touch it
only on Ali's explicit request. This guide, [docs/RULES.md](docs/RULES.md),
[docs/CONDUCT.md](docs/CONDUCT.md) and [docs/LANDING.md](docs/LANDING.md) are read to
their ends before any work, and so are the rulebook, the gate, the state file, the map,
the ledger and the baseline where the work touches what they govern; a document is read
whole, never by its first and last lines, and the index below names every other document
and when it is read.

This deployment follows the VITA template, which follows the Helm client style in the
[My-Styles](https://github.com/AliKHaliliT/My-Styles) repository. An improvement or a
workaround the work here surfaces goes upstream as [docs/REPORTING.md](docs/REPORTING.md)
describes, to the template for app-shaped ones and to My-Styles for style-shaped ones.
Improvements travel the other way too. This repository is a deployment rather than a fork of
a fork, so template changes are applied here deliberately, and a commit that does so says
which template change it carries.

## Documentation index

This is the single index of the project's technical documentation. A document that is not
listed here does not exist as far as this project is concerned: when you create a
document, register it here in the same change; when you remove one, delist it here. The
README is absent from this table on purpose, because it is the GitHub profile page rather
than a document about this project (see [docs/BASELINE.md](docs/BASELINE.md)).

| Document | What it is and when to read it |
| --- | --- |
| [STATE.md](STATE.md) | Living project state (Now / Next / Deferred / Blocked). Read first, always. |
| [docs/RULES.md](docs/RULES.md) | The hard rules of the tree, what its code, checks and records must satisfy. Frozen; do not edit. Read whole before any work. |
| [docs/CONDUCT.md](docs/CONDUCT.md) | The hard rules of conduct, how a worker reads, writes, pauses and speaks in this tree. Frozen; do not edit. Read whole before any work. |
| [docs/LANDING.md](docs/LANDING.md) | The hard rules of landing, how a change travels from its branch to main. Frozen; do not edit. Read whole before any work. |
| [docs/GATE.md](docs/GATE.md) | The delivery gate, the closed list a change is weighed against before it is delivered. Frozen; do not edit. Read before delivering any change. |
| [docs/ADOPTION.md](docs/ADOPTION.md) | Adopting this style, how an existing repository comes under the law and how a child re-aligns. Frozen; do not edit. Read when adopting or re-aligning. |
| [docs/REPORTING.md](docs/REPORTING.md) | The upstream report, what a project sends its template, in what shape, and how an entry is resolved. Frozen; do not edit. Read before writing an upstream entry. |
| [docs/EDITIONS.md](docs/EDITIONS.md) | Editions, the tiers a project is published at and the two versions of a tier, with the style named or not. Frozen; do not edit. Read before any part of the project is made public. |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | The annotated map of the whole site. Read before any structural change. |
| [docs/INVARIANTS.md](docs/INVARIANTS.md) | What must stay true about the site, one row per claim with the holder that refuses a violation and the rung that says what its green is worth. Read before changing what the site promises; a change to a claim changes its row. |
| [docs/CONVENTIONS.md](docs/CONVENTIONS.md) | The documentation rulebook's core: document species, the spine, the index contract, naming and code-level documentation; its parts are the rows below. Frozen; do not edit. Read before writing or changing any documentation. |
| [docs/LIVING.md](docs/LIVING.md) | The rulebook's rules for living documents and the invariants ledger. Frozen; do not edit. Read before writing or changing a living document. |
| [docs/RECORDS.md](docs/RECORDS.md) | The rulebook's rules for decision records. Frozen; do not edit. Read before writing a record. |
| [docs/PROSE.md](docs/PROSE.md) | The prose law, the rulebook's rules for every tracked byte of prose. Frozen; do not edit. Read before writing prose. |
| [docs/BASELINE.md](docs/BASELINE.md) | The repository baseline: always-present files, never-tracked files, and their modification rules. Read before adding, removing, or reshaping root-level or dot files. |
| [docs/UPSTREAM.md](docs/UPSTREAM.md) | What is pending between this project and its style: the alignment pin and every open improvement or workaround. Read before writing an upstream entry. |
| [docs/THEMING.md](docs/THEMING.md) | The design language: tokens, palettes, type, and motion. Read before touching any of them. |
| [docs/CONTENT-MODEL.md](docs/CONTENT-MODEL.md) | The content model's door: shared fields, frontmatter conventions, and the map of the per-subject schema files. |
| [docs/CONTENT-PROFILE.md](docs/CONTENT-PROFILE.md) | Field schema of the owner profile. |
| [docs/CONTENT-CAREER.md](docs/CONTENT-CAREER.md) | Field schemas of the career ledgers. |
| [docs/CONTENT-COMMUNITY.md](docs/CONTENT-COMMUNITY.md) | Field schemas of the community and credential ledgers. |
| [docs/CONTENT-GARDEN.md](docs/CONTENT-GARDEN.md) | Field schemas of the garden and writing ledgers. |
| [docs/CONTENT-LIBRARY.md](docs/CONTENT-LIBRARY.md) | Field schemas of the library's shelves (books and media), plus the status-stage heuristic. |
| [docs/CONTENT-TRAVEL.md](docs/CONTENT-TRAVEL.md) | Field schemas of the travel ledgers. |
| [docs/ROADMAP.md](docs/ROADMAP.md) | The feature landscape and standing technical debt. |
| [docs/SETUP.md](docs/SETUP.md) | First-time environment setup and the GitHub Pages deploy. |
| [docs/inherited/](docs/inherited/) | The style's own decision records, carried whole at the alignment pin and never edited here. Read one before proposing a rule the style may already have ruled on. |
| [docs/decisions/](docs/decisions/) | Immutable decision records holding the project's "why". Read the relevant record before revisiting a settled topic; never edit an accepted record beyond its status line and a dead link's target. |

There are no assistant-specific instruction files. Every assistant reads this file
directly. If a tool genuinely cannot read AGENTS.md, give it a one-line shim that imports
or points to this file and nothing more.

## Commands

| Command | Purpose |
| ------- | ------- |
| `npm install` | Install dependencies |
| `npm run dev` | Vite dev server with hot reload (port 3000, strict) |
| `npm run build` | Type-check then production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Vitest characterization suites, in a shuffled order under a seed the run prints |
| `npm run lint` | ESLint, which holds the layer rule and the function-shape limits |
| `npm run docs` | The living documents against the tree and the calendar |
| `npm run docs:selftest` | Every rule of the docs audit against a planted defect, since a check that never fires and a check that cannot fire look identical |
| `npm run edition -- hand-made <destination>` | Cut an edition, the tree a public repository receives, at a tier and in a version [docs/EDITIONS.md](docs/EDITIONS.md) defines; `--silent` cuts the version that names nothing of the style |
| `npm run edition:selftest` | Prove the edition tool, every tier and version cut from a project of the tool's own making |
| `npm run typecheck` | Type-check all projects (the root tsconfig is solution-style; a plain `tsc --noEmit` checks nothing) |
| `npm run icon -- <size>` | Render the pixel-mark to PNG (`--theme dark`, `--bg "#hex"`, `--out dir`) |
| `npm run profile-art` | Rebuild the profile README's SVG art into `util_resources/readme/` |

Run `npm test` after touching the record's `seed`, `store`, or `schema`, or the portfolio
`snapshot`, because those suites pin parsing, sorting, the localStorage fallback, the
record contract, and the export contract. Two suites are adapted to the real record. The
loader suite asserts an array for every collection and items only for the populated ones,
since some collections here are legitimately empty, and the shelf suite expects each shelf
in collection order, since this deployment seeds no ordering. Do not replace either with
the template's version, which assumes the demo seed.

The checks report at two levels. A failure is a verdict, it stops the command, and it
means a rule the tool fully decides has been broken. A warning is advice, it leaves the
exit status clean, and it comes from a check that cannot decide its own question and so is
not allowed to gate. Advice is not noise and not optional reading. Every warning is looked
at and then either fixed or dismissed in writing in the commit message of the change that
produced it, so the judgment outlives the run that asked for it, and a warning is never
silenced with a suppression comment to make a run look clean. A finding printed on every
run by design, like a review row of the invariants ledger, was answered by the record that
made it so and needs no repetition. The advisory checks here are the credential and
regular-expression heuristics in the lint configuration, which guess from the shape of a
string or a pattern and are wrong often enough that they cannot be a gate, the dependency
audit, run as `npm audit` over the tree the lock installs, whose verdict follows the
advisories the registry has published by the day it runs and so changes with no change to
the tree, which is why it advises and a finding is review's to fix or dismiss in writing,
the docs audit's vocabulary advisory, which reads an honest domain term the same as a tell
and so advises for review, its spelling advisory, which runs where codespell is installed
over the files git tracks and no other, reads the project's own terms from
`.codespellignore`, and names itself as not run elsewhere, and its form advisory, which
counts the references a prose paragraph names and cannot tell an enumeration from an
argument, so it advises a list or a table and gates nothing. Its splice advisory names a
colon that opens a lowercase clause in a record main does not hold yet, because a list
colon and a spliced one look alike to a machine, and it falls silent once the record has
landed, since a defect found in a merged record stays. A check the tree gave nothing to
run is named as not run, with what it needs, so a clean verdict never hides a check that
never looked.
