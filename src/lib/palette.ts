// Runtime palette system. The dossier's structure (square data, round
// actions, three type voices) is fixed; only the ink is swappable.
//
// Three layers, mirroring the content model (files are seed, localStorage
// overrides):
//   1. src/content/settings/palette.json, the SEED: the deployed default.
//      vite.config.ts injects it into index.html at build time, so the first
//      paint already matches and a future separated admin changes the live
//      site by pushing this one file (next build wears it).
//   2. index.css @theme literals: pre-CSS-variable fallback only; kept
//      loosely in sync with the seed but never load-bearing.
//   3. localStorage ("os_palette"): a per-browser override, edited live in
//      Admin → Appearance and applied at boot before first render.

import { safeSetItem } from "@/lib/storage";
import { generatePaletteCss, type Palette, type PaletteMode } from "@/lib/paletteCss";
import seedJson from "@/content/settings/palette.json";

export { generatePaletteCss };
export type { Palette, PaletteMode };

export interface PalettePreset extends Palette {
  id: string;
  name: string;
  story: string;
}

export const PALETTE_PRESETS: PalettePreset[] = [
  {
    id: "rangefinder",
    name: "Rangefinder",
    story: "A field instrument: international orange on stone gray, built to be read in weather.",
    light: {
      background: "#f0efeb", card: "#faf9f6", textPrimary: "#191713",
      textSecondary: "#6b675e", border: "#d3d0c7", borderStrong: "#a8a496",
      inputBg: "#faf9f6", signal: "#bc4a10", field: "#ff6b2e",
      pulse: "#7fb5c9", footer: "#171512", footerInk: "#f0ede6",
    },
    dark: {
      background: "#131110", card: "#1b1815", textPrimary: "#efeae3",
      textSecondary: "#a49c8f", border: "#37312a", borderStrong: "#584f43",
      inputBg: "#100e0c", signal: "#ff8a50", field: "#ff7038",
      pulse: "#8fc3d8", footer: "#0f0d0b", footerInk: "#f0ede6",
    },
  },
  {
    id: "meridian",
    name: "Meridian",
    story: "The original dossier: moss green on warm chart paper, pink as ornament.",
    light: {
      background: "#f6f3ea", card: "#fcfaf3", textPrimary: "#17130b",
      textSecondary: "#6d6553", border: "#d4cfc0", borderStrong: "#a8a08c",
      inputBg: "#fcfaf3", signal: "#0c7a3b", field: "#25de6f",
      pulse: "#f0a3ea", footer: "#131008", footerInk: "#f0ebde",
    },
    dark: {
      background: "#131008", card: "#1b1710", textPrimary: "#f0ebde",
      textSecondary: "#a79e8a", border: "#37311f", borderStrong: "#59503a",
      inputBg: "#100d06", signal: "#54d18c", field: "#2be873",
      pulse: "#e79be1", footer: "#0c0a05", footerInk: "#f0ebde",
    },
  },
  {
    id: "blueprint",
    name: "Blueprint",
    story: "The reference print: drafting-table blue on cold paper, dimensions inked in the margins.",
    light: {
      background: "#edf0f4", card: "#f7f9fc", textPrimary: "#101721",
      textSecondary: "#5c6875", border: "#c9d1da", borderStrong: "#9aa7b4",
      inputBg: "#f7f9fc", signal: "#155bb5", field: "#2f7ff2",
      pulse: "#f0a35e", footer: "#0e1a2b", footerInk: "#dfe8f2",
    },
    dark: {
      background: "#0d141d", card: "#131c27", textPrimary: "#e8eef5",
      textSecondary: "#93a2b2", border: "#243244", borderStrong: "#3c4f66",
      inputBg: "#0a111a", signal: "#78aeff", field: "#3d8bff",
      pulse: "#f0a35e", footer: "#0a121c", footerInk: "#dfe8f2",
    },
  },
  {
    id: "observatory",
    name: "Observatory",
    story: "The night survey: astronomer violet over telescope-housing gray, one comet-gold trace.",
    light: {
      background: "#f1f2f6", card: "#fafafd", textPrimary: "#14141f",
      textSecondary: "#61616f", border: "#d2d3dd", borderStrong: "#a3a5b5",
      inputBg: "#fafafd", signal: "#5747c8", field: "#7c6cff",
      pulse: "#e3b34c", footer: "#12121c", footerInk: "#e9e9f2",
    },
    dark: {
      background: "#0f0f17", card: "#16161f", textPrimary: "#ecebf4",
      textSecondary: "#9c9bad", border: "#292937", borderStrong: "#434357",
      inputBg: "#0c0c13", signal: "#a29bff", field: "#7c6cff",
      pulse: "#e3b34c", footer: "#0b0b12", footerInk: "#e9e9f2",
    },
  },
  {
    id: "ledger",
    name: "Ledger",
    story: "The stamped file: archival carmine on ledger paper, every entry countersigned.",
    light: {
      background: "#f5f3ec", card: "#fcfaf4", textPrimary: "#1b1712",
      textSecondary: "#6f685c", border: "#d6d1c2", borderStrong: "#aba38e",
      inputBg: "#fcfaf4", signal: "#a92e28", field: "#e5484d",
      pulse: "#7d9c6d", footer: "#171310", footerInk: "#f1ede2",
    },
    dark: {
      background: "#141110", card: "#1c1815", textPrimary: "#f0ebe2",
      textSecondary: "#a79e8d", border: "#38322a", borderStrong: "#5a5143",
      inputBg: "#100d0b", signal: "#f2726b", field: "#e5484d",
      pulse: "#93b380", footer: "#0f0c0a", footerInk: "#f1ede2",
    },
  },
];

export const getPreset = (id: string): PalettePreset | undefined =>
  PALETTE_PRESETS.find((p) => p.id === id);

/** What each token drives, in site terms: shown in the admin editor. */
export const TOKEN_GUIDE: { key: keyof PaletteMode; label: string; where: string }[] = [
  { key: "background", label: "Ground", where: "The page background behind everything." },
  { key: "card", label: "Card", where: "Cards, modals, dropdowns, panels." },
  { key: "textPrimary", label: "Ink", where: "Headlines and body text: the main reading color." },
  { key: "textSecondary", label: "Muted ink", where: "Meta lines, dates, captions, secondary labels." },
  { key: "border", label: "Hairline", where: "The dashed rules and card edges everywhere." },
  { key: "borderStrong", label: "Strong hairline", where: "Chip borders, button outlines, hover edges." },
  { key: "inputBg", label: "Input ground", where: "Text fields and form controls (admin, search)." },
  { key: "signal", label: "Signal", where: "The working accent: links, active nav, live dates, focus rings. Must stay readable as text." },
  { key: "field", label: "Field", where: "The loud fill: pixel band, status dots, selection tints. Never used for text." },
  { key: "pulse", label: "Pulse", where: "Pure ornament in the pixel band and schematics. Never carries meaning." },
  { key: "footer", label: "Footer ground", where: "The dark footer band at the page bottom." },
  { key: "footerInk", label: "Footer ink", where: "Text and headlines inside the footer." },
];

// ── persistence + application ────────────────────────────────────────

const STORAGE_KEY = "os_palette";
const STYLE_TAG_ID = "os-palette-override";

export interface StoredPalette extends Palette {
  /** Preset id this started from, or "custom" once edited. */
  basedOn: string;
}

/** The deployed default: what every visitor sees until this repo rebuilds
 *  with a different palette.json. A separated admin publishes appearance by
 *  pushing that file, exactly like content markdown. */
export const SEED_PALETTE: StoredPalette = seedJson as StoredPalette;

/** Serialize in the seed-file format (what Export writes, what admins push). */
export const toSeedFileJson = (p: StoredPalette): string =>
  JSON.stringify({ basedOn: p.basedOn, light: p.light, dark: p.dark }, null, 2) + "\n";

export function loadStoredPalette(): StoredPalette | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredPalette;
    if (!parsed?.light?.background || !parsed?.dark?.background) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveStoredPalette(p: StoredPalette): boolean {
  return safeSetItem(STORAGE_KEY, JSON.stringify(p));
}

/** Forget the browser override; the build-injected seed shows through. */
export function clearStoredPalette(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // removal failing is harmless: the override tag is cleared regardless
  }
  document.getElementById(STYLE_TAG_ID)?.remove();
  syncThemeColorMeta(SEED_PALETTE);
}

/** Inject (or refresh) the override style tag and sync the theme-color meta.
 *  Appended to <head>, so it lands after the build-injected seed block and
 *  wins at equal specificity. */
export function applyPalette(p: Palette): void {
  let tag = document.getElementById(STYLE_TAG_ID) as HTMLStyleElement | null;
  if (!tag) {
    tag = document.createElement("style");
    tag.id = STYLE_TAG_ID;
    document.head.appendChild(tag);
  }
  tag.textContent = generatePaletteCss(p);
  syncThemeColorMeta(p);
}

function syncThemeColorMeta(p: Palette): void {
  document
    .querySelector('meta[name="theme-color"][media*="light"]')
    ?.setAttribute("content", p.light.background);
  document
    .querySelector('meta[name="theme-color"][media*="dark"]')
    ?.setAttribute("content", p.dark.background);
}

/** Apply the browser override, if any (the seed is already in the HTML). */
export function bootPalette(): void {
  const stored = loadStoredPalette();
  if (stored) applyPalette(stored);
}
