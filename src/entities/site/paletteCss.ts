// Pure palette → CSS generation. Deliberately dependency-free: imported by
// the app (src/lib/palette.ts) AND by vite.config.ts, which injects the seed
// palette into index.html at build time so the first paint already matches.

/**
 * One theme's worth of palette values.
 *
 * These keys are the shape of `palette.json` and of the palette carried inside
 * the portfolio contract, so they are a published format and keep their names
 * even though the CSS variables they map to are named differently.
 */
export interface PaletteMode {
  /** Page ground */
  background: string;
  /** Cards, modals, panels */
  card: string;
  /** Primary text */
  textPrimary: string;
  /** Secondary text, meta */
  textSecondary: string;
  /** Hairlines: usually drawn dashed */
  border: string;
  /** Chip borders, hover borders */
  borderStrong: string;
  /** Form fields */
  inputBg: string;
  /** The working accent: links, active states, live dates, focus (text-safe) */
  signal: string;
  /** Loud fill twin: pixel band, dots, highlights: never text */
  field: string;
  /** Ornament only: never carries meaning */
  pulse: string;
  /** Footer ground */
  footer: string;
  /** Footer text */
  footerInk: string;
}

/** Both themes together, which is what a palette actually is. */
export interface Palette {
  light: PaletteMode;
  dark: PaletteMode;
}

const VAR_MAP: [keyof PaletteMode, string][] = [
  ["background", "--surface"],
  ["card", "--card"],
  ["textPrimary", "--ink"],
  ["textSecondary", "--muted"],
  ["border", "--line"],
  ["borderStrong", "--line-strong"],
  ["inputBg", "--well"],
  ["signal", "--signal"],
  ["field", "--field"],
  ["pulse", "--pulse"],
  ["footer", "--footer"],
  ["footerInk", "--footer-ink"],
];

const modeVars = (m: PaletteMode) =>
  VAR_MAP.map(([k, v]) => `${v}: ${m[k]};`).join(" ");

/**
 * Doubled :root beats the stylesheet's values regardless of tag order.
 * Cascade: @theme literals < index.css [data-theme="dark"] < build-injected seed
 * (this CSS in index.html) < runtime localStorage override (same CSS,
 * appended later at runtime).
 */
export const generatePaletteCss = (p: Palette): string =>
  `:root:root { ${modeVars(p.light)} }\n:root:root[data-theme="dark"] { ${modeVars(p.dark)} }`;
