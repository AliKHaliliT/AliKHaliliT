# Content: Library

Field schemas of the library's two collections. Shared fields and frontmatter
conventions live in [CONTENT-MODEL.md](CONTENT-MODEL.md).

The library page is a hall of shelves: the book collection is the first shelf,
and every distinct `medium` value in the media collection earns its own, each
with a full page at `/library/<shelf>`. Statuses drive a stage heuristic shared
by the hub and the shelf pages: a label ending in "ing" ("Reading", "Watching")
counts as work in hand and leads its shelf, a label starting with "To " counts
as queued, and anything else counts as done. Stats and filter pills always show
the exact labels; the stages only order and select.

---

## `books`: Reading list

Folder: `src/content/books/`

```yaml
---
title: Book Title
author: Author Name
cover: https://...
status: Reading # Reading | Read | To Read
rating: 4 # 1–5, optional
---
Notes / review in Markdown.
```

---

## `media`: Films, series, anime, games

Folder: `src/content/media/`

Sorted by `date` descending. `medium` is an open string: film, series, anime,
and game get their own shelf glyphs and plural shelf headings ("Films",
"Games"), and any other value still earns a shelf, headed by its own Title
Case under the library's fallback mark. `status` is open too; pick labels whose
English shape matches the stage you mean (see the heuristic above).

```yaml
---
title: Title
medium: game # film | series | anime | game | anything else
creator: Studio or Director # optional; the author-analog
status: Played # optional; e.g. Watched | Watching | To Watch | Played | Playing | To Play
rating: 4 # 1–5, optional
image: https://... # poster or cover, optional
link: https://... # official page, store page, ..., optional
desc: One-line summary shown in the detail view. # optional
date: "2025-08" # when taken in; orders the shelf, optional
story: /garden/... # the long-form piece about it, optional
---
Notes in Markdown.
```
