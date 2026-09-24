# Invariants

What must stay true about this site, one row per claim, each bound to the holder that refuses a violation and graded by what its green is worth. The rulebook's section on the invariants ledger defines the columns and the five rungs; the docs audit holds that every holder is in the tree and prints every claim held by review alone on every run, and whether a claim is true stays with review.

| Claim | Held by | Rung |
| --- | --- | --- |
| Imports point downward only, from app through pages, features, and entities to shared, never back up. | `eslint.config.js` "Imports point downward only" | impossible |
| A slice is entered only through its `index.ts`. | `eslint.config.js` "Enter a slice through its index.ts" | impossible |
| The environment is read only through `shared/config`. | `eslint.config.js` "Read the environment through shared/config" | impossible |
| Nothing outside `shared/config` calls `fetch`. | `eslint.config.js` "HTTP lives in its documented home" | impossible |
| Nothing in product code prints to the console. | `eslint.config.js` "no-console" | impossible |
| Colors come only from the token utilities, and no raw palette class ships. | `scripts/audit-docs.mjs` "raw palette class" | impossible |
| No test opens a connection to a host beyond this machine. | `tests/setup.ts` "refused a connection" | impossible |
| Every content folder loads as an array, and each populated one carries its items. | `tests/src/entities/record/seed.test.ts` "returns an array for every content folder, items for the populated ones" | listed cases |
| A committed markdown file whose frontmatter cannot make an item is refused with the file named. | `tests/src/entities/record/schema.test.ts` "names the markdown file when frontmatter cannot make an item" | listed cases |
| A saved copy that breaks the record's contract never reaches a page, and its key is named. | `tests/src/entities/record/store.test.ts` "falls back and names the key when the stored shape breaks the contract" | listed cases |
| A saved copy the deployment has moved past is dropped rather than shown. | `tests/src/entities/record/store.test.ts` "drops the override and serves the seed when the markdown changed underneath" | listed cases |
| Pinned entries lead their section in ascending pin order, whatever the ordering policy. | `tests/src/entities/record/order.test.ts` "lifts pinned entries to the front in ascending pin order" | listed cases |
| The portfolio export round-trips through its file format with the contract fields intact. | `tests/src/features/portfolio-export/snapshot.test.ts` "round-trips through the file format with the contract fields intact" | listed cases |
| Only a browser holding a saved copy that failed its check ever shows the saved-copy notice. | review | review |
