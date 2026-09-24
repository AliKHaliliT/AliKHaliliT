/**
 * Prove each rule of the docs audit fires against a planted defect, then leave no trace.
 *
 * The audit is one script that reads the tree and prints its findings, so the proof runs it as
 * a child process over a planted tree, once per group of plants that cannot disturb each other,
 * and looks for the finding each plant was written to raise. A plant builds what it needs and
 * removes what it built, a tracked plant enters the index by intent-to-add and leaves it again,
 * and a borrowed living file comes back byte for byte, so the proof holds in a project built
 * from this template as well as in the template. A rule that only history can plant is named
 * as skipped rather than counted as proven. The unplanted tree is checked first, because a
 * plant proves nothing in a tree that already fails.
 */

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const AUDIT = join(ROOT, "scripts", "audit-docs.mjs");
const BUDGET_LINES = 150;
const HORIZON_DAYS = 90;
const NOW_CAP = 5;
const NAME_CAP = 72;
const TODAY = new Date().toISOString().slice(0, 10);

/** One git call against the repository this file lives in; empty when git says no. */
function git(...args) {
  try {
    return execFileSync("git", args, { cwd: ROOT, encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] });
  } catch {
    return "";
  }
}

/** The audit's findings and advice on the tree as it stands, one per line, the verdict lines excluded. */
function audit() {
  const done = spawnSync(process.execPath, [AUDIT], { cwd: ROOT, encoding: "utf-8" });
  return `${done.stdout}${done.stderr}`.split("\n").filter((line) => line && !line.startsWith("The tree") && !line.includes("problem(s).") && !line.startsWith("advisory,") && !line.includes("did not run"));
}

/** Only the findings, the lines the audit would fail on; advice is indented and decides nothing. */
function findings() {
  return audit().filter((line) => !line.startsWith("  "));
}

let failures = 0;

/** Report one broken rule and count it. */
function wrong(message) {
  console.log(`WRONG: ${message}`);
  failures += 1;
}

/** Fail unless a finding carries the needle. */
function expect(problems, needle, label) {
  if (!problems.some((p) => p.includes(needle))) wrong(`${label} did not raise ${JSON.stringify(needle)}`);
}

/** Write a plant, creating the directories it needs. */
function plant(rel, content) {
  const path = join(ROOT, rel);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

/** Remove a plant and every directory it emptied below the root. */
function unplant(rel) {
  const path = join(ROOT, rel);
  if (existsSync(path)) unlinkSync(path);
  let parent = dirname(path);
  while (parent !== ROOT && existsSync(parent) && readdirSync(parent).length === 0) {
    rmSync(parent, { recursive: true });
    parent = dirname(parent);
  }
}

/** Run one group of plants against the audit and check each expected finding. */
function proveGroup(label, plants, expected, tracked = false) {
  for (const [rel, content] of plants) {
    plant(rel, content);
    if (tracked) git("add", "-N", "--", rel);
  }
  try {
    const problems = audit();
    for (const needle of expected) expect(problems, needle, label);
  } finally {
    for (const [rel] of plants) {
      if (tracked) git("rm", "--cached", "-q", "--", rel);
      unplant(rel);
    }
  }
}

/** Append to living files, run the audit, check the findings, and restore every byte. */
function proveAppended(label, appended, expected) {
  const originals = new Map();
  for (const [rel, text] of appended) {
    const path = join(ROOT, rel);
    if (!existsSync(path)) {
      console.log(`append plant skipped: ${rel} is not in this tree`);
      continue;
    }
    originals.set(path, readFileSync(path));
    writeFileSync(path, Buffer.concat([originals.get(path), Buffer.from(text, "utf-8")]));
  }
  try {
    const problems = audit();
    for (const needle of expected) expect(problems, needle, label);
  } finally {
    for (const [path, bytes] of originals) writeFileSync(path, bytes);
  }
}

/** Replace a living file's text for one run, then restore its bytes. */
function proveReplaced(label, rel, text, expected, mustPass = false) {
  const path = join(ROOT, rel);
  const original = existsSync(path) ? readFileSync(path) : null;
  writeFileSync(path, text);
  try {
    const problems = audit().filter((p) => !mustPass || p.includes("UPSTREAM"));
    if (mustPass && problems.length > 0) wrong(`${label} raised ${JSON.stringify(problems.slice(0, 2))}`);
    for (const needle of expected) expect(problems, needle, label);
  } finally {
    if (original === null) unlinkSync(path);
    else writeFileSync(path, original);
  }
}

/** The lowest record number no record under docs/decisions uses, from nine hundred up. */
function freeNumber() {
  const taken = new Set(readdirSync(join(ROOT, "docs", "decisions")).map((name) => name.slice(0, 4)));
  for (let n = 900; n < 10000; n += 1) {
    const candidate = String(n).padStart(4, "0");
    if (!taken.has(candidate)) return candidate;
  }
  return "9999";
}

function proveFilePlants() {
  const twin = freeNumber();
  const record = "Status: Accepted\nDate: 2026-01-01\n";
  proveGroup(
    "an untracked plant",
    [
      ["docs/lowercase-planted.md", "# Planted\n"],
      ["docs/PLANTED.md", `# Planted\n${"line\n".repeat(150)}`],
      ["docs/decisions/bad-name-planted.md", "# Bad\n"],
      ["docs/decisions/0093-planted-with-a-title-so-long-that-it-runs-past-the-seventy-two-character-cap.md", `# 0093. Planted\n\n${record}`],
      [`docs/decisions/${twin}-planted-twin-a.md`, `# ${twin}. Planted twin\n\n${record}`],
      [`docs/decisions/${twin}-planted-twin-b.md`, `# ${twin}. Planted twin\n\n${record}`],
    ],
    [
      "docs/lowercase-planted.md: organic documents are UPPERCASE markdown",
      "docs/PLANTED.md: not registered in the AGENTS.md index",
      `docs/PLANTED.md: 152 lines against the ${BUDGET_LINES}-line budget`,
      "docs/decisions/bad-name-planted.md: records are named NNNN-short-kebab-title.md",
      `the cap is ${NAME_CAP}`,
      `share the number ${twin}`,
    ],
  );
}

function proveTrackedPlants() {
  proveGroup(
    "a tracked plant",
    [
      ["stray-planted/note.txt", "nobody gave this a room\n"],
      ["src/planted-layer/note.ts", "export const planted = 1;\n"],
      ["ROGUE-PLANTED.txt", "nobody named this\n"],
      ["docs/planted.png", "not a document\n"],
      ["docs/planted-folder/GUIDE.md", "# Guide\n"],
      ["docs/PLANTED-DASHES.md", "\u2014 \u2014 \u2014\n"],
    ],
    [
      "stray-planted/: exists in the tree but has no room",
      "src/planted-layer/: exists in the tree but has no room",
      "ROGUE-PLANTED.txt: sits at the root but neither the map nor the baseline names it",
      "docs/planted.png: docs/ holds markdown documents only",
      "docs/planted-folder/ has no row in the AGENTS.md index",
      "a file below a docs/ subfolder is a dated record named YYYY-MM-DD-short-kebab-title.md",
      "docs/PLANTED-DASHES.md carries 3 em dashes; the budget is 2 per file",
    ],
    true,
  );
}

/** A record over the budget born in this working tree is judged; one born before the rule arrived is left to history, so the rehearsal proves that half. */
function proveRecordDashes() {
  const number = freeNumber();
  const rel = `docs/decisions/${number}-planted-dashes.md`;
  proveGroup("a record over the budget born now", [[rel, `# ${number}. Planted dashes\n\nStatus: Accepted\nDate: 2026-01-01\n\n\u2014 \u2014 \u2014\n`]], [`${rel} carries 3 em dashes; the budget is 2 per file`], true);
}

function proveAppendedPlants() {
  const engines = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf-8")).engines?.node?.match(/>=\s*(\d+(?:\.\d+)*)/)?.[1];
  const claimed = engines === "18" ? "20" : "18";
  proveAppended(
    "a plant on a living document",
    [
      ["AGENTS.md", "\nNames `docs/GHOST-PLANTED.md` and `.github/workflows/GHOST-PLANTED.yml` and links [nowhere](docs/NOWHERE-PLANTED.md) in passing.\n"],
      ["docs/ARCHITECTURE.md", "\n```text\nplanted/\n└── ghost_planted_file.ts\n```\n"],
      ["docs/BASELINE.md", "line\n".repeat(160)],
      ["README.md", `\nRequires Node ${claimed}+ here.\n`],
    ],
    [
      "names `docs/GHOST-PLANTED.md`, which does not exist",
      "names `.github/workflows/GHOST-PLANTED.yml`, which does not exist",
      "links to docs/NOWHERE-PLANTED.md, which does not resolve",
      "the tree names ghost_planted_file.ts, which exists nowhere in this repository",
      `docs/BASELINE.md: `,
      `lines against the ${BUDGET_LINES}-line budget; split by fission`,
      ...(engines ? [`claims Node ${claimed}+ while engines declares ${engines}`] : []),
    ],
  );
  if (!engines) console.log("version plant skipped: package.json declares no engines floor");
}

// Rows the invariants proof inserts below the ledger's header, each with the finding it must raise; a row
// whose finding is null must pass, and the review row among them must also be advised.
const INVARIANT_PLANTS = [
  ["| Planted claim with a ghost holder. | `docs/GHOST-PLANTED.md` | listed cases |", "holder docs/GHOST-PLANTED.md is not a tracked file"],
  ['| Planted claim with a missing needle. | `AGENTS.md` "planted needle nobody wrote" | listed cases |', "does not contain 'planted needle nobody wrote'"],
  ['| Planted claim with a rung off the list. | `AGENTS.md` "Documentation index" | proved |', "rung 'proved' is not one of"],
  ["| Planted claim held by review under another rung. | review | impossible |", "a holder of review pairs only with the rung review"],
  ['| Planted claim with a file holder under the review rung. | `AGENTS.md` "Documentation index" | review |', "the rung review pairs only with a holder of review"],
  ["| Planted claim short of a cell. | review |", "three cells and none empty"],
  ["| Planted claim held by review. | review | review |", null],
  ['| Planted legal claim with a needle. | `AGENTS.md` "Documentation index" | listed cases |', null],
];

/** Each malformed or unbound row raises its finding, a legal row raises none, the review row is advised, and the bytes come back. */
function proveInvariantPlants() {
  const path = join(ROOT, "docs", "INVARIANTS.md");
  if (!existsSync(path)) {
    console.log("invariant plants skipped: no docs/INVARIANTS.md in this tree");
    return;
  }
  const original = readFileSync(path);
  const lines = original.toString("utf-8").replace(/\r\n/g, "\n").split("\n");
  const separator = lines.indexOf("| Claim | Held by | Rung |") + 1;
  const planted = INVARIANT_PLANTS.map(([row]) => row);
  writeFileSync(path, [...lines.slice(0, separator + 1), ...planted, ...lines.slice(separator + 1)].join("\n"));
  try {
    const all = audit();
    const problems = all.filter((line) => !line.startsWith("  "));
    INVARIANT_PLANTS.forEach(([row, needle], offset) => {
      const where = `docs/INVARIANTS.md:${separator + 2 + offset}:`;
      if (needle !== null) expect(problems, needle, `invariant plant ${JSON.stringify(row)}`);
      else if (problems.some((p) => p.startsWith(where))) wrong(`the legal invariant row ${JSON.stringify(row)} was reported`);
    });
    expect(all, "held by review alone", "the review row");
  } finally {
    writeFileSync(path, original);
  }
}

function proveStatePlants() {
  const path = join(ROOT, "STATE.md");
  if (!existsSync(path)) {
    console.log("STATE plants skipped: no STATE.md in this tree");
    return;
  }
  const text = readFileSync(path, "utf-8").replace(/\r\n/g, "\n");
  const six = Array.from({ length: 6 }, (_, n) => `- Planted in-flight work ${n} (${TODAY})\n`).join("");
  const planted = text
    .replace("## Next", "## Queue")
    .replace("## Blocked\n", "## Blocked\n\n- Planted stale blocked work (2025-01-01)\n")
    .replace("## Now\n", `## Now\n\n${six}`);
  proveReplaced("a STATE plant", "STATE.md", planted, [
    "not the four the schema fixes",
    `against the ${HORIZON_DAYS}-day horizon of Blocked`,
    `entries against the cap of ${NOW_CAP}`,
  ]);
  console.log("queue age firing case skipped: no queued entry in this tree has two horizons of history");
}

const UPSTREAM_HEAD = "# Upstream\n\nAligned to Planted at 0123456789ab.\n\nEvery entry is a lead, not a verdict.\n\n## Open\n\n";
const UPSTREAM_PARTS = "**What it is.** x.\n\n**How the work surfaced it.** x.\n\n**Why it is believed better.** x.\n\n**Records checked.** None.\n";

function proveUpstreamPlants() {
  const entry = `### ${TODAY} Planted entry\n\nKind: defect\nPin: 0123456789ab\n\n`;
  proveReplaced("a legal UPSTREAM.md", "docs/UPSTREAM.md", `${UPSTREAM_HEAD}Nothing open.\n`, [], true);
  proveReplaced("a legal UPSTREAM.md entry", "docs/UPSTREAM.md", UPSTREAM_HEAD + entry + UPSTREAM_PARTS, [], true);
  const variants = [
    ["# Upstream\n\nEvery entry is a lead, not a verdict.\n\n## Open\n\nNothing open.\n", "no Aligned line"],
    ["# Upstream\n\nAligned to Planted at 0123456789ab.\n\nNo section.\n", "no ## Open section"],
    [`${UPSTREAM_HEAD}Nothing here.\n`, "Open holds entries or the words Nothing open."],
    [`${UPSTREAM_HEAD}Nothing open.\n\n${entry}${UPSTREAM_PARTS}`, "beside open entries"],
    [`${UPSTREAM_HEAD}### ${TODAY} Planted entry\n\nPin: 0123456789ab\n\n${UPSTREAM_PARTS}`, "no Kind line"],
    [`${UPSTREAM_HEAD}### ${TODAY} Planted entry\n\nKind: defect\n\n${UPSTREAM_PARTS}`, "no Pin line"],
    [`${UPSTREAM_HEAD}${entry}**What it is.** x.\n\n**Why it is believed better.** x.\n`, "part **How the work surfaced it** missing"],
    [`${UPSTREAM_HEAD}${entry}**What it is.** x.\n\n**How the work surfaced it.** x.\n\n**Records checked.** None.\n`, "neither Why it is believed better"],
    [`${UPSTREAM_HEAD}### 2026-01-01 Planted entry\n\nKind: defect\nPin: 0123456789ab\n\n${UPSTREAM_PARTS}`, `past the ${HORIZON_DAYS}-day horizon`],
  ];
  for (const [text, needle] of variants) proveReplaced("an UPSTREAM.md plant", "docs/UPSTREAM.md", text, [needle]);
}

function provePalettePlant() {
  if (!existsSync(join(ROOT, "src"))) {
    console.log("palette plant skipped: this tree has no src/");
    return;
  }
  proveGroup(
    "the raw palette plant",
    [["src/planted-selftest.tsx", 'export const Planted = () => <div className="bg-red-500" />;\n']],
    ['raw palette class "bg-red-500"; colors come from the token utilities'],
  );
}

function proveCitationPlant() {
  const folder = join(ROOT, "docs", "decisions");
  const name = readdirSync(folder).sort().find((entry) => entry.endsWith(".md"));
  const first = name ? readFileSync(join(folder, name), "utf-8").split("\n")[0].trim() : "";
  if (!name || !first.includes(". ")) {
    console.log("citation plants skipped: no titled record in this tree");
    return;
  }
  const title = first.slice(first.indexOf(". ") + 2).trim();
  const number = name.slice(0, 4);
  proveAppended("the bare citation plant", [["AGENTS.md", `\nSee [decision ${number}](docs/decisions/${name}) in passing.\n`]], [`cites ${number} without its title`]);
  const agents = join(ROOT, "AGENTS.md");
  const original = readFileSync(agents);
  writeFileSync(agents, Buffer.concat([original, Buffer.from(`\nSee [decision ${number}, ${title}](docs/decisions/${name}) in passing.\n`)]));
  try {
    if (audit().some((p) => p.includes("without its title"))) wrong("a citation carrying the record's title was reported as bare");
  } finally {
    writeFileSync(agents, original);
  }
}

/** Only the advice, the indented lines under the advisory header. */
function adviceLines() {
  return audit().filter((line) => line.startsWith("  "));
}

function proveDensePlant() {
  const names = Array.from({ length: 8 }, (_, n) => `\`planted_${n}\``);
  const agents = join(ROOT, "AGENTS.md");
  const original = readFileSync(agents);
  // The tree may carry dense paragraphs of its own, so the plant is judged by what it adds.
  const before = adviceLines().length;
  try {
    writeFileSync(agents, Buffer.concat([original, Buffer.from(`\nThe planted paragraph names ${names.join(", ")} in one breath.\n`)]));
    const added = adviceLines().filter((line) => line.includes("names 8 references") && line.includes("AGENTS.md"));
    if (adviceLines().length !== before + 1 || added.length === 0) wrong("a prose paragraph naming eight references raised no advice of its own");
    writeFileSync(agents, Buffer.concat([original, Buffer.from(`\n${names.map((name) => `- ${name}\n`).join("")}`)]));
    if (adviceLines().length !== before) wrong("a list of eight names was advised as a dense paragraph");
  } finally {
    writeFileSync(agents, original);
  }
}

/** A banned word appended to the guide is advised, and the bytes come back. */
function proveVocabularyPlant() {
  const agents = join(ROOT, "AGENTS.md");
  const original = readFileSync(agents);
  writeFileSync(agents, Buffer.concat([original, Buffer.from("\nWe delve into it here.\n")]));
  try {
    if (!adviceLines().some((line) => line.includes("inflated vocabulary") && line.includes("'delve'") && line.includes("AGENTS.md"))) wrong("a banned word appended to AGENTS.md raised no vocabulary advice");
  } finally {
    writeFileSync(agents, original);
  }
}

/** A spliced clause in a record main does not hold is advised once, the label and the list intro beside it are not, and the record leaves. */
function proveSpliceAdvice() {
  const number = freeNumber();
  const name = `${number}-planted-splice.md`;
  const path = join(ROOT, "docs", "decisions", name);
  writeFileSync(path, `# ${number}. Planted splice\n\nStatus: Accepted\nDate: 2026-01-01\n\n## Context\n\nThe reader found the second defect, which is why: the dot was gone.\n- **A label.** Rejected: it duplicates what the tree records.\nThe audit gains three checks:\n`);
  try {
    const found = adviceLines().filter((line) => line.includes(name) && line.includes("lowercase clause"));
    if (found.length !== 1 || !found[0].includes(`${name}:8:`)) wrong(`a planted splice was advised ${found.length} time(s) instead of once at line 8`);
  } finally {
    unlinkSync(path);
  }
}

/** A misspelling appended to the README is advised where codespell is installed, and the bytes come back. */
function proveSpellingPlant() {
  if (spawnSync("codespell", ["--version"], { encoding: "utf-8" }).status !== 0) {
    console.log("spelling plant skipped: codespell is not on PATH");
    return;
  }
  const readme = join(ROOT, "README.md");
  const original = readFileSync(readme);
  writeFileSync(readme, Buffer.concat([original, Buffer.from("\nThe reciever waits here.\n")])); // codespell:ignore reciever
  try {
    if (!adviceLines().some((line) => line.includes("reciever ==> receiver"))) wrong("a misspelling appended to README.md raised no spelling advice"); // codespell:ignore reciever
  } finally {
    writeFileSync(readme, original);
  }
}

function proveImmutability() {
  const folder = join(ROOT, "docs", "decisions");
  const name = readdirSync(folder).sort().find((entry) => readFileSync(join(folder, entry), "utf-8").includes("\nStatus: Accepted\n"));
  if (!name) {
    console.log("immutability plants skipped: no accepted record of this project's own to plant on");
    return;
  }
  const path = join(folder, name);
  const original = readFileSync(path);
  try {
    writeFileSync(path, Buffer.concat([original, Buffer.from("\nplanted body edit\n")]));
    expect(audit(), "edited beyond its Status line", `a body edit to ${name}`);
    writeFileSync(path, Buffer.from(original.toString("utf-8").replace("Status: Accepted", "Status: Superseded by 0999")));
    if (audit().some((p) => p.includes("edited beyond its Status line"))) wrong(`a Status flip on ${name} was reported as an illegal edit`);
  } finally {
    writeFileSync(path, original);
  }
}

/** One word added to a list line inside an accepted record fails, because a list marker is content and not a diff header. */
function proveBulletEdit() {
  const folder = join(ROOT, "docs", "decisions");
  for (const name of readdirSync(folder).sort()) {
    const path = join(folder, name);
    const original = readFileSync(path);
    const text = original.toString("utf-8");
    const bullet = text.split(/\r?\n/).find((line) => line.startsWith("- "));
    if (!/\r?\nStatus: Accepted\r?\n/.test(text) || bullet === undefined) continue;
    try {
      writeFileSync(path, Buffer.from(text.replace(bullet, `${bullet} planted`)));
      expect(audit(), "edited beyond its Status line", `a bullet edit to ${name}`);
    } finally {
      writeFileSync(path, original);
    }
    return;
  }
  console.log("bullet edit plant skipped: no accepted record of this project's own carries a list line");
}

/**
 * The first relative link target on a line of a record other than its Status line, or null. A
 * superseded record links its superseder from its Status line, the one line every edit is legal on,
 * so a plant there proves nothing about the clause that binds the body.
 */
function bodyLink(text) {
  for (const line of text.split(/\r?\n/)) {
    if (line.startsWith("Status:")) continue;
    for (const match of line.matchAll(/\]\(([^)\s]+)\)/g)) {
      if (!/^(https?:\/\/|#|mailto:)/.test(match[1])) return match[1];
    }
  }
  return null;
}

/** The first record of the project's own with a relative link outside its Status line, with that link's target, or null. */
function recordWithLink() {
  const folder = join(ROOT, "docs", "decisions");
  for (const name of readdirSync(folder).sort()) {
    if (!name.endsWith(".md")) continue;
    const target = bodyLink(readFileSync(join(folder, name), "utf-8"));
    if (target !== null) return [join(folder, name), name, target];
  }
  return null;
}

/** The text with the first `](target)` outside its Status line replaced, so the plant lands where the clause binds. */
function plantLink(text, target, replacement) {
  const lines = text.split("\n");
  const index = lines.findIndex((line) => !line.startsWith("Status:") && line.includes(`](${target})`));
  if (index !== -1) lines[index] = lines[index].replace(`](${target})`, replacement);
  return lines.join("\n");
}

/** A living document naming an ignored path under a folder that exists on this machine raises nothing. */
function proveIgnoredPath() {
  const agents = join(ROOT, "AGENTS.md");
  const settings = join(ROOT, ".claude");
  const created = !existsSync(settings);
  if (created) mkdirSync(settings);
  const original = readFileSync(agents);
  try {
    writeFileSync(agents, Buffer.concat([original, Buffer.from("\nNames `.claude/worktrees/` in passing.\n")]));
    if (audit().some((p) => p.includes("`.claude/worktrees/`"))) wrong("an ignored path under a folder that exists on this machine was reported as one that does not exist");
  } finally {
    writeFileSync(agents, original);
    if (created) rmSync(settings, { recursive: true });
  }
}

/** A link target repaired to one that resolves passes; a changed link text or a target that does not resolve fails. */
function proveLinkRepair() {
  const found = recordWithLink();
  if (found === null) {
    console.log("link repair plants skipped: no record of this project's own carries a relative link");
    return;
  }
  const [path, name, target] = found;
  const original = readFileSync(path);
  const text = original.toString("utf-8");
  const other = target.split("#")[0] !== "../CONVENTIONS.md" ? "../CONVENTIONS.md" : "../ARCHITECTURE.md";
  try {
    writeFileSync(path, plantLink(text, target, `](${other})`));
    if (audit().some((p) => p.includes("edited beyond its Status line"))) wrong(`repairing a link target in ${name} to one that resolves was reported as an illegal edit`);
    writeFileSync(path, plantLink(text, target, "](../GHOST-PLANTED.md)"));
    expect(audit(), "edited beyond its Status line", `a link target in ${name} pointed at a ghost`);
    writeFileSync(path, plantLink(text, target, ` planted](${target})`));
    expect(audit(), "edited beyond its Status line", `a link's text in ${name} changed`);
  } finally {
    writeFileSync(path, original);
  }
}

/** A dead link in a record of the project's own is reported, and the same link in an inherited record is not. */
function proveRecordLinkPlant() {
  const own = freeNumber();
  const carried = freeInheritedNumber();
  const body = "\n\nStatus: Accepted\nDate: 2026-01-01\n\n## Decision\n\nSee [gone](../GONE-PLANTED.md)";
  const ownRel = `docs/decisions/${own}-planted-dead-link.md`;
  const carriedRel = `docs/inherited/${carried}-planted-dead-link.md`;
  plant(ownRel, `# ${own}. Planted dead link${body} here.\n`);
  plant(carriedRel, `# ${carried}. Planted dead link${body} there.\n`);
  try {
    const problems = audit();
    expect(problems, `${ownRel}:8: links to ../GONE-PLANTED.md, which does not resolve`, "the dead link plant");
    if (problems.some((p) => p.includes("docs/inherited/") && p.includes("does not resolve"))) wrong("a dead link in an inherited record was reported; inherited records are checked where they were written");
  } finally {
    unplant(ownRel);
    unplant(carriedRel);
  }
}

function proveAnchors() {
  const scopes = [
    ["immutability", "records held immutable on every line beyond their Status line and a link target repaired to resolve: every file below a subfolder of docs/"],
    ["queue age", "entries of Next, Deferred, and Blocked held to two horizons of unchanged text"],
    ["filename cap", "record filenames held to seventy-two characters"],
    ["disposition", "records the inherited folder gained held to a citing record of the project's own"],
    ["em dash budget", "records held to the em dash budget of two per file"],
  ];
  for (const [label, scope] of scopes) {
    const arrival = git("log", "--reverse", "--format=%H", "-S", scope, "--", "scripts/audit-docs.mjs").split(/\s+/).filter(Boolean)[0];
    if (!arrival) console.log(`anchor plant skipped: the ${label} scope sentence has not reached history yet`);
    else if (git("show", `${arrival}^:scripts/audit-docs.mjs`).includes(scope)) wrong(`the ${label} anchor is older than the commit that introduced the current scope`);
  }
}


/** The lowest record number no record under docs/inherited uses, from one up; the folder may not exist yet. */
function freeInheritedNumber() {
  const inherited = join(ROOT, "docs", "inherited");
  const taken = new Set(existsSync(inherited) ? readdirSync(inherited).map((name) => name.slice(0, 4)) : []);
  for (let n = 1; n < 10000; n += 1) {
    const candidate = String(n).padStart(4, "0");
    if (!taken.has(candidate)) return candidate;
  }
  return "9999";
}

/** A record of the project's own whose body is an inherited record's is reported, whatever its number and status. */
function proveTemplateCopy() {
  const free = freeInheritedNumber();
  const own = freeNumber();
  const body = "\n\nStatus: Accepted\nDate: 2026-01-01\n\n## Decision\n\nPlanted twice.\n";
  proveGroup(
    "the template copy plant",
    [
      [`docs/inherited/${free}-planted-template.md`, `# ${free}. Planted template${body}`],
      [`docs/decisions/${own}-planted-template.md`, `# ${own}. Planted template${body.replace("Status: Accepted", "Status: Superseded by 0999")}`],
    ],
    [`is the template's record docs/inherited/${free}-planted-template.md`],
  );
}

/** A record the inherited folder gains with no citing record fails, and the same record cited passes. */
function proveDisposition() {
  const decisions = join(ROOT, "docs", "decisions");
  if (!existsSync(decisions)) {
    console.log("disposition plants skipped: no docs/decisions in this tree");
    return;
  }
  const inherited = join(ROOT, "docs", "inherited");
  const existed = existsSync(inherited);
  const free = freeInheritedNumber();
  const own = freeNumber();
  const gainedRel = `docs/inherited/${free}-planted-gained.md`;
  const citingRel = `docs/decisions/${own}-planted-disposition.md`;
  const upstream = join(ROOT, "docs", "UPSTREAM.md");
  const atHost = existsSync(upstream) && readFileSync(upstream, "utf-8").includes("at the host's own commit");
  try {
    plant(gainedRel, `# ${free}. Planted gained\n\nStatus: Accepted\nDate: 2026-01-01\n\n## Decision\n\nx.\n`);
    if (!existed) console.log("disposition firing case skipped: this tree has no inherited folder that stood in history");
    else if (atHost) console.log("disposition firing case skipped: this arrow is aligned at the host's own commit and gains nothing by re-alignment");
    else expect(audit(), "cited by no record of this project's own", "the gained record plant");
    plant(citingRel, `# ${own}. Planted disposition\n\nStatus: Accepted\nDate: 2026-01-01\n\n## Decision\n\n[Inherited ${free}, Planted gained](../inherited/${free}-planted-gained.md) bound nothing here.\n`);
    if (audit().some((p) => p.includes("cited by no record"))) wrong("a gained record cited by a record of this project's own was reported as uncited");
  } finally {
    unplant(citingRel);
    unplant(gainedRel);
  }
}

function proveIgnorePlant() {
  const path = join(ROOT, ".gitignore");
  if (!existsSync(path)) {
    console.log("ignore plant skipped: no .gitignore in this tree");
    return;
  }
  const kept = readFileSync(path, "utf-8").split(/\r?\n/).filter((line) => ![".worktrees/", ".claude/worktrees/"].includes(line.trim()));
  proveReplaced("the ignore plant", ".gitignore", kept.join("\n") + "\n", ["Working trees section"]);
}


/** A local branch already merged into main is reported, and the branch is removed again. */
function proveStaleBranch() {
  if (git("rev-parse", "--verify", "--quiet", "refs/heads/main").trim() === "") {
    console.log("stale branch plant skipped: no local branch named main");
    return;
  }
  const name = "planted-stale-branch";
  git("branch", name, "main");
  try {
    expect(audit(), `branch ${name} is already merged into main`, "the stale branch plant");
  } finally {
    git("branch", "-D", name);
  }
}

/** A repository naming no remote reports the workflow as not run; the rehearsal's child is where this fires. */
function proveNoRemoteReport() {
  if (git("remote").trim() !== "") {
    console.log("no-remote report skipped: this repository names a remote, so the rehearsal's child proves it");
    return;
  }
  const done = spawnSync(process.execPath, [AUDIT], { cwd: ROOT, encoding: "utf-8" });
  if (!`${done.stdout}${done.stderr}`.includes("names no remote")) wrong("a repository with no remote did not report the workflow as not run");
}

/** Hiding a check's need names the check as not run in the audit's own output, and the file comes back. */
function proveUnrunReport() {
  const path = join(ROOT, "STATE.md");
  if (!existsSync(path)) {
    console.log("unrun plant skipped: no STATE.md in this tree");
    return;
  }
  const rawAudit = () => {
    const done = spawnSync(process.execPath, [AUDIT], { cwd: ROOT, encoding: "utf-8" });
    return `${done.stdout}${done.stderr}`;
  };
  if (rawAudit().includes("the STATE check did not run")) wrong("the STATE check was reported as not run while STATE.md is present");
  const original = readFileSync(path);
  unlinkSync(path);
  try {
    if (!rawAudit().includes("the STATE check did not run")) wrong("hiding STATE.md did not report the STATE check as not run");
  } finally {
    writeFileSync(path, original);
  }
}

const baseline = findings();
if (baseline.length > 0) {
  console.log("the unplanted tree is not clean, so nothing can be proven until the audit passes:");
  for (const p of baseline.slice(0, 5)) console.log(`  ${p}`);
  process.exit(1);
}
for (const proof of [proveFilePlants, proveTrackedPlants, proveRecordDashes, proveAppendedPlants, proveInvariantPlants, proveStatePlants, proveUpstreamPlants, provePalettePlant, proveCitationPlant, proveDensePlant, proveVocabularyPlant, proveSpliceAdvice, proveSpellingPlant, proveImmutability, proveBulletEdit, proveLinkRepair, proveIgnoredPath, proveRecordLinkPlant, proveAnchors, proveTemplateCopy, proveDisposition, proveIgnorePlant, proveStaleBranch, proveNoRemoteReport, proveUnrunReport]) {
  proof();
}
console.log(failures === 0 ? "every rule fires" : `${failures} rule(s) do not work`);
process.exit(failures === 0 ? 0 : 1);
