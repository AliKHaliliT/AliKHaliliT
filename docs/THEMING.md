# Theming

The design language is **"the dossier"**: a beautifully typeset technical file about one
person. It separates two voices. Fraunces is the human voice for display, titles, essays,
and italic asides, IBM Plex Mono is the instrument voice for every date, count, status,
chip, and button label, and Switzer sits quietly between them for body copy. Light mode is
warm chart paper and dark mode is warm charcoal. The rule of forms says **data is square**
(3px chips, hairline cards, dashed rules) and **actions are round** (full pills). The
signature elements are the **pixel band** (`ui/PixelBand`) and the **ground track**, a
dashed line whose square field-green node marks the page's position in the site map
(`GroundTrack`, with positions from `src/shared/config/nav.ts`).

Light and dark mode switch via the `data-theme` attribute on `<html>`, toggled by `useTheme`
(a button in the TopBar) and persisted in `localStorage`.

## Color tokens

`src/app/styles/tokens.css` holds them in two layers. The raw variables carry the values and
are re-pointed under `[data-theme="dark"]`; an `@theme inline` block maps each one to a
Tailwind utility, so a component writes `bg-surface` and never names a theme or a hex. The
mapping is inline rather than a copy because the runtime palette override rewrites the raw
layer, and only an inline mapping carries that through to the utilities.

The literals are the **Rangefinder** preset, the shipped default. Text and ground pairs meet
WCAG AA in both themes.

| Variable | Utility | Light | Dark | Role |
| -------- | ------- | ----- | ---- | ---- |
| `--surface` | `bg-surface` | `#f0efeb` | `#131110` | Page ground |
| `--card` | `bg-card` | `#faf9f6` | `#1b1815` | Cards, modals, panels |
| `--ink` | `text-ink` | `#191713` | `#efeae3` | Ink: headlines and body |
| `--muted` | `text-muted` | `#6b675e` | `#a49c8f` | Muted ink, meta |
| `--line` | `border-line` | `#d3d0c7` | `#37312a` | Hairlines, usually drawn dashed |
| `--line-strong` | `border-line-strong` | `#a8a496` | `#584f43` | Chip borders, hover borders |
| `--well` | `bg-well` | `#faf9f6` | `#100e0c` | Inputs (darker than cards in dark mode) |
| `--signal` | `text-signal` | `#bc4a10` | `#ff8a50` | The working accent: links, active, focus (text-safe) |
| `--field` | `bg-field` | `#ff6b2e` | `#ff7038` | Loud fill: pixel band, dots, highlights (never text) |
| `--pulse` | `bg-pulse` | `#7fb5c9` | `#8fc3d8` | Ornament, never carries meaning |
| `--footer` | `bg-footer` | `#171512` | `#0f0d0b` | Footer ground (`--footer-ink` is its text) |

The palette editor keys (`background`, `textPrimary`, `inputBg`, and so on) keep their own
names, because they are the shape of `palette.json` and of the palette carried in the
portfolio contract. `paletteCss.ts` maps those keys onto the variables above, which is what
lets the token vocabulary change without touching a published file format.

The color rule: taxonomies stay **neutral** chips, with one working accent per palette
(`signal` for text, `field` for fills), and `pulse` as ornament.

## Palettes

The whole token set is swappable, in three layers that mirror the content model (files are
the seed, localStorage overrides). This is the file-seed model from decision
[0002](decisions/0002-file-seeded-appearance-and-identity.md).

1. **Seed**: `src/content/settings/palette.json` is the deployed default. A Vite plugin
   (`paletteSeed` in `vite.config.ts`) bakes it into `index.html` at build time (an
   `os-palette-seed` style tag plus the `theme-color` metas), so the first paint matches
   before any JS runs. Changing what visitors see is replacing that one file and rebuilding,
   exactly what the companion admin panel produces, like content markdown.
2. **Fallback**: the `index.css` `@theme` literals; cosmetic only (the pre-CSS-variable
   paint), never load-bearing.
3. **Override**: `localStorage.os_palette`, applied at boot (`bootPalette()` in `main.tsx`)
   as an `os-palette-override` style tag appended after the seed block, so it wins at equal
   specificity. Per-browser only.

`src/entities/site/paletteCss.ts` is the dependency-free palette-to-CSS generator shared by the app and
the Vite plugin; `src/entities/site/palette.ts` holds the preset catalog (Rangefinder, Meridian,
Blueprint, Observatory, Ledger), the per-token guide, `SEED_PALETTE`, and persistence. The
companion admin panel carries the editor (presets, per-token pickers, Download palette.json in
the exact seed-file format). Because everything reads the CSS variables, no component knows
palettes exist.

## Typography

Three self-hosted families (latin-subset woff2 in `src/assets/fonts/`, `@font-face` in
`index.css`; first-paint faces preloaded in `index.html`):

| Token | Family | Role |
| ----- | ------ | ---- |
| `--font-serif` | Fraunces | Display and titles (600), essays (400), italic asides |
| `--font-sans` | Switzer | Interface and body copy (400 to 700) |
| `--font-mono` | IBM Plex Mono | Data: dates, chips, buttons, eyebrows, counts (400/500) |

Type-scale accents: `text-display` (clamped serif page-title size) and `text-eyebrow` (11px
mono readout). Reading surfaces use `prose dark:prose-invert prose-essay`; `.prose-essay` sets
Fraunces at 17px/1.75 on a 68ch measure and maps typography-plugin colors onto the tokens.

## Radius, shadow, focus

- **Radius:** data is square, actions are round: `--radius-ctl` (3px: chips, inputs) and
  `--radius-card` (6px: cards, modals); pills and circles use `rounded-full`.
- **Shadow:** borders carry structure. `--shadow-lift` (sticky stack cards) and
  `--shadow-overlay` (modals and search) are the only shadows.
- **Focus:** a global `:focus-visible` 2px signal outline; `[data-quiet-focus]` opts out
  where a parent renders its own cue (the search input). A skip link ("Skip to content"
  pointing at `#main`) is the first tabbable element.

## Motion

The form rule extended into time: **data is still, actions are alive, instruments tick.**
Chips, badges, and readouts never move on their own; anything clickable answers the hand;
the signature elements behave like a powered-on instrument.

- **Three tempos.** Tap feedback at 120 to 150ms; hover cues, dropdowns, and toggles at
  around 200ms; scene moves (the hero rise, whileInView chapter reveals, the 160ms route
  fade in `RouteTransitions`) at 160 to 650ms on the house ease `[0.2, 0.7, 0.2, 1]`.
- **Press grammar.** Every action compresses on press (`active:scale-*`) and most lift a
  pixel on hover; arrows nudge along their axis. Framer Motion runs behind `LazyMotion`
  (`domAnimation`, `strict`): use `m.`, never `motion.`; no layout or drag animations in
  the host app.
- **Choreography.** Dropdown panels scale in from their trigger corner and their items
  slide on hover; the mobile index staggers its blocks; the theme toggle spins its icon
  while the page crossfades via the View Transition API (`useTheme`).
- **Instruments.** PixelBand cells wink at long staggered periods (`os-blink` in
  `index.css`), the GroundTrack node breathes (`os-breathe`), and count cells tick up from
  zero on first view (`CountUp` in `Dashboard.tsx`).
- **The ambient stratum.** `ui/AmbientField` draws a slow generative constellation on a
  canvas: ember motes drift like fireflies (signal-colored glows, rare pulse flecks, faint
  ink dust) and motes that wander near one another are joined by hairlines, so schematic
  figures assemble and dissolve. Mounted twice: behind the dashboard hero, and as a fixed
  layer masked to the wide-screen gutters (App.tsx, 1400px and up). It is palette-aware
  (reads the tokens, re-reads on theme flips), pauses offscreen and on hidden tabs, caps
  device-pixel ratio, and renders a single still frame under reduced motion. Pure ornament:
  `aria-hidden`, no pointer events, nothing else knows it exists.
- **Reduced motion.** `MotionConfig reducedMotion="user"` covers Framer; the global CSS
  guard neutralizes keyframes and transitions; AmbientField checks the media query itself.

## Shared atoms (`src/shared/ui/`)

`Badge` (the annotation chip: square, mono, optional field-green glow dot), `PillLink` and
`PillButton` (round actions), `PixelBand` (mosaic divider), `SectionBlock` (numbered dossier
chapter scaffold), `PageHeader` (mono eyebrow plus Fraunces title plus track), `GroundTrack`,
`FilterBar` (pills, ink-solid active), `TagList` (mono `#tags`), `EmptyState`, `Modal`, and
`Markdown` (a code-split renderer). The nav map lives in `src/shared/config/nav.ts`, shared by TopBar,
Footer, and GroundTrack.
