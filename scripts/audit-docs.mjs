/**
 * Audit the tree against its own documentation and token conventions.
 *
 * A living document rots when a sentence that was true at writing stops being true after
 * reality moves through a path that never touches the file. The mechanical kinds of rot are
 * checked here, along with the shapes the rulebook fixes: budgets, the index contract over the
 * whole docs zone, names, the STATE schema, the engine floor claims, the room every directory
 * and root file has in the map or the baseline, the immutability of records, and the
 * raw-palette ban the token system implies. Decision records are exempt from the freshness
 * rules because they describe the past, which does not rot; what is held about them is that
 * nobody rewrites the past.
 */

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, posix, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const LIVING = [
  "AGENTS.md",
  "README.md",
  "STATE.md",
  "docs/ARCHITECTURE.md",
  "docs/BASELINE.md",
  "docs/CONVENTIONS.md",
  "docs/INVARIANTS.md",
];

/** An entry older than this is expired and must be re-verified before anything relies on it. */
const HORIZON_DAYS = 90;
/**
 * In-flight work that has not moved in this long is either finished or stalled, and Now is
 * for neither; the shorter horizon is what makes the sweep mechanical where it can be.
 */
const NOW_HORIZON_DAYS = 30;
/** Now is for in-flight work only; past this many entries the section is accreting, not tracking. */
const NOW_CAP = 5;
/** Bounded documents fail past this; the manual, the map, the README, the rulebook, and the invariants ledger grow with the system. */
const BUDGET_LINES = 150;
const FREE_GROWING = new Set(["AGENTS.md", "docs/ARCHITECTURE.md", "README.md", "docs/CONVENTIONS.md", "docs/INVARIANTS.md"]);

const BACKTICK = /`([^`\n]+)`/g;
const LINK = /\[[^\]]*\]\(([^)\s]+)\)/g;
const STATE_DATE = /\((\d{4}-\d{2}-\d{2})\)/g;
const RECORD_NAME = /^\d{4}-[a-z0-9-]+\.md$/;
const DATED_RECORD_NAME = /^\d{4}-\d{2}-\d{2}-[a-z0-9-]+\.md$/;
// The numbered record folders: decisions/, this project's own, and inherited/, the template's own
// carried whole in a project built from it, keeping the template's numbers so the two sequences
// never meet. A template has no inherited folder.
const NUMBERED_RECORD_FOLDERS = ["decisions", "inherited"];
// The upstream file a project built from the template carries: one Open section, entries dated by
// heading with a kind, a pin, and four labeled parts, expiring on the same horizon as STATE.
const UPSTREAM_ENTRY = /^### (\d{4}-\d{2}-\d{2}) (.+)$/gm;
const UPSTREAM_KIND = /^Kind: (improvement|defect)$/m;
const UPSTREAM_PIN = /^Pin: [0-9a-f]{7,40}$/m;
const UPSTREAM_PARTS = ["**What it is", "**How the work surfaced it", "**Records checked"];
const UPSTREAM_WHY = ["**Why it is believed better", "**What was worked around"];
const UPSTREAM_ALIGNED = /^Aligned to .+ at (`?[0-9a-f]{7,40}`?|the host's own commit)\.?$/m;
const RAW_PALETTE =
  /\b(?:bg|text|border|ring|fill|stroke|from|via|to)-(?:red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)-\d{2,3}\b/;
const FENCE = /```[^\n]*\n([\s\S]*?)```/g;
const TREE_FILE = /^[A-Za-z0-9_\-]+(?:\.[A-Za-z0-9_\-]+)+$/;
const SKIP_DIRS = new Set([".git", "node_modules", "__pycache__", "dist", "build", ".venv"]);
/**
 * Only a claim with the trailing plus is a floor claim; a bare version mention could be
 * talking about anything, and a check may never imply more than it decides.
 */
const FLOOR_CLAIM = /Node(?:\.js)? (\d+(?:\.\d+)?)\+/g;
/**
 * A record's changed lines are read from the diff by hunk: after a hunk header every line that
 * opens with a minus or a plus is a removed or an added line, whatever its content begins with,
 * so a bullet edited inside a record counts like any other line; the +++ and --- file headers
 * arrive before the first hunk and are never read as lines.
 */
// A record's changed lines are judged in pairs: a Status line may move, and a link target may
// move to one that resolves, because a path points at the present while the record's words
// describe the past.
const LINK_TARGET = /\]\(([^)\s]+)\)/g;
/**
 * This sentence dates the immutability rule's arrival in the tree's own history, so it is what
 * the check searches for, never a function's name, which a child's past may already carry.
 * Changing what the check covers changes this sentence, and the anchor moves forward with it.
 */
const IMMUTABILITY_SCOPE = "records held immutable on every line beyond their Status line and a link target repaired to resolve: every file below a subfolder of docs/";
// A queued, deferred, or blocked entry that stands unchanged for two horizons is a decision record
// trying to be born, and the file cannot show it, because a date is the entry's last-verified stamp
// rather than its birthday; so the age is read from history, from the first commit that carried the
// entry's text, and like every history-reading check this one binds from the arrival of its own
// scope sentence, counting no entry's age from before it.
const STATE_AGE_SCOPE = "entries of Next, Deferred, and Blocked held to two horizons of unchanged text";
// A record's filename stays within this many characters, because the folders it lives under are deep
// and a Windows clone has a path limit; like every history-reading check, the cap binds from the
// arrival of its own scope sentence, so a record added in a commit before that arrival is never
// judged. Before means an earlier commit, never an earlier date, because two commits on one day
// are ordered by the history and not by the calendar.
const RECORD_NAME_SCOPE = "record filenames held to seventy-two characters";
const NAME_CAP = 72;
// A link into a numbered record folder is a citation, and a citation carries the record's title
// in its paragraph, so the sentence stands without the click and cannot drift from what it cites.
const RECORD_LINK = /(?:decisions|inherited|claims)\/(\d{4})-[a-z0-9-]+\.md$/;
// A record the inherited folder gains at a re-alignment is cited by a record of the project's
// own, the re-alignment's, which says what the rule did to the tree; reading a record is not
// applying it, and a rule with no check reaches the tree only through the hand that says what it
// did with it. The check decides the citation and review decides its honesty. Like every
// history-reading check it binds from the arrival of its own scope sentence, and the folder's
// first arrival, the adoption, is exempt, because the adoption record stands for it whole.
const DISPOSITION_SCOPE = "records the inherited folder gained held to a citing record of the project's own";
const INHERITED_CITATION = /inherited\/(\d{4})-[a-z0-9-]+\.md/g;
// An arrow carried inside its style's repository is aligned at the host's own commit, its
// inherited folder moving with every landing under the family audit, so no re-alignment gains it
// a record and the disposition check does not apply there.
const HOST_OWN_COMMIT = "at the host's own commit";
// A tracked file carries at most this many em dashes, because the plague arrives as clusters and a
// cluster is countable; the count runs here rather than in the workflow alone, so a tree with no
// remote is held to it. A file holding a NUL byte is binary and is not read for it.
const EM_DASH_BUDGET = 2;
const EM_DASH = Buffer.from("\u2014", "utf-8");
// A record over the budget admits no edit that could bring it under, so the count over records binds
// from the arrival of its own scope sentence like every history-reading check, and a record born
// before that arrival is never judged; every other tracked file can be edited and is held whatever
// its age. The inherited folder is counted where it was written.
const EM_DASH_SCOPE = "records held to the em dash budget of two per file";
// The vocabulary the prose law bans, advised and never gated, because an honest domain term
// reads the same as a tell; the workflow's list, moved here so a tree with no remote hears it.
const VOCABULARY = /paradigm shift|game.changer|ever-evolving|cutting.edge|\bdelve|\btapestry\b|\bsupercharge|\btransformative\b|\bmultifaceted\b|\bmeticulous\b|\bparamount\b|\bembark\b|it.s worth noting|at the end of the day|in today.s world|let.s dive|going forward|a testament to|marks a pivotal|plays a vital role|experts agree|studies show|widely regarded as/i;
// What the two advisories skip: the workflows, the rulebook that lists the tells, and this
// script, which carries the list; a record is skipped by its depth under docs/.
const VOCABULARY_SKIP = [".github/", "docs/CONVENTIONS.md", "scripts/audit-docs.mjs", "scripts/audit-docs-selftest.mjs"];
const CODESPELL_SKIP = ".git,node_modules,.hypothesis,__pycache__,dist,package-lock.json,*.svg,*.png,*.ico,*.woff,*.woff2,*.map,decisions,claims,reviews,inherited,mockServiceWorker.js";
const CODESPELL_IGNORE = "accreting,afterall";
// A prose paragraph that names this many references or more is an enumeration wearing prose, a
// list or a table with its rows run together; measured over the family and over a project built
// from it, everything at this count was a schema stated as prose or a set of bindings, and
// everything argued sat well below it. Whether a given paragraph is one of those stays with
// review, so the count advises and never gates.
const DENSE_PARAGRAPH = 8;
const REFERENCE = /`[^`\n]+`|\[[^\]]*\]\([^)\s]+\)/g;
const NOT_PROSE = ["#", "- ", "* ", "|", ">"];

/** One git call against the repository this file lives in; empty when git says no. */
function git(...args) {
  try {
    return execFileSync("git", args, { cwd: ROOT, encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] });
  } catch {
    return "";
  }
}

/** Every tracked path, posix and relative to the root, so untracked local clutter never fires a check. */
function trackedFiles() {
  return git("ls-files", "-z").split("\0").filter(Boolean);
}

/** Every name drawn in a document's tree diagrams, directories without their trailing slash. */
function drawnEntries(text) {
  const names = new Set();
  for (const fence of text.matchAll(FENCE)) {
    const block = fence[1];
    if (!block.includes("──")) continue;
    for (const raw of block.split("\n")) {
      const entry = raw.split("#")[0].replace(/[│├└─]/g, " ").trim().replace(/\/$/, "");
      if (entry) names.add(entry);
    }
  }
  return names;
}

/** Whether a backticked token is claiming to be a repository path. */
function looksLikePath(token) {
  if (!token.includes("/") || token.includes(" ")) return false;
  if (/[<>*{}$|\\="']/.test(token)) return false;
  if (token.includes("://") || /^(http|-|@)/.test(token)) return false;
  const first = token.replace(/^\.?\//, "").split("/")[0];
  return existsSync(resolve(ROOT, first));
}

/**
 * Whether git ignores the path a token names, asked with its trailing slash kept so a directory pattern
 * answers. An ignored path is by declaration not part of the tree, so a living document naming one claims
 * nothing the tree can be held to, whatever happens to exist on the machine the audit runs on.
 */
function ignored(token) {
  return spawnSync("git", ["check-ignore", "-q", "--", token.replace(/^\.?\//, "")], { cwd: ROOT }).status === 0;
}

function lineOf(text, index) {
  return text.slice(0, index).split("\n").length;
}

/** Every prose paragraph with the line it starts on; fences, headings, list items, table rows, and quotes are not prose. */
function proseParagraphs(text) {
  const paragraphs = [];
  let buffer = [];
  let start = 0;
  let inFence = false;
  text.split("\n").forEach((line, index) => {
    if (line.startsWith("```")) {
      inFence = !inFence;
      return;
    }
    const trimmed = line.trimStart();
    if (inFence || !line.trim() || NOT_PROSE.some((mark) => trimmed.startsWith(mark)) || /^\s*\d+\.\s/.test(line)) {
      if (buffer.length > 0) paragraphs.push([start, buffer.join(" ")]);
      buffer = [];
      return;
    }
    if (buffer.length === 0) start = index + 1;
    buffer.push(line.trim());
  });
  if (buffer.length > 0) paragraphs.push([start, buffer.join(" ")]);
  return paragraphs;
}

/** A prose paragraph naming eight or more references is advised to become a list or a table; the facts stay, the shape changes. */
function adviseDenseParagraphs(rel, text) {
  for (const [line, paragraph] of proseParagraphs(text)) {
    const count = [...paragraph.matchAll(REFERENCE)].length;
    if (count >= DENSE_PARAGRAPH) {
      advice.push(`${rel}:${line}: this paragraph names ${count} references; a list or a table shows them, a paragraph argues, and every fact it holds survives the move`);
    }
  }
}

/** The title a record's heading states, after its number, or null where the heading is not in the form. */
function recordTitle(record) {
  const first = readFileSync(record, "utf-8").split("\n")[0].trim();
  if (!first.startsWith("# ") || !first.includes(". ")) return null;
  return first.slice(first.indexOf(". ") + 2).trim();
}

/** Every link to a record carries the record's title in the same paragraph, so the sentence stands without the click. */
function checkRecordCitations(rel, doc, text) {
  for (const paragraph of text.split(/\n\s*\n/)) {
    for (const match of paragraph.matchAll(LINK)) {
      const target = match[1].split("#")[0];
      const record = resolve(dirname(doc), target);
      if (!RECORD_LINK.test(target) || !existsSync(record)) continue;
      const title = recordTitle(record);
      if (title === null || paragraph.includes(title)) continue;
      const number = record.split(/[\\/]/).pop().slice(0, 4);
      problems.push(`${rel}:${lineOf(text, text.indexOf(match[0]))}: cites ${number} without its title; a citation carries the number and the title, ${title}`);
    }
  }
}

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) yield* walk(full);
    else yield full;
  }
}

/** Every file basename in the tree, for verifying names drawn in tree diagrams. */
function* walkAll(dir) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) yield* walkAll(full);
    else yield full;
  }
}

const problems = [];
const advice = [];
const today = new Date();
const basenames = new Set();
for (const file of walkAll(ROOT)) basenames.add(file.split(/[\\/]/).pop());

for (const rel of LIVING) {
  const doc = resolve(ROOT, rel);
  if (!existsSync(doc)) continue;
  const text = readFileSync(doc, "utf-8");

  if (!FREE_GROWING.has(rel)) {
    const lines = text.split("\n").length;
    if (lines > BUDGET_LINES) {
      problems.push(`${rel}: ${lines} lines against the ${BUDGET_LINES}-line budget; split by fission`);
    }
  }

  for (const match of text.matchAll(BACKTICK)) {
    const token = match[1].trim();
    const target = resolve(ROOT, token.replace(/^\.?\//, "").replace(/\/$/, ""));
    if (looksLikePath(token) && !existsSync(target) && !ignored(token)) {
      problems.push(`${rel}:${lineOf(text, match.index)}: names \`${token}\`, which does not exist`);
    }
  }

  // Links inside inline code spans are schema examples, not claims; blank the spans
  // with same-length padding so reported line numbers stay true.
  const prose = text.replace(BACKTICK, (m) => " ".repeat(m.length));
  for (const match of prose.matchAll(LINK)) {
    const target = match[1];
    if (/^(https?:\/\/|#|mailto:)/.test(target)) continue;
    const resolved = resolve(dirname(doc), target.split("#")[0]);
    if (!existsSync(resolved)) {
      problems.push(`${rel}:${lineOf(prose, match.index)}: links to ${target}, which does not resolve`);
    }
  }

  for (const fence of text.matchAll(FENCE)) {
    const block = fence[1];
    if (!block.includes("──")) continue;
    const blockLine = lineOf(text, fence.index);
    block.split("\n").forEach((raw, offset) => {
      const entry = raw.split("#")[0].replace(/[│├└─]/g, " ").trim().replace(/\/$/, "");
      if (entry && TREE_FILE.test(entry) && !basenames.has(entry)) {
        problems.push(`${rel}:${blockLine + offset + 1}: the tree names ${entry}, which exists nowhere in this repository`);
      }
    });
  }

  checkRecordCitations(rel, doc, text);
  adviseDenseParagraphs(rel, text);
}

// The first commit whose diff of the path carries the needle, or null.
function firstCommit(needle, path) {
  return git("log", "--reverse", "--format=%H", "-S", needle, "--", path).split(/\s+/).filter(Boolean)[0] ?? null;
}

// The committer date of one commit.
function commitDate(commit) {
  return new Date(`${git("show", "-s", "--format=%cs", commit).trim()}T00:00:00`);
}

// Whether the first commit is a proper ancestor of the second, which is what before means in a history.
function isBefore(commit, other) {
  return commit !== other && git("rev-list", "--count", `${other}..${commit}`).trim() === "0";
}

// How long a queued entry has stood unchanged, counted from the binding commit or the entry's
// own, whichever is later.
function standingDays(raw, binding) {
  const born = firstCommit(raw.replace(/\s*\(\d{4}-\d{2}-\d{2}\)\s*$/, "").trim(), "STATE.md");
  const start = born === null ? null : commitDate(isBefore(born, binding) ? binding : born);
  return start === null ? 0 : Math.floor((today - start) / 86_400_000);
}

const statePath = resolve(ROOT, "STATE.md");
if (existsSync(statePath)) {
  const text = readFileSync(statePath, "utf-8");
  const sections = [...text.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
  if (sections.join(",") !== "Now,Next,Deferred,Blocked") {
    problems.push(`STATE.md: sections are [${sections.join(", ")}], not the four the schema fixes`);
  }
  let section = "";
  const binding = firstCommit(STATE_AGE_SCOPE, "scripts/audit-docs.mjs");
  text.split("\n").forEach((raw, offset) => {
    if (raw.startsWith("## ")) {
      section = raw.slice(3).trim();
      return;
    }
    const stamp = raw.match(/\((\d{4}-\d{2}-\d{2})\)/);
    if (!stamp) return;
    const horizon = section === "Now" ? NOW_HORIZON_DAYS : HORIZON_DAYS;
    const age = Math.floor((today - new Date(`${stamp[1]}T00:00:00`)) / 86_400_000);
    if (age > horizon) {
      problems.push(
        `STATE.md:${offset + 1}: entry last verified ${stamp[1]}, ${age} days ago against the ` +
          `${horizon}-day horizon of ${section}; re-verify it against reality, then re-date or remove it`,
      );
    }
    if (section === "Now" || binding === null) return;
    const standing = standingDays(raw, binding);
    if (standing > HORIZON_DAYS * 2) {
      problems.push(
        `STATE.md:${offset + 1}: entry has stood unchanged in ${section} for ${standing} days, two horizons; ` +
          "promote it to Now, write it as a decision record, or drop it",
      );
    }
  });
  const nowSection = text.match(/^## Now\r?\n([\s\S]*?)(?=^## )/m);
  if (nowSection) {
    const entries = [...nowSection[1].matchAll(/^- /gm)].length;
    if (entries > NOW_CAP) {
      problems.push(`STATE.md: Now holds ${entries} entries against the cap of ${NOW_CAP}; sweep finished work into git's memory`);
    }
  }
}

const docsDir = resolve(ROOT, "docs");
if (existsSync(docsDir)) {
  const agents = existsSync(resolve(ROOT, "AGENTS.md")) ? readFileSync(resolve(ROOT, "AGENTS.md"), "utf-8") : "";
  for (const entry of readdirSync(docsDir)) {
    const full = join(docsDir, entry);
    if (!statSync(full).isFile() || !entry.endsWith(".md")) continue;
    if (!agents.includes(entry)) {
      problems.push(`docs/${entry}: not registered in the AGENTS.md index`);
    }
    if (entry.replace(/-/g, "").replace(/\.md$/, "") !== entry.replace(/-/g, "").replace(/\.md$/, "").toUpperCase()) {
      problems.push(`docs/${entry}: organic documents are UPPERCASE markdown`);
    }
    if (!["ARCHITECTURE.md", "CONVENTIONS.md", "BASELINE.md", "UPSTREAM.md", "INVARIANTS.md"].includes(entry)) {
      const lines = readFileSync(full, "utf-8").split("\n").length;
      if (lines > BUDGET_LINES) {
        problems.push(`docs/${entry}: ${lines} lines against the ${BUDGET_LINES}-line budget; split by fission`);
      }
    }
    if (!LIVING.includes(`docs/${entry}`)) {
      const organic = readFileSync(full, "utf-8");
      checkRecordCitations(`docs/${entry}`, full, organic);
      adviseDenseParagraphs(`docs/${entry}`, organic);
    }
  }
  for (const folderName of NUMBERED_RECORD_FOLDERS) {
    const records = join(docsDir, folderName);
    if (!existsSync(records)) continue;
    // Numbers are unique within a folder and never compared across the two, which is the point
    // of the split; a duplicate in the inherited folder means the copy is no longer the
    // template's folder.
    const advice = folderName === "decisions" ? "renumber the newer record" : "recopy the folder whole from the template";
    const numbers = new Map();
    for (const entry of readdirSync(records)) {
      if (!entry.endsWith(".md")) continue;
      if (!RECORD_NAME.test(entry)) {
        problems.push(`docs/${folderName}/${entry}: records are named NNNN-short-kebab-title.md`);
        continue;
      }
      const num = entry.slice(0, 4);
      if (numbers.has(num)) {
        problems.push(`docs/${folderName}/: ${numbers.get(num)} and ${entry} share the number ${num}; ${advice}`);
      }
      numbers.set(num, entry);
    }
  }
  // Below the top level, docs/ holds record folders only: the numbered folders above, and dated
  // folders such as briefings or progress reports, each registered by its own row. A living
  // document belongs at the top as a flat UPPERCASE file, where the naming and budget rules can
  // see it, so anything else below a subfolder fails.
  for (const path of trackedFiles()) {
    if (!path.startsWith("docs/") || path.startsWith("docs/decisions/")) continue;
    if (path.split("/").length === 2) {
      if (!path.endsWith(".md")) {
        problems.push(`${path}: docs/ holds markdown documents only; assets live where the baseline sends them`);
      }
      continue;
    }
    const folder = path.split("/").slice(0, 2).join("/");
    if (!agents.includes(`(${folder}/)`)) {
      problems.push(`${path}: ${folder}/ has no row in the AGENTS.md index; a subfolder of docs/ is a registered record folder or it does not exist`);
    }
    if (folder !== "docs/inherited" && !DATED_RECORD_NAME.test(path.split("/").pop())) {
      problems.push(
        `${path}: a file below a docs/ subfolder is a dated record named YYYY-MM-DD-short-kebab-title.md; ` +
          `a living document is a flat UPPERCASE file at the top of docs/`,
      );
    }
  }
}

// The upstream file's schema and horizon, where a project carries one.
function checkUpstream() {
  const path = join(ROOT, "docs", "UPSTREAM.md");
  if (!existsSync(path)) return;
  const text = readFileSync(path, "utf-8");
  if (!UPSTREAM_ALIGNED.test(text)) {
    problems.push("docs/UPSTREAM.md: no Aligned line naming the template and the commit the project is aligned to");
  }
  if (!text.includes("## Open")) {
    problems.push("docs/UPSTREAM.md: no ## Open section");
    return;
  }
  const body = text.split("## Open")[1];
  const entries = [...body.matchAll(UPSTREAM_ENTRY)];
  if (entries.length === 0 && !body.includes("Nothing open.")) {
    problems.push("docs/UPSTREAM.md: Open holds entries or the words Nothing open.");
  }
  if (entries.length > 0 && body.includes("Nothing open.")) {
    problems.push("docs/UPSTREAM.md: says Nothing open. beside open entries");
  }
  entries.forEach((entry, index) => {
    const end = index + 1 < entries.length ? entries[index + 1].index : body.length;
    const chunk = body.slice(entry.index + entry[0].length, end);
    const label = `docs/UPSTREAM.md: entry ${entry[1]} ${entry[2].slice(0, 40)}`;
    if (!UPSTREAM_KIND.test(chunk)) problems.push(`${label}: no Kind line reading improvement or defect`);
    if (!UPSTREAM_PIN.test(chunk)) problems.push(`${label}: no Pin line naming the template commit`);
    for (const part of UPSTREAM_PARTS) {
      if (!chunk.includes(part)) problems.push(`${label}: part ${part}** missing`);
    }
    if (!UPSTREAM_WHY.some((why) => chunk.includes(why))) {
      problems.push(`${label}: neither Why it is believed better nor What was worked around`);
    }
    const age = Math.floor((today - new Date(`${entry[1]}T00:00:00`)) / 86_400_000);
    if (age > HORIZON_DAYS) {
      problems.push(
        `${label}: past the ${HORIZON_DAYS}-day horizon; re-verify against the template and re-date, ` +
          "or make it the project's own decision and delete it",
      );
    }
  });
}

// The commit that first added each tracked file under the prefix, from one walk of history.
function addedCommits(prefix) {
  const commits = new Map();
  let current = null;
  // Names in the log are relative to the repository top, while this audit may run from a folder
  // below it, so the folder prefix is stripped before the names are compared.
  const topPrefix = git("rev-parse", "--show-prefix").trim();
  for (const line of git("log", "--reverse", "--no-renames", "--diff-filter=A", "--format=@@%H", "--name-only", "--", prefix).split("\n")) {
    if (line.startsWith("@@")) current = line.slice(2).trim();
    else if (line && current !== null) {
      const name = line.startsWith(topPrefix) ? line.slice(topPrefix.length) : line;
      if (!commits.has(name)) commits.set(name, current);
    }
  }
  return commits;
}

// Records written after the cap arrived keep their filenames within it; carried folders are exempt.
function checkRecordNames() {
  const docsRoot = join(ROOT, "docs");
  if (!existsSync(docsRoot)) return;
  const arrival = firstCommit(RECORD_NAME_SCOPE, "scripts/audit-docs.mjs");
  const added = addedCommits("docs");
  for (const full of walkAll(docsRoot)) {
    if (!full.endsWith(".md")) continue;
    const rel = relative(ROOT, full).split(/[\\/]/).join("/");
    if (rel.split("/").length < 3 || rel.startsWith("docs/inherited/")) continue;
    const name = rel.split("/").pop();
    if (name.length <= NAME_CAP) continue;
    const born = added.get(rel);
    const judged = born === undefined || (arrival !== null && !isBefore(born, arrival));
    if (judged) {
      problems.push(`${rel}: filename is ${name.length} characters, the cap is ${NAME_CAP}; a title is short, and the folders above it are not`);
    }
  }
}

checkRecordNames();
checkUpstream();

// Whether the upstream file aligns this tree at the host's own commit, as an arrow carried inside
// its style's repository is.
function alignedAtHost() {
  const upstream = join(ROOT, "docs", "UPSTREAM.md");
  return existsSync(upstream) && readFileSync(upstream, "utf-8").includes(HOST_OWN_COMMIT);
}

// The numbers of every inherited record a record of the project's own cites by a link.
function citedInheritedNumbers() {
  const cited = new Set();
  const decisions = join(ROOT, "docs", "decisions");
  for (const name of existsSync(decisions) ? readdirSync(decisions) : []) {
    if (!name.endsWith(".md")) continue;
    for (const match of readFileSync(join(decisions, name), "utf-8").matchAll(INHERITED_CITATION)) cited.add(match[1]);
  }
  return cited;
}

// Whether an inherited record is judged under this rule: not part of the folder's first arrival,
// and either not committed yet or born in the commit that brought the scope sentence or after it.
function gainedUnderRule(name, added, adoption, arrival) {
  const born = added.get(`docs/inherited/${name}`);
  if (born === adoption) return false;
  if (born === undefined) return true;
  return arrival !== null && !isBefore(born, arrival);
}

// Every record the inherited folder gained after adoption is cited by a record of the project's own.
function checkDispositions() {
  const inherited = join(ROOT, "docs", "inherited");
  if (!existsSync(inherited) || alignedAtHost() || !git("ls-tree", "-r", "--name-only", "HEAD", "--", "docs/inherited").trim()) return;
  const cited = citedInheritedNumbers();
  const uncited = readdirSync(inherited).filter((name) => RECORD_NAME.test(name) && !cited.has(name.slice(0, 4))).sort();
  if (uncited.length === 0) return;
  const arrival = firstCommit(DISPOSITION_SCOPE, "scripts/audit-docs.mjs");
  const added = addedCommits("docs/inherited");
  const adoption = git("log", "--reverse", "--format=%H", "--diff-filter=A", "--", "docs/inherited").split(/\s+/).filter(Boolean)[0];
  for (const name of uncited) {
    if (!gainedUnderRule(name, added, adoption, arrival)) continue;
    problems.push(`docs/inherited/${name}: gained by a re-alignment and cited by no record of this project's own; the re-alignment's record names each record the folder gained with what it bound and what changed, or that it bound nothing and why`);
  }
}
checkDispositions();

// A record's text beyond its heading and its Status line, the two lines a copy under another number changes.
function recordBody(text) {
  const lines = text.replace(/\r\n/g, "\n").trim().split("\n");
  return lines.slice(1).filter((line) => !line.startsWith("Status: ")).join("\n").trim();
}

// No record of the project's own is an inherited record's body under another number.
function checkTemplateCopies() {
  const inherited = join(ROOT, "docs", "inherited");
  const decisions = join(ROOT, "docs", "decisions");
  if (!existsSync(inherited) || !existsSync(decisions)) return;
  const bodies = new Map();
  for (const name of readdirSync(inherited)) {
    if (name.endsWith(".md")) bodies.set(recordBody(readFileSync(join(inherited, name), "utf-8")), name);
  }
  for (const name of readdirSync(decisions).sort()) {
    if (!name.endsWith(".md")) continue;
    const twin = bodies.get(recordBody(readFileSync(join(decisions, name), "utf-8")));
    if (twin !== undefined) {
      problems.push(`docs/decisions/${name}: is the template's record docs/inherited/${twin} under this project's number; docs/decisions/ holds the project's own decisions and nothing else, so delete it, the inherited folder carries it`);
    }
  }
}
checkTemplateCopies();

// The invariants ledger's header row, the words a rung may be, and the shape of a holder: a tracked path
// in backticks with an optional quoted needle the file must contain, or the word review, which pairs only
// with the review rung. Every review row is advised on every run, so a claim nothing decides cannot hide
// behind a green; whether a row is honest stays with review.
const INVARIANTS_HEADER = "| Claim | Held by | Rung |";
const RUNGS = ["impossible", "generated cases", "listed cases", "advised", "review"];
const HOLDER = /^`([^`]+)`(?: "([^"]+)")?$/;

// Every row of the ledger's table after its header, as the line number and its cells, or null without the header.
function invariantRows(text) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const start = lines.indexOf(INVARIANTS_HEADER);
  if (start === -1) return null;
  const rows = [];
  for (let index = start + 2; index < lines.length && lines[index].startsWith("|"); index += 1) {
    rows.push([index + 1, lines[index].trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim())]);
  }
  return rows;
}

// A holder is a tracked path that contains its needle, where one is given.
function checkHolder(where, holder, tracked) {
  const match = HOLDER.exec(holder);
  if (match === null) problems.push(`${where}: a holder is a tracked path in backticks, with a quoted needle where the file holds more than one thing, or the word review`);
  else if (!tracked.has(match[1])) problems.push(`${where}: holder ${match[1]} is not a tracked file`);
  else if (match[2] !== undefined && !readFileSync(join(ROOT, match[1]), "utf-8").includes(match[2])) problems.push(`${where}: holder ${match[1]} does not contain '${match[2]}'`);
}

// One row holds three cells, a rung from the list, review paired with review, and a holder in the tree.
function checkInvariantRow(where, cells, tracked) {
  if (cells.length !== 3 || cells.some((cell) => !cell)) {
    problems.push(`${where}: a row is a claim, a holder, and a rung, three cells and none empty`);
    return;
  }
  const [claim, holder, rung] = cells;
  if (!RUNGS.includes(rung)) problems.push(`${where}: rung '${rung}' is not one of ${RUNGS.join(", ")}`);
  if (holder === "review") {
    advice.push(`${where}: held by review alone, so nothing decides it; ${claim}`);
    if (rung !== "review") problems.push(`${where}: a holder of review pairs only with the rung review`);
    return;
  }
  if (rung === "review") problems.push(`${where}: the rung review pairs only with a holder of review`);
  checkHolder(where, holder, tracked);
}

// Every row of the invariants ledger names a holder in the tree and a rung from the list, and every review row is advised.
function checkInvariants() {
  const ledger = join(ROOT, "docs", "INVARIANTS.md");
  if (!existsSync(ledger)) return;
  const rows = invariantRows(readFileSync(ledger, "utf-8"));
  if (rows === null) {
    problems.push(`docs/INVARIANTS.md: no table under the header ${INVARIANTS_HEADER}`);
    return;
  }
  const tracked = new Set(trackedFiles());
  for (const [line, cells] of rows) checkInvariantRow(`docs/INVARIANTS.md:${line}`, cells, tracked);
}
checkInvariants();

// Whether a tracked path is a record, a file below a subfolder of docs/, which immutability keeps from being edited.
function isRecord(rel) {
  return rel.startsWith("docs/") && rel.split("/").length > 2;
}

// Whether a file's count is judged, which every editable file's is and a record's only when born in
// the commit that brought the scope or after it.
function judgedForDashes(rel, born, arrival) {
  if (!isRecord(rel)) return true;
  return born === undefined || (arrival !== null && !isBefore(born, arrival));
}

// How many em dashes a file's bytes carry, or zero for a binary.
function emDashCount(bytes) {
  if (bytes.includes(0)) return 0;
  let count = 0;
  for (let at = bytes.indexOf(EM_DASH); at !== -1; at = bytes.indexOf(EM_DASH, at + EM_DASH.length)) count += 1;
  return count;
}

// Every tracked text file stays within the em dash budget, a record from the rule's arrival on, since a
// record admits no edit that could bring it under; the inherited folder is counted where it was written.
function checkEmDashes() {
  const over = [];
  for (const rel of trackedFiles()) {
    const path = join(ROOT, rel);
    if (rel.startsWith("docs/inherited/") || !existsSync(path) || statSync(path).isDirectory()) continue;
    const count = emDashCount(readFileSync(path));
    if (count > EM_DASH_BUDGET) over.push([rel, count]);
  }
  if (over.length === 0) return;
  const arrival = firstCommit(EM_DASH_SCOPE, "scripts/audit-docs.mjs");
  const added = addedCommits("docs");
  for (const [rel, count] of over) {
    if (judgedForDashes(rel, added.get(rel), arrival)) problems.push(`${rel} carries ${count} em dashes; the budget is ${EM_DASH_BUDGET} per file`);
  }
}
checkEmDashes();

// Every relative link in a record of the project's own resolves; the inherited folder is checked where it was written.
function checkRecordLinks() {
  const docsRoot = join(ROOT, "docs");
  if (!existsSync(docsRoot)) return;
  for (const full of walkAll(docsRoot)) {
    const rel = relative(ROOT, full).split(/[\\/]/).join("/");
    if (!rel.endsWith(".md") || rel.split("/").length < 3 || rel.startsWith("docs/inherited/")) continue;
    const prose = readFileSync(full, "utf-8").replace(BACKTICK, (m) => " ".repeat(m.length));
    for (const match of prose.matchAll(LINK)) {
      const target = match[1];
      if (/^(https?:\/\/|#|mailto:)/.test(target)) continue;
      if (!existsSync(resolve(dirname(full), target.split("#")[0]))) {
        problems.push(`${rel}:${lineOf(prose, match.index)}: links to ${target}, which does not resolve`);
      }
    }
  }
}
checkRecordLinks();

// Whether a tracked file is read for the vocabulary: not a workflow, the rulebook, this script, a record, or a binary.
function readForVocabulary(rel) {
  if (VOCABULARY_SKIP.some((skip) => rel.startsWith(skip))) return false;
  if (rel.startsWith("docs/") && rel.split("/").length > 2) return false;
  const path = join(ROOT, rel);
  return existsSync(path) && !statSync(path).isDirectory();
}

// The prose law's banned vocabulary in living prose and code, advised because an honest term reads like a tell.
function adviseVocabulary() {
  for (const rel of trackedFiles().filter(readForVocabulary)) {
    const bytes = readFileSync(join(ROOT, rel));
    if (bytes.includes(0)) continue;
    bytes.toString("utf-8").split("\n").forEach((line, index) => {
      const hit = line.match(VOCABULARY);
      if (hit) advice.push(`${rel}:${index + 1}: inflated vocabulary or weasel attribution, '${hit[0]}'; the verdict is review's`);
    });
  }
}

const SPLICE = /(?:^|(?<=[.!?] )|(?<=\*\* ))([^.!?:*]{0,400}?): (?=[a-z])/g;

// The ref a record counts as landed against: main, or the remote's main where the checkout has no local one.
function landingBase() {
  for (const ref of ["main", "origin/main"]) if (git("rev-parse", "--verify", "--quiet", ref).trim()) return ref;
  return null;
}

// Records of the project's own that main does not hold yet: new or changed in the working tree, or in commits main lacks.
function unlandedRecords() {
  const prefix = git("rev-parse", "--show-prefix").trim();
  const paths = new Set([...git("diff", "--name-only", "--relative", "HEAD").split("\n"), ...git("ls-files", "--others", "--exclude-standard").split("\n")]);
  const base = landingBase();
  if (base !== null) {
    for (const top of git("log", "--name-only", "--format=", `${base}..HEAD`).split("\n")) if (top.startsWith(prefix)) paths.add(top.slice(prefix.length));
  }
  return [...paths].filter((p) => p && isRecord(p) && !p.startsWith("docs/inherited/") && existsSync(join(ROOT, p))).sort();
}

// Each prose line where a colon closes a clause of three words or more and a lowercase letter follows, with that clause.
function spliceCandidates(text) {
  const found = [];
  let fence = false;
  text.split(/\r?\n/).forEach((line, index) => {
    if (line.startsWith("```")) fence = !fence;
    else if (!fence && !/^(#|\||Status:|Date:)/.test(line)) {
      const clauses = [...line.replace(BACKTICK, " ").matchAll(SPLICE)].map((m) => m[1].trim()).filter((c) => c.split(/\s+/).length >= 3);
      if (clauses.length > 0) found.push([index + 1, clauses[0].slice(-40)]);
    }
  });
  return found;
}

// A colon opening a lowercase clause in a record main does not hold yet, advised and never gated. A list colon
// and a spliced one look alike to a machine, so the verdict is the writer's, and the advisory falls silent
// once the record has landed, because a defect found in a merged record stays.
function adviseSplices() {
  for (const rel of unlandedRecords()) {
    for (const [line, clause] of spliceCandidates(readFileSync(join(ROOT, rel), "utf-8"))) {
      advice.push(`${rel}:${line}: the colon after '${clause}' opens a lowercase clause; a list, a quote or a label keeps its colon, and a spliced clause becomes two sentences`);
    }
  }
}

// Whether codespell is on the path; the spelling advisory runs only where it is and is named as not run elsewhere.
function codespellPresent() {
  return spawnSync("codespell", ["--version"], { encoding: "utf-8" }).status === 0;
}

// Misspellings in living prose and code, advised where codespell is installed; the pass spawns a process,
// so it runs once per audit command, and the selftest proves it by the audit's own output.
function adviseSpelling() {
  if (!codespellPresent()) return;
  const done = spawnSync("codespell", ["--skip", CODESPELL_SKIP, "--ignore-words-list", CODESPELL_IGNORE, "."], { cwd: ROOT, encoding: "utf-8" });
  for (const line of `${done.stdout}`.split("\n")) {
    if (line.trim()) advice.push(`${line.trim()}; correct it, or name a domain term in the ignore list`);
  }
}
adviseVocabulary();
adviseSplices();
adviseSpelling();

// The ignore file names every directory a second working tree may occupy, because a tree created
// inside the repository is a nested checkout that a careless add records as an embedded repository.
const WORKING_TREE_DIRS = [".worktrees/", ".claude/worktrees/"];
function checkIgnoredWorkingTrees() {
  const ignore = join(ROOT, ".gitignore");
  const lines = existsSync(ignore) ? readFileSync(ignore, "utf-8").split(/\r?\n/).map((line) => line.trim()) : [];
  const missing = WORKING_TREE_DIRS.filter((directory) => !lines.includes(directory));
  if (missing.length > 0) {
    problems.push(`.gitignore: a second working tree's directory is ignored before it is created; the Working trees section names ${WORKING_TREE_DIRS.join(" and ")}, missing ${missing.join(", ")}`);
  }
}

checkIgnoredWorkingTrees();

// Whether the tree has a local branch named main, which the stale-branch check reads against.
function localMain() {
  return git("rev-parse", "--verify", "--quiet", "refs/heads/main").trim() !== "";
}

// No local branch beside main and the ones checked out is already merged into main, or a landed branch outlives its landing.
function checkStaleBranches() {
  if (!localMain()) return;
  for (const line of git("for-each-ref", "--format=%(refname:short)%09%(worktreepath)", "refs/heads/").split("\n")) {
    const [name, worktree] = line.split("\t");
    if (!name || name === "main" || worktree) continue;
    if (git("rev-list", "--count", `main..${name}`).trim() === "0") {
      problems.push(`branch ${name} is already merged into main and still exists; a landed branch is deleted in the push that moves main, and a local one goes with it`);
    }
  }
}
checkStaleBranches();

// Every tracked directory at the root and one level below src/, and every root file, has a room
// in the map or the baseline; that is the depth the form draws, and deeper structure is the
// layer rule's own. A directory is housed when its name is drawn in the map's tree, or the
// baseline names it.
const archPath = resolve(ROOT, "docs/ARCHITECTURE.md");
if (existsSync(archPath)) {
  const named = drawnEntries(readFileSync(archPath, "utf-8"));
  const baselinePath = resolve(ROOT, "docs/BASELINE.md");
  if (existsSync(baselinePath)) {
    for (const match of readFileSync(baselinePath, "utf-8").matchAll(BACKTICK)) {
      for (const segment of match[1].replace(/^\.\//, "").split("/")) if (segment) named.add(segment);
    }
  }
  const directories = new Set();
  const files = new Set();
  for (const path of trackedFiles()) {
    const parts = path.split("/");
    if (parts.length === 1) {
      files.add(parts[0]);
      continue;
    }
    directories.add(parts[0]);
    if (parts[0] === "src" && parts.length > 2) directories.add(parts.slice(0, 2).join("/"));
  }
  for (const directory of [...directories].sort()) {
    if (!named.has(directory.split("/").pop())) {
      problems.push(`${directory}/: exists in the tree but has no room in docs/ARCHITECTURE.md or the baseline; draw it or fold it`);
    }
  }
  for (const name of [...files].sort()) {
    if (["AGENTS.md", "README.md", "STATE.md", "LICENSE"].includes(name) || named.has(name)) continue;
    problems.push(`${name}: sits at the root but neither the map nor the baseline names it; give it a room or remove it`);
  }
}

// A record changes only on its Status line or at a link target that resolves, in the working tree
// and in every commit since this
// scope arrived. The rule binds from the commit that brought its current scope sentence into
// the tree, found in git's own history, so an adopting project is held from its adoption
// forward, never re-litigates a past it did not write under the rule, and is never caught by
// a widened scope reaching behind its own arrival. A shallow clone cannot show that history,
// so it fails rather than quietly checking less.
// Every subfolder of docs/ is a record folder, so the diff is read over docs/ and only files
// below a subfolder count; the flat living documents at the top change freely.
// The record a diff header names, or nothing when the file is a flat living document at the top of docs/.
function recordOf(header) {
  const path = header.slice(6);
  const below = path.includes("docs/") ? path.split("docs/")[1] : "";
  return below.includes("/") ? path : "";
}

// Every hunk that changes a record, as the record's path with its removed and its added lines, a
// list marker counting like any first character.
function recordHunks(diff) {
  const hunks = [];
  let current = "";
  let hunk = null;
  for (const line of diff.split("\n")) {
    if (line.startsWith("diff --")) hunk = null;
    else if (line.startsWith("+++ b/")) current = recordOf(line);
    else if (line.startsWith("@@")) {
      hunk = current ? { record: current, minus: [], plus: [] } : null;
      if (hunk !== null) hunks.push(hunk);
    } else if (hunk !== null) pushChanged(hunk, line);
  }
  return hunks.filter((h) => h.minus.length + h.plus.length > 0);
}

// A line inside a hunk that opens with a minus or a plus is a removed or an added line of the record.
function pushChanged(hunk, line) {
  if (line.startsWith("-")) hunk.minus.push(line.slice(1));
  else if (line.startsWith("+")) hunk.plus.push(line.slice(1));
}

// Whether a link target written in the record resolves, in the working tree or in the commit named by where.
function targetResolves(where, record, target) {
  const path = posix.normalize(posix.join(posix.dirname(record), target.split("#")[0]));
  if (where === "the working tree") return existsSync(join(git("rev-parse", "--show-toplevel").trim(), path));
  return git("ls-tree", "--full-tree", where, "--", path).trim() !== "";
}

// A changed line is legal when only its Status moved, or only its link targets moved and each new target resolves.
function legalPair(where, record, oldLine, newLine) {
  if (oldLine.startsWith("Status: ") && newLine.startsWith("Status: ")) return true;
  if (oldLine.replace(LINK_TARGET, "]()") !== newLine.replace(LINK_TARGET, "]()")) return false;
  return [...newLine.matchAll(LINK_TARGET)].every((match) => targetResolves(where, record, match[1]));
}

// Every record the diff changes beyond its Status line or a link target that resolves, reported once each.
function flagIllegalEdits(where, diff) {
  const flagged = new Set();
  for (const { record, minus, plus } of recordHunks(diff)) {
    const legal = minus.length === plus.length && minus.every((oldLine, i) => legalPair(where, record, oldLine, plus[i]));
    if (!legal && !flagged.has(record)) {
      flagged.add(record);
      problems.push(`${record}: edited beyond its Status line in ${where}; a record is immutable, so supersede it instead, or repair a link target to one that resolves`);
    }
  }
}

if (existsSync(resolve(ROOT, "docs"))) {
  if (git("rev-parse", "--is-shallow-repository").trim() === "true") {
    problems.push("the clone is shallow, so record history cannot be checked; fetch the full history");
  } else {
    const arrivals = git("log", "--reverse", "--format=%H", "-S", IMMUTABILITY_SCOPE, "--", "scripts/audit-docs.mjs").split(/\s+/).filter(Boolean);
    const diffs = [["the working tree", git("diff", "HEAD", "--unified=0", "--diff-filter=M", "--", "docs")]];
    if (arrivals.length > 0) {
      diffs.push([arrivals[0].slice(0, 12), git("show", arrivals[0], "--format=", "--unified=0", "-M", "--diff-filter=M", "--", "docs")]);
      // One walk prints every later commit's patch behind its own marker line, instead of one
      // process per commit, so the cost stays flat as the history grows; a merge shows what its
      // resolution changed, as show does.
      const log = git("log", "-p", "--cc", "--format=%x01%H", "--unified=0", "-M", "--diff-filter=M", `${arrivals[0]}..HEAD`, "--", "docs");
      for (const chunk of log.split("\x01").slice(1)) {
        const newline = chunk.indexOf("\n");
        const sha = newline === -1 ? chunk : chunk.slice(0, newline);
        diffs.push([sha.trim().slice(0, 12), newline === -1 ? "" : chunk.slice(newline + 1)]);
      }
    }
    for (const [where, diff] of diffs) {
      flagIllegalEdits(where, diff);
    }
  }
}

const srcDir = resolve(ROOT, "src");
if (existsSync(srcDir)) {
  for (const file of walk(srcDir)) {
    if (!/\.(ts|tsx)$/.test(file)) continue;
    const text = readFileSync(file, "utf-8");
    let offset = 0;
    for (const line of text.split("\n")) {
      const match = line.match(RAW_PALETTE);
      if (match) {
        const rel = file.slice(ROOT.length + 1).replace(/\\/g, "/");
        problems.push(`${rel}:${lineOf(text, offset)}: raw palette class "${match[0]}"; colors come from the token utilities`);
      }
      offset += line.length + 1;
    }
  }
}

const pkg = join(ROOT, "package.json");
if (existsSync(pkg)) {
  const floor = JSON.parse(readFileSync(pkg, "utf-8")).engines?.node?.match(/>=\s*(\d+(?:\.\d+)*)/)?.[1];
  if (floor) {
    for (const rel of LIVING) {
      const path = join(ROOT, rel);
      if (!existsSync(path)) continue;
      const text = readFileSync(path, "utf-8");
      for (const match of text.matchAll(FLOOR_CLAIM)) {
        if (match[1] !== floor) {
          problems.push(`${rel}: claims Node ${match[1]}+ while engines declares ${floor}; the version story is one number`);
        }
      }
    }
  }
}

// What a check needs before it can run. A check whose need is absent is reported as not run,
// with the need named, so a clean verdict never hides a check the tree gave nothing to check.
const CHECK_NEEDS = [
  ["the STATE check", "STATE.md"],
  ["the upstream check", "docs/UPSTREAM.md"],
  ["the invariants check", "docs/INVARIANTS.md"],
  ["the disposition check", "docs/inherited"],
  ["the template-copy check", "docs/inherited"],
  ["the rooms check", "docs/ARCHITECTURE.md"],
  ["the docs-zone checks", "docs"],
  ["the record-link check", "docs"],
];
const unrun = CHECK_NEEDS.filter(([, need]) => !existsSync(join(ROOT, need))).map(([name, need]) => `${name} did not run: ${need} is absent from this tree`);
if (existsSync(join(ROOT, "docs", "inherited")) && alignedAtHost()) unrun.push("the disposition check did not run: docs/UPSTREAM.md aligns this arrow at the host's own commit, so the family audit holds its inherited folder and no re-alignment gains it a record");
const declaredFloor = existsSync(pkg) ? JSON.parse(readFileSync(pkg, "utf-8")).engines?.node?.match(/>=\s*(\d+(?:\.\d+)*)/)?.[1] : undefined;
if (!codespellPresent()) unrun.push("the spelling advisory did not run: codespell is not on PATH; the workflow installs it with pipx, or install it yourself");
if (!localMain()) unrun.push("the stale-branch check did not run: no local branch named main");
if (git("remote").trim() === "") unrun.push("the workflow did not run: this repository names no remote, so its landed-branches step, the one check beyond the gate's commands it carries, ran nowhere");
if (!declaredFloor) unrun.push("the version-story check did not run: package.json declares no engines.node floor");
if (unrun.length > 0) {
  console.log(`${unrun.length} check(s) did not run on this tree, each named with what it needs:`);
  for (const item of unrun) console.log(`  ${item}`);
}

if (advice.length > 0) {
  console.log(`advisory, ${advice.length} item(s), decides nothing and gates nothing:`);
  for (const item of advice) console.log(`  ${item}`);
}
for (const problem of problems) console.log(problem);
if (problems.length > 0) {
  console.log(`\n${problems.length} problem(s). The tree disagrees with its own conventions.`);
  process.exit(1);
}
console.log("The tree agrees with its own conventions.");
