# Content Model: Garden And Writing Ledgers

The garden and writing ledgers of the record, carved from the content model's door. Field semantics and shared rules live in [CONTENT-MODEL.md](CONTENT-MODEL.md).

## `projects`: Portfolio projects

Folder: `src/content/projects/`

```yaml
---
title: My Project
role: Lead Developer
year: "2024"
image: https://...
link: https://...
stats: "10k users"
featured: true # optional: headlines the dashboard's Selected work chapter (first featured wins; defaults to the newest project)
tags:
  - React
  - TypeScript
---
Project description in Markdown.
```

---

## `posts`: Digital garden notes

Folder: `src/content/garden/`

Note: the frontmatter field `type` maps to `postType` in the interface to avoid collision with the content `type` field.

```yaml
---
title: Note Title
slug: note-title
type: Seedling # common: Seedling | Evergreen | List (long living lists); any label works
desc: One-line summary
tags:
  - Systems
---
Note body in Markdown.
```

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

## `blog`: Long-form articles

Folder: `src/content/blog/`

Sorted by `date` descending.

```yaml
---
title: Article Title
slug: article-title
date: "2024-03-15"
excerpt: One-sentence summary shown in previews.
cover: https://...
series: "Series Name" # optional grouping
readingTime: 8 # minutes, optional
externalUrl: "" # set when the canonical home is elsewhere (Medium, dev.to): the
# site renders the entry distinctly (dashed frame, host chip) and links out;
# the body, if present, is shown as a summary only
tags:
  - Systems
  - Productivity
---
Full article body in Markdown.
```

---

## `updates`: Microblog / feed

Folder: `src/content/updates/`

Sorted by `date` descending.

```yaml
---
date: "2024-03-15"
updateType: note # note | link | milestone
link: https://... # only for updateType: link
linkTitle: "Page title" # only for updateType: link
---
Short update body in Markdown.
```

---

## `courses`: Certifications & courses

Folder: `src/content/courses/`

Displayed on the `/education` page under "Courses & Continued Learning" alongside formal degrees. No dedicated route.

```yaml
---
title: Course Title
provider: Coursera
link: https://...
date: "2024-01"
tags:
  - Machine Learning
---
```

---
