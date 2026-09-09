# 0017. Shelve every medium in one library

Status: Accepted
Date: 2026-08-31

## Context

The library held books alone, so everything else a life takes in (films,
series, anime, games) either went unrecorded or hid inside garden notes. The
owner asked for a library of categories: an overview page fronting a few
entries per category, a full page per category, generalized statuses, and
entries that open into detail with an image, a date, a link, and a story tie.
The `books` type is pinned inside the versioned `vita-portfolio` snapshot that
both sister apps keep copies of, which made its shape expensive to disturb.

## Options considered

- Generalize `books` into one `library` type with a `medium` field. Cleanest
  data model, but it renames a collection the export contract, the admin
  panel, the resume builder, and every existing user's record already carry,
  and the README promises releases leave existing records alone. Lost.
- One new type per medium (`films`, `games`, ...). Every future medium becomes
  a code change across three repositories, which is exactly what the family's
  open-type convention exists to avoid. Lost.
- A closed status enum ("done | in progress | queued") shared by all shelves.
  Honest labels like "Watched" and "Played" would be squeezed into jargon, and
  the record's other type fields are already open strings. Lost.
- Per-item routes (`/library/:shelf/:slug`) instead of the detail modal. The
  travel fix earned detail views real routes because the old inline swap broke
  scroll and back; a modal changes no route and breaks neither, and a full page
  per library entry overweights a record whose body is a few lines of notes.
  Search still deep-links via `?item=`, consumed once and cleared from the URL
  so history never holds a modal-open state. Lost.

## Decision

Add one `media` content type with an open `medium` string; `books` stays
untouched. The library page becomes a hub of shelves, the book collection
first and every distinct medium after it, each fronting its work-in-hand and
newest entries and linking to `/library/:shelf` for the exhaustive list.
Statuses stay open strings unified by a stage heuristic on their English
shape: "-ing" labels are in hand, "To " labels are queued, the rest are done;
stats and filters show exact labels. `media` joins the portfolio snapshot's
collection list additively at version 1, since the content record is
`Partial` and the snapshot claims to be a complete backup. The library
schemas move to `docs/CONTENT-LIBRARY.md` by fission, because the garden
document was near its budget and the library is its own subject now.

## Consequences

A new medium is frontmatter, not code: any `medium` value earns a shelf, a
glyph fallback, search coverage, and a page. The admin panel owes a media
editor and the sister repositories owe their contract copies the new
collection name in the same wave, or the "every ledger has an editor" claim
rots. The stage heuristic is presentation only, so a mislabeled status can
misplace an entry within a shelf but never lose it.
