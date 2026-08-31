# 0010. Move the played games onto the library's shelf

Status: Accepted
Date: 2026-08-31

## Context

The template grew a multi-medium library (its decision 0017): a media
collection shelved by an open `medium` field, a hub page of shelves, and a
full page per shelf. This deployment carries that template change, and it
already held exactly the data the feature was built for, a garden note listing
every game Ali has played, kept there because the record had nowhere better.

## Evidence

The garden list held 49 bullets, counted by grepping its `- ` lines, and the
migration script wrote 49 media entries from that same match, so the boundary
of "every game moved" is that one file's bullet list. The full check ladder
passed against the final tree, and the built site was inspected serving 50
library entries across two shelves.

## Options considered

- Keep the garden list beside the new shelf. Lost because two copies of the
  same list is the exact drift the single-source rule exists to prevent; the
  shelf is now the list.
- Enrich the migrated entries with dates, ratings, or covers. Lost because
  the garden list carried none of that, and the record never invents; the
  fields stay empty until Ali fills them, through the panel or by hand.
- Seed film and anime entries from the matching interests. Lost for the same
  reason: the interests name the hobbies, not any titles.

## Decision

Apply the template's library wave whole, code, docs, and the adapted loader
suite. Generate one `media` entry per game in the garden list, each carrying
only what the list knew (`title`, `medium: game`, `status: Played`), delete
the garden list in the same change, and point the gaming interest's story at
the games shelf. The garden is empty as a result, which the site already
handles by hiding the section until a note exists.

## Consequences

The library now records 49 games beside the books, each entry ready to take a
rating, a date, an image, a link, or notes whenever Ali adds them. The garden
starts blank, so its section stays out of the navigation until real notes
arrive. The loader suite's postType pin moved from a named garden post to a
general invariant, since the post it pinned no longer exists.
