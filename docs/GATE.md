# The delivery gate

A task is not delivered while the gate below has findings. Carry these items from the first line written, because they are cheapest to satisfy while the code is still forming and most expensive as after-the-fact repairs; the closing pass exists to confirm, not to redo.

Closing a task follows one loop: run the checking commands the guide lists, weigh the change against every item below, fix what an item names, and repeat. One pass with no findings ends the loop. A finding is a concrete disagreement with a listed item, never general unease; the list is closed, and nothing outside it may generate rework. If the same finding survives three honest fix attempts, stop looping, record the finding and the attempts in STATE.md, and say so plainly when delivering. The names below index a wider literature; where a name's common usage and the rule beside it differ, the rule governs.

- **Cognitive load**: nothing in the change is harder to hold in mind than the task requires.
- **Granularity**: the size of every new unit (function, file, document, the change itself) is a choice, not an accident.
- **Growth honesty**: what each loop's or query's cost grows with is a choice, not an accident, and no change buys a worse growth rate where a construction of equal effort exists.
- **Ubiquitous language**: new names use the vocabulary the tree already speaks.
- **Single source of truth**: the change introduces no second copy of any fact, and anything derived points at its source.
- **Least privilege and surface**: nothing gains more access, exports, or dependencies than the task needs.
- **Adversary honesty**: every change that creates or moves a trust boundary names who it is meant to withstand, and deciding that nobody is attacking it is a decision to write down rather than an assumption to leave implicit.
- **Boundary honesty**: no data crosses a boundary unchecked, and checking happens at the door, once.
- **Loud failure**: every new failure path raises a typed error; nothing is swallowed or silently defaulted.
- **Two hats**: shape changes and behavior changes are separate steps, and no incidental reformatting rides along.
- **Waste**: nothing speculative and nothing the change orphaned is left behind.
- **The measured line**: nothing is made faster without a measurement that demanded it, and every optimization that lands records its measurement and its price.
- **Test honesty**: substitutes stand in only at the declared seams, time, randomness, and order are controlled, the suite runs in a shuffled order under a seed the run prints so a test leaning on its neighbor fails on the day it is written and the run that caught it can be replayed, and where an optional dependency sits behind a port with a fallback implementation, the suite executes both paths and holds them to a tolerance a decision record states with the measurement that set it, over a fixture on which the two can disagree, and no request leaves the loopback, since the test setup refuses one and a test that must reach a host names the host in the open.
- **Point-of-use truth**: the doc comment or docstring each export carries is true, not merely present.
- **Intent-split placement**: every documentation change lands in the document whose reader it serves, per the rulebook's species.
- **Decision records**: any choice made here that would be re-litigated without a record gets one now.
- **Debt**: every shortcut taken is written in STATE.md before delivery, never carried in memory.
- **Invariants bound**: every claim the change adds, moves, or retires has its row in `docs/INVARIANTS.md`, each row naming a holder in the tree and its rung, and a claim nothing decides is held by review and printed by the audit rather than carried in memory.
- **Upstream honesty**: every workaround of template-owned bytes or template-prescribed behavior, and every improvement that qualified, is an entry in the project's `UPSTREAM.md` before delivery, nameless as to the project, and the closing note names each entry added by its heading, or says there is none.
- **The commands**: every checking command the guide lists has passed against the final state of the tree, which is the tree that gets pushed, so a merge or a rebase after the last run makes a new final tree and the commands run again on it, and every advisory finding printed along the way has been read and then fixed or dismissed in the commit message.
- **The hard rules**: the change disagrees with no review-held clause of [RULES.md](RULES.md), [CONDUCT.md](CONDUCT.md) or [LANDING.md](LANDING.md), re-read now, not recalled.
