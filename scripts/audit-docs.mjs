/**
 * Audit the tree against its own documentation and token conventions.
 *
 * A living document rots when a sentence that was true at writing stops being true after
 * reality moves through a path that never touches the file. The mechanical kinds of rot are
 * checked here, along with the shapes the rulebook fixes: budgets, the index contract, names,
 * the STATE schema, and the raw-palette ban the token system implies. Decision records are
 * exempt because they describe the past, which does not rot.
 */

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
  for (const match of text.matchAll(STATE_DATE)) {
    const stamped = new Date(`${match[1]}T00:00:00`);
    const age = Math.floor((today - stamped) / 86_400_000);
    if (age > HORIZON_DAYS) {
      problems.push(
        `STATE.md:${lineOf(text, match.index)}: entry last verified ${match[1]}, ${age} days ago; ` +
          `re-verify it against reality, then re-date or remove it`,
      );
    }
  }
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

for (const problem of problems) console.log(problem);
if (problems.length > 0) {
  console.log(`\n${problems.length} problem(s). The tree disagrees with its own conventions.`);
  process.exit(1);
}
console.log("The tree agrees with its own conventions.");
