# 0007. Build the site as one-way sliced layers

Status: Accepted
Date: 2026-08-04

## Context

The site grew from a scaffold, so its source tree grouped files by technical kind:
`components/` beside `lib/`, `services/`, `context/`, `types/`, and `hooks/`. That
layout answers "what sort of file is this" and answers nothing about direction. A
UI atom could import a service, a service could import a page helper, and nothing
in the tree said which way a dependency was allowed to run. The practical symptoms
were small but real. A helper that reads site settings sat in `lib/` next to
helpers that read nothing, the site map lived in `lib/nav.ts` while the routes that
had to agree with it lived in `App.tsx`, and `App.tsx` itself carried the provider
stack, the route table, the transition choreography, and the page chrome at once.

A sibling template in the same family had meanwhile settled a shape for exactly this
kind of application, and adopting it makes the three repositories of this ecosystem
legible to the same reader.

## Options considered

- **Leave the kind-based tree and document the intended direction.** Rejected: a
  direction that exists only in prose is not checkable, and the drift that prompted
  this decision happened under exactly such a convention.
- **Group by feature with no layering.** Rejected: it removes the kind-based
  arbitrariness without adding direction, so the same sideways imports remain
  legal and the shared UI kit has nowhere principled to live.
- **One-way sliced layers.** Accepted.

## Decision

Source lives in five layers, and imports point downward only:

```text
app  ->  pages  ->  features  ->  entities  ->  shared
```

A slice is entered through its `index.ts` and nowhere else, suites excepted since
they test a module directly. Same-layer slices do not import each other; a concern
spanning two of them moves up a layer instead. A part used by exactly one page
stays inside that page, and a part a second page needs moves down a layer.

The composition root is split to match: `main.tsx` boots, `providers.tsx` holds the
provider stack, `router.tsx` holds the route table and its choreography, and
`app/layout/AppLayout.tsx` holds the chrome.

Two consequences are deliberate rather than accidental. The nav map lives in
`shared/config` because three layers read it, which means paths appear both there
and in the router; the router owns which component answers a path, and the nav map
owns where that path sits in the site map. And the Vite plugins read
`entities/site/meta.ts` and `entities/site/paletteCss.ts` directly at build time,
which is outside the layer stack entirely; both files are dependency-free by design
for that reason.

## Consequences

The direction of every dependency is now a property of where a file sits, so a
violation is visible in an import path rather than discoverable only by reading.
Splitting the content provider from its hook also removed an ESLint exemption that
existed only to tolerate a file exporting a component beside its hook.

The cost is real. Import paths got longer, moving a part between layers is a rename
rather than an edit, and the layer rule is enforced by review alone, since no linter
in this repository checks it yet. A boundary linter is recorded as deferred in
STATE.md rather than adopted unproven.
