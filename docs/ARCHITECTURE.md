# Architecture

## Tech stack

| Layer | Choice |
| ----- | ------ |
| Framework | React 19 + TypeScript |
| Build tool | Vite 7 |
| Styling | Tailwind CSS v4 (via `@tailwindcss/vite`, no PostCSS needed) |
| Routing | React Router DOM v7 |
| Animation | Framer Motion |
| Content | Markdown files + `front-matter` (YAML frontmatter parsing) |
| Testing | Vitest (`npm test`): characterization suites for the seams |
| Deployment | GitHub Pages (static) |

---

## The layers and their one rule

The site is built as one-way sliced layers. Imports point downward, never up or
sideways:

```text
app  ->  pages  ->  features  ->  entities  ->  shared
```

- **app** is the composition root: the bootstrap, the provider stack, the route
  table, the chrome, and the design tokens. It is the only layer allowed to know
  everything, and all cross-layer wiring is tied here.
- **pages** compose a route's content from features, entities, and shared parts.
  Ephemeral view state (an open filter, a selected item) lives here; logic does not.
- **features** are interactions with logic of their own, which today means the
  command palette and the portfolio export.
- **entities** are the domain nouns. `record` owns the content model, both of its
  doors, and the collections the site reads; `site` owns file-seeded identity and
  appearance.
- **shared** is the base: typed configuration, the small libraries, the UI kit,
  and the test helpers. It knows nothing about the layers above.

A slice is entered only through its `index.ts` public API, and suites are the one
exception since they test a module directly. A part used by exactly one page stays
inside that page (the project and book modals), and a part two pages need moves
down a layer (the city card). A concern spanning two entity slices moves up a
layer instead of reaching sideways, which is why the portfolio export is a feature:
it reads both the record and the site's palette.

The reasoning behind the shape is recorded in
[the template's decision 0007, Build the site as one-way sliced layers](inherited/0007-build-the-site-as-one-way-sliced-layers.md),
and the choice to keep the record as a single entity slice in
[the template's decision 0008, Keep the record as one entity slice](inherited/0008-keep-the-record-as-one-entity-slice.md).

```text
vita/
├── AGENTS.md                   # Agent entry point and the documentation index
├── index.html                  # The single page; mounts src/app/main.tsx
├── vite.config.ts              # Build, the @ -> src alias, and the seed plugins
├── eslint.config.js            # Flat ESLint configuration; carries the layer and token rules
├── tsconfig.json               # Solution file referencing the app and node configs
├── tsconfig.app.json           # Compiler options for the browser bundle under src/
├── tsconfig.node.json          # Compiler options for the build tooling (vite.config.ts)
│
├── public/                     # Static assets served as-is (the favicon and its sources)
│
├── scripts/                    # Tracked repository tooling
│   ├── audit-docs.mjs          # The docs audit; the gate's Docs command
│   ├── audit-docs-selftest.mjs # Proves every rule of the audit against a planted defect
│   ├── make-icon.mjs           # Renders the pixel-mark to PNG
│   └── profile-art.mjs         # Draws the profile page's SVG art
│
├── docs/                       # Technical documentation (indexed in AGENTS.md)
│
├── src/
│   ├── app/                    # Composition root
│   │   ├── main.tsx            # Boots the palette, then mounts App
│   │   ├── App.tsx             # Providers wrapped around the router
│   │   ├── providers.tsx       # Motion runtime and the record provider
│   │   ├── router.tsx          # The route table and the route transitions
│   │   ├── layout/             # AppLayout, TopBar, Footer, saved-copy notice, theme, nav visibility
│   │   └── styles/             # index.css (base) and tokens.css (the tokens)
│   ├── pages/                  # One slice per route
│   ├── features/               # search, portfolio-export
│   ├── entities/
│   │   ├── record/             # Content model, both doors, the collections
│   │   └── site/               # Identity, palette, page copy
│   ├── shared/                 # config, lib, ui, testing
│   ├── assets/                 # Fonts and images the bundler fingerprints
│   └── content/                # The record itself, as Markdown and JSON
│
└── tests/                      # Vitest suites mirroring the src structure
    ├── setup.ts                # Refuses any connection that would leave the loopback
    └── src/
```

---

## Data flow

```text
src/content/**/*.md
  -> entities/record/seed.ts     import.meta.glob at build time; parses and checks frontmatter
  -> entities/record/store.ts    checks localStorage first, falls back to the parsed files
  -> entities/record/context.ts  React context; provides typed collections and refused copies
  -> pages and components        consume via useContent()
```

**Persistence model:**

- Markdown files are seed data only. They are read at build time via `import.meta.glob`.
- Runtime edits are written by a same-origin editing surface, the companion admin, into
  `localStorage` under `os_content_<type>` and `os_settings`, where they shadow the seed.
  This site reads them and writes nothing.
- Clearing browser storage resets everything to the Markdown seed. This is intentional.
- The admin records a fingerprint of the bundled seed beside each edit
  (`os_content_seed_<type>`). When a redeploy changes the markdown under an edit, the
  deployment wins and the stale copy is dropped, under
  [the template's decision 0014, Let a changed seed win over a stale override](inherited/0014-let-a-changed-seed-win-over-a-stale-override.md).
- A saved copy that fails its check never reaches a page. The store sets it aside, and the
  shell shows a notice naming the key to clear, which only a browser holding such a copy sees.

---

## The record boundary

Content reaches the site through two doors, and neither is trusted by
construction. `entities/record/schema.ts` holds the contract both are checked
against, and a violation becomes a `RecordContractError` naming the file or the
storage key rather than a crash on some page far from the cause.

The two doors are treated differently on purpose. Bundled markdown is committed
content, so a file whose frontmatter cannot produce a valid item is an authoring
bug and the loader throws with the path. The localStorage override is written by a
separate application in the same browser, so a malformed value is not this site's
bug to fail on; the store sets it aside, serves the committed seed instead, and the
shell names the key to clear in a notice. Only invariants the whole site depends on are
checked, because a guard that outgrows the model starts rejecting valid content. See
[the template's decision 0009, Guard the record with hand-written validators](inherited/0009-guard-the-record-with-hand-written-validators.md)
and [the template's decision 0025, Name a refused saved copy on the page](inherited/0025-name-a-refused-saved-copy-on-the-page.md).

---

## Routing

| Path | Page | Slice |
| ---- | ---- | ----- |
| `/` | Home | `pages/dashboard` |
| `/experience` | Experience | `pages/experience` |
| `/education` | Education | `pages/education` |
| `/awards` | Awards | `pages/awards` |
| `/certificates` | Certificates | `pages/certificates` |
| `/publications` | Publications | `pages/publications` |
| `/speaking` | Speaking | `pages/speaking` |
| `/volunteering` | Volunteering | `pages/volunteering` |
| `/organizations` | Organizations | `pages/organizations` |
| `/references` | References | `pages/references` |
| `/projects` | Projects | `pages/projects` |
| `/library` | Library hub (a row per shelf) | `pages/library` |
| `/library/:shelf` | One shelf in full (`books`, or any medium) | `pages/library` |
| `/skills` | Skills | `pages/skills` |
| `/uses` | Redirect to `/skills` | (a `Navigate` in `app/router.tsx`) |
| `/interests` | Interests | `pages/interests` |
| `/travel` | Travel | `pages/travel` |
| `/travel/country/:slug` | Country detail | `pages/travel-detail` |
| `/travel/city/:slug` | City detail | `pages/travel-detail` |
| `/garden` | Garden | `pages/garden` |
| `/garden/:slug` | Garden post | `pages/garden-post` |
| `/blog` | Blog | `pages/blog` |
| `/blog/:slug` | Blog post | `pages/blog-post` |
| `/updates` | Updates | `pages/updates` |

Routes are declared in `src/app/router.tsx`; anything unknown lands on the
not-found page. The nav map lives in `src/shared/config/nav.ts`, which is where
labels, grouping, and site order come from. Paths therefore appear in two places
by design: the router owns which component answers a path, and the nav map owns
where that path sits in the site map.

---

## Shell and layout

`app/layout/AppLayout.tsx` draws everything around a route's content. Navigation is
a sticky **TopBar**: grouped dropdowns from `NAV_GROUPS`, the command-palette
trigger, the theme toggle, and a full-screen mobile index. The **Footer** is the
dossier back cover: a complete sitemap, socials from settings, and the pixel band.
Content sits in a centered 1180px rail with dashed hairline edges. There is no
sidebar. A browser holding a saved copy the record refused also gets a small notice
at the foot of the viewport naming each key to clear and why; every other browser
renders nothing there.

---

## Search

`features/search/SearchModal.tsx`, rendered inside the layout and opened via **Ctrl+K**
or **Cmd+K** or a custom `open-search` DOM event (dispatched from the header). It is a
client-side substring match over seventeen content types, scored so a title hit outranks a
structured-fact hit (institution, venue, company, and so on), which outranks tags, which
outrank a hit buried in the body; results group by section with a per-type cap. There is
no search index; it filters the in-memory record directly.

---

## The ecosystem boundary

VITA is one of **three repositories**: this public site, the admin panel, and the resume
builder, under [the template's decision 0004, A three-repository ecosystem bridged by files](inherited/0004-three-repo-ecosystem.md). This repo ships zero
editing machinery. The companions carry their own copies of whatever they share with the
site, so nothing here imports from them or vice versa. They talk to each other through
files:

- **Seed files in** (admin to site): the admin panel produces exactly what lives under
  `src/content/` (content Markdown, `profile.md`, `site.json`, `palette.json`); publishing an
  edit is committing the file and rebuilding. This is why **no personal strings exist in
  source code**: everything owner-specific is a content file the admin can regenerate.
- **`portfolio.json` out** (site record to builder): a snapshot of the whole record,
  `{ format: "vita-portfolio", version, exportedAt, settings, content }` with every content
  collection. The `features/portfolio-export` slice owns this half of the contract, holding
  the shape in `contract.ts` and the reference exporter in `snapshot.ts` (pinned by its
  suite); the builder keeps its own copy, and the `format` and `version` fields keep the two
  sides honest. The snapshot doubles as a full backup format.
- The resume builder's documents (`os_resumes`) are its own localStorage, not site data; the
  site's runtime override keys (`os_content_<type>`, `os_settings`, `os_site`, `os_palette`)
  remain readable by any same-origin editing surface.

---

## Design system

`src/app/styles/tokens.css` is the only place a color is written down. Every token
becomes a Tailwind utility, which is how components speak in tokens rather than raw
values, and the dark block re-points the same names so no component names a theme.
The rest of the visual language (palettes, typography, radius, shadow, motion, and
the shared UI atoms) lives in [THEMING.md](THEMING.md).

---

## Site identity

The site's own name and metadata follow the same three-layer file-seed model as the palette,
under [the template's decision 0002, Appearance and identity follow the content model as file seeds](inherited/0002-file-seeded-appearance-and-identity.md):

1. **Seed**: `src/content/settings/site.json`, whose fields the table below lists. The
   `siteSeed` plugin in `vite.config.ts` rewrites the `<title>` and description meta and
   injects the Open Graph and Twitter tags at build time; the literals in `index.html` are
   neutral template defaults.
2. **Override**: `localStorage.os_site`, written by the companion admin panel's Site identity
   editor (per-browser; clearing it falls back to the deployed seed file).
3. `src/entities/site/meta.ts` is the dependency-free model and head-tag generator shared with
   the Vite plugin; `src/entities/site/identity.ts` adds persistence and the `useSiteIdentity()`
   hook, consumed by the TopBar wordmark, the Footer colophon, and `TitleSync` (which sets
   `document.title` per route via `pageLabel()` in `src/shared/config/nav.ts`).

| Field | What it sets | When it is empty |
| --- | --- | --- |
| `name` | The wordmark | Required |
| `title` | The base document title, which pages prefix with their own label | Required |
| `description` | The description meta and the Open Graph description | Required |
| `author` | The author meta, and the colophon's owner when the profile names none | Required |
| `url` | The canonical origin for `og:url` | The tag is left out |
| `mark` | The oversized hero monogram | The name's initials, via `siteMark()` |
| `tagline` | The footer's big serif sign-off, newline-separated with the last line in the accent | "Built from {city}, logged everywhere." |
| `colophon` | The footer's bottom line | "A dossier by {owner}" |
| `pageCopy` | Any page-header description, keyed per page | The fallbacks in `src/entities/site/pageCopy.ts` |

The build reaching into an entity slice is the one deliberate exception to the layer
rule: `meta.ts` and `paletteCss.ts` are dependency-free by design precisely so the Vite
plugins can read them at build time, before any layer exists.

The rule this system enforces: **no personal strings in source code**. Everything
owner-specific lives in `src/content/` (markdown, `profile.md`, `site.json`, `palette.json`),
which is exactly what the companion admin panel produces.

---

## Travel hierarchy

Countries and cities are two separate content types joined at render time in
`src/pages/travel/TravelPage.tsx`.

- `countries` type maps to `src/content/travel/countries/*.md`
- `trips` type maps to `src/content/travel/cities/*.md`

Join key: `trip.country === country.name` (an exact string match, so it must be consistent).

- Cities without a matching country entry render under an "orphan" group.
- Countries with no city entries still render (0 cities shown).

---

## Known constraints

- **No server**: a pure static site. All logic is client-side.
- **Bundle size**: `react-markdown` plus `remark-gfm` are code-split behind the shared
  `Markdown` component (`src/shared/ui/Markdown.tsx`). Further splits are possible via
  `build.rollupOptions.output.manualChunks`.
- **Content edits require a rebuild**: Markdown files are bundled at build time. Runtime
  localStorage overrides are per-browser only until exported and committed as seed files.
- **`ContentType` includes `"settings"`** but settings is a single `UserSettings` object, not an
  `AnyContentItem[]`. It is handled separately in the record's context and store.
- **Blog versus Garden**: Garden (`posts`) is personal knowledge management, atomic notes; Blog
  is polished long-form articles for external readers.
- **Updates subtypes**: `note` (a short thought), `link` (a link plus commentary), `milestone`
  (a significant event).

## Testing

Five rules hold however broad the suite is. Suites live in `tests/`, mirroring the source
tree, one suite named after the unit it covers. A collaborator is replaced only at an
architectural seam, by a hand-written fake satisfying the contract it stands in for, never by
mocking a module's internals, since a test bound to an implementation voids the
substitutability the layering exists to provide. And no coverage threshold is imposed, because
a percentage gate buys assertions that assert nothing, so breadth stays a judgment call while
placement and substitution do not. And a test is proved by the failure it catches, named
before it is written, watched failing against a mutation after, and watched failing again when
the fix it guards is reverted, because a test that has never failed has proved only that it
runs. And no request leaves the loopback, `tests/setup.ts` refusing any connection to another
host before its socket opens and a test that must reach a host naming it in the open, because
an adapter that resolves its credentials from the environment is a working adapter on a
machine that has them. The suite runs in a shuffled order under a seed the run prints, so a
test that leans on its neighbour fails on the day it is written.

The 11 suites here are characterization and unit tests over the record's schema, seed, store,
shelves, and ordering, the site identity and palette, the portfolio snapshot, and the date,
skill and text libraries. They contain no module mocking at all, which is what made adopting
the rule a description of existing practice rather than a migration. The reasoning is recorded
in [decision 0007, Adopt the style's test contract](decisions/0007-adopt-the-styles-test-contract.md),
and the rule itself is owned by the style.

## Exemplars

The map says where things live; these files say how they read. An artifact of a kind listed
here is cut from its exemplar and rewritten, never written fresh from the rule, because the
rule names what must exist and only these bytes carry the dialect. This deployment inherits
its dialect from the template, so an exemplar here is the local copy of the template's.

- A content type end to end, model through both doors: `src/entities/record/model.ts`, `seed.ts`, and `store.ts`.
- A page slice with a capped preview and a full list: `src/pages/library/`.
- A real record entry with its optional fields exercised: `src/content/books/the-gambler.md`.
- A characterization suite adapted to the real record: `tests/src/entities/record/seed.test.ts`.
- A decision record: `docs/decisions/0010-move-the-played-games-onto-the-librarys-shelf.md`.
