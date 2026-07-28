# Repository Baseline

The living rulebook for the repository's always-present files: which files must exist,
which must never be tracked, and how each may be modified. Unlike
[CONVENTIONS.md](CONVENTIONS.md) this document is not frozen: the baseline evolves with the
tooling, and a change that reshapes it is recorded as a decision record.

## Always present

| File | Role | Modification rule |
| --- | --- | --- |
| `README.md` | Ali's GitHub profile page. | Owner-only. It predates this deployment, is not governed by the template's README rules, and is never touched by agents. |
| `.gitignore` | What git must never track. | Every rule must correspond to the actual stack: add into the matching labeled section, and remove a rule when the tool it serves leaves the project. Never remove a rule that still matches something real without an owner decision. |
| `.gitattributes` | Line-ending and binary policy. | Near-frozen; changes are owner decisions, because they silently rewrite every contributor's checkout. |
| `.editorconfig` | Vendor-neutral editor baseline. | Near-frozen; same reasoning as `.gitattributes`. |
| `package.json` + `package-lock.json` | The dependency manifest and its lockfile. | The lockfile is committed and never hand-edited; it changes only through npm. |
| `index.html`, `vite.config.ts`, `tsconfig*.json`, the ESLint config | The build and type surface. | Present because the app does not build without them. |

The documentation spine (`AGENTS.md`, `STATE.md`, `docs/`) is also always present; it is
governed by [CONVENTIONS.md](CONVENTIONS.md), not by this file.

## Present when the trigger exists

Triggers are bidirectional: the file appears when its trigger appears and is removed when
its trigger disappears. A conditional file whose trigger is gone is clutter, not caution.

| File | Trigger |
| --- | --- |
| `LICENSE` | Absent on purpose. This is a personal deployment: the app code inherits its MIT license from the upstream template, and the personal content in `src/content/` is all-rights-reserved, which no single license file could state honestly. |
| `CHANGELOG.md` | Absent: nobody upgrades through releases of a personal deployment; the template's changelog lives upstream. |
| `util_resources/` | The repository embeds images beyond the profile README. None today, so the folder does not exist. |
| `.github/workflows/deploy.yml` | The site deploys through GitHub Actions to Pages. |
| `.env.example` | Anything reads a `.env`; nothing does today. |

## Never tracked

- Editor and IDE directories (`.vscode/`, `.idea/`).
- Secrets and local environments: any `.env` with real values.
- Anything regenerable: `node_modules/`, `dist/`, coverage, caches, and the icon exports
  (`pixel-mark-*.png`).
- Operating-system junk: `.DS_Store`, `Thumbs.db`, `Desktop.ini`.
- Browser-automation scratch: `.playwright-mcp/`.

## Temporary development files

Files created only to support a task in progress are not repository content. Prefer
creating them outside the repository tree in the first place. When one does live inside the
tree, it is purged in the same change that ends its usefulness. If it is unclear whether a
file is still needed, surface it to the owner rather than deleting it or silently leaving
it behind.

## Line endings

`.gitattributes` is the single authority: text files are stored normalized (`* text=auto`),
shell scripts always check out LF, and Windows script formats (`.bat`, `.cmd`, `.ps1`)
always check out CRLF. Binary assets (fonts, images, icons) are marked binary so git never
diffs or normalizes them. Local `core.autocrlf` settings must never be load-bearing.
