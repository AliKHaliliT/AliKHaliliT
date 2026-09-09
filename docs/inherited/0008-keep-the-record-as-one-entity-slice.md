# 0008. Keep the record as one entity slice

Status: Accepted
Date: 2026-08-04

## Context

Adopting sliced layers ([decision 0007](0007-build-the-site-as-one-way-sliced-layers.md))
raised an immediate question about the entity layer. The site knows sixteen content
types, from projects and books to publications and interests. The obvious reading of
an entity layer is one slice per domain noun, which would mean sixteen slices.

The content model does not actually work that way. Every type extends one
`BaseContent` shape, differing only in a few structured fields, and they are all
loaded by one generic loader keyed by type and stored under one keying scheme. The
types are variants of a discriminated union rather than independent nouns.

## Options considered

- **One slice per content type.** Rejected, on three counts. `AnyContentItem` and
  `ContentType` are used by the loader, the store, the search feature, and the
  portfolio exporter, so the union would have to live below all sixteen slices in
  `shared`, which is where the layering stops meaning anything. Fifteen of the
  slices would then hold a type alias and nothing else. And the two consumers that
  genuinely span everything, search and the snapshot, would import sixteen slices
  each to do it.
- **Slices grouped by domain kinship**, such as writing, credentials, and travel.
  Rejected: the groupings are arbitrary at the edges (a course is a credential or a
  piece of learning depending on the day), and each group would still need the
  shared base type from below, so the first objection survives in weaker form.
- **One `record` slice, with `site` beside it.** Accepted.

## Decision

The entity layer holds two slices. `entities/record` owns the content union, both
of its doors, the collections the site reads, and the small parts that render a
specific type. `entities/site` owns file-seeded identity and appearance, which is a
genuinely different noun with its own storage keys and its own seed files.

Internal structure inside the record slice carries the weight that separate slices
would have: `model.ts`, `schema.ts`, `seed.ts`, `store.ts`, `context.ts`, and a
`ui/` folder, all behind one `index.ts`.

## Consequences

The union stays in the layer that owns it, and the two cross-cutting consumers
enter through one door rather than sixteen. The record slice is correspondingly
large, which is the honest cost: it is the biggest thing in the source tree, and
finding a part inside it means knowing its segment rather than its slice.

If a content type ever grows logic of its own that the others do not share, it can
be promoted to its own slice without disturbing this decision, since the union
would stay where it is and the new slice would sit beside `record` rather than
under it.
