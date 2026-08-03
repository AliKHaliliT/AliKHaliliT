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
| `npx tsc -b` | Type-check all projects (the root tsconfig is solution-style; a plain `tsc --noEmit` checks nothing) |
| `npm run icon -- <size>` | Render the pixel-mark to PNG (`--theme dark`, `--bg "#hex"`, `--out dir`) |
| `npm run profile-art` | Rebuild the profile README's SVG art into `util_resources/readme/` |

Run `npm test` after touching `contentLoader`, `contentService`, or `portfolioSnapshot`:
those suites pin parsing, sorting, localStorage fallback, and the export contract.

## Hard rules

These are non-negotiable. Depth lives in the indexed documents; this is the checklist.

- **This is the real record.** Every content file under `src/content/` is Ali's actual
  life data. Never replace it with demo content and never invent entries. A short list of
  confidential projects stays permanently off the site; the names live in the untracked
  `LOCAL.md`.
- **Prose carries no em dashes.** Not in docs, comments, or UI copy. Use a semicolon to
  join two clauses or parentheses for an aside.
- **All prose must read as if a person wrote it.** Never write the clause-colon splice, a
  sentence shaped as claim, colon, elaboration; in prose a colon may only introduce a
  list, a quote, or a label. The softer language-model tells (balanced semicolon
  antitheses, triadic lists, not-X-but-Y reversals) are fine one at a time and forbidden
  stacked, so allow at most one flourish per paragraph and keep the rest plain declarative
  sentences.
- **Every tracked byte is public prose.** Confidential facts, private repository names,
  deployment details, and the description of what was withheld and why never enter a
  tracked file or a commit message, even in a private repository, because visibility can
  flip and history is permanent. Such context goes to the untracked `LOCAL.md` at the root
  (see [docs/BASELINE.md](docs/BASELINE.md)); read it when it exists, create it when first
  needed, and when unsure whether a fact is sensitive, ask the owner instead of recording
  it.
- **Motion runs behind `LazyMotion` strict** (`domAnimation` features): always import and
  use `m.` from framer-motion, never `motion.`. See [docs/THEMING.md](docs/THEMING.md).
- **Colors come from CSS variables** with the `dark:` Tailwind variant; never hardcode a
  color. See [docs/THEMING.md](docs/THEMING.md).
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

## Documentation index

A document that is not listed here does not exist: no reader can be expected to find it.
Register a new document in this table in the same change that creates it.

| Document | Species | Read it when |
| -------- | ------- | ------------ |
| [STATE.md](STATE.md) | living | Always first: what is Now, Next, Deferred, or Blocked |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | living | Before any structural change: data flow, routing, boundaries |
| [docs/THEMING.md](docs/THEMING.md) | living | Before touching design tokens, palettes, type, or motion |
| [docs/CONTENT-MODEL.md](docs/CONTENT-MODEL.md) | living | Field schemas for every type, and the add-a-type checklist |
| [docs/ROADMAP.md](docs/ROADMAP.md) | living | The feature landscape and standing technical debt |
| [docs/SETUP.md](docs/SETUP.md) | living | First-time environment setup and GitHub Pages deploy |
| [docs/BASELINE.md](docs/BASELINE.md) | living | Which root files must exist, which are never tracked, and why |
| [docs/CONVENTIONS.md](docs/CONVENTIONS.md) | living, frozen | Before writing any document: the rulebook, never edited directly |
| [docs/decisions/](docs/decisions/) | records | Why a durable choice was made; cite by number, never edit |

There are no assistant-specific instruction files: every agent reads this one.
