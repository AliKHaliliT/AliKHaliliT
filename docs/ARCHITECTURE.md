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
| Testing | Vitest (`npm test`): characterization suites for the services |
| Deployment | GitHub Pages (static) |

---

## Data flow

```text
src/content/**/*.md
  -> contentLoader.ts          import.meta.glob at build time; parses frontmatter
  -> ContentService.getAll()   checks localStorage first, falls back to parsed files
  -> ContentContext            React Context; provides typed arrays + CRUD methods
  -> Pages & Components        consume via useContent()
```

**Persistence model:**

- Markdown files are seed data only. They are read at build time via `import.meta.glob`.
- Runtime edits (written by a same-origin editing surface through `ContentService`) are
  stored in `localStorage` under `os_content_<type>` and `os_settings` and shadow the seed.
- Clearing browser storage resets everything to the Markdown seed. This is intentional.
- Saves also record a fingerprint of the bundled seed (`os_content_seed_<type>`); if a
  redeploy changes the markdown under a shadowed type, `getAll` logs a console warning naming
  the key to clear.
- All localStorage writes go through `safeSetItem` (`src/lib/storage.ts`): quota or
  unavailability surfaces as a console error and a one-time alert instead of an unhandled throw.
- `ContentService.downloadMarkdown(item)` exports any item as a `.md` file so it can be
  committed back to the repo as seed data.

---

## Routing

| Path | Page | Component |
| ---- | ---- | --------- |
| `/` | Home | `src/pages/Dashboard.tsx` |
| `/experience` | Experience | `src/pages/Experience.tsx` |
| `/education` | Education | `src/pages/EducationPage.tsx` |
| `/awards` | Awards | `src/pages/Awards.tsx` |
| `/certificates` | Certificates | `src/pages/Certificates.tsx` |
| `/publications` | Publications | `src/pages/Publications.tsx` |
| `/speaking` | Speaking | `src/pages/Speaking.tsx` |
| `/volunteering` | Volunteering | `src/pages/Volunteering.tsx` |
| `/organizations` | Organizations | `src/pages/Organizations.tsx` |
| `/references` | References | `src/pages/References.tsx` |
| `/projects` | Projects | `src/pages/Projects.tsx` |
| `/library` | Library | `src/pages/Library.tsx` |
| `/skills` | Skills | `src/pages/SkillsPage.tsx` |
| `/uses` | Redirect to `/skills` | (a `Navigate` in `App.tsx`) |
| `/interests` | Interests | `src/pages/Interests.tsx` |
| `/travel` | Travel | `src/pages/Travel.tsx` |
| `/garden` | Garden | `src/pages/Garden.tsx` |
| `/garden/:slug` | Garden post | `src/pages/GardenPost.tsx` |
| `/blog` | Blog | `src/pages/Blog.tsx` |
| `/blog/:slug` | Blog post | `src/pages/BlogPost.tsx` |
| `/updates` | Updates | `src/pages/Updates.tsx` |

Routes are added in `src/App.tsx`; anything unknown lands on `NotFound`. The nav map lives in
`src/lib/nav.ts` (consumed by TopBar, Footer, and GroundTrack).

---

## Shell and layout

Navigation is a sticky **TopBar** (`src/components/layout/TopBar.tsx`): grouped dropdowns from
`NAV_GROUPS`, the command-palette trigger, the theme toggle, and a full-screen mobile index.
The **Footer** (`layout/Footer.tsx`) is the dossier back cover: a complete sitemap, socials
from settings, and the pixel band. Content sits in a centered
1180px rail with dashed hairline edges (`App.tsx`). There is no sidebar; the old
`SidebarContext` and its `sidebar-collapsed` key are gone.

---

## Search

`src/components/SearchModal.tsx`, rendered at the app root and opened via **Ctrl+K** or
**Cmd+K** or a custom `open-search` DOM event (dispatched from the header). It is a client-side
substring match over sixteen content types, scored so a title hit outranks a structured-fact
hit (institution, venue, company, and so on), which outranks tags, which outrank a hit buried
in the body; results group by section with a per-type cap. There is no search index; it
filters the in-memory `ContentContext` arrays directly.

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
  collection. This repo keeps its half of the contract in `src/types/portfolio.ts` and the
  reference exporter in `src/services/portfolioSnapshot.ts` (pinned by
  `portfolioSnapshot.test.ts`); the builder keeps its own copy, and the `format` and
  `version` fields keep the two sides honest. The snapshot doubles as a full backup format.
- The resume builder's documents (`os_resumes`) are its own localStorage, not site data; the
  site's runtime override keys (`os_content_<type>`, `os_settings`, `os_site`, `os_palette`)
  remain readable by any same-origin editing surface.

---

## Design system

The visual language (design tokens, color palettes, typography, radius, shadow, motion, and the
shared UI atoms) lives in [THEMING.md](THEMING.md).

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
   `src/lib/pageCopy.ts`). The `siteSeed`
   plugin in `vite.config.ts` rewrites the `<title>` and description meta and injects the Open
   Graph and Twitter tags at build time; the literals in `index.html` are neutral template
   defaults.
2. **Override**: `localStorage.os_site`, written by the companion admin panel's Site identity
   editor (per-browser; clearing it falls back to the deployed seed file).
3. `src/lib/siteMeta.ts` is the dependency-free model and head-tag generator shared with the
   Vite plugin; `src/lib/site.ts` adds persistence and the `useSiteIdentity()` hook, consumed by
   the TopBar wordmark, the Footer colophon, and `TitleSync` (which sets `document.title` per
   route via `pageLabel()` in `src/lib/nav.ts`).

The rule this system enforces: **no personal strings in source code**. Everything
owner-specific lives in `src/content/` (markdown, `profile.md`, `site.json`, `palette.json`),
which is exactly what the companion admin panel produces.

---

## Travel hierarchy

Countries and cities are two separate content types joined at render time in
`src/pages/Travel.tsx`.

- `countries` type maps to `src/content/travel/countries/*.md`
- `trips` type maps to `src/content/travel/cities/*.md`

Join key: `trip.country === country.name` (an exact string match, so it must be consistent).

- Cities without a matching country entry render under an "orphan" group.
- Countries with no city entries still render (0 cities shown).

---

## Known constraints

- **No server**: a pure static site. All logic is client-side.
- **Bundle size**: `react-markdown` plus `remark-gfm` are code-split behind the shared
  `Markdown` component (`src/components/ui/Markdown.tsx`). Further splits are possible via
  `build.rollupOptions.output.manualChunks`.
- **Content edits require a rebuild**: Markdown files are bundled at build time. Runtime
  localStorage overrides are per-browser only until exported and committed as seed files.
- **`ContentType` includes `"settings"`** but settings is a single `UserSettings` object, not an
  `AnyContentItem[]`. It is handled separately in ContentContext and ContentService.
- **Blog versus Garden**: Garden (`posts`) is personal knowledge management, atomic notes; Blog
  is polished long-form articles for external readers.
- **Updates subtypes**: `note` (a short thought), `link` (a link plus commentary), `milestone`
  (a significant event).
