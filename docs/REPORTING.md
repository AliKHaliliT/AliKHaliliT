# The upstream report

This template is the style's single statement of its form, and it only stays that way if what a child learns flows back to it. When work against this template surfaces something the template itself should have had, the improvement belongs in the template first and in the project second; an improvement kept privately by one child is a quiet fork of the style. The same road carries defects. A child that works around something in the template's own bytes or behavior and tells nobody leaves every later child to hit it, so the road is also where a workaround is confessed.

A project built from this template carries one living document for this, `UPSTREAM.md` at the top of `docs/`, registered by one index row and present from adoption on; the template itself has none, being the style. It is a document of the same kind as `STATE.md`. It holds what is pending between the project and its style, an entry is written when the work that produced it closes, and an entry is deleted when it is resolved, with anything worth keeping written into a decision record. Its schema is fixed:

- The file opens with its title, one line naming the template and the commit the project is aligned to, `Aligned to <template> at <commit>`, or at the host's own commit for an arrow carried inside its style's repository, and one sentence saying that every entry is a lead and not a verdict, to be verified against the template's own tree before it is adopted.
- One section, `## Open`, holds either the words `Nothing open.` or entries.
- Each entry is a heading of the form `### YYYY-MM-DD` followed by a title, then a `Kind:` line reading `improvement` or `defect`, and a `Pin:` line naming the template commit the entry was written against.
- An entry sent outside the file, as an issue on the template's repository or in a message, keeps its heading whole as its first line, the date and the title together, because the date is the day the entry was written against its pin and the channel's own stamp is the day it was sent.
- Each entry carries four parts under the bold labels **What it is**, **How the work surfaced it**, **Why it is believed better** or **What was worked around**, and **Records checked**.

An entry names nothing that identifies the project, no project name, no person, no host, no path or address that points at the project, and no fact about its domain beyond what the entry needs, because the file is handed to the template's public repository and may be quoted verbatim into its records, whatever the visibility of the project that wrote it. The part that says how the work surfaced the entry names the kind of work and never its subject, an entry quotes the template's bytes and never the project's own code, data or prose, it attaches nothing, no log, screenshot or file, because an attachment carries what the text was written to leave out and no audit reads one, and whatever cannot be said in public stays in the project's private, untracked ledger. Before an entry leaves the repository, its owner reads it as a stranger would. The docs audit refuses an entry carrying an address, a URL, an email or an absolute path, the leaks a tool can decide, and a name stays review's.

The shape, as bytes to copy rather than a sentence to interpret:

```markdown
# Upstream

Aligned to <template> at <commit>.

Every entry below is a lead, not a verdict; verify it against the template's own tree before adopting it.

## Open

### 2026-09-09 A title in plain words

Kind: improvement
Pin: <commit>

**What it is.** One paragraph.

**How the work surfaced it.** One paragraph.

**Why it is believed better.** One paragraph, or **What was worked around.** for a defect.

**Records checked.** One paragraph.
```

Entries come in two kinds, and only the first is judged:

- **An improvement** earns an entry only if it is genuinely better rather than differently shaped, the template does not already have it, and the template's decision records, [decisions/](decisions/) here and the `inherited/` folder under `docs/` in a project built from this template, show no record of it being considered and rejected. Read the decision records before writing anything; a rejected idea returning without new evidence is noise, and an improvement invented to have something to send is worse than none.
- **A defect** is never judged. Anything the child worked around, patched, suppressed, or could not make work in template-owned bytes or template-prescribed behavior gets an entry, whether or not the child is sure it is a defect and however small the fix was. An entry may say plainly that the child could not tell a defect from its own misunderstanding, because the maintainer decides that, and size is not a criterion; a one-line rename a child needed is exactly the kind of entry that must arrive.

The order is strict. The work is finished as specified first, and an entry is never written instead of finishing. Each entry is written as a hand-off, self-contained enough to be pasted to an agent or handed to the template's maintainer and acted on with no other context, in the same change that closes the work which produced it, and the closing note of that delivery names each entry added by its heading, or says none was. The style's owner reads the file and points an agent at the template. Anyone else holding it is holding an open-source template's feedback, and the right move is for the project's owner to file each entry as an issue on the template's repository. An agent never sends an entry anywhere on its own, not as an issue, a message or a pull request, because what leaves the repository cannot be taken back; it proposes the sending in its closing note as a numbered option, and the owner sends or declines.

No reply is owed, and nothing waits for one. Every open entry is resolved by the child at its next re-alignment, against the new pin, the records the template gained since the old one, and the treasury's dispositions, which name reports by pin and date and are public, so a refusal is found there without anyone writing a letter. An entry the template now carries is deleted and the template's form taken. An entry a record refuses is deleted, the child conforming, or turned into the child's own decision record where the matter is the child's to decide. An entry the template is silent on stays. An entry older than ninety days is re-verified against the current template and re-dated, or made the child's own decision and deleted, because silence for a season is the style's answer for now and the child owns its divergence. A reply from the maintainer, when one comes, is a message that speeds this up and is filed nowhere; what was sent and what became of it is the file's own history in git.
