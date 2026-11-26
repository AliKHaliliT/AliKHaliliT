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
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const AUDIT = join(ROOT, "scripts", "audit-docs.mjs");
const BUDGET_WORDS = 2000;
const HORIZON_DAYS = 90;
const NOW_HORIZON_DAYS = 30;
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

/** The environment without a variable that names another repository, so a tree of a proof's own making answers for itself. */
function fixtureEnv(extra = {}) {
  return { ...Object.fromEntries(Object.entries(process.env).filter(([name]) => !name.startsWith("GIT_"))), ...extra };
}

/** One git call in a tree of a proof's own making, which must succeed. */
function fixtureGit(tree, ...args) {
  execFileSync("git", args, { cwd: tree, env: fixtureEnv(), stdio: "ignore" });
}

/** Everything in a tree of a proof's own making committed, the commit dated at noon of the day given, by the clock the audit reads. */
function fixtureCommit(tree, day) {
  fixtureGit(tree, "add", "-A");
  const dated = { GIT_AUTHOR_DATE: `${day}T12:00:00`, GIT_COMMITTER_DATE: `${day}T12:00:00` };
  execFileSync("git", ["-c", "user.name=selftest", "-c", "user.email=selftest@example.invalid", "-c", "commit.gpgsign=false", "commit", "-q", "-m", "fixture"], { cwd: tree, env: fixtureEnv(dated), stdio: "ignore" });
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
      ["docs/PLANTED.md", `# Planted\n\n${"word ".repeat(2001)}\n`],
      ["docs/decisions/bad-name-planted.md", "# Bad\n"],
      ["docs/decisions/0093-planted-with-a-title-so-long-that-it-runs-past-the-seventy-two-character-cap.md", `# 0093. Planted\n\n${record}`],
      [`docs/decisions/${twin}-planted-twin-a.md`, `# ${twin}. Planted twin\n\n${record}`],
      [`docs/decisions/${twin}-planted-twin-b.md`, `# ${twin}. Planted twin\n\n${record}`],
    ],
    [
      "docs/lowercase-planted.md: organic documents are UPPERCASE markdown",
      "docs/PLANTED.md: not registered in the AGENTS.md index",
      `docs/PLANTED.md: 2003 words of prose against the ${BUDGET_WORDS}-word budget`,
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
      ["docs/PLANTED-INVISIBLE.md", "a\u200bb\n"],
      ["docs/PLANTED-CITED.md", "# Planted\n\nSee decision 0001 in passing.\n"],
      ["tests/planted-seam.ts", 'vi.mock("@/shared/api")\n'],
    ],
    [
      "stray-planted/: exists in the tree but has no room",
      "src/planted-layer/: exists in the tree but has no room",
      "ROGUE-PLANTED.txt: sits at the root but neither the map nor the baseline names it",
      "docs/planted.png: docs/ holds markdown documents only",
      "docs/planted-folder/ has no row in the AGENTS.md index",
      "a file below a docs/ subfolder is a dated record named YYYY-MM-DD-short-kebab-title.md",
      "docs/PLANTED-DASHES.md carries 3 em dashes; the budget is 2 per file",
      "docs/PLANTED-INVISIBLE.md:1: carries U+200B, an invisible character",
      "docs/PLANTED-CITED.md:3: cites record 0001 by bare number",
      "tests/planted-seam.ts:1: patches a module with 'vi.mock('; module mocking is banned",
    ],
    true,
  );
}

/** A tracked file over the budget, carrying an invisible character and a banned word, that the attributes file declares linguist-generated raises nothing and is advised nothing, and the file and the declaration both leave. */
function proveOwnedCitationLine() {
  const rel = "docs/PLANTED-OWNED.md";
  plant(rel, "# Planted\n\nThe wire form is \"decision 0001\", the style's decision 0001, Planted.\n");
  git("add", "-N", "--", rel);
  try {
    const noise = audit().filter((line) => line.includes(rel) && line.includes("by bare number"));
    if (noise.length > 0) wrong(`an owned citation on the same line was reported as bare: ${noise.join("; ")}`);
  } finally {
    git("rm", "--cached", "-q", "--", rel);
    unplant(rel);
  }
}

/** A tracked line carrying a bare record number beside the same number with its owner raises nothing, so a form kept byte for byte is answered by the comment beside it. */
function proveDeclaredDashes() {
  const attributes = join(ROOT, ".gitattributes");
  const original = existsSync(attributes) ? readFileSync(attributes) : null;
  const rel = "docs/PLANTED-DECLARED.md";
  writeFileSync(attributes, Buffer.concat([original ?? Buffer.alloc(0), Buffer.from(`\n${rel} linguist-generated\n`)]));
  plant(rel, "\u2014 \u2014 \u2014 \u200b\nWe delve into it here.\n");
  git("add", "-N", "--", rel);
  try {
    const noise = audit().filter((line) => line.includes(rel) && (line.includes("carries") || line.includes("inflated vocabulary")));
    if (noise.length > 0) wrong(`a declared file over the budget was counted or advised: ${noise.join("; ")}`);
  } finally {
    git("rm", "--cached", "-q", "--", rel);
    unplant(rel);
    if (original === null) unlinkSync(attributes);
    else writeFileSync(attributes, original);
  }
}

// What the proof plants for a run: a project's guide, an audit of its own, a file carrying every defect the
// prose checks hold, one to a line after the first, a project of its own keeping, which is its audit's to
// hold and never this one's, and a file beside the folder whose name opens as the folder's does.
const NESTED_PLANT = "nested-planted";
const NESTED_PARTS = {
  guide: [`${NESTED_PLANT}/AGENTS.md`, "# Planted guide\n"],
  audit: [`${NESTED_PLANT}/scripts/audit-docs.mjs`, "// Planted\n"],
  notes: [`${NESTED_PLANT}/notes.md`, "\u2014 \u2014 \u2014 \u200b\nSee decision 0001 in passing.\nWe delve into it here.\nThe reciever waits here.\n"], // codespell:ignore reciever
  inner: [`${NESTED_PLANT}/inner/AGENTS.md`, "# Planted inner guide\n"],
  beside: [`${NESTED_PLANT}.md`, "\u2014 \u2014 \u2014\n"],
};

/** The audit's lines that name the plant, with the named parts planted and tracked for one run. */
function plantedNest(parts) {
  const plants = parts.map((part) => NESTED_PARTS[part]);
  for (const [rel, content] of plants) {
    plant(rel, content);
    git("add", "-N", "--", rel);
  }
  try {
    return audit().filter((line) => line.includes(NESTED_PLANT));
  } finally {
    for (const [rel] of plants) {
      git("rm", "--cached", "-q", "--", rel);
      unplant(rel);
    }
  }
}

/** Under a guide and an audit of its own a planted project's file raises nothing here, and neither does a project it keeps, while its folder still needs a room and a file beside it is still read; a guide with no audit beside it fails; and the same file under no guide is read. */
function proveNestedProject() {
  let lines = plantedNest(["guide", "audit", "notes", "inner", "beside"]);
  const noise = lines.filter((line) => line.includes("notes.md") || line.includes("/inner/") || line.includes("carries a guide of its own"));
  if (noise.length > 0) wrong(`a project kept inside this one was read past its folder or asked for the audit it carries: ${noise.join("; ")}`);
  expect(lines, `${NESTED_PLANT}/: exists in the tree but has no room`, "the folder of a project kept inside this one");
  expect(lines, `${NESTED_PLANT}.md carries 3 em dashes`, "a file beside a project kept inside this one");
  expect(plantedNest(["guide", "notes"]), `${NESTED_PLANT}/: carries a guide of its own and no docs audit`, "a guide with no audit beside it");
  lines = plantedNest(["notes"]);
  for (const needle of ["notes.md carries 3 em dashes", "notes.md:1: carries U+200B", "notes.md:2: cites record 0001 by bare number", "notes.md:3: inflated vocabulary"]) expect(lines, needle, "a file under no guide");
  if (spawnSync("codespell", ["--version"], { encoding: "utf-8" }).status !== 0) console.log("kept project spelling case skipped: codespell is not on PATH");
  else expect(lines, "reciever ==> receiver", "a file under no guide"); // codespell:ignore reciever
}

/** A guide the editions lay over a cut makes no project of the overlay folder, so it is read as this project's own file and no audit is asked of it. */
function proveOverlayGuide() {
  const rel = "edition/overlay/AGENTS.md";
  if (existsSync(join(ROOT, rel))) {
    console.log("overlay guide plant skipped: this project's editions already lay a guide");
    return;
  }
  plant(rel, "# A public guide\n\n\u2014 \u2014 \u2014\n");
  git("add", "-N", "--", rel);
  try {
    const lines = audit();
    expect(lines, `${rel} carries 3 em dashes`, "a guide in the overlay folder");
    if (lines.some((line) => line.includes("carries a guide of its own"))) wrong("the overlay folder was read as a project kept inside this one");
  } finally {
    git("rm", "--cached", "-q", "--", rel);
    unplant(rel);
  }
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
      ["docs/BASELINE.md", `${"word ".repeat(2001)}\n`],
      ["README.md", `\nRequires Node ${claimed}+ here.\n`],
    ],
    [
      "names `docs/GHOST-PLANTED.md`, which does not exist",
      "names `.github/workflows/GHOST-PLANTED.yml`, which does not exist",
      "links to docs/NOWHERE-PLANTED.md, which does not resolve",
      "the tree names ghost_planted_file.ts, which exists nowhere in this repository",
      `docs/BASELINE.md: `,
      `words of prose against the ${BUDGET_WORDS}-word budget; split by fission`,
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
}

// The entries the queue-age proof plants, each beside the empty line of the section it takes the place of.
const AGED_NEXT = ["- Nothing queued.", "- Planted queued work that stands"];
const AGED_DEFERRED = ["- Nothing deferred.", "- Planted deferred work a day short"];
const AGED_NOW = ["- Nothing in flight.", "- Planted in-flight work that stands"];

/** A legal state file holding the entries given, each in place of its section's empty line and dated the day given. */
function agedState(day, entries) {
  return entries.reduce((text, [empty, entry]) => text.replace(`${empty}\n`, `${entry} (${day})\n`), STATE_CANON);
}

/**
 * What a copy of the audit names as standing too long in a repository of the proof's own making. Each commit is
 * dated that many days before today and brings the entries given, with the audit where it says so, and the
 * entries are dated today on disk, the way an entry is kept alive without a change of text. No plant can give
 * this tree's own history an old entry.
 */
function agedFindings(commits) {
  const tree = mkdtempSync(join(tmpdir(), "planted-aged-"));
  try {
    fixtureGit(tree, "init", "-q", ".");
    fixtureGit(tree, "config", "core.autocrlf", "false");
    for (const [days, withAudit, entries] of commits) {
      if (withAudit) {
        mkdirSync(join(tree, "scripts"), { recursive: true });
        writeFileSync(join(tree, "scripts", "audit-docs.mjs"), readFileSync(AUDIT));
      }
      writeFileSync(join(tree, "STATE.md"), agedState(daysAgo(days), entries));
      fixtureCommit(tree, daysAgo(days));
    }
    writeFileSync(join(tree, "STATE.md"), agedState(daysAgo(0), commits.at(-1)[2]));
    const done = spawnSync(process.execPath, [join(tree, "scripts", "audit-docs.mjs")], { cwd: tree, encoding: "utf-8", env: fixtureEnv() });
    return `${done.stdout}`.split("\n").filter((line) => line.includes("has stood unchanged"));
  } finally {
    rmSync(tree, { recursive: true, force: true });
  }
}

/**
 * A queued entry a day past two horizons is named, while a deferred one a day short and one in flight are not,
 * and an entry older than the rule is counted from the rule's arrival. The ages are planted at their edge, so the
 * proof starts over where the day turned while it ran.
 */
function proveQueueAge() {
  const two = HORIZON_DAYS * 2;
  const day = daysAgo(0);
  const stood = agedFindings([[two * 2, true, []], [two + 1, false, [AGED_NEXT, AGED_NOW]], [two, false, [AGED_NEXT, AGED_NOW, AGED_DEFERRED]]]);
  const younger = agedFindings([[two * 2, false, [AGED_NEXT]], [Math.floor(HORIZON_DAYS / 3), true, [AGED_NEXT]]]);
  if (daysAgo(0) !== day) {
    proveQueueAge();
    return;
  }
  if (stood.length !== 1 || !stood[0].includes(`in Next for ${two + 1} days`)) wrong(`of a queued entry a day past two horizons, a deferred one a day short and one in flight, the audit named ${stood.length > 0 ? stood.join("; ") : "none"}`);
  if (younger.length > 0) wrong(`an entry older than the rule was counted from its own first day and named: ${younger.join("; ")}`);
}

/** A legal state file, every section holding its empty line, that the point plants are cut from. */
const STATE_CANON = "# Project State\n\n## Now\n\n- Nothing in flight.\n\n## Next\n\n- Nothing queued.\n\n## Deferred\n\n- Nothing deferred.\n\n## Blocked\n\n- Nothing blocked.\n";

/** A calendar date some days back on the local clock, the one the audit reads a stamp against. */
function daysAgo(days) {
  const day = new Date();
  day.setDate(day.getDate() - days);
  return `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
}

/** The finding a planted line raises, named by the number of the line in the planted file. */
function atLine(text, line, finding) {
  return `STATE.md:${text.split("\n").indexOf(line) + 1}: ${finding}`;
}

/**
 * Each point of the STATE schema fires on a file cut from a legal one, and the legal cuts raise nothing.
 *
 * The plants share a run only where each raises a finding that no other plant in its run can raise, by its message
 * or by the line it names, so a break of one point leaves its own plant's finding missing whatever the others print.
 * The horizons are planted away from their edges, because this proof and the audit read two clocks.
 */
function proveStatePoints() {
  const path = join(ROOT, "STATE.md");
  if (!existsSync(path)) {
    console.log("STATE point plants skipped: no STATE.md in this tree");
    return;
  }
  const today = `(${daysAgo(0)})`;
  const five = Array.from({ length: NOW_CAP }, (_, n) => `- Planted in-flight work ${n} ${today}\n`).join("");
  const undated = "entry does not end with its last-verified date";
  const scattered = STATE_CANON.replace("## Now\n", "Planted narration of finished work.\n# A planted second title\n\n## Now\n")
    .replace("- Nothing in flight.\n", `A planted paragraph inside a section.\n- Planted stalled work (${daysAgo(60)})\n`)
    .replace("- Nothing queued.\n", `- Planted undated work\n- Planted work ${today} with words after its date\n- Nothing from the planted source counts yet\n`)
    .replace("- Nothing deferred.\n", `- Nothing queued.\n- Nothing deferred.\n- Planted deferred work ${today}\n`)
    .replace("- Nothing blocked.\n", `\n## Done\n\n- Planted finished work ${today}\n`);
  proveReplaced("a scattered STATE plant", "STATE.md", scattered, [
    atLine(scattered, "Planted narration of finished work.", "stands above the sections"),
    atLine(scattered, "# A planted second title", "stands above the sections"),
    atLine(scattered, "A planted paragraph inside a section.", "is not an entry"),
    `against the ${NOW_HORIZON_DAYS}-day horizon of Now`,
    atLine(scattered, "- Planted undated work", undated),
    atLine(scattered, `- Planted work ${today} with words after its date`, undated),
    atLine(scattered, "- Nothing from the planted source counts yet", undated),
    atLine(scattered, "- Nothing queued.", undated),
    atLine(scattered, "- Nothing deferred.", "says - Nothing deferred. beside other lines in Deferred"),
    "STATE.md: Blocked holds neither an entry nor its empty line",
    "not the four the schema fixes",
  ]);
  const ordered = STATE_CANON.replace("## Next", "## Swapped").replace("## Deferred", "## Next").replace("## Swapped", "## Deferred")
    .replace("- Nothing in flight.\n", `${five}- Nothing else starts before the planted source arrives ${today}\n`);
  proveReplaced("an ordered STATE plant", "STATE.md", ordered, ["not the four the schema fixes", `entries against the cap of ${NOW_CAP}`]);
  const legal = STATE_CANON.replace("- Nothing in flight.\n", five)
    .replace("- Nothing queued.\n", `- Planted queued work (${daysAgo(60)})\n- Planted work first seen (2025-01-01), verified again ${today}\n`)
    .replace(/\n/g, "\r\n");
  const original = readFileSync(path);
  writeFileSync(path, legal);
  try {
    const raised = findings().filter((line) => line.startsWith("STATE.md"));
    if (raised.length > 0) wrong(`a legal STATE file raised ${JSON.stringify(raised.slice(0, 2))}`);
  } finally {
    writeFileSync(path, original);
  }
}

const UPSTREAM_HEAD = "# Upstream\n\nAligned to Planted at 0123456789ab.\n\nEvery entry is a lead, not a verdict.\n\n## Open\n\n";
const UPSTREAM_PARTS = "**What it is.** x.\n\n**How the work surfaced it.** x.\n\n**Why it is believed better.** x.\n\n**Records checked.** None.\n";

/** The legal plants need their row in the index table, borrowed and given back; a project that carries the file already has one. */
function withUpstreamRow(prove) {
  const agents = join(ROOT, "AGENTS.md");
  const original = readFileSync(agents);
  const text = original.toString("utf-8");
  const anchor = "| [docs/decisions/](docs/decisions/)";
  if (!text.includes("(docs/UPSTREAM.md)")) {
    writeFileSync(agents, text.replace(anchor, `| [docs/UPSTREAM.md](docs/UPSTREAM.md) | Planted: what this project has for its style. |\n${anchor}`));
  }
  try {
    prove();
  } finally {
    writeFileSync(agents, original);
  }
}

function proveUpstreamPlants() {
  const entry = `### ${TODAY} Planted entry\n\nKind: defect\nPin: 0123456789ab\n\n`;
  withUpstreamRow(() => {
    proveReplaced("a legal UPSTREAM.md", "docs/UPSTREAM.md", `${UPSTREAM_HEAD}Nothing open.\n`, [], true);
    proveReplaced("a legal UPSTREAM.md entry", "docs/UPSTREAM.md", UPSTREAM_HEAD + entry + UPSTREAM_PARTS, [], true);
    proveReplaced("an entry that quotes packages with their versions", "docs/UPSTREAM.md", UPSTREAM_HEAD + entry + UPSTREAM_PARTS.replace("**What it is.** x.", "**What it is.** x, as esbuild@0.28.1 and @tanstack/react-query@5.105.3 in the manifest show."), [], true);
    proveReplaced("an entry that quotes a version whose last label is one letter", "docs/UPSTREAM.md", UPSTREAM_HEAD + entry + UPSTREAM_PARTS.replace("**What it is.** x.", "**What it is.** x, as some-tool@1.4.b in the lock shows."), [], true);
    proveReplaced("an entry that quotes a version whose last label runs into digits", "docs/UPSTREAM.md", UPSTREAM_HEAD + entry + UPSTREAM_PARTS.replace("**What it is.** x.", "**What it is.** x, as some-tool@1.4.beta2 in the lock shows."), [], true);
    proveReplaced("an entry that quotes a version whose last label runs into a hyphen", "docs/UPSTREAM.md", UPSTREAM_HEAD + entry + UPSTREAM_PARTS.replace("**What it is.** x.", "**What it is.** x, as some-tool@1.4.rc-1 in the lock shows."), [], true);
  });
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
    [`${UPSTREAM_HEAD}${entry}${UPSTREAM_PARTS.replace("**What it is.** x.", "**What it is.** x, as https://example.invalid/private shows.")}`, "an address, a URL, an email or an absolute path"],
    [`${UPSTREAM_HEAD}${entry}${UPSTREAM_PARTS.replace("**What it is.** x.", "**What it is.** x, in /home/someone/project/app.")}`, "an address, a URL, an email or an absolute path"],
    [`${UPSTREAM_HEAD}${entry}${UPSTREAM_PARTS.replace("**What it is.** x.", "**What it is.** x, write to someone@example.invalid for the rest.")}`, "an address, a URL, an email or an absolute path"],
    [`${UPSTREAM_HEAD}${entry}${UPSTREAM_PARTS.replace("**What it is.** x.", "**What it is.** x, write to someone@163.invalid for the rest.")}`, "an address, a URL, an email or an absolute path"],
    [`${UPSTREAM_HEAD}${entry}${UPSTREAM_PARTS.replace("**What it is.** x.", "**What it is.** x, write to someone@example.zz for the rest.")}`, "an address, a URL, an email or an absolute path"],
    [`${UPSTREAM_HEAD}${entry}${UPSTREAM_PARTS.replace("**What it is.** x.", "**What it is.** x, in C:\\Users\\someone\\project.")}`, "an address, a URL, an email or an absolute path"],
    [`${UPSTREAM_HEAD}${entry}${UPSTREAM_PARTS.replace("**What it is.** x.", "**What it is.** x, in /Volumes/shared/project/app.")}`, "an address, a URL, an email or an absolute path"],
    [`${UPSTREAM_HEAD}${entry}${UPSTREAM_PARTS.replace("**What it is.** x.", "**What it is.** x, in /media/someone/disk/project.")}`, "an address, a URL, an email or an absolute path"],
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

/** Three spliced clauses in a record main does not hold are advised, one across a wrap and one in a bullet, while the label, the list intro and a two-word label behind a list marker are not, and the record leaves. */
/** A planted tag and a planted pin without its version each raise their finding, and the plant leaves. */
function proveActionPins() {
  proveGroup("a workflow action pinned by tag", [[".github/workflows/PLANTED.yml", "on: push\njobs:\n  planted:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v7\n"]], [".github/workflows/PLANTED.yml:6: actions/checkout@v7 is pinned by a name that can move"]);
  proveGroup("a workflow action pinned without its version", [[".github/workflows/PLANTED.yml", "on: push\njobs:\n  planted:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1\n"]], [".github/workflows/PLANTED.yml:6: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 names its commit and not its version"]);
  proveGroup("an edition's workflow action pinned by tag", [["edition/overlay/.github/workflows/PLANTED.yml", "on: push\njobs:\n  planted:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v7\n"]], ["edition/overlay/.github/workflows/PLANTED.yml:6: actions/checkout@v7 is pinned by a name that can move"]);
}

function proveSpliceAdvice() {
  const number = freeNumber();
  const name = `${number}-planted-splice.md`;
  const path = join(ROOT, "docs", "decisions", name);
  writeFileSync(path, `# ${number}. Planted splice\n\nStatus: Accepted\nDate: 2026-01-01\n\n## Context\n\nThe reader found the second defect, which is why: the dot was gone.\n- **A label.** Rejected: it duplicates what the tree records.\nThe audit gains three checks:\n\nReproduced in a fresh environment with the seat's development\nrequirements: the revealed type was nothing.\n- Completeness review: collapsed, the marker is not a word.\n- The agent ran the whole review: it found the marker counted.\n`);
  try {
    const found = adviceLines().filter((line) => line.includes(name) && line.includes("lowercase clause"));
    if (found.length !== 3 || !found[0].includes(`${name}:8:`) || !found[1].includes(`${name}:13:`) || !found[2].includes(`${name}:15:`)) wrong(`the planted splices were advised ${found.length} time(s) instead of once each at lines 8, 13 and 15`);
  } finally {
    unlinkSync(path);
  }
}

/** An install script approved for a package the lock installs at another version fails, so does one for a package the lock never installs, and the manifest's bytes come back. */
function proveApprovalPlant() {
  const path = join(ROOT, "package.json");
  const lock = join(ROOT, "package-lock.json");
  if (!existsSync(path) || !existsSync(lock)) {
    console.log("approval plant skipped: no package.json and package-lock.json in this tree");
    return;
  }
  // A package the lock installs, so a check that read the name and not the version would pass the plant.
  const installed = Object.keys(JSON.parse(readFileSync(lock, "utf-8")).packages ?? {}).find((key) => key.startsWith("node_modules/"));
  const name = installed?.slice("node_modules/".length) ?? "planted-package";
  const manifest = JSON.parse(readFileSync(path, "utf-8"));
  manifest.allowScripts = { ...manifest.allowScripts, [`${name}@0.0.0-planted`]: true, "planted-unversioned": true };
  proveReplaced("an approval the lock does not install", "package.json", `${JSON.stringify(manifest, null, 2)}\n`, [
    `package.json: allowScripts approves ${name} at 0.0.0-planted, which package-lock.json does not install`,
    "package.json: allowScripts approves planted-unversioned, which package-lock.json does not install",
  ]);
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

/** A misspelling in a file git does not track raises no spelling advice, and the file leaves. */
function proveUntrackedSpelling() {
  if (spawnSync("codespell", ["--version"], { encoding: "utf-8" }).status !== 0) {
    console.log("untracked spelling plant skipped: codespell is not on PATH");
    return;
  }
  const rel = "PLANTED-UNTRACKED.txt";
  plant(rel, "The reciever waits here.\n"); // codespell:ignore reciever
  try {
    if (adviceLines().some((line) => line.includes("PLANTED-UNTRACKED"))) wrong("a misspelling in a file git does not track was advised");
  } finally {
    unplant(rel);
  }
}

// Tracked files carrying one misspelling each, with whether the spelling pass reads them. The tool's walk passed
// over a hidden name and a name in its skip list, a folder's or a file's, and the pass keeps both rules, a name
// that only holds a listed one, or differs from it where the listed one has a dot, being read; the last of them
// sorts after every path of the tree, so it falls in the last run when the paths are cut.
const SPELLING_REACH = [
  ["planted-reach/plain/notes.md", true],
  ["planted-reach/.hidden/notes.md", false],
  ["planted-reach/claims/notes.md", false],
  ["planted-reach/claims-kept/notes.md", true],
  ["planted-reach/kept-claims/notes.md", true],
  ["planted-reach/planted.map", false],
  ["planted-reach/package-lockxjson", true],
  ["zz-planted-reach.md", true],
];
const SPELLING_TURNED = "planted-reach/turned";

/**
 * The spelling pass reads a tracked file under a plain name once and passes over one under a hidden name or a
 * name in the skip list, as the tool's walk did, and it does not walk a tracked path that is a folder on disk.
 */
function proveSpellingReach() {
  if (spawnSync("codespell", ["--version"], { encoding: "utf-8" }).status !== 0) {
    console.log("spelling reach plants skipped: codespell is not on PATH");
    return;
  }
  const planted = [...SPELLING_REACH.map(([rel]) => rel), SPELLING_TURNED];
  for (const rel of planted) plant(rel, "The reciever waits here.\n"); // codespell:ignore reciever
  git("add", "-N", "--", ...planted);
  try {
    // The path git tracks as a file becomes a folder on disk, which the tool would walk if it were handed it.
    unlinkSync(join(ROOT, SPELLING_TURNED));
    plant(`${SPELLING_TURNED}/notes.md`, "The reciever waits here.\n"); // codespell:ignore reciever
    const advice = adviceLines();
    for (const [rel, read] of SPELLING_REACH) {
      const found = advice.filter((line) => line.trimStart().startsWith(`${rel}:1:`)).length;
      if (found !== (read ? 1 : 0)) wrong(`the spelling pass named ${rel} ${found} time(s), where ${read ? "one finding" : "none"} was due`);
    }
    if (advice.some((line) => line.includes(SPELLING_TURNED))) wrong(`the spelling pass walked ${SPELLING_TURNED}, a tracked path that is a folder on disk`);
  } finally {
    git("rm", "--cached", "-q", "--", ...planted);
    rmSync(join(ROOT, "planted-reach"), { recursive: true, force: true });
    unplant("zz-planted-reach.md");
  }
}

// Paths whose lengths are chosen so the cut falls where one character decides it: a hundred that fill a run to
// the last character, then one a character longer and ninety-eight more that leave a run one character short of
// taking the next, then that next one, alone.
const RUN_PATHS = Array.from({ length: 200 }, (_, n) => `f/${String(n).padStart(3, "0")}-${"x".repeat(n === 100 ? 61 : 60)}.md`);
const RUN_CUTS = [RUN_PATHS.slice(0, 100), RUN_PATHS.slice(100, 199), RUN_PATHS.slice(199)];

/**
 * The audit shows what the spelling pass read and not how its runs were cut, so a stand-in for the tool, first
 * on the path, records what it is handed in a repository of the proof's own making: the tracked files and
 * nothing else, in git's order, cut where the limit asks and nowhere else. A system that runs only a compiled
 * program by name cannot be handed the stand-in, and the proof says so there.
 */
function proveSpellingRuns() {
  if (process.platform === "win32") {
    console.log("spelling runs plant skipped: this system runs only a compiled program by name, so no stand-in for the tool can be handed to the audit");
    return;
  }
  const scratch = mkdtempSync(join(tmpdir(), "planted-runs-"));
  const calls = join(scratch, "calls.txt");
  const tree = join(scratch, "tree");
  const file = (rel, text) => {
    mkdirSync(dirname(join(tree, rel)), { recursive: true });
    writeFileSync(join(tree, rel), text);
  };
  try {
    mkdirSync(join(scratch, "bin"));
    writeFileSync(join(scratch, "bin", "codespell"), `#!/bin/sh\n( IFS='\t'; printf '%s\\n' "$*" ) >> '${calls}'\n`, { mode: 0o755 });
    file("scripts/audit-docs.mjs", readFileSync(AUDIT));
    for (const rel of [...RUN_PATHS, ".hidden/notes.md", "claims/notes.md", "planted.map", "turned"]) file(rel, "Planted.\n");
    fixtureGit(tree, "init", "-q", ".");
    fixtureGit(tree, "add", "-A");
    // A path git tracks as a file becomes a folder on disk, and a file is written that git does not track.
    unlinkSync(join(tree, "turned"));
    file("turned/notes.md", "Planted.\n");
    file("untracked.md", "Planted.\n");
    spawnSync(process.execPath, [join(tree, "scripts", "audit-docs.mjs")], { cwd: tree, encoding: "utf-8", env: fixtureEnv({ PATH: `${join(scratch, "bin")}${delimiter}${process.env.PATH}` }) });
    const handed = existsSync(calls) ? readFileSync(calls, "utf-8").split("\n").filter(Boolean).map((line) => line.split("\t")) : [];
    // A call opens with its options, each a name and a value, and the paths follow.
    const runs = handed.filter((args) => args[0] !== "--version").map((args) => args.slice(args.findIndex((arg, index) => index % 2 === 0 && !arg.startsWith("--"))));
    if (JSON.stringify(runs) !== JSON.stringify(RUN_CUTS)) {
      wrong(`the tool was handed ${runs.length} run(s) of ${runs.map((run) => run.length).join(", ")} path(s), ${runs.flat().filter((rel) => !RUN_PATHS.includes(rel)).length} of them not the planted files, where runs of ${RUN_CUTS.map((run) => run.length).join(", ")} were due`);
    }
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

function proveImmutability() {
  const folder = join(ROOT, "docs", "decisions");
  // The record edited is one git tracks, read with either line ending, because an untracked record a script has
  // just written has no diff for the audit to refuse, and a Windows checkout keeps carriage returns.
  const tracked = new Set(git("ls-files", "-z", "--", "docs/decisions").split("\0").filter(Boolean).map((rel) => rel.split("/").pop()));
  const name = readdirSync(folder).sort().find((entry) => tracked.has(entry) && /\r?\nStatus: Accepted\r?\n/.test(readFileSync(join(folder, entry), "utf-8")));
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
  const tracked = new Set(git("ls-files", "-z", "--", "docs/decisions").split("\0").filter(Boolean).map((rel) => rel.split("/").pop()));
  for (const name of readdirSync(folder).sort()) {
    if (!tracked.has(name)) continue;
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
// An untracked record is invisible to the immutability check, which reads records through git,
// so a plant on one proves nothing and the choice passes such a record over.
function recordWithLink() {
  const folder = join(ROOT, "docs", "decisions");
  const tracked = new Set(git("ls-files", "-z", "--", "docs/decisions").split("\0").filter(Boolean).map((rel) => rel.split("/").pop()));
  for (const name of readdirSync(folder).sort()) {
    if (!name.endsWith(".md") || !tracked.has(name)) continue;
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

/**
 * A living document naming a path beyond a symbolic link is judged by the link, reported while the ignore
 * file leaves the link out and passed once it covers it, the path absent behind the link either way.
 */
function proveIgnoredLink() {
  const agents = join(ROOT, "AGENTS.md");
  const ignore = join(ROOT, ".gitignore");
  if (!existsSync(agents) || !existsSync(ignore)) {
    console.log("ignored link plant skipped: no AGENTS.md or no .gitignore in this tree");
    return;
  }
  const link = join(ROOT, "planted-link");
  const scratch = mkdtempSync(join(tmpdir(), "planted-link-"));
  try {
    symlinkSync(scratch, link, "dir");
  } catch {
    rmSync(scratch, { recursive: true });
    console.log("ignored link plant skipped: this machine cannot create a symbolic link");
    return;
  }
  const original = readFileSync(agents);
  const kept = readFileSync(ignore);
  try {
    writeFileSync(agents, Buffer.concat([original, Buffer.from("\nNames `planted-link/absent.json` in passing.\n")]));
    expect(audit(), "names `planted-link/absent.json`, which does not exist", "a path beyond a link the ignore file leaves out");
    writeFileSync(ignore, `${kept.toString("utf-8").replace(/\n+$/, "")}\n\n# Planted\nplanted-link\n`);
    if (audit().some((p) => p.includes("`planted-link/absent.json`"))) wrong("a path beyond an ignored symbolic link was reported as one that does not exist");
  } finally {
    writeFileSync(ignore, kept);
    writeFileSync(agents, original);
    unlinkSync(link);
    rmSync(scratch, { recursive: true });
  }
}

/** A link target repaired to one that resolves passes; a changed link text or a target that does not resolve fails. */
/** An untracked record with a link, sorting before every real one, is never the record the link plants choose. */
function proveTrackedChoice() {
  const rel = "docs/decisions/0000-planted-untracked-link.md";
  plant(rel, "# 0000. Planted untracked link\n\nStatus: Accepted\nDate: 2026-01-01\n\n## Decision\n\nSee [the map](../ARCHITECTURE.md).\n");
  try {
    const chosen = recordWithLink();
    if (chosen !== null && chosen[1] === "0000-planted-untracked-link.md") wrong("the link repair plants chose an untracked record, which the immutability check cannot see");
  } finally {
    unplant(rel);
  }
}

function proveLinkRepair() {
  proveTrackedChoice();
  const found = recordWithLink();
  if (found === null) {
    console.log("link repair plants skipped: no tracked record of this project's own carries a relative link");
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


/** A misspelling named in the project's own ignore file is not advised, and both files come back. */
function proveIgnoredTerm() {
  if (spawnSync("codespell", ["--version"], { encoding: "utf-8" }).status !== 0) {
    console.log("ignored term plant skipped: codespell is not on PATH");
    return;
  }
  const readme = join(ROOT, "README.md");
  const ignore = join(ROOT, ".codespellignore");
  const original = readFileSync(readme);
  const had = existsSync(ignore) ? readFileSync(ignore) : null;
  writeFileSync(readme, Buffer.concat([original, Buffer.from("\nThe reciever waits here.\n")])); // codespell:ignore reciever
  writeFileSync(ignore, Buffer.concat([had ?? Buffer.alloc(0), Buffer.from("reciever\n")])); // codespell:ignore reciever
  try {
    if (adviceLines().some((line) => line.includes("reciever ==> receiver"))) wrong("a misspelling named in .codespellignore was still advised"); // codespell:ignore reciever
  } finally {
    writeFileSync(readme, original);
    if (had === null) unlinkSync(ignore);
    else writeFileSync(ignore, had);
  }
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
for (const proof of [proveFilePlants, proveTrackedPlants, proveRecordDashes, proveDeclaredDashes, proveNestedProject, proveOverlayGuide, proveAppendedPlants, proveInvariantPlants, proveStatePlants, proveStatePoints, proveQueueAge, proveUpstreamPlants, provePalettePlant, proveCitationPlant, proveDensePlant, proveVocabularyPlant, proveSpliceAdvice, proveActionPins, proveApprovalPlant, proveSpellingPlant, proveUntrackedSpelling, proveSpellingReach, proveSpellingRuns, proveIgnoredTerm, proveImmutability, proveBulletEdit, proveLinkRepair, proveIgnoredPath, proveIgnoredLink, proveRecordLinkPlant, proveAnchors, proveTemplateCopy, proveDisposition, proveIgnorePlant, proveStaleBranch, proveNoRemoteReport, proveUnrunReport, proveOwnedCitationLine]) {
  proof();
}
console.log(failures === 0 ? "every rule fires" : `${failures} rule(s) do not work`);
process.exit(failures === 0 ? 0 : 1);
