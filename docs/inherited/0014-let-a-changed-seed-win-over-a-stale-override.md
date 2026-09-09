# 0014. Let a changed seed win over a stale override

Status: Accepted
Date: 2026-08-10

## Context

The record door preferred this browser's localStorage override unconditionally. That is right while the override is newer than the deployment, which is the companion admin's preview working as designed on their shared origin, and wrong forever after: once a redeploy changed the markdown underneath a shadowed collection, the browser kept showing the old edit and the only notice was a console warning naming the key to clear. The deferred fix on file was a merge-or-choose dialog, real UI with real design cost.

The store had already recorded everything needed to do better. Every admin save writes a fingerprint of the seed it was made against, and the door was reading that fingerprint just to warn.

A second finding rode along. The write half of this site's storage code, the record's `save` and `downloadMarkdown`, the identity and palette writers, and the provider's whole mutation chain of `updateContent`, `updateSettings`, and `deleteItem`, had zero callers anywhere in the app. They are fossils of the era when the admin lived inside this repository, kept alive since the split only by tests exercising them. The owner ruled that genuinely dead code is purged.

## Options considered

- **The merge-or-choose UI.** Rejected: it asks the owner to arbitrate every conflict by hand when the fingerprint already knows the answer, and it is the most work of the three.
- **Overrides gated to dev builds.** Rejected: it would kill the admin's same-origin live preview on the deployed site, which is documented design.
- **Seed wins when the seed changed.** Accepted: one rule at the door, no UI, and both directions stay correct. A draft newer than the deployment previews as before; a deployment newer than the draft shows through, with the stale copy dropped rather than warned about.

## Decision

The door keeps an override only while the committed seed still matches the fingerprint recorded at save time. When they differ, the override and its fingerprint are removed and the seed is served, with one console note saying so. An override carrying no fingerprint at all is kept, since there is nothing to judge it against.

The dead write half is purged. `ContentService` is now a read-only door of `getAll` and `getSettings`, the identity and palette modules keep only their read paths, the provider's context drops its mutation methods, and the suites arrange overrides the way the admin actually creates them, by writing storage directly, instead of calling writers this site no longer owns. The merge-UI deferral leaves STATE with this record as its answer.

## Consequences

Editing this site happens where it always really happened, in the companion admin or in the files, and the site itself is now structurally incapable of writing its own record, which is what a renderer should be. The stale-shadow failure mode is gone rather than diagnosable. The costs are that a not-yet-published draft is discarded the moment a redeploy touches its collection, which is the correct reading of "the repository is the record", and that the door's behavior now depends on the fingerprint the admin writes, a coupling that was already there and is now honest.
