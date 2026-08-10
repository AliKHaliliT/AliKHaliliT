# Content Model: Career Ledgers

The career ledgers of the record, carved from the content model's door. Field semantics and shared rules live in [CONTENT-MODEL.md](CONTENT-MODEL.md).

## `experience`: Work history

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

## `education`: Degrees & formal education

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

## `awards`: Awards, honors, scholarships, grants

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

## `publications`: Academic papers, theses, formal articles

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

## `speaking`: Talks, conference presentations, podcast appearances

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
