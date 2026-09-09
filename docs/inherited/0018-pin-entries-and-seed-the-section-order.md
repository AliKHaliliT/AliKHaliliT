# 0018. Pin entries and seed the section order

Status: Accepted
Date: 2026-08-31

## Context

Every collection carried one baked-in order (dated types newest first, the
rest alphabetical), the capped previews took its head, and nothing let the
owner choose what a section fronts or how it sorts. The owner asked for
arbitrary hand-picked entries leading a section, a per-section choice between
alphabetical and chronological, and for the whole thing to keep working when
entries lack the field a policy sorts by.

## Options considered

- A per-section list of chosen slugs in a settings seed. Lost because the
  choice lives away from the entries it governs, renaming a file silently
  breaks it, and reordering means editing a list nobody sees while writing an
  entry; a `pin` number in the entry's own frontmatter is visible exactly
  where the decision is made.
- Distinct policies for the capped view and the full page. Lost because two
  orders for one section make the preview stop being the head of the page,
  which is the one intuition every section currently honors; pins are the
  per-view control, since only the front shows them differently.
- Ordering keys inside `site.json`. Lost because ordering governs the record,
  not the identity, and the record slice cannot read the site slice without an
  import pointing sideways; a settings seed beside `profile.md` keeps the
  reader and the owner in one slice.
- Applying order at each page. Lost because seventeen call sites drift; the
  loader and the storage door order once, and every page, preview, and export
  inherits it.

## Decision

`BaseContent` gains an optional `pin`; pinned entries lead their collection in
ascending pin order in every view, and an unusable value reads as no pin. A
new optional seed, `src/content/settings/ordering.json`, maps a content type
or a library shelf (`media/<slug>`) to `alphabetical` or `chronological`; the
type defaults stand where it is silent, and a broken file means the defaults.
Chronological reads each type's own date field, sorts what carries one newest
first, and lets undated entries close the list alphabetically, so a policy
never fails on incomplete data. The ordering core lives in
`entities/record/order.ts`, applied by the loader and the storage door; the
library adds its per-shelf pass behind pins, and the hub front reads pins,
then work in hand, then shelf order.

## Consequences

Choosing a section's front row is now `pin: 1` through `pin: N` in
frontmatter, and flipping a shelf between alphabetical and chronological is
one seed line, both of which the admin panel can edit once it grows the field
and the seed editor it now owes. Grouped pages (projects by year, travel by
country) group over the ordered list, so pins reorder within groups rather
than across them. The previous loader sort was recreated exactly as the
default policies, pinned by the existing characterization suites.
