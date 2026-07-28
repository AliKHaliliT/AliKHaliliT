#!/usr/bin/env node
// Renders the VITA pixel-mark (the brand mosaic in public/favicon.svg and the
// TopBar) to PNG at any size. Dependency-free: the mark is six axis-aligned
// squares, rasterized with exact-coverage antialiasing and encoded through
// node's built-in zlib.
//
// Usage:
//   npm run icon -- 512
//   npm run icon -- 16 32 180 512 --theme dark
//   npm run icon -- 1024 --bg "#131110" --out ./exports
//
// Colors come from the deployed palette seed (src/content/settings/palette.json:
// ink = textPrimary, plus field and pulse, per theme), so a re-themed fork gets
// a matching icon without touching this file.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { deflateSync } from "node:zlib";
import path from "node:path";
import { fileURLToPath } from "node:url";

// --- The mark's geometry, in the favicon's 32-unit viewBox -----------------

const UNIT = 32;
const CELL = 7.5;
// [x, y, colorRole] per cell: two rows of three, one field and one pulse cell.
const CELLS = [
  [2.5, 7.5, "ink"],
  [12.25, 7.5, "field"],
  [22, 7.5, "ink"],
  [2.5, 17, "ink"],
  [12.25, 17, "ink"],
  [22, 17, "pulse"],
];

// --- Palette ----------------------------------------------------------------

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FALLBACK = {
  light: { ink: "#191713", field: "#ff6b2e", pulse: "#7fb5c9" },
  dark: { ink: "#efeae3", field: "#ff7038", pulse: "#8fc3d8" },
};

function loadColors(theme) {
  try {
    const seed = JSON.parse(
      readFileSync(path.join(ROOT, "src/content/settings/palette.json"), "utf8")
    );
    const t = seed[theme];
    return {
      ink: t.textPrimary ?? FALLBACK[theme].ink,
      field: t.field ?? FALLBACK[theme].field,
      pulse: t.pulse ?? FALLBACK[theme].pulse,
    };
  } catch {
    return FALLBACK[theme];
  }
}

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const v = h.length === 3 ? [...h].map((c) => c + c).join("") : h;
  const n = parseInt(v, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// --- Rasterizer: exact per-pixel coverage of axis-aligned squares -----------

function render(size, colors, bg) {
  const px = new Uint8Array(size * size * 4);
  if (bg) {
    const [r, g, b] = bg;
    for (let i = 0; i < px.length; i += 4) {
      px[i] = r; px[i + 1] = g; px[i + 2] = b; px[i + 3] = 255;
    }
  }
  const s = size / UNIT;
  for (const [cx, cy, role] of CELLS) {
    const [r, g, b] = hexToRgb(colors[role]);
    const x0 = cx * s, x1 = (cx + CELL) * s;
    const y0 = cy * s, y1 = (cy + CELL) * s;
    for (let y = Math.floor(y0); y < Math.ceil(y1); y++) {
      const covY = Math.min(y + 1, y1) - Math.max(y, y0);
      for (let x = Math.floor(x0); x < Math.ceil(x1); x++) {
        const covX = Math.min(x + 1, x1) - Math.max(x, x0);
        const a = Math.max(0, covX) * Math.max(0, covY); // 0..1 coverage
        if (a <= 0) continue;
        const i = (y * size + x) * 4;
        // Source-over composite (cells never overlap one another).
        const sa = a, da = px[i + 3] / 255, oa = sa + da * (1 - sa);
        px[i] = Math.round((r * sa + px[i] * da * (1 - sa)) / oa);
        px[i + 1] = Math.round((g * sa + px[i + 1] * da * (1 - sa)) / oa);
        px[i + 2] = Math.round((b * sa + px[i + 2] * da * (1 - sa)) / oa);
        px[i + 3] = Math.round(oa * 255);
      }
    }
  }
  return px;
}

// --- Minimal PNG encoder (RGBA8, no interlace) -------------------------------

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePng(px, size) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type: RGBA
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0; // filter: none
    raw.set(px.subarray(y * size * 4, (y + 1) * size * 4), y * (size * 4 + 1) + 1);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// --- CLI ---------------------------------------------------------------------

const args = process.argv.slice(2);
const sizes = [];
let theme = "light";
let bg = null;
let outDir = process.cwd();

for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--theme") theme = args[++i];
  else if (a === "--bg") bg = hexToRgb(args[++i]);
  else if (a === "--out") outDir = args[++i];
  else if (/^\d+$/.test(a)) sizes.push(parseInt(a, 10));
  else {
    console.error(`Unknown argument: ${a}`);
    process.exit(1);
  }
}

if (!sizes.length || (theme !== "light" && theme !== "dark")) {
  console.error(
    'Usage: npm run icon -- <size> [more sizes] [--theme light|dark] [--bg "#hex"] [--out dir]'
  );
  process.exit(1);
}

const colors = loadColors(theme);
mkdirSync(outDir, { recursive: true });
for (const size of sizes) {
  const png = encodePng(render(size, colors, bg), size);
  const name = `pixel-mark-${size}${theme === "dark" ? "-dark" : ""}.png`;
  const file = path.join(outDir, name);
  writeFileSync(file, png);
  console.log(`${file} (${size}x${size}, ${png.length} bytes)`);
}
