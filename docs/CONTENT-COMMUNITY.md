# Content Model: Community And Credential Ledgers

The community and credential ledgers of the record, carved from the content model's door. Field semantics and shared rules live in [CONTENT-MODEL.md](CONTENT-MODEL.md).

## `volunteering`: Volunteer work, open-source contributions, community

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

## `certificates`: Professional and academic certifications

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

## `references`: Professional references

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

## `interests`: Hobbies and personal interests

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

## `organizations`: Professional and academic memberships

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
