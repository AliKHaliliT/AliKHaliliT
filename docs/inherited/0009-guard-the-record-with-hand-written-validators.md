# 0009. Guard the record with hand-written validators

Status: Accepted
Date: 2026-08-04

## Context

Content entered the site through two unchecked doors. The markdown loader assembled
an item out of frontmatter and cast it with `as unknown as AnyContentItem[]`, a cast
that says the compiler cannot help here and nothing else checks either. The store
read the localStorage override with `JSON.parse` and returned the result as domain
types directly.

The second door mattered more than the first. `os_content_<type>` is written by the
companion admin panel, which is a separate application that happens to share this
browser origin. Anything malformed there, from a stale key written by an older
version to a hand-edited value, reached the pages as if the site had produced it.
The failure then surfaced wherever a page first touched a missing field, which is
the worst place to learn about it.

## Options considered

- **Leave the casts and rely on the ecosystem contract.** Rejected: the contract is
  real but unenforced, and the site is the party that renders the damage.
- **Adopt a schema library.** Rejected. It is the sibling template's instrument and
  a good one, but this repository already validates by hand-written type guard
  (`isSiteIdentity` predates this decision), the site ships to static hosting where
  every dependency is weight a visitor downloads, and the shapes being checked are
  shallow. Consistency with the code already here beat consistency with the sibling.
- **Hand-written validators plus a named error.** Accepted.

## Decision

`entities/record/schema.ts` holds the contract and a `RecordContractError` that
names the file or storage key the offending value came from. Both doors run through
it, and they fail differently on purpose:

- The **seed** is committed content, so a file whose frontmatter cannot produce a
  valid item is an authoring bug. The loader throws with the markdown path, and the
  suite that loads every type turns that into a failing test rather than a
  production surprise.
- The **override** is another application's output, so a malformed value is not this
  site's bug to fail on. The store reports the key to clear and serves the committed
  seed instead, which keeps a corrupt override from blanking a public page.

Only invariants the whole site depends on are checked: the value is a list, each
item is an object with a usable id, each item's `type` matches the collection it was
filed under, and `tags` is a list when present. Optional fields stay optional.

## Consequences

The loader's return type is now earned rather than asserted, and the dynamic field
access that sorting needs is confined to one named helper instead of loosening the
type of the whole array. A wrong-collection or wrong-shape override degrades to the
committed content with the cause named in the console.

The guards are deliberately shallow, so a value can satisfy them and still be missing
a field some page wants. That is the accepted limit: the checks cover what every
consumer assumes, and per-type depth would have to be maintained against the model
forever to stay honest.
