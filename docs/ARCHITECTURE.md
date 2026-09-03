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
[the template's decision 0007](https://github.com/AliKHaliliT/VITA/blob/main/docs/decisions/0007-build-the-site-as-one-way-sliced-layers.md), and the
choice to keep the record as a single entity slice in
[the template's decision 0008](https://github.com/AliKHaliliT/VITA/blob/main/docs/decisions/0008-keep-the-record-as-one-entity-slice.md).

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
│   │   ├── layout/             # AppLayout, TopBar, Footer, theme, nav visibility
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
    └── src/
```

---

## Data flow

```text
src/content/**/*.md
  -> entities/record/seed.ts     import.meta.glob at build time; parses and checks frontmatter
  -> entities/record/store.ts    checks localStorage first, falls back to the parsed files
  -> entities/record/context.ts  React context; provides typed collections + writers
  -> pages and components        consume via useContent()
```

**Persistence model:**

- Markdown files are seed data only. They are read at build time via `import.meta.glob`.
- Runtime edits (written by a same-origin editing surface) are stored in
  `localStorage` under `os_content_<type>` and `os_settings` and shadow the seed.
- Clearing browser storage resets everything to the Markdown seed. This is intentional.
- Saves also record a fingerprint of the bundled seed (`os_content_seed_<type>`); if a
  redeploy changes the markdown under a shadowed type, `getAll` logs a console warning
  naming the key to clear.
- All localStorage writes go through `safeSetItem` (`src/shared/lib/storage.ts`): quota or
  unavailability surfaces as a console error and a one-time alert instead of an unhandled throw.
- `ContentService.downloadMarkdown(item)` exports any item as a `.md` file so it can be
  committed back to the repo as seed data.

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
bug to fail on; the store reports the key to clear and serves the committed seed
instead. Only invariants the whole site depends on are checked, because a guard
that outgrows the model starts rejecting valid content. See
[the template's decision 0009](https://github.com/AliKHaliliT/VITA/blob/main/docs/decisions/0009-guard-the-record-with-hand-written-validators.md).

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
sidebar.

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
builder (decision [0004](decisions/0004-three-repo-ecosystem.md)). This repo ships zero
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

The site's own name and metadata follow the same three-layer file-seed model as the palette
(decision [0002](decisions/0002-file-seeded-appearance-and-identity.md)):

1. **Seed**: `src/content/settings/site.json` (`name` is the wordmark, `title` is the base
   document title, plus `description`, `author`, `url`, and three optional owner-voice fields:
   `mark` for the oversized hero monogram, falling back to the name's initials via `siteMark()`;
   `tagline` for the footer's big serif sign-off, newline-separated with the last line in the
   accent, falling back to "Built from {city}, logged everywhere."; and `colophon` for the
   footer's bottom line, falling back to "A dossier by {owner}". An optional `pageCopy`
   record overrides any page-header description, keyed per page with fallbacks in
   `src/entities/site/pageCopy.ts`). The `siteSeed`
   plugin in `vite.config.ts` rewrites the `<title>` and description meta and injects the Open
   Graph and Twitter tags at build time; the literals in `index.html` are neutral template
   defaults.
2. **Override**: `localStorage.os_site`, written by the companion admin panel's Site identity
   editor (per-browser; clearing it falls back to the deployed seed file).
3. `src/entities/site/meta.ts` is the dependency-free model and head-tag generator shared with
   the Vite plugin; `src/entities/site/identity.ts` adds persistence and the `useSiteIdentity()`
   hook, consumed by the TopBar wordmark, the Footer colophon, and `TitleSync` (which sets
   `document.title` per route via `pageLabel()` in `src/shared/config/nav.ts`).

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

Three rules hold however broad the suite is. Suites live in `tests/`, mirroring the source
tree, one suite named after the unit it covers. A collaborator is replaced only at an
architectural seam, by a hand-written fake satisfying the contract it stands in for, never by
mocking a module's internals, since a test bound to an implementation voids the
substitutability the layering exists to provide. And no coverage threshold is imposed, because
a percentage gate buys assertions that assert nothing, so breadth stays a judgment call while
placement and substitution do not.

The 9 suites here are characterization tests over the record's schema, seed and store, the site identity and palette, the portfolio snapshot, and the date, skill and text libraries. They contain no module
mocking at all, which is what made adopting the rule a description of existing practice rather
than a migration. The reasoning is recorded in
[decision 0007](decisions/0007-adopt-the-styles-test-contract.md), and the rule itself is owned by the style.

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
