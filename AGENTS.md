# VITA · Ali's deployment

This repository is Ali Khalili's personal deployment of the
[VITA template](https://github.com/AliKHaliliT/VITA): the same app, seeded with the real
record instead of the demo. React and Vite, deployed statically to GitHub Pages. Content
is Markdown files bundled at build time: no server, no database.

This file is the single entry point for any contributor, human or agent. Read
[STATE.md](STATE.md) first to learn what is in flight, then this file for the rules, then
the indexed document that covers whatever you are about to touch. The README is Ali's
GitHub profile page and is not governed by the template's README rules; touch it only on
Ali's explicit request.

## Commands

| Command | Purpose |
| ------- | ------- |
| `npm install` | Install dependencies |
| `npm run dev` | Vite dev server with hot reload (port 3000, strict) |
| `npm run build` | Type-check then production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Vitest characterization suites |
| `npm run lint` | ESLint |
| `npm run docs` | The living documents against the tree and the calendar |
| `npm run typecheck` | Type-check all projects (the root tsconfig is solution-style; a plain `tsc --noEmit` checks nothing) |
| `npm run icon -- <size>` | Render the pixel-mark to PNG (`--theme dark`, `--bg "#hex"`, `--out dir`) |
| `npm run profile-art` | Rebuild the profile README's SVG art into `util_resources/readme/` |

Run `npm test` after touching the record's `seed`, `store`, or `schema`, or the portfolio
`snapshot`: those suites pin parsing, sorting, localStorage fallback, the record contract,
and the export contract. The loader suite is adapted to the real record, where some
collections are legitimately empty, so it asserts an array for every collection and items
only for the populated ones. Do not replace it with the template's version, which assumes
the demo seed fills every folder.

The checks report at two levels. A failure is a verdict, it stops the command, and it
means a rule the tool fully decides has been broken. A warning is advice, it leaves the
exit status clean, and it comes from a check that cannot decide its own question and so
is not allowed to gate. Advice is not noise and not optional reading. Every warning is
looked at and then either fixed or dismissed in writing, in the change that produced it,
and a warning is never silenced with a suppression comment to make a run look clean. The
advisory checks here are the credential and regular-expression heuristics in the lint
configuration, which guess from the shape of a string or a pattern and are wrong often
enough that they cannot be a gate, and the prose-vocabulary grep in CI, which reads an
honest domain term the same as a tell and so advises for review.

## Hard rules

These are non-negotiable. Depth lives in the indexed documents; this is the checklist.

- **This is the real record.** Every content file under `src/content/` is Ali's actual
  life data. Never replace it with demo content and never invent entries. A short list of
  confidential projects stays permanently off the site; the names live in the untracked
  `LOCAL.md`.
- **An em dash is legal where it clearly beats the comma, the parenthesis, or the period
  it replaces**, and it counts as its paragraph's one flourish. A tracked file carries at
  most two; CI counts that boundary, while the judgment of fit and commit messages stay
  with review.
- **Commit history speaks in the owner's voice alone.** No attribution trailers, no
  Co-Authored-By lines, nothing naming a tool or an assistant in a commit message. Held in
  review, like every commit-message rule.
- **A check may never imply more than it decides.** A green run is a claim, so a check is
  named for the question it actually settles, and a check that cannot settle its question
  advises rather than gates. Whatever it leaves undecided is stated beside the rule as
  review's work, never left to look automated, because the half no tool reaches is the
  half that rots and it rots faster behind a passing signal. This is why the family
  carries no coverage threshold, no maturity score, and no metric standing in for a rule
  it cannot decide.
- **A check that makes a worker damage the work is worse than no check.** When a rule
  fights something real, neither bend the work to earn a green run nor rewrite the rule.
  Pause the work in a state it can resume from, report the conflict, propose the change,
  and wait for the owner's explicit approval, because a rule change slipped into a busy
  diff is a decision nobody made. A length rule cuts filler and never information, a
  repair is verified for its side effects rather than for its intent, and a warning is
  answered rather than avoided, since an advisory a worker silences has become a gate.
- **A completeness claim names its boundary.** Saying that every caller was updated or
  every usage fixed is a fact only when it names the enumerable list it exhausted, a grep,
  a file list, a suite run, that a reader can re-derive. A claim over a region the
  claimant drew itself, such as every edge case considered, is offered as judgment rather
  than fact, because no boundary exists for it to have reached and the claim reports only
  that the claimant stopped finding things. Review probes the second kind, and trusts the
  first only as far as its boundary reaches.
- **A rule binds only where its own text claims to bind.** A length budget governs the
  document whose budget it is, the prose law governs a tracked byte, and a stage's cap
  governs that stage; outside that reach a rule does not apply at all. So nothing is spent
  applying a convention to material it never named, such as trimming or restyling an
  untracked working file that will never ship, and a count taken of such material is a
  measurement rather than a finding to fix.
- **A STATE entry is a claim, not a fact.** Its date is a last-verified stamp with a
  90-day expiry the docs audit enforces in CI. Read STATE.md before starting work, and
  sweep it before starting anything new, deleting every entry that describes finished work
  and re-verifying or deleting any entry the tree no longer confirms. An entry earns Now
  only while its work is genuinely unfinished. Completing work deletes its entry in the
  same change and never replaces it with a narration of the landing, and every change ends
  with a sweep for entries it completed or invalidated, agent and human alike.
- **All prose must read as if a person wrote it.** Never write the clause-colon splice, a
  sentence shaped as claim, colon, elaboration; in prose a colon may only introduce a
  list, a quote, or a label. The softer language-model tells (balanced semicolon
  antitheses, triadic lists, not-X-but-Y reversals) are fine one at a time and forbidden
  stacked, so allow at most one flourish per paragraph and keep the rest plain declarative
  sentences. The full catalog of tells, the vocabulary, and the portability test live in
  the rulebook's Prose section ([docs/CONVENTIONS.md](docs/CONVENTIONS.md#prose)).
- **Every tracked byte is public prose.** Confidential facts, private repository names,
  deployment details, and the description of what was withheld and why never enter a
  tracked file or a commit message, even in a private repository, because visibility can
  flip and history is permanent. Such context goes to the untracked `LOCAL.md` at the root
  (see [docs/BASELINE.md](docs/BASELINE.md)); read it when it exists, create it when first
  needed, and when unsure whether a fact is sensitive, ask the owner instead of recording
  it.
- **The layer rule is absolute.** Imports point downward through
  `app -> pages -> features -> entities -> shared`, never up or sideways. A slice is
  entered only through its `index.ts` (suites excepted), same-layer slices never import
  each other, and a concern spanning two slices moves up a layer. ESLint checks this, so a
  violation fails `npm run lint` rather than surviving review.
- **Content is checked at the door.** Everything entering the record passes through
  `entities/record/schema.ts`; never widen a type with a cast to make a value fit. A bad
  markdown file fails with its path named, and a bad localStorage override falls back to
  the committed record with the key to clear named.
- **The environment is read only through `shared/config`.** No other module touches
  `import.meta.env`.
- **Suites mirror the source tree and substitute only at a seam.** One suite per unit under
  test, at the matching path beneath `tests/`. A collaborator is replaced at an architectural
  seam, by a hand-written fake satisfying the contract it stands in for, and never by mocking a
  module's internals, because a test bound to an implementation voids the substitutability the
  layers exist to provide while still passing green. No coverage threshold is imposed, so
  breadth stays a judgment call while placement and substitution do not. See
  [decision 0007](docs/decisions/0007-adopt-the-styles-test-contract.md).
- **Follow the doc-comment convention** in the [template's Conventions section](https://github.com/AliKHaliliT/VITA#conventions)
  and the documentation rules in [docs/CONVENTIONS.md](docs/CONVENTIONS.md); the latter is
  frozen and must not be edited.
- **The documentation rulebook is owned by the style.** [docs/CONVENTIONS.md](docs/CONVENTIONS.md)
  changes only in the Helm template inside the My-Styles repository, never here, and this
  deployment never diverges from its copy. A rule believed wrong or missing goes upstream
  instead (see [The upstream report](#the-upstream-report)).
- **Motion runs behind `LazyMotion` strict** (`domAnimation` features): always import and
  use `m.` from framer-motion, never `motion.`. See [docs/THEMING.md](docs/THEMING.md).
- **Colors come only from the token utilities** defined in `src/app/styles/tokens.css`
  (`bg-surface`, `text-ink`, `border-line`, `text-signal`, and so on). Never hardcode a
  color, never reach for a raw palette class, and never spell a token the long way as
  `bg-[var(--surface)]`; a composite value such as a `color-mix()` is the only place the
  variable itself appears. See [docs/THEMING.md](docs/THEMING.md).
- **No personal strings in source code.** Owner data lives only under `src/content/`.
- **Content types map one-to-one** to a folder, an interface, and a glob entry: see
  [docs/CONTENT-MODEL.md](docs/CONTENT-MODEL.md).
- **Never use `type` as a frontmatter key** (it collides with the internal `ContentType`
  field); the `posts` type is the exception, remapped to `postType` in the loader.
- **Ecosystem boundary.** The admin panel (TABULARIUM) and the resume builder (EPITOMA)
  are separate repos; they share with this app by copying, never by importing, and the
  bridges are files (seed content in, `portfolio.json` out).
- **Markdown formatting.** Every fenced block gets a language identifier; lists and fences
  are surrounded by blank lines (MD031, MD032, MD040).

## The delivery gate

A task is not delivered while the gate below has findings. Carry these items from the first line written, because they are cheapest to satisfy while the code is still forming and most expensive as after-the-fact repairs; the closing pass exists to confirm, not to redo.

Closing a task follows one loop: run the checking commands above, weigh the change against every item below, fix what an item names, and repeat. One pass with no findings ends the loop. A finding is a concrete disagreement with a listed item, never general unease; the list is closed, and nothing outside it may generate rework. If the same finding survives three honest fix attempts, stop looping, record the finding and the attempts in STATE.md, and say so plainly when delivering. The names below index a wider literature; where a name's common usage and the rule beside it differ, the rule governs.

- **Cognitive load**: nothing in the change is harder to hold in mind than the task requires.
- **Granularity**: the size of every new unit (function, file, document, the change itself) is a choice, not an accident.
- **Growth honesty**: what each loop's or query's cost grows with is a choice, not an accident, and no change buys a worse growth rate where a construction of equal effort exists.
- **Ubiquitous language**: new names use the vocabulary the tree already speaks.
- **Single source of truth**: the change introduces no second copy of any fact, and anything derived points at its source.
- **Least privilege and surface**: nothing gains more access, exports, or dependencies than the task needs.
- **Adversary honesty**: every change that creates or moves a trust boundary names who it is meant to withstand, and deciding that nobody is attacking it is a decision to write down rather than an assumption to leave implicit.
- **Boundary honesty**: no data crosses a boundary unchecked, and checking happens at the door, once.
- **Loud failure**: every new failure path raises a typed error; nothing is swallowed or silently defaulted.
- **Two hats**: shape changes and behavior changes are separate steps, and no incidental reformatting rides along.
- **Waste**: nothing speculative and nothing the change orphaned is left behind.
- **The measured line**: nothing is made faster without a measurement that demanded it, and every optimization that lands records its measurement and its price.
- **Test honesty**: substitutes stand in only at the declared seams, and time, randomness, and order are controlled.
- **Point-of-use truth**: the doc comment or docstring each export carries is true, not merely present.
- **Intent-split placement**: every documentation change lands in the document whose reader it serves, per the rulebook's species.
- **Decision records**: any choice made here that would be re-litigated without a record gets one now.
- **Debt**: every shortcut taken is written in STATE.md before delivery, never carried in memory.
- **The commands**: every checking command above has passed against the final state of the tree, and every advisory finding printed along the way has been read and then fixed or dismissed in writing.
- **The hard rules**: the change disagrees with no review-held clause of this guide's Hard rules, re-read now, not recalled.

## The upstream report

This deployment follows the [VITA template](https://github.com/AliKHaliliT/VITA), which
follows the Helm client style in the [My-Styles](https://github.com/AliKHaliliT/My-Styles)
repository, and the rulebook both live under is owned there. When work here surfaces
something the template or the style should have had, the improvement is not kept as a local
advantage. Check the decision records upstream first, and if the idea was already considered
and rejected there, drop it unless new evidence exists. Otherwise write a self-contained
report entry stating what the improvement is, how it surfaced, why it is believed better
than what the template does today, and that the upstream logs hold no prior ruling, and
close it by telling the receiver to verify the claim with research before adopting it. Then
send it upstream, to the template for app-shaped improvements and to My-Styles for
style-shaped ones. The full workflow, including the qualification gate and the final
alignment check that follows integration, is defined in the style's AGENTS.md.

Improvements travel in the other direction too. This repository is a deployment rather than
a fork of a fork, so template changes are applied here deliberately, and a commit that does
so says which template change it carries.

## Documentation index

This is the single index of the project's technical documentation. A document that is not
listed here does not exist as far as this project is concerned: when you create a document,
register it here in the same change; when you remove one, delist it here. The README is
absent from this table on purpose, because it is the GitHub profile page rather than a
document about this project (see [docs/BASELINE.md](docs/BASELINE.md)).

| Document | What it is and when to read it |
| --- | --- |
| [STATE.md](STATE.md) | Living project state (Now / Next / Deferred / Blocked). Read first, always. |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | The annotated map of the whole site. Read before any structural change. |
| [docs/CONVENTIONS.md](docs/CONVENTIONS.md) | The documentation rulebook: document species, schemas, naming. Frozen; owned by the style. Read before writing or changing any documentation. |
| [docs/BASELINE.md](docs/BASELINE.md) | The repository baseline: always-present files, never-tracked files, and their modification rules. Read before adding, removing, or reshaping root-level or dot files. |
| [docs/THEMING.md](docs/THEMING.md) | The design language: tokens, palettes, type, and motion. Read before touching any of them. |
| [docs/CONTENT-MODEL.md](docs/CONTENT-MODEL.md) | The content model's door: shared fields, frontmatter conventions, and the map of the per-subject schema files. |
| [docs/CONTENT-PROFILE.md](docs/CONTENT-PROFILE.md) | Field schema of the owner profile. |
| [docs/CONTENT-CAREER.md](docs/CONTENT-CAREER.md) | Field schemas of the career ledgers. |
| [docs/CONTENT-COMMUNITY.md](docs/CONTENT-COMMUNITY.md) | Field schemas of the community and credential ledgers. |
| [docs/CONTENT-GARDEN.md](docs/CONTENT-GARDEN.md) | Field schemas of the garden and writing ledgers. |
| [docs/CONTENT-TRAVEL.md](docs/CONTENT-TRAVEL.md) | Field schemas of the travel ledgers. |
| [docs/ROADMAP.md](docs/ROADMAP.md) | The feature landscape and standing technical debt. |
| [docs/SETUP.md](docs/SETUP.md) | First-time environment setup and the GitHub Pages deploy. |
| [docs/decisions/](docs/decisions/) | Immutable decision records holding the project's "why". Read the relevant record before revisiting a settled topic; never edit an accepted record. |

There are no assistant-specific instruction files. Every assistant reads this file
directly. If a tool genuinely cannot read AGENTS.md, give it a one-line shim that imports
or points to this file and nothing more.
