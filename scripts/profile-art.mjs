#!/usr/bin/env node
// Builds the profile README art (the archive wall) into util_resources/readme/:
// hero, enter plate, and marquee ticker, each in a dark and a light variant
// swapped by the README's picture elements. Everything is self-contained SVG:
// the tag is raw pixel rects, the QR poster genuinely encodes the site URL,
// and every animation carries a prefers-reduced-motion guard.
//
// Usage:
//   npm run profile-art
//
// The output is deterministic (seeded PRNG), so reruns are byte-identical
// until this file changes.

import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import QRCode from "qrcode";

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "util_resources", "readme");
const SITE = "https://alikhalilit.github.io/AliKHaliliT/";
mkdirSync(OUT, { recursive: true });

const ORANGE = "#ff7038";
const SKY = "#8fc3d8";

// Rangefinder seed, split into a night wall and a daylight wall
const THEMES = {
  dark: {
    suffix: "",
    wall: "#17140f", ink: "#efeae3", stencil: "#7a7166", shadow: "#0d0b08",
    grainInk: [0.94, 0.92, 0.89], vigColor: "#0d0b08", vigOp: 0.72,
    tagShadow: "#0d0b08", subFill: "#efeae3",
    tapeBg: "#efeae3", tapeInk: ORANGE,
    plate: "#1b1815", plateInk: "#efeae3",
  },
  light: {
    suffix: "-light",
    wall: "#ded7c9", ink: "#1b1815", stencil: "#6f665a", shadow: "#2a241d",
    grainInk: [0.11, 0.09, 0.07], vigColor: "#5a4f40", vigOp: 0.3,
    tagShadow: "#2a241d", subFill: "#1b1815",
    tapeBg: "#1b1815", tapeInk: ORANGE,
    plate: "#efeae3", plateInk: "#1b1815",
  },
};

const MONO = `ui-monospace, 'Cascadia Mono', 'SF Mono', Consolas, monospace`;

// Deterministic PRNG so regeneration is stable
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 5x7 pixel glyphs (I is 3 wide)
const GLYPHS = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  I: ["111", "010", "010", "010", "010", "010", "111"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
};

function pixelWord(word, cell, gapCells = 1) {
  let x = 0;
  const rects = [];
  const bottoms = [];
  for (const ch of word) {
    if (ch === " ") { x += 3 * cell; continue; }
    const g = GLYPHS[ch];
    const w = g[0].length;
    g.forEach((row, ry) => {
      [...row].forEach((bit, rx) => {
        if (bit === "1") {
          rects.push(`<rect x="${x + rx * cell}" y="${ry * cell}" width="${cell - 1}" height="${cell - 1}"/>`);
          if (ry === g.length - 1) bottoms.push(x + rx * cell);
        }
      });
    });
    x += (w + gapCells) * cell;
  }
  return { svg: rects.join(""), width: x - gapCells * cell, height: 7 * cell, bottoms };
}

// a pair of offset pixel squares, the drawn (font-independent) separator
function pixelSep(x, y, s, color) {
  return `<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="${color}"/>` +
    `<rect x="${x + s + 2}" y="${y + s + 2}" width="${s}" height="${s}" fill="${color}"/>`;
}

const REDUCED = `@media (prefers-reduced-motion: reduce){*{animation:none!important}}`;

const qr = QRCode.create(SITE, { errorCorrectionLevel: "M" });

/* ------------------------------------------------------------------ hero */
function hero(T) {
  const W = 1200, H = 560;
  const rnd = mulberry32(1998);

  const ali = pixelWord("ALI", 30);
  const khalili = pixelWord("KHALILI", 16);
  const ghost = pixelWord("ALI", 44);

  function splatter(cx, cy, n, spread, color, baseR) {
    let out = "";
    for (let i = 0; i < n; i++) {
      const a = rnd() * Math.PI * 2;
      const d = rnd() * rnd() * spread;
      const r = baseR * (0.3 + rnd() * rnd() * 1.7);
      out += `<circle cx="${(cx + Math.cos(a) * d).toFixed(1)}" cy="${(cy + Math.sin(a) * d * 0.7).toFixed(1)}" r="${r.toFixed(1)}" fill="${color}"/>`;
    }
    return out;
  }

  const dripXs = [ali.bottoms[1], ali.bottoms[4], ali.bottoms[7]].filter(Boolean);
  const drips = dripXs.map((dx, i) => {
    const w = 5 + (i % 2) * 2;
    const h = 26 + i * 14;
    return `<rect x="${dx + 12}" y="${ali.height - 2}" width="${w}" height="${h}" fill="${ORANGE}"/>` +
      `<circle cx="${dx + 12 + w / 2}" cy="${ali.height - 2 + h}" r="${w * 0.72}" fill="${ORANGE}"/>`;
  }).join("") +
    `<circle class="fall f1" cx="${dripXs[1] + 15}" cy="${ali.height + 40}" r="4" fill="${ORANGE}"/>` +
    `<circle class="fall f2" cx="${dripXs[2] + 15}" cy="${ali.height + 70}" r="3.4" fill="${ORANGE}"/>`;

  // wheat-pasted QR poster; dark modules on paper stay scannable in both themes
  const qrPoster = (() => {
    const n = qr.modules.size, cell = 4, quiet = 3 * cell;
    const inner = n * cell + quiet * 2;
    let mods = "";
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (qr.modules.get(r, c)) mods += `<rect x="${quiet + c * cell}" y="${quiet + r * cell}" width="${cell}" height="${cell}"/>`;
      }
    }
    return `<g transform="translate(936 92) rotate(2.5)">
      <rect x="-7" y="-7" width="${inner + 14}" height="${inner + 40}" fill="${T.shadow}" opacity="0.45"/>
      <rect x="-4" y="-4" width="${inner + 8}" height="${inner + 34}" fill="#efeae3"/>
      <g fill="#1b1815">${mods}</g>
      <text x="${inner / 2}" y="${inner + 18}" text-anchor="middle" font-family="${MONO}" font-weight="700" font-size="13" letter-spacing="3" fill="#1b1815">SCAN TO ENTER</text>
    </g>`;
  })();

  // spray-can sticker
  const canSticker = (() => {
    const c = 9;
    const rows = [".n.", "ccc", "bbbbb", "bbbbb", "ppppp", "ppppp", "bbbbb", "bbbbb", "bbbbb"];
    const fill = { n: "#1b1815", c: "#1b1815", b: SKY, p: "#efeae3" };
    let art = "";
    rows.forEach((row, ry) => [...row].forEach((k, rx) => {
      const off = row.length === 3 ? c : 0;
      if (k !== ".") art += `<rect x="${off + rx * c}" y="${ry * c}" width="${c - 1}" height="${c - 1}" fill="${fill[k]}"/>`;
    }));
    art += `<circle cx="-10" cy="-6" r="3" fill="${ORANGE}"/><circle cx="-20" cy="-14" r="2.2" fill="${ORANGE}"/><circle cx="-28" cy="-24" r="1.6" fill="${ORANGE}"/>`;
    return `<g transform="translate(956 366) rotate(7)">
      <rect x="-14" y="-13" width="74" height="120" fill="${T.shadow}" opacity="0.4"/>
      <rect x="-11" y="-10" width="68" height="114" fill="#efeae3"/>
      <g transform="translate(1 2)">${art}</g>
      <text x="23" y="97" text-anchor="middle" font-family="${MONO}" font-size="10" letter-spacing="2" fill="#1b1815">FRESH</text>
    </g>`;
  })();

  // pixel arrow sticker pointing down at the enter plate
  const arrowSticker = (() => {
    const c = 9;
    const rows = ["..111..", "..111..", "..111..", "1111111", ".11111.", "..111.."];
    let art = "";
    rows.forEach((row, ry) => [...row].forEach((bit, rx) => {
      if (bit === "1") art += `<rect x="${rx * c}" y="${ry * c}" width="${c - 1}" height="${c - 1}" fill="${ORANGE}"/>`;
    }));
    return `<g transform="translate(1082 350) rotate(-6)">
      <rect x="-12" y="-12" width="86" height="77" fill="${T.shadow}" opacity="0.4"/>
      <rect x="-9" y="-9" width="80" height="71" fill="#efeae3"/>
      ${art}
    </g>`;
  })();

  const barcode = (() => {
    let x = 0, out = "";
    for (let i = 0; i < 26; i++) {
      const w = rnd() < 0.3 ? 4 : rnd() < 0.5 ? 2 : 1;
      if (rnd() < 0.72) out += `<rect x="${x}" width="${w}" height="26" fill="${T.ink}" opacity="0.75"/>`;
      x += w + 2;
    }
    return { out, w: x };
  })();

  // stencil caption with drawn separators
  const stencil = (() => {
    const words = ["ARTIFICER", "SCHOLAR", "KEEPER OF RECORDS"];
    const cw = 13.4;
    let x = 88, out = "";
    words.forEach((wd, i) => {
      const wpx = Math.round(wd.length * cw);
      out += `<text x="${x}" y="522" font-family="${MONO}" font-size="14" letter-spacing="5" textLength="${wpx}" fill="${T.stencil}">${wd}</text>`;
      x += wpx + 16;
      if (i < words.length - 1) { out += pixelSep(x, 506, 5, ORANGE); x += 28; }
    });
    return out;
  })();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="ALI KHALILI. Artificer, scholar, keeper of records.">
  <!-- The archive wall: the dossier tagged after hours. Hand-built; the tag is
       raw rects and the QR really encodes the site. Colors follow the
       Rangefinder seed. Regenerate with npm run profile-art. -->
  <defs>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="matrix" values="0 0 0 0 ${T.grainInk[0]} 0 0 0 0 ${T.grainInk[1]} 0 0 0 0 ${T.grainInk[2]} 0 0 0 0.05 0"/></filter>
    <filter id="spray" x="-30%" y="-30%" width="160%" height="160%"><feTurbulence type="turbulence" baseFrequency="0.18" numOctaves="2" result="t" seed="7"/><feDisplacementMap in="SourceGraphic" in2="t" scale="14"/></filter>
    <filter id="halo" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="26"/></filter>
    <radialGradient id="vig" cx="50%" cy="42%" r="75%"><stop offset="60%" stop-color="${T.vigColor}" stop-opacity="0"/><stop offset="100%" stop-color="${T.vigColor}" stop-opacity="${T.vigOp}"/></radialGradient>
  </defs>
  <style>
    .blink{animation:blink 1.6s steps(2) infinite}
    .scan{animation:scan 9s linear infinite}
    .fall{animation:fall 4.6s ease-in infinite}
    .f2{animation-duration:6.2s;animation-delay:1.4s}
    @keyframes blink{50%{opacity:0}}
    @keyframes scan{0%{transform:translateY(0)}100%{transform:translateY(${H}px)}}
    @keyframes fall{0%{transform:translateY(0);opacity:0}12%{opacity:1}82%{opacity:1}100%{transform:translateY(64px);opacity:0}}
    ${REDUCED}
  </style>

  <rect width="${W}" height="${H}" fill="${T.wall}"/>
  <rect width="${W}" height="${H}" filter="url(#grain)"/>

  <!-- dossier registration frame -->
  <rect x="26" y="26" width="${W - 52}" height="${H - 52}" fill="none" stroke="${T.ink}" stroke-opacity="0.14" stroke-dasharray="4 8"/>
  <g stroke="${T.ink}" stroke-opacity="0.5" stroke-width="2">
    <path d="M26 46 V26 H46 M${W - 46} 26 H${W - 26} V46 M${W - 26} ${H - 46} V${H - 26} H${W - 46} M46 ${H - 26} H26 V${H - 46}"/>
  </g>

  <!-- ghost of an earlier pass by the same hand -->
  <g transform="translate(620 120) rotate(-7)" fill="none" stroke="${T.ink}" stroke-opacity="0.055" stroke-width="1.5">${ghost.svg}</g>

  <!-- spray halo behind the tag -->
  <ellipse cx="330" cy="205" rx="300" ry="150" fill="${ORANGE}" opacity="0.16" filter="url(#halo)"/>

  <!-- splatter -->
  <g filter="url(#spray)" opacity="0.85">
    ${splatter(560, 130, 26, 90, ORANGE, 2.6)}
    ${splatter(660, 330, 16, 70, SKY, 2.2)}
    ${splatter(866, 470, 12, 50, ORANGE, 2)}
  </g>

  <!-- THE TAG -->
  <g transform="translate(84 96) rotate(-2)">
    <g transform="translate(7 8)" fill="${T.tagShadow}" opacity="0.85">${ali.svg}</g>
    <g fill="${ORANGE}">${ali.svg}</g>
    ${drips}
  </g>
  <g transform="translate(88 350) rotate(-2)">
    <g transform="translate(4 5)" fill="${SKY}" opacity="0.55">${khalili.svg}</g>
    <g fill="${T.subFill}">${khalili.svg}</g>
  </g>

  <!-- wall furniture: QR paste-up, spray can, arrow to the plate below -->
  ${qrPoster}
  ${canSticker}
  ${arrowSticker}

  <!-- wet paint tape -->
  <g transform="translate(700 52) rotate(-4)">
    <rect width="170" height="34" fill="${T.tapeBg}" opacity="0.92"/>
    <text x="85" y="23" text-anchor="middle" font-family="${MONO}" font-weight="700" font-size="15" letter-spacing="4" fill="${T.tapeInk}">WET PAINT</text>
  </g>

  <!-- live record lamp -->
  <g font-family="${MONO}" font-size="13" letter-spacing="3">
    <circle class="blink" cx="52" cy="58" r="5" fill="${ORANGE}"/>
    <text x="68" y="63" fill="${T.ink}" opacity="0.8">LIVE RECORD</text>
  </g>

  <!-- bottom registration band: stencil, barcode, plaque chip -->
  ${stencil}
  <g transform="translate(742 496)">${barcode.out}</g>
  <g transform="translate(${W - 336} 496)" font-family="${MONO}">
    <rect width="272" height="30" fill="none" stroke="${T.stencil}" stroke-width="1"/>
    <text x="136" y="20" text-anchor="middle" font-size="13" letter-spacing="2" fill="${T.stencil}">EST. MMXXVI · OPEN ARCHIVE</text>
  </g>

  <!-- scanline + vignette -->
  <rect class="scan" x="0" y="-4" width="${W}" height="3" fill="${T.ink}" opacity="0.05"/>
  <rect width="${W}" height="${H}" fill="url(#vig)" pointer-events="none"/>
</svg>`;
  writeFileSync(path.join(OUT, `hero${T.suffix}.svg`), svg);
}

/* ------------------------------------------------------------------ CTA */
function enter(T) {
  const W = 760, H = 132;
  const chev = (x, cls) =>
    `<g class="${cls}" transform="translate(${x} ${H / 2 - 21})"><path d="M0 0 L16 0 L34 21 L16 42 L0 42 L18 21 Z" fill="${ORANGE}"/></g>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Enter the archive: open the website">
  <style>
    .c1{animation:seq 1.5s steps(1) infinite}
    .c2{animation:seq 1.5s steps(1) infinite .25s}
    .c3{animation:seq 1.5s steps(1) infinite .5s}
    .cur{animation:blink 1.1s steps(2) infinite}
    .frame{animation:pulse 3s ease-in-out infinite}
    @keyframes seq{0%{opacity:.15}25%{opacity:1}60%{opacity:.15}100%{opacity:.15}}
    @keyframes blink{50%{opacity:0}}
    @keyframes pulse{0%,100%{stroke-opacity:.35}50%{stroke-opacity:1}}
    ${REDUCED}
  </style>
  <rect width="${W}" height="${H}" fill="${T.plate}"/>
  <rect class="frame" x="5" y="5" width="${W - 10}" height="${H - 10}" fill="none" stroke="${ORANGE}" stroke-width="2" stroke-dasharray="26 10"/>
  <g stroke="${ORANGE}" stroke-width="6">
    <path d="M5 29 V5 H29 M${W - 29} 5 H${W - 5} V29 M${W - 5} ${H - 29} V${H - 5} H${W - 29} M29 ${H - 5} H5 V${H - 29}" fill="none"/>
  </g>
  <text x="44" y="${H / 2 + 12}" font-family="${MONO}" font-weight="700" font-size="36" letter-spacing="4" fill="${T.plateInk}">ENTER THE ARCHIVE</text>
  <rect class="cur" x="486" y="${H / 2 - 16}" width="17" height="32" fill="${SKY}"/>
  ${chev(560, "c1")}${chev(610, "c2")}${chev(660, "c3")}
</svg>`;
  writeFileSync(path.join(OUT, `enter${T.suffix}.svg`), svg);
}

/* --------------------------------------------------------------- ticker */
function ticker(T) {
  const W = 1200, H = 46;
  const words = [
    "RAID THE WORKSHOP", "DECIPHER THE SCROLLS", "FOLLOW THE QUESTLINE", "WANDER THE GARDEN",
    "LOOT THE LIBRARY", "CHART THE ATLAS", "READ THE CHRONICLES", "CATCH THE RAVENS",
  ];
  const cw = 12.4, sepW = 34, gap = 18;
  let x = 0, seg = "";
  for (const wd of words) {
    const wpx = Math.round(wd.length * cw);
    seg += `<text x="${x}" y="${H / 2 + 6}" font-family="${MONO}" font-size="17" letter-spacing="2" textLength="${wpx}" fill="${T.ink}">${wd}</text>`;
    x += wpx + gap;
    seg += pixelSep(x, H / 2 - 7, 5, ORANGE);
    x += sepW;
  }
  const TL = x;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Marquee inviting you to raid the workshop, decipher the scrolls, follow the questline, wander the garden, loot the library, chart the atlas, read the chronicles, and catch the ravens">
  <style>.mq{animation:mq 30s linear infinite}@keyframes mq{to{transform:translateX(-${TL}px)}}${REDUCED}</style>
  <rect width="${W}" height="${H}" fill="${T.plate}"/>
  <line x1="0" y1="1.5" x2="${W}" y2="1.5" stroke="${T.ink}" stroke-opacity="0.25" stroke-dasharray="4 8"/>
  <line x1="0" y1="${H - 1.5}" x2="${W}" y2="${H - 1.5}" stroke="${T.ink}" stroke-opacity="0.25" stroke-dasharray="4 8"/>
  <g class="mq">
    <g>${seg}</g>
    <g transform="translate(${TL} 0)">${seg}</g>
    <g transform="translate(${TL * 2} 0)">${seg}</g>
  </g>
</svg>`;
  writeFileSync(path.join(OUT, `ticker${T.suffix}.svg`), svg);
}

for (const T of Object.values(THEMES)) { hero(T); enter(T); ticker(T); }
console.log("wrote hero/enter/ticker in dark and light variants to util_resources/readme/");
