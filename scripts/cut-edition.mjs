/**
 * Cut an edition of this project, the tree a public repository receives.
 *
 * The editions document, docs/EDITIONS.md, is the law this script carries out. A tier says how
 * much of the project leaves the workshop, and below the snapshot a version says whether what
 * leaves names the style it was built under.
 *
 *     node scripts/cut-edition.mjs snapshot DESTINATION
 *     node scripts/cut-edition.mjs hand-made DESTINATION [--silent]
 *     node scripts/cut-edition.mjs bare DESTINATION [--silent]
 *     node scripts/cut-edition.mjs --selftest
 *
 * A cut is taken from the last commit and assembled whole before a byte is written, so a
 * refusal leaves the destination as it was. Nothing here commits, pushes or deletes, because
 * publishing the destination is the owner's.
 */

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, posix, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const SELF = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(SELF), "..");

const USAGE = `usage: node scripts/cut-edition.mjs TIER DESTINATION [--silent]
  TIER is snapshot, hand-made or bare; the whole tier is the repository itself and needs no cut
  --silent cuts the version that names nothing of the style, for the hand-made and the bare tier
  DESTINATION is a folder outside the repository that holds nothing yet`;
const TIERS = ["snapshot", "hand-made", "bare"];

/**
 * What the style has a project keep, withheld from every tier below the snapshot: the guide and
 * the state, the documents and the records, the audits and this tool, the word list the spelling
 * advisory reads, and the workflow that runs the style's gate. A project names its own
 * withholdings in the list below, one path to a line.
 */
const STYLE_FILES = ["AGENTS.md", "STATE.md", ".codespellignore", ".github/workflows/ci.yml"];
const STYLE_FOLDERS = ["docs/", "edition/"];
const STYLE_TOOLS = [
  "scripts/audit_docs.py",
  "scripts/audit_inquiry.py",
  "scripts/cut_edition.py",
  "scripts/audit-docs.mjs",
  "scripts/audit-docs-selftest.mjs",
  "scripts/cut-edition.mjs",
];
const WITHHELD_LIST = "edition/withheld.txt";
/** Files the public receives in another form than the workshop keeps, laid over the hand-made tier at the same path. */
const OVERLAY = "edition/overlay/";

/**
 * The words that name the style where nothing else does, advised in a silent edition and never
 * deciding, since each of them is also a word a product may use of itself.
 */
const VOCABULARY = /\b(?:rulebook|prose law|docs audit|invariants ledger|upstream entry|re-alignment|decision record)\b/i;
const FAMILY = /My-Styles/;

const NOTICES = {
  "hand-made":
    "This repository is the project's hand-made edition, its code as written, published without the records, the rules and the gates it was built under.",
  bare: "This repository is the project's bare edition, its code with comments and docstrings stripped, published without the records, the rules and the gates it was built under.",
};
/** What a bare README keeps beside its opening: how to run the thing, and under what terms. */
const BARE_SECTIONS = ["Getting Started", "License"];
const FENCE = /^\s*(?:```|~~~)/;
const RULE = /\n---\s*$/;
const SENTENCE_END = /(?<=[.!?])\s+(?=[A-Z[`*])/;
const LINK = /(!?)\[([^\]]*)\]\(([^)\s]+)\)/g;
const ENTRY = /^((?:[│ ] {3})*)(├──|└──) (\S+)(.*)$/;
const SPACER = /^[│ ]*│[│ ]*$/;
/** A comment a tool reads is an instruction and stays; only a reason written after it is a remark. */
const DIRECTIVE = /^(?:\/\/\/\s*<|\/\/\s*(?:@ts-|eslint-|prettier-|@vitest-|v8 |c8 |istanbul )|\/\*\s*(?:eslint|globals? |@vite-ignore|[@#]__PURE__|v8 |c8 |istanbul ))/;
/** The longest path this system is sure to write. Past it a write can fail halfway, so a cut that would reach it is refused before a byte is written. */
const PATH_LIMIT = process.platform === "win32" ? 248 : 4000;
/** Kinds that hold no comment by their nature, left out of the list of what a bare cut carried as written. */
const PLAIN = [".md", ".json", ".lock", ".svg"];
const TERMS = ["LICENSE", "COPYING", "NOTICE", "README"];

/** The compiler this project installs, which reads a script for its comments; without it no strip of a script proves itself, and a script goes out as written. */
function compiler() {
  try {
    return createRequire(SELF)("typescript");
  } catch {
    return null;
  }
}
const ts = compiler();

/** One git call in this project's tree, answered in bytes; empty when git says no. */
function git(args, input) {
  try {
    return execFileSync("git", args, { cwd: ROOT, input, stdio: ["pipe", "pipe", "ignore"], maxBuffer: 2 ** 30 });
  } catch {
    return Buffer.alloc(0);
  }
}

/** Every tracked path of this project, posix and relative to its root. */
function tracked() {
  return git(["ls-files", "-z"]).toString("utf-8").split("\0").filter(Boolean);
}

/** The committed bytes of each path, read from the last commit in one call, so a cut never depends on how a checkout ends its lines. */
function blobs(paths) {
  const out = git(["cat-file", "--batch"], Buffer.from(paths.map((path) => `HEAD:./${path}\n`).join(""), "utf-8"));
  const found = new Map();
  let at = 0;
  for (const path of paths) {
    const lineEnd = out.indexOf(10, at);
    if (lineEnd < 0) break;
    const header = out.subarray(at, lineEnd).toString("utf-8").split(" ");
    at = lineEnd + 1;
    if (header.length !== 3 || header[1] !== "blob") continue;
    const size = Number(header[2]);
    found.set(path, out.subarray(at, at + size));
    at += size + 1;
  }
  return found;
}

/** The paths this project withholds beyond the style's own, one to a line in its list, a folder by its trailing slash. */
function projectList(paths) {
  if (!paths.includes(WITHHELD_LIST)) return [];
  const text = (blobs([WITHHELD_LIST]).get(WITHHELD_LIST) ?? Buffer.alloc(0)).toString("utf-8");
  return text.split("\n").map((line) => line.trim()).filter((line) => line !== "" && !line.startsWith("#"));
}

/** Whether a path belongs to the workshop: the style's files, folders and tools, or a path the project's list names. */
function isWithheld(path, own) {
  if (STYLE_FILES.includes(path) || STYLE_TOOLS.includes(path)) return true;
  if (STYLE_FOLDERS.some((folder) => path.startsWith(folder))) return true;
  return own.some((entry) => path === entry.replace(/\/$/, "") || path.startsWith(`${entry.replace(/\/$/, "")}/`));
}

/** The projects kept inside this one, each a folder below the root that carries a guide of its own. */
function nestedRoots(paths) {
  const roots = paths.filter((path) => path.endsWith("/AGENTS.md")).map((path) => path.slice(0, -"/AGENTS.md".length)).sort();
  return roots.filter((root) => !roots.some((other) => root.startsWith(`${other}/`)));
}

/** Bytes as text where they are text, null for a binary file, which a cut copies and never reads. */
function asText(data) {
  if (data.includes(0)) return null;
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(data);
  } catch {
    return null;
  }
}

/** A text as its lines, each with the line ending it had. */
function linesOf(text) {
  return text.match(/[^\n]*\n|[^\n]+$/g) ?? [];
}

/** A document as runs of prose and fenced blocks in order, each fenced run with its fence lines. */
function fenced(text) {
  const runs = [];
  let inside = false;
  let current = [];
  for (const line of linesOf(text)) {
    if (!FENCE.test(line)) {
      current.push(line);
    } else if (inside) {
      runs.push([true, [...current, line].join("")]);
      current = [];
      inside = false;
    } else {
      runs.push([false, current.join("")]);
      current = [line];
      inside = true;
    }
  }
  runs.push([inside, current.join("")]);
  return runs.filter(([, run]) => run !== "");
}

/** A document as its opening and its second-level sections, each a title with its body; a heading inside a fence is never one. */
function splitSections(text) {
  const parts = [["", []]];
  for (const [isFence, run] of fenced(text)) {
    for (const line of linesOf(run)) {
      if (!isFence && line.startsWith("## ")) parts.push([line.slice(3).trim(), []]);
      parts.at(-1)[1].push(line);
    }
  }
  return parts.map(([title, lines]) => [title, lines.join("")]);
}

/** The opening with the edition's notice as its last paragraph, above the rule that closes it where it has one. */
function withNotice(opening, notice) {
  let body = opening.trimEnd();
  let closing = "";
  if (RULE.test(body)) {
    body = body.replace(RULE, "").trimEnd();
    closing = "---\n\n";
  }
  return `${body}\n\n${notice}\n\n${closing}`;
}

/** The opening without the sentences that name the family, each one reported so the owner sees what left. */
function silentOpening(cut, opening) {
  const kept = [];
  for (const paragraph of opening.split("\n\n")) {
    if (!FAMILY.test(paragraph) || /^[#!<|`-]/.test(paragraph.trimStart())) {
      kept.push(paragraph);
      continue;
    }
    const sentences = paragraph.split(SENTENCE_END);
    for (const sentence of sentences.filter((one) => FAMILY.test(one))) {
      cut.notes.push(`README.md: cut for naming the family: ${sentence.trim()}`);
    }
    const staying = sentences.filter((sentence) => !FAMILY.test(sentence));
    if (staying.length > 0) kept.push(staying.join(" "));
  }
  return kept.join("\n\n");
}

/** The project's README as the tier publishes it: the section that points at the rulebook cut, the bare tier down to its opening and how to run it, and the opening carrying the notice or losing what names the family. */
function rewriteReadme(cut, text) {
  const parts = splitSections(text);
  let kept = parts.filter(([title]) => !title.startsWith("Conventions"));
  if (kept.length !== parts.length) {
    cut.notes.push("README.md: the Conventions section was cut, since it points at documents the edition withholds");
  }
  if (cut.tier === "bare") {
    kept = kept.filter(([title]) => title === "" || BARE_SECTIONS.some((stem) => title.startsWith(stem)));
  }
  const opening = cut.silent ? silentOpening(cut, kept[0][1]) : withNotice(kept[0][1], NOTICES[cut.tier]);
  const whole = [`${opening.replace(/\n+$/, "")}\n\n`, ...kept.slice(1).map(([, body]) => body)].join("");
  return `${whole.trimEnd().replace(RULE, "")}\n`;
}

/** Whether an entry at this level is still to come before the tree climbs above it. */
function follows(items, index, level) {
  for (const item of items.slice(index + 1)) {
    if (item.kind === "entry" && item.depth <= level) return item.depth === level;
  }
  return false;
}

/** The columns to the left of a line, a bar wherever a folder above it has more to show. */
function bars(items, index, depth) {
  return Array.from({ length: depth }, (_, level) => (follows(items, index, level) ? "│   " : "    ")).join("");
}

/** The lines of a drawn tree as items, an entry the edition withholds left out with everything drawn under it. */
function parseTree(lines, gone) {
  const items = [];
  const stack = [];
  let cutDepth = null;
  let dropped = 0;
  for (const line of lines) {
    const match = ENTRY.exec(line);
    if (match === null) {
      const spacer = SPACER.test(line);
      if (cutDepth === null || !spacer) items.push({ kind: spacer ? "spacer" : "other", raw: line });
      continue;
    }
    const depth = match[1].length / 4;
    if (cutDepth !== null && depth > cutDepth) {
      dropped += 1;
      continue;
    }
    cutDepth = null;
    stack.length = depth;
    stack.push(match[3].replace(/\/$/, ""));
    if (gone(stack.join("/"))) {
      cutDepth = depth;
      dropped += 1;
      continue;
    }
    items.push({ kind: "entry", depth, name: match[3], tail: match[4] });
  }
  return [items, dropped];
}

/** The items of a tree drawn again, each entry closing its folder when nothing follows it there. */
function renderTree(items) {
  const lines = [];
  items.forEach((item, index) => {
    if (item.kind === "other") {
      lines.push(item.raw);
    } else if (item.kind === "entry") {
      const glyph = follows(items, index, item.depth) ? "├──" : "└──";
      lines.push(`${bars(items, index, item.depth)}${glyph} ${item.name}${item.tail}`);
    } else if (index > 0 && items[index - 1].kind === "entry") {
      const ahead = items.slice(index + 1).find((later) => later.kind === "entry");
      if (ahead !== undefined) lines.push(`${bars(items, index, ahead.depth)}│`);
    }
  });
  return lines;
}

/** Whether a path, a file or a folder, is among the paths given. */
function among(paths, path) {
  return paths.has(path) || [...paths].some((kept) => kept.startsWith(`${path}/`));
}

/** A document whose drawn trees no longer show what the edition withholds, their branches redrawn around the gap. */
function redrawTrees(cut, path, text, present) {
  const withheld = new Set(cut.withheld);
  const gone = (entry) => !among(present, entry) && among(withheld, entry);
  let total = 0;
  const runs = fenced(text).map(([isFence, run]) => {
    if (!isFence || !run.includes("──")) return run;
    const [items, dropped] = parseTree(run.replace(/\n$/, "").split("\n"), gone);
    total += dropped;
    return dropped > 0 ? `${renderTree(items).join("\n")}\n` : run;
  });
  if (total > 0) cut.notes.push(`${path}: ${total} line(s) of a drawn tree left out, the branches redrawn around them`);
  return runs.join("");
}

/** A document with every link into a path the edition does not hold turned back into its words; an image it cannot show is a problem, since nothing stands in for a picture. */
function unlink(cut, path, text, present) {
  const here = posix.dirname(path);
  let count = 0;
  const swap = (whole, image, words, target) => {
    const bare = target.split("#", 1)[0];
    if (bare === "" || bare.includes("://") || bare.startsWith("mailto:") || bare.startsWith("/")) return whole;
    const aimed = posix.normalize(posix.join(here, bare)).replace(/\/$/, "");
    if (aimed === "." || among(present, aimed)) return whole;
    if (image !== "") {
      cut.problems.push(`${path}: the image ${target} is not in the edition, and nothing stands in for a picture`);
      return whole;
    }
    count += 1;
    return words;
  };
  const rewritten = fenced(text).map(([isFence, run]) => (isFence ? run : run.replace(LINK, swap))).join("");
  if (count > 0) cut.notes.push(`${path}: ${count} link(s) into withheld paths turned back into their words`);
  return rewritten;
}

/** Every Markdown document the edition keeps, rewritten for what the edition holds: the README by its schema, drawn trees without withheld entries, and links into withheld paths turned back into words. */
function rewriteDocuments(cut, present) {
  for (const path of [...cut.edition.keys()].sort()) {
    if (!path.endsWith(".md") || cut.foreign.has(path)) continue;
    let text = asText(cut.edition.get(path));
    if (text === null) continue;
    if (path === "README.md") text = rewriteReadme(cut, text);
    text = unlink(cut, path, redrawTrees(cut, path, text, present), present);
    cut.edition.set(path, Buffer.from(text, "utf-8"));
  }
}

/** A text without the spans named: a line a span empties is dropped, a line a span shortens loses the space left at its end, and every other line stands as it was. */
function removeSpans(source, spans) {
  const byRow = new Map();
  for (const span of spans) byRow.set(span.row, [...(byRow.get(span.row) ?? []), span]);
  const kept = [];
  linesOf(source).forEach((line, row) => {
    if (!byRow.has(row)) {
      kept.push(line);
      return;
    }
    let body = line.replace(/\r?\n$/, "");
    const ending = line.slice(body.length);
    let whole = false;
    for (const span of byRow.get(row).sort((a, b) => b.start - a.start)) {
      body = body.slice(0, span.start) + body.slice(span.end);
      whole = whole || span.whole;
    }
    if (!whole && body.trim() !== "") kept.push(body.trimEnd() + ending);
  });
  return kept.join("");
}

/** The comments that go for naming what is wanted gone, each with the block it stands in: a run of comment lines is one remark, and a remark that names the style leaves whole. */
function namedBlocks(comments, wanted) {
  const taken = [];
  let block = [];
  for (const comment of [...comments, null]) {
    const last = block.at(-1);
    const joins = comment !== null && last !== undefined && last.joins && comment.joins && comment.row === last.endRow + 1;
    if (block.length > 0 && !joins) {
      if (block.some((one) => wanted(one.text))) taken.push(...block);
      block = [];
    }
    if (comment !== null) block.push(comment);
  }
  return taken;
}

/** The spans a comment covers, a line at a time, from where it opens to where it closes. */
function spansOf(comment, lines) {
  const spans = [];
  for (let row = comment.row; row <= comment.endRow; row += 1) {
    const length = lines[row].replace(/\r?\n$/, "").length;
    const start = row === comment.row ? comment.column : 0;
    const end = row === comment.endRow ? comment.endColumn : length;
    spans.push({ row, start, end, whole: row > comment.row && row < comment.endRow });
  }
  return spans;
}

/** A script as the compiler parses it, by the dialect its name declares. */
function parsed(text, name) {
  const jsx = /\.[jt]sx$/.test(name);
  const kind = jsx ? ts.ScriptKind.TSX : /\.[cm]?ts$/.test(name) ? ts.ScriptKind.TS : ts.ScriptKind.JS;
  return ts.createSourceFile(name, text, ts.ScriptTarget.Latest, true, kind);
}

/** Every comment range of a script, found at the edges of its tokens, where a comment can stand. */
function commentRanges(text, source) {
  const found = new Map();
  const visit = (node) => {
    const ranges = [...(ts.getLeadingCommentRanges(text, node.getFullStart()) ?? []), ...(ts.getTrailingCommentRanges(text, node.getEnd()) ?? [])];
    for (const range of ranges) found.set(range.pos, range);
    node.getChildren(source).forEach(visit);
  };
  visit(source);
  return [...found.values()].sort((a, b) => a.pos - b.pos);
}

/** One comment range as a comment a strip may take, or null for an instruction to a tool, which stays but for a reason written after it. */
function offered(text, source, range, lines) {
  const from = source.getLineAndCharacterOfPosition(range.pos);
  const to = source.getLineAndCharacterOfPosition(range.end);
  const body = text.slice(range.pos, range.end);
  const alone = lines[from.line].slice(0, from.character).trim() === "";
  const whole = { row: from.line, endRow: to.line, column: from.character, endColumn: to.character, text: body, joins: alone && body.startsWith("//"), documents: body.startsWith("/**") };
  if (!DIRECTIVE.test(body)) return whole;
  const reason = body.startsWith("//") ? body.indexOf(" -- ") : -1;
  return reason < 0 ? null : { ...whole, column: from.character + reason, text: body.slice(reason), joins: false };
}

/** Every comment of a script a strip may take. */
function scriptComments(text, name) {
  const source = parsed(text, name);
  const lines = linesOf(text);
  return commentRanges(text, source).map((range) => offered(text, source, range, lines)).filter((comment) => comment !== null);
}

/** The tokens of a script in order, comments and the documentation attached to them apart, which is everything a script means. */
function tokensOf(text, name) {
  const source = parsed(text, name);
  const out = [`errors:${source.parseDiagnostics.length}`];
  const visit = (node) => {
    if (node.kind >= ts.SyntaxKind.FirstJSDocNode && node.kind <= ts.SyntaxKind.LastJSDocNode) return;
    const children = node.getChildren(source);
    if (children.length === 0) out.push(`${node.kind}:${node.getText(source)}`);
    children.forEach(visit);
  };
  visit(source);
  return out.join("\u0000");
}

/** The column of a comment in a file that holds one only on a line a hash begins. */
function edgeOpens(line) {
  return line.startsWith("#") ? 0 : -1;
}

/** The column of a comment in a file that holds one on a line whose first mark is a hash. */
function hashOpens(line) {
  return line.trimStart().startsWith("#") ? line.length - line.trimStart().length : -1;
}

/** The column of a comment in a file that holds one on a line whose first mark is a hash or a semicolon. */
function markOpens(line) {
  return /^[#;]/.test(line.trimStart()) ? line.length - line.trimStart().length : -1;
}

const OPENS = { edge: edgeOpens, hash: hashOpens, marks: markOpens };

/** The kind of text a path holds, for the kinds a strip can prove itself on, or the empty string. */
function kindOf(path) {
  const name = posix.basename(path);
  if (/\.(?:[cm]?[jt]s|[jt]sx)$/.test(name)) return ts === null ? "" : "script";
  if ([".gitignore", ".dockerignore", ".gitattributes"].includes(name)) return "edge";
  if (name === ".editorconfig") return "marks";
  if (name.startsWith(".env")) return "hash";
  return "";
}

/**
 * A script after its strip, or null where the tokens it is left with are not the tokens it had.
 * A comment that documents a symbol goes only with the whole strip: where a silent cut would
 * take it for what it names, it stays, and the silence check refuses the line instead.
 */
function strippedScript(source, wanted, name) {
  const comments = scriptComments(source, name);
  const chosen = wanted === null ? comments : namedBlocks(comments.filter((comment) => !comment.documents), wanted);
  const lines = linesOf(source);
  const after = removeSpans(source, chosen.flatMap((comment) => spansOf(comment, lines)));
  return tokensOf(source, name) === tokensOf(after, name) ? after : null;
}

/** A text read a line at a time after its strip, or null where a line that was no comment did not survive it. */
function strippedLines(kind, source, wanted) {
  const opens = OPENS[kind];
  const lines = linesOf(source).map((line) => line.replace(/\r?\n$/, ""));
  const comments = lines
    .map((line, row) => ({ row, endRow: row, column: opens(line), endColumn: line.length, text: line.slice(Math.max(opens(line), 0)), joins: true }))
    .filter((comment) => comment.column >= 0);
  const chosen = wanted === null ? comments : namedBlocks(comments, wanted);
  const after = removeSpans(source, chosen.map((comment) => ({ row: comment.row, start: comment.column, end: comment.endColumn, whole: false })));
  const rest = (text) => text.split("\n").filter((line) => opens(line) < 0).join("\n");
  return rest(source) === rest(after) ? after : null;
}

/** A text of a known kind after its strip, or null where the strip could not prove it took comments alone. */
function stripped(kind, source, wanted, name) {
  try {
    return kind === "script" ? strippedScript(source, wanted, name) : strippedLines(kind, source, wanted);
  } catch {
    return null;
  }
}

/** Whether a path holds no comment by its nature, or is not this project's to read. */
function passedOver(cut, path) {
  return cut.foreign.has(path) || PLAIN.some((suffix) => path.endsWith(suffix)) || TERMS.some((stem) => posix.basename(path).startsWith(stem));
}

/** Every kept text of a kind a strip can prove itself on, stripped; a text of another kind, or one whose strip could not be proven, goes out as written, and a bare cut names it. */
function stripSources(cut, wanted) {
  let changed = 0;
  const carried = new Map();
  for (const path of [...cut.edition.keys()].sort()) {
    const text = passedOver(cut, path) ? null : asText(cut.edition.get(path));
    if (text === null) continue;
    const kind = kindOf(path);
    const after = kind === "" ? null : stripped(kind, text, wanted, path);
    if (after === null) {
      const label = posix.extname(path) || posix.basename(path);
      carried.set(label, (carried.get(label) ?? 0) + 1);
    } else if (after !== text) {
      cut.edition.set(path, Buffer.from(after, "utf-8"));
      changed += 1;
    }
  }
  noteStrips(cut, wanted, changed, carried);
}

/** What a strip did, said once: how many files changed, and at the bare tier which kinds went out as written. */
function noteStrips(cut, wanted, changed, carried) {
  if (wanted !== null) {
    if (changed > 0) cut.notes.push(`${changed} file(s) lost a comment that named the style, each strip proven against its source`);
    return;
  }
  cut.notes.push(`${changed} file(s) stripped of comments and docstrings, each strip proven against its source`);
  if (carried.size > 0) {
    const kinds = [...carried.entries()].sort().map(([kind, count]) => `${count} ${kind}`).join(", ");
    cut.notes.push(`carried as written, since no strip proves itself on their kind: ${kinds}`);
  }
}

/** What names the style in this project, a closed list a machine can decide: the family by its name, a record by its number, and a withheld path by its name. */
function stylePattern(cut, own) {
  const keptNames = new Set([...cut.edition.keys()].map((path) => posix.basename(path)));
  const names = new Set([...cut.withheld, ...STYLE_FOLDERS, ...own.filter((entry) => entry.endsWith("/"))]);
  for (const path of cut.withheld) {
    if (path.split("/").length <= 2 && !keptNames.has(posix.basename(path))) names.add(posix.basename(path));
  }
  const paths = [...names].sort((a, b) => b.length - a.length).map((name) => name.replace(/[.*+?^${}()|[\]\\/-]/g, "\\$&")).join("|");
  return new RegExp(`My-Styles|\\b(?:[Dd]ecision|[Rr]ecord|[Cc]laim)s? 0\\d{3}\\b|(?<![\\w./-])(?:${paths})(?![\\w-])`);
}

/** A silent edition names nothing of the style: every kept line that still does is a problem with what it names, and a word the style merely uses is advised. */
function checkSilence(cut, pattern) {
  for (const path of [...cut.edition.keys()].sort()) {
    const text = cut.foreign.has(path) ? null : asText(cut.edition.get(path));
    (text ?? "").split("\n").forEach((line, index) => {
      const match = pattern.exec(line);
      const word = VOCABULARY.exec(line);
      if (match !== null) {
        cut.problems.push(
          `${path}:${index + 1}: names '${match[0]}', and a silent edition names nothing of the style; reword it where it is written, or withhold the file`,
        );
      } else if (word !== null) {
        cut.advice.push(`${path}:${index + 1}: says '${word[0]}', a word of the style's that may also be the product's own`);
      }
    });
  }
}

/** Every file under a folder, as paths relative to it. */
function filesUnder(folder, prefix = "") {
  return readdirSync(join(folder, prefix), { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? filesUnder(folder, `${prefix}${entry.name}/`) : [`${prefix}${entry.name}`],
  );
}

/** A project kept inside this one, cut by its own tool at the same tier and version and laid in at its own path. */
function takeNested(cut, nest) {
  if (!existsSync(join(ROOT, nest, "scripts/cut-edition.mjs"))) {
    cut.problems.push(`${nest}/: carries a guide of its own and no edition tool this one can run, so nothing can cut it; give it the tool or withhold it`);
    return;
  }
  const scratch = mkdtempSync(join(tmpdir(), "edition-"));
  try {
    const target = join(scratch, "cut");
    const asked = ["scripts/cut-edition.mjs", cut.tier, target, "--nested", ...(cut.silent ? ["--silent"] : [])];
    const done = spawnSync(process.execPath, asked, { cwd: join(ROOT, nest), encoding: "utf-8" });
    const said = done.stdout.split("\n").filter((line) => line.trim() !== "");
    if (done.status !== 0) {
      const lines = said.length > 1 ? said.slice(0, -1) : [done.stderr.trim() || "its tool said nothing"];
      cut.problems.push(...lines.map((line) => `${nest}/${line}`));
      return;
    }
    for (const path of filesUnder(target).sort()) {
      cut.edition.set(`${nest}/${path}`, readFileSync(join(target, path)));
      cut.foreign.add(`${nest}/${path}`);
    }
    cut.notes.push(...said.slice(1).map((line) => `${nest}/: ${line.trim()}`));
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

/** The names of the manifest's scripts that run a file the edition withholds. */
function withheldScripts(cut, manifest) {
  const withheld = new Set(cut.withheld);
  const runs = (command) => typeof command === "string" && command.split(/\s+/).some((word) => withheld.has(word.replace(/^\.\//, "")));
  return Object.entries(manifest.scripts ?? {}).filter(([, command]) => runs(command)).map(([name]) => name);
}

/** A manifest's text without the lines of the scripts named, a comma dropped where it would now close its object. */
function withoutScripts(text, names) {
  const lines = text.split("\n").filter((line) => !names.some((name) => line.trimStart().startsWith(`${JSON.stringify(name)}:`)));
  return lines
    .map((line, index) => {
      const next = lines.slice(index + 1).find((later) => later.trim() !== "");
      return next !== undefined && /^\s*[}\]]/.test(next) ? line.replace(/,\s*$/, "") : line;
    })
    .join("\n");
}

/**
 * The project's manifest without the scripts that ran a withheld tool, since a script whose file
 * stays in the workshop is a command that fails. The lines go and nothing else moves, and the
 * manifest must then read to what it read to before, those scripts apart.
 */
function rewriteManifest(cut) {
  const text = cut.edition.has("package.json") ? asText(cut.edition.get("package.json")) : null;
  if (text === null) return;
  try {
    const manifest = JSON.parse(text);
    const names = withheldScripts(cut, manifest);
    if (names.length === 0) return;
    const after = withoutScripts(text, names);
    for (const name of names) delete manifest.scripts[name];
    if (JSON.stringify(JSON.parse(after)) !== JSON.stringify(manifest)) throw new Error("the manifest did not survive the cut");
    cut.edition.set("package.json", Buffer.from(after, "utf-8"));
    cut.notes.push(`package.json: ${names.length} script(s) that ran a withheld tool left out`);
  } catch {
    cut.problems.push("package.json: its scripts that run withheld tools could not be left out with proof; take them out of the manifest's lines by hand or withhold the file");
  }
}

/** The files the public receives in another form, each at the path it replaces; a nested project leaves its workflow behind, since a workflow is read at a repository's root and nowhere else. */
function laidOverlay(cut, paths) {
  const chosen = paths.filter((path) => path.startsWith(OVERLAY) && !(cut.nested && path.startsWith(`${OVERLAY}.github/`)));
  const found = blobs(chosen);
  if (found.size > 0) cut.notes.push(`${found.size} file(s) laid over the cut from ${OVERLAY}`);
  return new Map([...found.entries()].map(([path, data]) => [path.slice(OVERLAY.length), data]));
}

/** The edition whole, in memory: what the tier keeps, each nested project by its own tool, the documents rewritten, the sources stripped where the tier or the version asks, and the overlay on top. */
function assemble(cut) {
  const paths = tracked();
  if (cut.tier === "snapshot") {
    cut.edition = blobs(paths);
    return;
  }
  const own = projectList(paths);
  cut.withheld = paths.filter((path) => isWithheld(path, own));
  const kept = paths.filter((path) => !isWithheld(path, own));
  const nests = nestedRoots(kept);
  cut.edition = blobs(kept.filter((path) => !nests.some((nest) => path.startsWith(`${nest}/`))));
  for (const nest of nests) takeNested(cut, nest);
  rewriteManifest(cut);
  const overlay = cut.tier === "hand-made" ? laidOverlay(cut, paths) : new Map();
  rewriteDocuments(cut, new Set([...cut.edition.keys(), ...overlay.keys()]));
  const pattern = stylePattern(cut, own);
  if (cut.tier === "bare") stripSources(cut, null);
  else if (cut.silent) stripSources(cut, (text) => pattern.test(text));
  for (const [path, data] of overlay) cut.edition.set(path, data);
  if (cut.silent) checkSilence(cut, pattern);
  if (!cut.nested && !cut.edition.has("LICENSE")) {
    cut.advice.push("no LICENSE at the edition's root; a public repository states its terms, and that file is the owner's to add");
  }
}

/** A folder as the filesystem holds it, every link on the way to it followed. The system's own answer comes first, since it alone undoes a short name, then each link read in turn, and where neither answers the path stands as written. */
function followed(path, native = realpathSync.native) {
  for (const ask of [native, realpathSync]) {
    try {
      return ask(path);
    } catch {
      // The next way of asking is tried.
    }
  }
  return path;
}

/** One path as the machine compares it, its closest folder that exists as the filesystem holds it and the part not made yet under it, whatever case and slashes it was written in. */
function settled(path) {
  const whole = resolve(path);
  let held = whole;
  while (!existsSync(held) && dirname(held) !== held) held = dirname(held);
  const real = join(followed(held), relative(held, whole));
  return process.platform === "win32" ? real.toLowerCase() : real;
}

/** Why a cut cannot start, or the empty string: an edition is written outside the repository, into a folder that holds nothing, from a tree every change of which a commit holds. */
function refusal(destination) {
  const top = settled(git(["rev-parse", "--show-toplevel"]).toString("utf-8").trim() || ROOT);
  const target = settled(destination);
  if (target === top || target.startsWith(top + sep) || top.startsWith(target + sep)) {
    return "the destination lies inside the repository or holds it; an edition is written outside";
  }
  if (existsSync(target) && (!statSync(target).isDirectory() || readdirSync(target).length > 0)) {
    return "the destination exists and is not an empty folder; a cut never writes over anything";
  }
  if (git(["status", "--porcelain", "--untracked-files=no", "--", "."]).toString("utf-8").trim() !== "") {
    return "the tree holds changes no commit has; an edition is cut from the last commit, so commit them or put them away first";
  }
  return "";
}

/** Why a destination cannot hold these paths, or the empty string: a path past what the system writes would stop the cut halfway, and a cut is whole or it is nothing. */
function overlong(destination, paths, limit = PATH_LIMIT) {
  const longest = paths.reduce((kept, path) => (path.length > kept.length ? path : kept), "");
  // Measured as written, since the system counts the spelling it is handed and never the folder a link leads to.
  const length = resolve(destination).length + 1 + longest.length;
  if (length < limit) return "";
  return `under this destination ${longest} would run to ${length} characters, past the ${limit} this system is sure to write; cut into a folder with a shorter path`;
}

/** The edition written out, or the reason the system gave for stopping partway. */
function written(cut, destination) {
  try {
    for (const [path, data] of cut.edition) {
      mkdirSync(dirname(join(destination, path)), { recursive: true });
      writeFileSync(join(destination, path), data);
    }
    return "";
  } catch (error) {
    return String(error.message);
  }
}

/** What a cut did, in the order a reader checks it: what was asked and from which commit, what was written, what was changed on the way, and what is advised. */
function report(cut, destination) {
  const version = cut.tier === "snapshot" ? "" : cut.silent ? ", silent," : ", attributed,";
  const commit = git(["rev-parse", "--short=12", "HEAD"]).toString("utf-8").trim();
  console.log(`cut the ${cut.tier} edition${version} from ${commit} into ${destination}`);
  console.log(`  ${cut.edition.size} file(s) written, ${cut.withheld.length} withheld`);
  for (const note of cut.notes) console.log(`  ${note}`);
  if (cut.advice.length > 0 && !cut.nested) {
    console.log(`advisory, ${cut.advice.length} item(s), decides nothing and gates nothing:`);
    for (const item of cut.advice) console.log(`  ${item}`);
  }
}

/** One cut, written only when it is whole and has no problem to report. */
function run(tier, destination, silent, nested) {
  const stop = refusal(destination);
  if (stop !== "") {
    console.log(stop);
    return 1;
  }
  const cut = { tier, silent, nested, edition: new Map(), withheld: [], foreign: new Set(), notes: [], advice: [], problems: [] };
  assemble(cut);
  const unwritable = overlong(destination, [...cut.edition.keys()]);
  if (unwritable !== "") cut.problems.push(unwritable);
  if (cut.problems.length > 0) {
    for (const problem of cut.problems) console.log(problem);
    console.log(`\n${cut.problems.length} problem(s). Nothing was written.`);
    return 1;
  }
  const stopped = written(cut, destination);
  if (stopped !== "") {
    console.log(`the system stopped the cut while it wrote, so the destination holds a part of it, which is the owner's to remove: ${stopped}`);
    return 1;
  }
  report(cut, destination);
  return 0;
}

/** Cut an edition, or prove the tool. */
function main() {
  const flags = new Set(process.argv.slice(2).filter((arg) => arg.startsWith("--")));
  const args = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
  if (flags.has("--selftest")) return selftest();
  const unknown = [...flags].some((flag) => flag !== "--silent" && flag !== "--nested");
  const offered = args.length === 2 && TIERS.includes(args[0]) && !(args[0] === "snapshot" && flags.has("--silent"));
  if (unknown || !offered) {
    console.log(USAGE);
    return 2;
  }
  return run(args[0], args[1], flags.has("--silent"), flags.has("--nested"));
}

/**
 * The selftest's project, small enough to read whole: a README by the schema with the sentence
 * that names the family, a configuration and a module whose comments name the style in one block
 * and not in another, a workflow the style runs and the plain one the public receives, a path the
 * project withholds, and a project nested inside with its own guide.
 */
const FIXTURE_README = [
  "# Sample",
  "",
  "A sample client.",
  "",
  "Sample does one thing. Built from [Helm](https://example.invalid/My-Styles/tree/main/Helm), the client template of the My-Styles family. It is small.",
  "",
  "---",
  "",
  "## Core Architectural Pillars",
  "",
  "1. **One rule.** The layers import downward, as [the reasoning says](docs/decisions/0001-keep-the-layers-apart.md).",
  "",
  "---",
  "",
  "## Project Structure",
  "",
  "```text",
  "sample/",
  "├── src/                        # The client",
  "├── package.json                # The manifest",
  "├── AGENTS.md                   # The guide",
  "└── docs/                       # The documents",
  "    └── decisions/              # The reasons",
  "```",
  "",
  "---",
  "",
  "## Getting Started",
  "",
  "```bash",
  "# Install the dependencies",
  "npm ci",
  "```",
  "",
  "---",
  "",
  "## Conventions",
  "",
  "The project's conventions live in the rulebook, [docs/CONVENTIONS.md](docs/CONVENTIONS.md).",
  "",
  "---",
  "",
  "## License",
  "",
  "This work is under an [MIT](https://choosealicense.com/licenses/mit/) License.",
  "",
].join("\n");
const FIXTURE_MODULE = [
  "/** The sample module. */",
  "",
  'import { sep } from "node:path"; // the standard library',
  "",
  "// Helm's decision 0001 keeps this pure.",
  "// It imports nothing upward.",
  "export function double(value: number): number {",
  "  // eslint-disable-next-line no-magic-numbers -- two is the point of it",
  "  return value * 2;",
  "}",
  "",
  "/** A port with nothing in it. */",
  "export interface Port {}",
  "",
  "/** The name, with a comment mark inside. */",
  "export function name(): string {",
  '  const text = "// not a comment";',
  "  return text + sep;",
  "}",
  "",
].join("\n");
const FIXTURE_CONFIG = [
  "// The lint settings are the style's, as AGENTS.md says.",
  "// They change with it.",
  "export default []; // the whole configuration",
  "",
].join("\n");
const FIXTURE = {
  "AGENTS.md": "# Sample Agent Guide\n\nThe guide.\n",
  "STATE.md": "# State\n\n- Nothing in flight.\n",
  ".codespellignore": "sampleword\n",
  LICENSE: "The terms.\n",
  "index.html": '<!-- the page -->\n<div id="root"></div>\n',
  ".gitignore": "# Second working trees, as STATE.md records\n.worktrees/\n\n# caches\nnode_modules/\n",
  ".github/workflows/ci.yml": "name: gate\n",
  "docs/CONVENTIONS.md": "# Conventions\n\nThe rulebook.\n",
  "docs/decisions/0001-keep-the-layers-apart.md": "# 0001. Keep the layers apart\n",
  "edition/withheld.txt": "# what this project keeps back\nnotes/\n",
  "edition/overlay/.github/workflows/ci.yml": "name: plain\n",
  "notes/private.txt": "kept back\n",
  "scripts/audit-docs.mjs": "export const VALUE = 1;\n",
  "package.json": '{\n  "name": "sample",\n  "scripts": {\n    "build": "vite build",\n    "docs": "node scripts/audit-docs.mjs"\n  }\n}\n',
  "eslint.config.js": FIXTURE_CONFIG,
  "src/sample.ts": FIXTURE_MODULE,
  "README.md": FIXTURE_README,
  "web/inner/AGENTS.md": "# Inner Agent Guide\n",
  "web/inner/README.md": "# Inner\n\nAn inner project.\n\n## Conventions\n\nSee [the guide](AGENTS.md).\n",
  "web/inner/docs/NOTES.md": "# Notes\n",
  "web/inner/src/inner.ts": "/** Inner. */\nexport const VALUE = 1; // one\n",
  "web/inner/edition/overlay/.github/workflows/ci.yml": "name: inner\n",
  "web/inner/edition/overlay/CONTRIBUTING.md": "# Contributing\n",
};
/**
 * What a second project adds to be refused: a documentation comment that names the style, an
 * image the edition cannot show, and a nested project with no tool of its own to cut it.
 */
const FIXTURE_TOLD = {
  "src/told.ts": "/** As AGENTS.md says. */\nexport const TOLD = 1;\n",
  "docs/map.png": "not a picture\n",
  "README.md": FIXTURE_README.replace("A sample client.", "A sample client.\n\n![The map](docs/map.png)"),
};

/** A committed project in a scratch folder, with this tool at its own path and, where asked, in the project nested inside. */
function buildFixture(root, files, nestedTool) {
  const homes = ["scripts/cut-edition.mjs", ...(nestedTool ? ["web/inner/scripts/cut-edition.mjs"] : [])];
  const contents = { ...files, ...Object.fromEntries(homes.map((home) => [home, readFileSync(SELF)])) };
  for (const [path, data] of Object.entries(contents)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), data);
  }
  const identity = ["-c", "user.name=selftest", "-c", "user.email=selftest@example.invalid", "-c", "commit.gpgsign=false"];
  for (const args of [["init", "-q"], ["config", "core.autocrlf", "false"], ["add", "-A"], [...identity, "commit", "-q", "-m", "fixture"]]) {
    execFileSync("git", args, { cwd: root, stdio: "ignore" });
  }
}

/** One cut of a fixture by its own copy of this tool: how it ended, what it said, and what it wrote. */
function cutFixture(root, out, ...args) {
  const env = { ...process.env, NODE_PATH: join(ROOT, "node_modules") };
  const done = spawnSync(process.execPath, ["scripts/cut-edition.mjs", args[0], out, ...args.slice(1)], { cwd: root, encoding: "utf-8", env });
  const files = existsSync(out) ? Object.fromEntries(filesUnder(out).map((path) => [path, readFileSync(join(out, path), "utf-8")])) : {};
  return [done.status, done.stdout, files];
}

/** One failure counted and named, or none. */
function expect(holds, what) {
  if (!holds) console.log(`WRONG: ${what}`);
  return holds ? 0 : 1;
}

/** The snapshot is every tracked file as it stands, the workshop's own among them. */
function proveSnapshot(root, out) {
  const [code, , files] = cutFixture(root, out, "snapshot");
  const everything = ["AGENTS.md", "docs/CONVENTIONS.md", "notes/private.txt", "web/inner/AGENTS.md", "scripts/cut-edition.mjs"].filter((path) => path in files);
  return expect(code === 0 && everything.length === 5, "the snapshot left out a tracked file") + expect(files["src/sample.ts"] === FIXTURE_MODULE, "the snapshot changed a file it carried");
}

/** The hand-made tier withholds the workshop, carries the code as written, lays the overlay, and rewrites the README for what it holds. */
function proveHandMade(root, out) {
  const [code, , files] = cutFixture(root, out, "hand-made");
  const readme = files["README.md"] ?? "";
  const held = Object.keys(files).filter((path) => /^(?:docs|edition|notes)\//.test(path) || /(?:AGENTS\.md|STATE\.md|audit-docs\.mjs|cut-edition\.mjs|\.codespellignore)$/.test(path));
  let failures = expect(code === 0 && held.length === 0, `the hand-made tier carried what it withholds: ${held}`);
  failures += expect(files[".github/workflows/ci.yml"] === "name: plain\n", "the overlay's workflow did not replace the style's");
  failures += expect(files["src/sample.ts"] === FIXTURE_MODULE, "the hand-made tier changed code it carries as written");
  failures += expect(files["package.json"] === '{\n  "name": "sample",\n  "scripts": {\n    "build": "vite build"\n  }\n}\n', "the manifest kept a script that runs a withheld tool, or lost another");
  failures += expect(!readme.includes("## Conventions") && !readme.includes("docs/"), "the README kept its Conventions section or a withheld path");
  failures += expect(readme.includes("as the reasoning says."), "a link into a withheld path was not turned back into its words");
  failures += expect(readme.includes("└── package.json") && !readme.includes("AGENTS.md"), "a drawn tree kept a withheld entry or left its last branch open");
  failures += expect(readme.includes(NOTICES["hand-made"]) && readme.includes("Built from [Helm]"), "the attributed README lost its notice or its attribution");
  failures += expect("web/inner/src/inner.ts" in files && !("web/inner/AGENTS.md" in files), "the nested project was not cut by its own tool");
  failures += expect("web/inner/CONTRIBUTING.md" in files, "the nested project's overlay was not laid");
  return failures + expect(!("web/inner/.github/workflows/ci.yml" in files), "a nested project carried a workflow no root reads");
}

/** The silent version drops a comment that names the style, cuts the sentence that names the family, and keeps every other word. */
function proveSilent(root, out) {
  const [code, said, files] = cutFixture(root, out, "hand-made", "--silent");
  const [readme, module, config, ignore] = ["README.md", "src/sample.ts", "eslint.config.js", ".gitignore"].map((path) => files[path] ?? "");
  let failures = expect(code === 0, `the silent cut of a project that can be silent was refused:\n${said}`);
  failures += expect(!readme.includes("My-Styles") && !readme.includes(NOTICES["hand-made"]), "the silent README names the family or carries the notice");
  failures += expect(readme.includes("Sample does one thing. It is small."), "the silent README lost a sentence that named nothing");
  failures += expect(!module.includes("keeps this pure") && !module.includes("imports nothing upward"), "a comment block that names the style was not dropped whole");
  failures += expect(module.includes("// the standard library") && module.includes("/** The sample module. */"), "the silent cut dropped a comment that named nothing");
  failures += expect(!config.includes("AGENTS.md") && config.includes("// the whole configuration"), "the configuration's comments were not sorted by what they name");
  failures += expect(!ignore.includes("STATE.md") && ignore.includes("# caches"), "the ignore file's comments were not sorted by what they name");
  return failures + expect(said.includes("cut for naming the family"), "the cut did not report the sentence it took");
}

/** The bare tier strips every comment a proof covers, keeps what instructs a tool, and cuts the README to what the thing is and how to run it. */
function proveBare(root, out) {
  const [code, said, files] = cutFixture(root, out, "bare");
  const [readme, module, config] = ["README.md", "src/sample.ts", "eslint.config.js"].map((path) => files[path] ?? "");
  let failures = expect(code === 0 && !module.includes("/**") && !module.includes("standard library"), "the bare tier left a comment in a module");
  failures += expect(module.includes("// eslint-disable-next-line no-magic-numbers\n") && !module.includes("the point of it"), "an instruction to a tool was dropped, or the reason after it kept");
  failures += expect(module.includes('"// not a comment"') && module.includes("export interface Port {}"), "a string was cut as a comment, or code went with one");
  failures += expect(config === "export default [];\n", "the configuration kept a comment");
  failures += expect(readme.includes("## Getting Started") && readme.includes("## License") && !readme.includes("## Project Structure"), "the bare README is not its opening, how to run it and its terms");
  failures += expect(readme.includes(NOTICES.bare), "the bare README lost its notice");
  failures += expect(!(".github/workflows/ci.yml" in files) && !("web/inner/CONTRIBUTING.md" in files), "the bare tier took the overlay");
  failures += expect(files["index.html"] === FIXTURE["index.html"] && said.includes(".html"), "a kind no strip proves itself on was changed or went unnamed");
  return failures + expect(!(files["web/inner/src/inner.ts"] ?? "/**").includes("/**"), "the nested project was not stripped by its own tool");
}

/** A cut that cannot be whole writes nothing: a destination inside the repository or already holding something, a tree with uncommitted changes, a version the tier has not, and a silent edition that still names the style. */
function proveRefusals(root, told, out) {
  let failures = expect(cutFixture(root, join(root, "inside"), "hand-made")[0] === 1, "a destination inside the repository was accepted");
  mkdirSync(join(out, "full"), { recursive: true });
  writeFileSync(join(out, "full", "kept.txt"), "already here\n");
  failures += expect(cutFixture(root, join(out, "full"), "hand-made")[0] === 1 && existsSync(join(out, "full", "kept.txt")), "a destination that holds something was written over");
  failures += expect(cutFixture(root, join(out, "usage"), "snapshot", "--silent")[0] === 2, "the snapshot was offered a silent version");
  writeFileSync(join(root, "LICENSE"), "changed\n");
  failures += expect(cutFixture(root, join(out, "dirty"), "hand-made")[0] === 1, "a tree with uncommitted changes was cut");
  execFileSync("git", ["checkout", "--", "LICENSE"], { cwd: root, stdio: "ignore" });
  const [code, said, files] = cutFixture(told, join(out, "told"), "hand-made", "--silent");
  failures += expect(code === 1 && Object.keys(files).length === 0 && said.includes("Nothing was written."), "a silent cut that still names the style wrote something");
  failures += expect(said.includes("src/told.ts:1: names 'AGENTS.md'"), "a documentation comment that names the style did not refuse the silent cut");
  failures += expect(said.includes("the image docs/map.png is not in the edition"), "an image the edition cannot show raised nothing");
  return failures + expect(said.includes("web/inner/: carries a guide of its own and no edition tool"), "a nested project with no tool was passed over");
}

/** A way of asking the system that gives no answer, for proving what the tool does without one. */
function unanswered() {
  throw new Error("no answer");
}

/** A destination is read as the system reads it, judged where the filesystem holds it, so that a link into the repository is refused like the folder it leads to, and measured as it is written. */
function proveLinks(root, door) {
  let failures = expect(followed(root, () => "the system's answer") === "the system's answer", "the system's own answer for a folder was passed over");
  failures += expect(followed(join(root, "nowhere"), unanswered) === join(root, "nowhere"), "a path nothing can read was not left as written");
  try {
    symlinkSync(root, door, "junction");
  } catch {
    console.log("the refusal of a destination behind a link was not proven: this system made no link to prove it on");
    return failures;
  }
  failures += expect(followed(door, unanswered) === realpathSync(root), "a link was not read where the system gave no answer of its own");
  const edge = resolve(door, "e").length + 1 + "a.txt".length;
  failures += expect(overlong(join(door, "e"), ["a.txt"], edge) !== "" && overlong(join(door, "e"), ["a.txt"], edge + 1) === "", "a destination behind a link was measured by a spelling the cut does not write under");
  return failures + expect(cutFixture(root, join(door, "inside"), "hand-made")[0] === 1 && !existsSync(join(root, "inside")), "a destination inside the repository was accepted when a link led to it");
}

/** A strip is trusted only through its proof: a text changed beyond its comments is refused, and words that only look like a comment stay where they are. */
function proveStrips() {
  let failures = expect(tokensOf("const x = 1; // c\n", "a.ts") !== tokensOf("const x = 2;\n", "a.ts"), "the proof passed a strip that changed a value");
  failures += expect(tokensOf("const x = 1; // c\n", "a.ts") === tokensOf("const x = 1;\n", "a.ts"), "the proof refused a strip that took a comment alone");
  failures += expect(overlong("d", ["a.txt"], 1) !== "" && overlong("d", ["a.txt"], 10 ** 6) === "", "a destination whose paths the system cannot write was not refused before the cut wrote");
  const words = "export const View = () => <p>// kept words</p>;\n";
  failures += expect([null, words].includes(stripped("script", words, null, "view.tsx")), "words inside markup were cut as a comment and the proof did not catch it");
  return failures + expect(stripped("edge", "# note\n  # a pattern, not a comment\nbuild/\n", null, ".gitignore") === "  # a pattern, not a comment\nbuild/\n", "an ignore file lost a line that was no comment");
}

/** Prove the tool on a project of its own making, since a cut that was never checked against what it should hold proves nothing. */
function selftest() {
  if (ts === null) {
    console.log("the selftest did not run: the compiler is not installed, and without it no strip of a script proves itself");
    return 1;
  }
  const scratch = mkdtempSync(join(tmpdir(), "edition-selftest-"));
  let failures = 0;
  try {
    const [root, told, out] = ["project", "told", "out"].map((name) => join(scratch, name));
    buildFixture(root, FIXTURE, true);
    buildFixture(told, { ...FIXTURE, ...FIXTURE_TOLD }, false);
    failures += proveSnapshot(root, join(out, "snapshot")) + proveHandMade(root, join(out, "hand-made"));
    failures += proveSilent(root, join(out, "silent")) + proveBare(root, join(out, "bare"));
    failures += proveRefusals(root, told, out) + proveLinks(root, join(scratch, "door")) + proveStrips();
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
  if (failures > 0) {
    console.log(`\n${failures} proof(s) failed. The tool does not cut what its law says.`);
    return 1;
  }
  console.log("every cut holds");
  return 0;
}

process.exit(main());
