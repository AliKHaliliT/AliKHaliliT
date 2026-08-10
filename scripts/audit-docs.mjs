/**
 * Audit the living documents for the three kinds of rot they can carry.
 *
 * A living document rots when a sentence that was true at writing stops being true after
 * reality moves through a path that never touches the file. The mechanical kinds are checked
 * here; the docs rulebook carries the rest. Decision records are exempt because they describe
 * the past, which does not rot.
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
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

const BACKTICK = /`([^`\n]+)`/g;
const LINK = /\[[^\]]*\]\(([^)\s]+)\)/g;
const STATE_DATE = /\((\d{4}-\d{2}-\d{2})\)/g;

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

const problems = [];
const today = new Date();

for (const rel of LIVING) {
  const doc = resolve(ROOT, rel);
  if (!existsSync(doc)) continue;
  const text = readFileSync(doc, "utf-8");

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
}

const statePath = resolve(ROOT, "STATE.md");
if (existsSync(statePath)) {
  const text = readFileSync(statePath, "utf-8");
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
}

for (const problem of problems) console.log(problem);
if (problems.length > 0) {
  console.log(`\n${problems.length} problem(s). The living documents disagree with reality.`);
  process.exit(1);
}
console.log("Living documents agree with reality.");
