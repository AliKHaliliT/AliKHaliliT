# Content Model

All types are defined once, in `src/entities/record/model.ts` (the companion admin panel and resume builder keep their own copies; this file is the site's authority). Everything entering the record is validated at the door by `src/entities/record/schema.ts`, and the record suites under `tests/src/entities/record` pin parsing, sorting, and the door's behavior.

The field schema of every type lives in its subject file:

| Ledgers | Types | Schemas |
| --- | --- | --- |
| Profile | `settings` | [CONTENT-PROFILE.md](CONTENT-PROFILE.md) |
| Career | `experience`, `education`, `awards`, `publications`, `speaking` | [CONTENT-CAREER.md](CONTENT-CAREER.md) |
| Community | `volunteering`, `certificates`, `references`, `interests`, `organizations` | [CONTENT-COMMUNITY.md](CONTENT-COMMUNITY.md) |
| Garden | `projects`, `posts`, `blog`, `updates`, `courses` | [CONTENT-GARDEN.md](CONTENT-GARDEN.md) |
| Library | `books`, `media` | [CONTENT-LIBRARY.md](CONTENT-LIBRARY.md) |
| Travel | `trips`, `countries` | [CONTENT-TRAVEL.md](CONTENT-TRAVEL.md) |

## The portfolio snapshot (not a content type)

The resume builder lives in its own repo and does **not** add a content type here. What this
repo owns is the export contract it consumes: `src/features/portfolio-export/contract.ts` defines
`portfolio.json` (format `vita-portfolio`, versioned: settings plus every content collection),
and `src/features/portfolio-export/snapshot.ts` builds it. The snapshot doubles as a full backup of
the record. See the ecosystem boundary in [ARCHITECTURE.md](ARCHITECTURE.md) and decisions
[0003](decisions/0003-self-contained-resume-builder.md) and
[0004](decisions/0004-three-repo-ecosystem.md).

---

## `BaseContent` interface (shared fields)

All types extend `BaseContent`:

```typescript
interface BaseContent {
  id: string | number; // defaults to filename slug if not set in frontmatter
  type: ContentType;
  title?: string;
  body?: string;
  tags?: string[];
  date?: string;
  story?: string; // route of the long-form piece about this item
  pin?: number; // pinned entries lead their section, ascending
}
```

### The `story` field

Any item can point at its long-form piece: a blog or garden route (`/blog/...`,
`/garden/...`) or an external URL. The `StoryLink` component renders the
consistent "read the story" affordance; interests, books, and travel cities
show it today, and other surfaces adopt it as needed. This is how a one-line
record (a game, a book, a city) connects to real writing without every
content type growing its own long-form body.

### Pinning and ordering

Any entry may carry `pin: 1` (2, 3, ...), and pinned entries lead their
section in ascending pin order, in the capped previews and on the full pages
alike, so choosing what a section fronts is frontmatter rather than code.
Behind the pins, each collection follows its ordering policy: dated types read
newest first and everything else alphabetically by default, and the optional
seed `src/content/settings/ordering.json` overrides that per section, mapping
a content type (or a library shelf as `media/<slug>`) to `"alphabetical"` or
`"chronological"`. Both degrade gracefully rather than demanding complete
data: chronological sorts whatever carries the type's date field newest first
and lets undated entries close the list alphabetically, an unusable `pin`
value is treated as no pin, and an absent or broken ordering file means the
defaults. The loader applies all of this once, so every page, capped preview,
and export sees the same order. Two boundaries: a grouped page (projects by
year, garden by kind) groups over the ordered list, so pins and policies act
within groups rather than across them, and the travel atlas orders itself
hierarchically, so `trips` and `countries` ignore the seed.

### Open type fields

`awardType`, `pubType`, `speakingType`, `certType`, and `memberType` are open
strings: the values listed in each section above are common suggestions (they
get proper labels from `src/entities/record/labels.ts`), but any owner-invented value is
valid and renders as its Title Case form. An athletics trophy
(`awardType: athletics`), a patent (`pubType: patent`), or an attended
conference (`speakingType: attendance`) needs no code change. The media
collection's `medium` and `status` are open the same way, and a new `medium`
value earns its own library shelf (see [CONTENT-LIBRARY.md](CONTENT-LIBRARY.md)).

---

## Frontmatter conventions

- `id` is optional: omit it and the filename slug is used automatically.
- `tags` must be a YAML list, not a comma-separated string.
- Dates use ISO strings: `"2024-03-15"` (full) or `"2024-03"` (month-only for startDate/endDate).
- Empty strings `""` are valid for optional fields.
- The body (everything after the closing `---`) is available as `item.body`.
- **Never use `type` as a frontmatter key**: it conflicts with the internal `ContentType` field. Use type-specific names: `employmentType`, `awardType`, `updateType`, `pubType`, `speakingType`, `certType`, `memberType`. The `posts` type is the exception: its frontmatter `type` is remapped to `postType` in the loader.
- `skills` and `languages` in settings use the format `Category: item1, item2` (one per line). For languages, each line is `Language: Proficiency`.
