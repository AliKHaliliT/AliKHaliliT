# Upstream

Aligned to VITA at `1fdec80`.

Every entry below is a lead, not a verdict; verify it against the template's own tree before adopting it.

## Open

### 2026-09-24 A deployment cannot name a real word where the spelling advisory keeps its ignore list

Kind: defect
Pin: 1fdec80

**What it is.** The rulebook says a flagged word that is a real term is named in the check's
ignore list, so the decision is written where the check runs. The spelling advisory runs inside
the docs audit, and its ignore list is a constant in that script, which a deployment carries byte
for byte from the template and pins, so a deployment has no ignore list it may write to. An
identifier the dictionary misreads, and a real word of the deployment's own record, then print on
every run of every change, and the only answer left is the same dismissal repeated in every
commit message. Reading a project's own list beside the style's, for instance a file of ignored
words the audit passes to codespell, would put the decision where the check runs again.

**How the work surfaced it.** A re-alignment reproduced the spelling pass with codespell's own
default dictionaries over the audit's skip list. It named an icon component's identifier at
nineteen places, a course title in the record, and a real plural, alongside five places in the
carried selftest.

**What was worked around.** Nothing in the tree. The candidates were dismissed in the commit
message of the change that produced them, and they will print again on the next run.

**Records checked.** The template's record that disposed of the style's latest wave names the
spelling advisory's move into the audit and says nothing about a child's own terms. The
template's own upstream file already carries the gap to the style, and this entry adds the case
of a deployment, whose own record brings real words the dictionary does not know.
