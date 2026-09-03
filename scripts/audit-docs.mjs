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

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const LIVING = [
  "AGENTS.md",
  "README.md",
  "STATE.md",
  "docs/ARCHITECTURE.md",
  "docs/BASELINE.md",
  "docs/CONVENTIONS.md",
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
/** Bounded documents fail past this; the manual, the map, and the README grow with the system. */
const BUDGET_LINES = 150;
const FREE_GROWING = new Set(["AGENTS.md", "docs/ARCHITECTURE.md", "README.md"]);

const BACKTICK = /`([^`\n]+)`/g;
const LINK = /\[[^\]]*\]\(([^)\s]+)\)/g;
const STATE_DATE = /\((\d{4}-\d{2}-\d{2})\)/g;
const RECORD_NAME = /^\d{4}-[a-z0-9-]+\.md$/;
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
 * A changed diff line that is not a Status line; the +++ and --- headers are excluded by the
 * lookahead and skipped by name where the diff is read.
 */
const ILLEGAL_RECORD_EDIT = /^[-+](?![-+])(?!Status: )/;

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

function lineOf(text, index) {
  return text.slice(0, index).split("\n").length;
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
    if (looksLikePath(token) && !existsSync(target)) {
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
}

const statePath = resolve(ROOT, "STATE.md");
if (existsSync(statePath)) {
  const text = readFileSync(statePath, "utf-8");
  const sections = [...text.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
  if (sections.join(",") !== "Now,Next,Deferred,Blocked") {
    problems.push(`STATE.md: sections are [${sections.join(", ")}], not the four the schema fixes`);
  }
  let section = "";
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
    if (!["ARCHITECTURE.md", "CONVENTIONS.md", "BASELINE.md"].includes(entry)) {
      const lines = readFileSync(full, "utf-8").split("\n").length;
      if (lines > BUDGET_LINES) {
        problems.push(`docs/${entry}: ${lines} lines against the ${BUDGET_LINES}-line budget; split by fission`);
      }
    }
  }
  const decisions = join(docsDir, "decisions");
  if (existsSync(decisions)) {
    const numbers = new Map();
    for (const entry of readdirSync(decisions)) {
      if (!entry.endsWith(".md")) continue;
      if (!RECORD_NAME.test(entry)) {
        problems.push(`docs/decisions/${entry}: records are named NNNN-short-kebab-title.md`);
        continue;
      }
      const num = entry.slice(0, 4);
      if (numbers.has(num)) {
        problems.push(`docs/decisions/: ${numbers.get(num)} and ${entry} share the number ${num}; renumber the newer record`);
      }
      numbers.set(num, entry);
    }
  }
  // Everything else under docs/ is a document with a room or it does not exist. A file below a
  // subdirectory is registered by its own path or by its directory's row in the index; a file
  // that is not markdown has no species and no room here at all.
  for (const path of trackedFiles()) {
    if (!path.startsWith("docs/") || path.startsWith("docs/decisions/")) continue;
    if (path.split("/").length === 2 && path.endsWith(".md")) continue;
    const folder = path.split("/").slice(0, 2).join("/");
    if (!path.endsWith(".md")) {
      problems.push(`${path}: docs/ holds markdown documents only; assets live where the baseline sends them`);
    } else if (!agents.includes(`(${path})`) && !agents.includes(`(${folder}/)`)) {
      problems.push(`${path}: lives under docs/ but is neither the spine, a record, nor registered in the index; give it a room or fold it`);
    }
  }
}

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

// A record changes only on its Status line, in the working tree and in every commit since this
// check arrived. The rule binds from the commit that brought the check into the tree, found in
// git's own history, so an adopting project is held from its adoption forward and never
// re-litigates a past it did not write under the rule. A shallow clone cannot show that
// history, so it fails rather than quietly checking less.
if (existsSync(resolve(ROOT, "docs/decisions"))) {
  if (git("rev-parse", "--is-shallow-repository").trim() === "true") {
    problems.push("the clone is shallow, so record history cannot be checked; fetch the full history");
  } else {
    const arrivals = git("log", "--reverse", "--format=%H", "-S", "ILLEGAL_RECORD_EDIT", "--", "scripts/audit-docs.mjs").split(/\s+/).filter(Boolean);
    const diffs = [["the working tree", git("diff", "HEAD", "--unified=0", "--diff-filter=M", "--", "docs/decisions")]];
    if (arrivals.length > 0) {
      const later = git("log", "--format=%H", `${arrivals[0]}..HEAD`, "--diff-filter=M", "--", "docs/decisions").split(/\s+/).filter(Boolean);
      for (const sha of [arrivals[0], ...later]) {
        diffs.push([sha.slice(0, 12), git("show", sha, "--format=", "--unified=0", "-M", "--diff-filter=M", "--", "docs/decisions")]);
      }
    }
    for (const [where, diff] of diffs) {
      let current = "";
      const flagged = new Set();
      for (const line of diff.split("\n")) {
        if (line.startsWith("+++ b/")) {
          current = line.slice(6);
          continue;
        }
        if (/^(--- |\+\+\+ |@@|diff |index |similarity |rename )/.test(line)) continue;
        if (ILLEGAL_RECORD_EDIT.test(line) && !flagged.has(current)) {
          flagged.add(current);
          problems.push(`${current}: edited beyond its Status line in ${where}; a record is immutable, so supersede it instead`);
        }
      }
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

for (const problem of problems) console.log(problem);
if (problems.length > 0) {
  console.log(`\n${problems.length} problem(s). The tree disagrees with its own conventions.`);
  process.exit(1);
}
console.log("The tree agrees with its own conventions.");
