# Content Model

All types are defined once, in `src/types/content.ts` (the companion admin panel and resume builder keep their own copies; this file is the site's authority). There is no runtime schema validation. The loaders trust the frontmatter, and `contentLoader.test.ts` pins the parsing and sorting behavior.

---

## Implemented types

### `settings`: Profile

Single file: `src/content/settings/profile.md`. Not an array: one `UserSettings` object.

```yaml
---
name: Wren Emberquill
role: Artificer
location: Cinderfen
avatar: "" # URL or empty
bio: ""
focus: Building Personal OS
# Contact
email: you@example.com
phone: ""
website: ""
# Social
github: https://github.com/example
linkedin: ""
twitter: ""
scholar: ""
medium: ""
orcid: ""
# Any other platform, one per line: "Label: URL" or "Label [icon]: URL".
# Nothing is hardcoded; add whatever belongs on the dossier (Kaggle,
# Hugging Face, Instagram, ...). The optional [icon] names a glyph from
# src/lib/linkIcons.ts: with an icon the hero renders an icon square,
# without one a text chip.
links: |
  Kaggle: https://www.kaggle.com/username
  Academic email [at]: mailto:you@university.edu
# Profile details
nationality: "" # e.g. "Canadian": shown beside location
dateOfBirth: "" # ISO date; never rendered, but it SHIPS in the public bundle like every
# profile field. Leave empty on public deployments (type it into a resume document instead).
availability: "" # e.g. "Open to opportunities from Sept 2025"
workMode: "" # e.g. "Remote · Hybrid"
declaration: "" # End-of-resume statement (not displayed on site)
# Structured text (one entry per line)
languages: |
  English: Native
  Farsi: Native
skills: |
  Languages: Python, TypeScript, Go
  Frameworks: React, FastAPI
  Tools: Docker, Git, AWS
# Long-form sections
now: "" # legacy, not displayed: the Home Now chapter reads from `updates`
uses: "" # Markdown, optional: setup and workflow notes, shown at the end of /skills
---
```

---

### `experience`: Work history

Folder: `src/content/experience/`

Sorted by `startDate` descending.

```yaml
---
title: Software Engineer
company: Acme Corp
location: Calgary, AB
startDate: "2022-06"
endDate: "2024-01" # omit for current role (shows "Present")
employmentType: full-time # full-time | part-time | internship | contract | freelance
link: https://...
tags:
  - React
  - Python
---
- Key responsibility or achievement
- Another bullet point
```

---

### `education`: Degrees & formal education

Folder: `src/content/education/`

Sorted by `startDate` descending. Certifications from the `courses` type are shown together on `/education` but remain a separate content type.

```yaml
---
title: B.Sc. Computer Science
institution: University of Calgary
location: Calgary, AB
startDate: "2020-09"
endDate: "2025-04"
degree: Bachelor # Bachelor | Master | PhD | Certificate | Diploma | Associate | Other
field: Computer Science
gpa: "3.9" # optional
link: https://...
tags:
  - Machine Learning
  - Systems
---
Thesis, notable coursework, or other notes in Markdown.
```

---

### `awards`: Awards, honors, scholarships, grants

Folder: `src/content/awards/`

Sorted by `date` descending. Grouped by `awardType` on the Awards page.

```yaml
---
title: Best Paper Award
issuer: IEEE Conference on X
date: "2023-11"
awardType: award # award | scholarship | grant | honor | competition
amount: "$2,500" # optional: shown for scholarships/grants
link: https://...
tags:
  - Machine Learning
---
Short description in Markdown.
```

---

### `publications`: Academic papers, theses, formal articles

Folder: `src/content/publications/`

Distinct from blog posts: externally published, citable, with DOI. Sorted by `year` descending.

```yaml
---
title: "Paper Title"
authors: "Wren Emberquill, Co-Author Name"
venue: "IEEE Conference on X"
year: "2024"
doi: "10.1109/..."
link: https://...
pubType: conference # journal | conference | preprint | book-chapter | thesis | other
tags:
  - Machine Learning
---
Abstract or summary in Markdown.
```

---

### `speaking`: Talks, conference presentations, podcast appearances

Folder: `src/content/speaking/`

Sorted by `date` descending.

```yaml
---
title: "Talk Title"
event: "Conference Name"
date: "2024-09"
location: Calgary, AB
speakingType: talk # talk | podcast | workshop | panel | keynote | other
link: https://...
slides: https://...
video: https://...
tags:
  - AI
---
Description in Markdown.
```

---

### `volunteering`: Volunteer work, open-source contributions, community

Folder: `src/content/volunteering/`

Sorted by `startDate` descending.

```yaml
---
title: Open Source Contributor
organization: Some Project
role: Core Contributor # optional
location: Remote # optional
startDate: "2023-01"
endDate: "" # empty = ongoing
link: https://...
tags:
  - Open Source
---
Description in Markdown.
```

---

### `certificates`: Professional and academic certifications

Folder: `src/content/certificates/`

Sorted by `date` descending. Shown on `/certificates` and as a widget on the dashboard.

```yaml
---
title: AWS Certified Solutions Architect – Associate
issuer: Amazon Web Services
date: "2023-11-15"
credentialId: "ABC123DEF456"
link: https://...
certType: technical # technical | professional | academic | language | other
tags:
  - AWS
  - Cloud
---
Optional notes in Markdown.
```

---

### `references`: Professional references

Folder: `src/content/references/`

The primary identifier is `name` (not `title`). Shown on `/references`.

```yaml
---
title: Reference from PhD supervisor # descriptive label; optional
name: Dr. Jane Smith # required: full name
organization: University of Calgary
relationship: PhD Supervisor
email: j.smith@example.com
phone: ""
link: https://... # profile / website
---
Available upon request.
```

---

### `interests`: Hobbies and personal interests

Folder: `src/content/interests/`

Simple entries. Shown as color-coded chips grouped by category on `/interests` and as a chip cloud on the dashboard.

```yaml
---
title: Photography
category: creative # hobby | sport | creative | technical | social | other
---
Optional description in Markdown.
```

---

### `organizations`: Professional and academic memberships

Folder: `src/content/organizations/`

Sorted by `startDate` descending. Shown as cards on `/organizations`.

```yaml
---
title: IEEE
role: Student Member
memberType: professional # professional | academic | community | other
startDate: "2021-09"
endDate: "" # empty = current
location: Global
website: https://ieee.org
---
Optional description in Markdown.
```

---

### `projects`: Portfolio projects

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

### `posts`: Digital garden notes

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

### `books`: Reading list

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

### `trips`: City-level travel entries

Folder: `src/content/travel/cities/`

```yaml
---
city: Tokyo
country: Japan # must match a country entry's `name` field exactly
flag: 🇯🇵 # data only; not rendered (flag emoji fail on Windows, code chips were retired)
image: https://...
coordinates: "35.6762° N, 139.6503° E"
---
Travel notes in Markdown.
```

---

### `countries`: Country-level travel entries

Folder: `src/content/travel/countries/`

```yaml
---
name: Japan
code: JP # data only; kept for future use, not rendered
flag: 🇯🇵 # data only; not rendered (flag emoji fail on Windows, code chips were retired)
image: https://...
years: "2023, 2024"
visited: true
---
Country notes in Markdown.
```

---

### `blog`: Long-form articles

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

### `updates`: Microblog / feed

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

### `courses`: Certifications & courses

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

## The portfolio snapshot (not a content type)

The resume builder lives in its own repo and does **not** add a content type here. What this
repo owns is the export contract it consumes: `src/types/portfolio.ts` defines
`portfolio.json` (format `vita-portfolio`, versioned: settings plus every content collection),
and `src/services/portfolioSnapshot.ts` builds it. The snapshot doubles as a full backup of
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
}
```

### The `story` field

Any item can point at its long-form piece: a blog or garden route (`/blog/...`,
`/garden/...`) or an external URL. The `StoryLink` component renders the
consistent "read the story" affordance; interests, books, and travel cities
show it today, and other surfaces adopt it as needed. This is how a one-line
record (a game, a book, a city) connects to real writing without every
content type growing its own long-form body.

### Open type fields

`awardType`, `pubType`, `speakingType`, `certType`, and `memberType` are open
strings: the values listed in each section above are common suggestions (they
get proper labels from `src/lib/labels.ts`), but any owner-invented value is
valid and renders as its Title Case form. An athletics trophy
(`awardType: athletics`), a patent (`pubType: patent`), or an attended
conference (`speakingType: attendance`) needs no code change.

---

## Frontmatter conventions

- `id` is optional: omit it and the filename slug is used automatically.
- `tags` must be a YAML list, not a comma-separated string.
- Dates use ISO strings: `"2024-03-15"` (full) or `"2024-03"` (month-only for startDate/endDate).
- Empty strings `""` are valid for optional fields.
- The body (everything after the closing `---`) is available as `item.body`.
- **Never use `type` as a frontmatter key**: it conflicts with the internal `ContentType` field. Use type-specific names: `employmentType`, `awardType`, `updateType`, `pubType`, `speakingType`, `certType`, `memberType`. The `posts` type is the exception: its frontmatter `type` is remapped to `postType` in the loader.
- `skills` and `languages` in settings use the format `Category: item1, item2` (one per line). For languages, each line is `Language: Proficiency`.
