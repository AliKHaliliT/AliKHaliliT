# 0025. Name a refused saved copy on the page

Status: Accepted
Date: 2026-09-22

## Context

The style's next alignment brings a lint rule that refuses any `console` call in
product code, with the instruction that a diagnostic goes where the failure path
already sends it and never to the console. The record's door printed three
console lines. One reported a stale override being dropped. Two named the key
when a broken override or a broken profile was refused, and those two carried a
promise stated in the guide, the README, and
[decision 0009, Guard the record with hand-written validators](0009-guard-the-record-with-hand-written-validators.md),
that a broken override falls back to the seed with the key to clear named.
Deleting the lines alone would have kept the fallback and broken the promise, so
the choice was put to the owner, who chose a notice on the page.

## Evidence

A production build served locally, with a corrupt `os_content_books` and an
`os_settings` claiming the type books planted in storage, rendered one notice
naming both keys with their reasons,
`Expected property name or '}' in JSON at position 1 (line 1 column 2)` and
`Record contract violated by localStorage "os_settings": settings claims type "books"`.
With storage cleared it rendered nothing. At 390 pixels wide the notice kept its
16-pixel gutters with no horizontal scroll, in the dark theme as in the light,
and dismissing it removed it.

The store was mutated six ways against the suite: no refusal recorded, a refusal
never forgotten, a stale drop recorded as refused, unreadable storage left to
throw, the profile's refusal filed under the wrong collection, and an empty list
always returned. A test failed for each.

The storage helper `safeSetItem`, which printed a console error beside its
alert, had no caller in `src/` or `tests/`. It is a write path that
[decision 0014, Let a changed seed win over a stale override](0014-let-a-changed-seed-win-over-a-stale-override.md)
purged everywhere else and missed.

## Options considered

- Drop the diagnostics and supersede the promise. Refused by the owner, because
  the fallback would then name nothing anywhere, and an edit made in the admin
  that never appears here would have no explanation at all.
- Waive the console rule for the store and report the clash upstream. Refused,
  because the rule leaves product code no room, and the waiver would keep the one
  channel the owner rarely has open.
- A notice for the stale drop as well. Refused. Dropping a stale copy is the
  designed path of decision 0014, the copy is already gone when the notice would
  appear, and a notice after every publish would teach the owner to ignore the
  one that matters.

## Decision

The store records each saved copy it refuses, with its key, the collection it
claimed, and the reason the check gave, and forgets the entry once the key reads
cleanly again or holds nothing. The context carries the list, and the shell
renders a small notice when it is not empty, naming each key and its reason,
dismissible for the page view. Storage that cannot be read at all holds nothing
to honor or to name, so a visitor whose browser blocks storage sees nothing. The
stale-drop line goes without a replacement, and the unused storage helper is
deleted.

## Consequences

The promise holds, and it now reaches the owner in the page rather than in a
console they would have had to open. The suites assert the named key instead of
spying on the console. A visitor never sees the notice, because only a browser
holding a copy the admin wrote can hold a broken one.
