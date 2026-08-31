# Roadmap & Feature Analysis

This document captures what the site currently has and what remains open. It is the source of truth for feature decisions.

---

## Vision

A **CV on steroids**: every dimension of a professional and personal life in one place:

- Career layer: experience, education, skills, projects, awards, publications, talks, certifications, organizations
- Personal layer: writing (blog + garden), reading, travel, microblog, interests
- Presented beautifully, managed through the companion admin panel (its own repo), deployed statically

---

## Current state

### Implemented and working

| Section          | Type(s)                 | Route            | Notes                                                               |
| ---------------- | ----------------------- | ---------------- | ------------------------------------------------------------------- |
| Home (dashboard) | -                       | `/`              | Hero + six numbered chapters previewing every section               |
| Experience       | `experience`            | `/experience`    | Timeline with expandable cards, employment type badge               |
| Education        | `education` + `courses` | `/education`     | Degrees timeline + certifications grid                              |
| Awards           | `awards`                | `/awards`        | Chronological ledger; type badge (competition / scholarship / etc.) |
| Certificates     | `certificates`          | `/certificates`  | Filter pills by type; credential ID + link support                  |
| Publications     | `publications`          | `/publications`  | Sorted by year; pubType badge; DOI + PDF links                      |
| Speaking         | `speaking`              | `/speaking`      | Sorted by date; type badge; slides + video links                    |
| Volunteering     | `volunteering`          | `/volunteering`  | Timeline with org + date range                                      |
| Organizations    | `organizations`         | `/organizations` | Professional memberships; memberType badge                          |
| References       | `references`            | `/references`    | Contact cards with mailto / tel links                               |
| Projects         | `projects`              | `/projects`      | Featured card + year-grouped ledger                                 |
| Library          | `books` + `media`       | `/library`       | Shelf hub; per-shelf pages; status + rating on every shelf          |
| Skills           | -                       | `/skills`        | Skill matrix + spoken languages + setup notes (`/uses` redirects)   |
| Interests        | `interests`             | `/interests`     | Ledger rows grouped by category, story links                        |
| Travel           | `countries` + `trips`   | `/travel`        | Hierarchical country → city                                         |
| Garden           | `posts`                 | `/garden`        | Open note kinds (Seedling / Evergreen / List); per-post routes      |
| Blog             | `blog`                  | `/blog`          | Series, tags, reading time; per-post routes                         |
| Updates          | `updates`               | `/updates`       | note / link / milestone subtypes                                    |
| Search           | -                       | Ctrl+K           | `SearchModal` · scored substring match over 17 content types        |

### Profile card (dashboard) displays

| Field                    | Source                                                                   |
| ------------------------ | ------------------------------------------------------------------------ |
| Name, role               | `settings.name`, `settings.role`                                         |
| Location + nationality   | `settings.location`, `settings.nationality`                              |
| Work mode + availability | `settings.workMode`, `settings.availability`                             |
| Bio                      | `settings.body` / `settings.bio`                                         |
| Social links             | email, phone, website, GitHub, LinkedIn, Twitter, Scholar, Medium, ORCID |
| Languages                | `settings.languages` (parsed `Language: Proficiency` per line)           |
| Skills                   | `settings.skills` (parsed `Category: item1, item2` per line)             |

### Settings-only fields (not publicly displayed)

| Field         | Purpose                                       |
| ------------- | --------------------------------------------- |
| `dateOfBirth` | Resume use; not rendered on site              |
| `declaration` | End-of-resume statement; not rendered on site |

---

## Open technical debt

| Item                      | Priority | Notes                                                                                                               |
| ------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------- |
| Seed shadowing            | Medium   | Runtime edits shadow bundled markdown; redeploys only trigger a console warning · merge/choose UI is a product call |
| Runtime schema validation | Low      | Loaders trust frontmatter/localStorage shapes; tests pin behavior but nothing validates at runtime                  |
| Bundle size               | Low      | One main chunk ~590 kB min / 180 kB gzip; `react-markdown` code-split; further `manualChunks` splits possible       |
| `courses` route           | Low      | No dedicated page · intentionally shown under `/education`. Could add `/courses` if needed.                         |

---

## Things deliberately excluded

| Item                                | Reason                                                                                                         |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Goals / habit tracking              | Private, not public-facing                                                                                     |
| Newsletter                          | Out of scope for a static site                                                                                 |
| Comments / reactions                | No server; would require a third-party service                                                                 |
| Visa / passport / disability fields | Privacy-sensitive; added to resume builders for compliance purposes but not appropriate for a public portfolio |
| Expected salary                     | Privacy-sensitive                                                                                              |
