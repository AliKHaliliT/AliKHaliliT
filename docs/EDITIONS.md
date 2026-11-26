# Editions

A project built from this style is a workshop. It holds the product, and beside it everything the style has it keep, the guide, the state, the documents, the records and the audits. Every tracked byte is already written for a public audience, so the whole repository may be published as it stands. An edition is for the owner who wants the product public and the workshop kept back. It is a tree cut from the repository by a tool, at one of four tiers, and below the snapshot in one of two versions.

## The tiers

A tier says how much leaves the workshop, and each holds less than the one above it.

| Tier | What it holds | History | Versions |
| --- | --- | --- | --- |
| Whole | The repository in its entirety. | Its own | One |
| Snapshot | Every tracked file as it stands. | New | One |
| Hand-made | The product as written, a README rewritten for what the edition holds, and the files the overlay lays over it. | New | Two |
| Bare | The hand-made tier's files with comments and docstrings stripped, and a README cut to what the thing is and how to run it. | New | Two |

The whole tier is the repository itself and needs no cut. The hand-made tier is the one to reach for, a repository that reads as if it had been made by hand, with no record, no rule and no gate in it.

Nothing sits between the snapshot and the hand-made tier, because the workshop cannot be shed by degrees. A commit message cites a record, a record cites the rulebook and the records it inherited, the invariants ledger names the audits, and history holds every file that was ever tracked. Cut one of them and the rest point at nothing, so they leave together, and the snapshot is the one step that drops history alone.

## What a tier withholds

From the hand-made tier down, an edition holds the product and nothing of the workshop. Withheld are the guide and the state file, the whole of `docs/`, the audits and the edition tool, the word list the spelling advisory reads, the workflow that runs the style's gate, and the `edition/` folder itself. A project withholds more by naming paths in `edition/withheld.txt`, one to a line, a folder by its trailing slash. A command the manifest keeps for a withheld tool leaves with the tool, since a script whose file stays in the workshop is a command that fails.

The code leaves as it is written. At the hand-made tier no source file differs from its commit by a byte, its comments and docstrings included. Only Markdown is rewritten, the README above all, and in three ways. The Conventions section is cut, since it points at documents the edition withholds. A drawn tree loses the lines for withheld paths and has its branches redrawn around them. A link into a withheld path is turned back into its words, and an image the edition cannot show refuses the cut, since nothing stands in for a picture.

The bare tier strips comments and docstrings from every kind of file on which a strip can prove itself. A comment that instructs a tool, a type or lint directive, stays without the reason written after it. The README keeps its opening, its Getting Started section and its License section. A stripped file parses to what its source parsed to, so stripped code runs as its source ran. It does not pass a lint that demands docstrings, and a framework that reads docstrings loses what it read from them, so a bare edition is for running and not for reading.

## The two versions

Below the snapshot an edition is cut in one of two versions. The attributed version says where it came from. Its README keeps the sentence that names the template and gains a notice that names the tier. The silent version names nothing of the style. The tier and the version are the owner's to name, and a cut asked for no version is attributed.

What names the style is a closed list, so that a tool can decide it. It is the family by its name, a record by its number, and a withheld path by its name. In a silent cut the README's opening loses each sentence that names the family, and the cut reports every sentence it took. A comment that names the style is dropped with the block it stands in, since a run of comment lines is one remark. A docstring, a documentation comment or a line of a document that names the style is never rewritten by the tool. It refuses the cut, and the line is then reworded in the workshop, by a change like any other, or its file is withheld. A word the style merely uses, such as rulebook, decides nothing, because a product may use the same word of itself, and the cut names each line that holds one as advice.

The whole tier and the snapshot have one version each, because they carry the style's own documents and cannot be silent about it.

## How a cut is made

The edition tool is run as the guide's Commands section gives it, with a tier, a destination and the version. It cuts from the last commit and refuses a tree that holds uncommitted changes, so an edition always answers to one commit, which the tool prints. It assembles the edition whole before it writes a byte, and a cut with a problem writes nothing. A destination under which a path would run past what the system is sure to write is such a problem, so it is refused before the cut writes. The destination is a folder outside the repository that holds nothing yet, and the tool refuses any other. The tool never commits, never pushes and never deletes.

Publishing is the owner's. An agent sends nothing outside the repository on its own, so it cuts the edition, reports what the tool printed, and proposes the publishing as a numbered option. The owner commits the destination as the public repository's history, one commit for each edition, and tags in the workshop the commit the edition was cut from, so that a figure the public cites can be traced to the run that produced it.

A project kept inside another, an arrow in an inquiry or a client beside its server, carries a guide of its own and is cut by its own tool at the same tier and version, then laid in at its path. A nested project with no tool refuses the cut. The edition of an inquiry is therefore its arrows, each cut as the product it is, under the inquiry's README. Its questions, claims, passes and bibliography are the workshop, and whoever wants the inquiry itself public takes the whole tier or the snapshot.

## The edition folder

`edition/` holds what a project's editions need beyond the style's own rules, and exists only while it holds something. `edition/withheld.txt` is the project's own list of withheld paths. `edition/overlay/` holds the files the public receives in another form than the workshop keeps, each at the path it replaces, and is laid over the hand-made tier alone. The style ships one such file, a plain workflow that runs the product's own checks in place of the gate, and the docs audit holds its actions to the pins it holds every workflow to. A nested project leaves its workflow behind, since a workflow is read at a repository's root and nowhere else.

## What the tool proves, and what stays with review

A strip is trusted only through its proof. A stripped file must still parse or read to what its source did, comments and docstrings apart, and a strip that cannot show this is not made. A kind with no parser to prove a strip is carried as written, and a bare cut names every such kind. The tool's selftest cuts a project of its own making at every tier and in both versions.

Review keeps what a tool cannot decide. The tool runs none of the product's checks, so review runs them in the destination before it is published, since a path withheld may be one the product needed. Whether the README still reads well after its cuts is review's, and so is each word the silent cut advised. The license is the owner's alone. A cut says when the edition carries none, and no agent writes one.
