# Content Model: Owner Profile

The owner profile of the record, carved from the content model's door. Field semantics and shared rules live in [CONTENT-MODEL.md](CONTENT-MODEL.md).

## `settings`: Profile

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
# src/shared/lib/linkIcons.ts: with an icon the hero renders an icon square,
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
