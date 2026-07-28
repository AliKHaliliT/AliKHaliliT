// Pure palette → CSS generation. Deliberately dependency-free: imported by
// the app (src/lib/palette.ts) AND by vite.config.ts, which injects the seed
// palette into index.html at build time so the first paint already matches.

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

export interface Palette {
  light: PaletteMode;
  dark: PaletteMode;
}

const VAR_MAP: [keyof PaletteMode, string][] = [
  ["background", "--color-background"],
  ["card", "--color-card"],
  ["textPrimary", "--color-text-primary"],
  ["textSecondary", "--color-text-secondary"],
  ["border", "--color-border"],
  ["borderStrong", "--color-border-strong"],
  ["inputBg", "--color-input-bg"],
  ["signal", "--color-signal"],
  ["field", "--color-field"],
  ["pulse", "--color-pulse"],
  ["footer", "--color-footer"],
  ["footerInk", "--color-footer-ink"],
];

const modeVars = (m: PaletteMode) =>
  VAR_MAP.map(([k, v]) => `${v}: ${m[k]};`).join(" ") +
  // canopy is a legacy alias of the working accent
  ` --color-canopy: ${m.signal};`;

/**
 * Doubled :root beats the stylesheet's values regardless of tag order.
 * Cascade: @theme literals < index.css :root.dark < build-injected seed
 * (this CSS in index.html) < runtime localStorage override (same CSS,
 * appended later at runtime).
 */
export const generatePaletteCss = (p: Palette): string =>
  `:root:root { ${modeVars(p.light)} }\n:root:root.dark { ${modeVars(p.dark)} }`;
