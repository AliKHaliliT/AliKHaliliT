import { m } from "framer-motion";

/**
 * Designed stand-ins for a featured project that has no image. Two distinct
 * pieces in the dossier language, both drawn entirely from palette tokens so
 * every theme and preset carries them:
 *
 * - DraftingPlot (home): a schematic drafting itself on grid paper. Frames
 *   trace in and fade, the brand mosaic plots cell by cell, a plotting head
 *   wanders the sheet, and a dimension line reports the plot. Kinetic.
 * - SpecimenPlate (projects): an archival specimen card. A dashed seal holds
 *   the twinkling mosaic beside dotted-leader ledger lines and an honest
 *   NO FIGURE FILED stamp. Near-still.
 *
 * Pure ornament: parents mark the surface aria-hidden. Motion respects the
 * app-wide MotionConfig reducedMotion="user".
 */

const INK = "var(--muted)";
const SIGNAL = "var(--signal)";
const PULSE = "var(--pulse)";

/** The six-cell brand mosaic, cell size c, origin (x, y). Cell fills echo the
    pixel-mark: one signal cell up top, one pulse cell closing the row below. */
const mosaicCells = (x: number, y: number, c: number) => [
  { x: x, y: y, fill: INK },
  { x: x + c + 3, y: y, fill: SIGNAL },
  { x: x + 2 * (c + 3), y: y, fill: INK },
  { x: x, y: y + c + 3, fill: INK },
  { x: x + c + 3, y: y + c + 3, fill: INK },
  { x: x + 2 * (c + 3), y: y + c + 3, fill: PULSE },
];

/** The plot chip's label: the title's first meaningful word (articles make
    useless chips), clamped so long words stay a chip. */
const chipWord = (title: string) => {
  const words = title.split(/\s+/).filter((w) => !/^(the|a|an)$/i.test(w));
  return (words[0] || title).toUpperCase().slice(0, 12);
};

const trace = (delay: number) => ({
  initial: { pathLength: 0, opacity: 0 },
  animate: { pathLength: [0, 1, 1, 0], opacity: [0.9, 0.9, 0.9, 0] },
  transition: {
    duration: 7,
    times: [0, 0.42, 0.8, 1],
    delay,
    repeat: Infinity,
    repeatDelay: 2.5,
    ease: "easeInOut" as const,
  },
});

/** Generated schematic art for a featured project with no image of its own. */
export const DraftingPlot = ({ title, year }: { title: string; year?: string }) => (
  <>
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 420 260"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
    >
      {/* ruler ticks along the top and left edges */}
      <g stroke={INK} strokeWidth="1" opacity="0.4">
        {Array.from({ length: 20 }, (_, i) => (
          <line key={`t${i}`} x1={16 + i * 20} y1="0" x2={16 + i * 20} y2={i % 5 === 0 ? 10 : 5} />
        ))}
        {Array.from({ length: 12 }, (_, i) => (
          <line key={`l${i}`} x1="0" y1={16 + i * 20} x2={i % 5 === 0 ? 10 : 5} y2={16 + i * 20} />
        ))}
      </g>

      {/* frames drafting themselves in, out of phase */}
      <m.rect
        x="46" y="96" width="150" height="86" rx="6"
        stroke={SIGNAL} strokeWidth="1.5"
        {...trace(0)}
      />
      <m.rect
        x="232" y="56" width="112" height="60" rx="6"
        stroke={PULSE} strokeWidth="1.5"
        {...trace(2.4)}
      />
      <m.circle
        cx="300" cy="182" r="34"
        stroke={INK} strokeWidth="1.2"
        {...trace(4.6)}
      />

      {/* dimension line under the signal frame */}
      <g stroke={INK} strokeWidth="1" opacity="0.55">
        <line x1="46" y1="196" x2="196" y2="196" />
        <line x1="46" y1="191" x2="46" y2="201" />
        <line x1="196" y1="191" x2="196" y2="201" />
      </g>
      <text x="121" y="212" textAnchor="middle" fill={INK} opacity="0.8" fontSize="9" fontFamily="ui-monospace, monospace" letterSpacing="1.5">
        150 × 86
      </text>

      {/* the brand mosaic plots in, one cell at a time */}
      {mosaicCells(236, 140, 13).map((cell, i) => (
        <m.rect
          key={i}
          x={cell.x} y={cell.y} width="12" height="12" fill={cell.fill}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.9, 0.9, 0] }}
          transition={{
            duration: 9.5,
            times: [0, 0.1, 0.85, 1],
            delay: 1 + i * 0.45,
            repeat: Infinity,
            repeatDelay: 1.5,
          }}
        />
      ))}

    </svg>

    {/* The plotting head wandering the sheet. It lives in HTML, not the SVG:
        transform animations on an SVG group fall between the two drivers this
        stack ships (WAAPI covers HTML transforms, the JS loop covers SVG
        attributes), so the head animates left/top on a positioned element. */}
    <m.div
      className="absolute"
      initial={{ left: "14%", top: "24%" }}
      animate={{ left: ["14%", "76%", "76%", "14%"], top: ["24%", "24%", "72%", "24%"] }}
      transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
    >
      <svg width="26" height="26" viewBox="-13 -13 26 26" className="-translate-x-1/2 -translate-y-1/2" fill="none">
        <g stroke={SIGNAL} strokeWidth="1.2">
          <line x1="-9" y1="0" x2="9" y2="0" />
          <line x1="0" y1="-9" x2="0" y2="9" />
          <circle r="4" opacity="0.6" />
        </g>
      </svg>
    </m.div>

    {/* plot chip and readout, HTML so the tokens style them like real chips */}
    <span className="absolute left-[7%] top-[13%] flex items-center gap-1.5 rounded-ctl border border-line-strong bg-surface px-2 py-1 font-mono text-[10px] uppercase tracking-[0.08em]">
      {chipWord(title)}
      <m.span
        className="inline-block h-3 w-[5px] bg-signal"
        animate={{ opacity: [1, 1, 0, 0] }}
        transition={{ duration: 1.1, times: [0, 0.5, 0.5, 1], repeat: Infinity }}
      />
    </span>
    <span className="absolute bottom-[8%] left-[7%] font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted">
      Plot 004{year ? ` · ${year}` : ""} · no figure filed
    </span>
  </>
);

/** The second generated plate, so two featured items never look alike. */
export const SpecimenPlate = ({ title, year }: { title: string; year?: string }) => (
  <div aria-hidden className="absolute inset-0 overflow-hidden bg-[color-mix(in_srgb,var(--field)_8%,var(--surface))]">
    {/* registration corners */}
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" fill="none">
      <g stroke={INK} strokeWidth="1.5" opacity="0.6">
        <path d="M18 34 V18 H34 M366 18 H382 V34 M382 266 V282 H366 M34 282 H18 V266" />
      </g>

      {/* the seal: a dashed ring holding the twinkling mosaic */}
      <circle cx="290" cy="150" r="62" stroke={INK} strokeWidth="1" strokeDasharray="3 7" opacity="0.7" />
      <circle cx="290" cy="150" r="50" stroke={INK} strokeWidth="0.75" opacity="0.3" />
      {mosaicCells(262, 132, 15).map((cell, i) => (
        <m.rect
          key={i}
          x={cell.x} y={cell.y} width="14" height="14" fill={cell.fill}
          initial={{ opacity: 0.85 }}
          animate={{ opacity: [0.85, 0.35, 0.85] }}
          transition={{ duration: 3.6, delay: i * 0.6, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </svg>

    {/* ghost figure number */}
    <span className="absolute -left-2 bottom-0 select-none font-serif text-[7rem] font-semibold italic leading-none tracking-[-0.05em] text-ink opacity-[0.07]">
      Fig.
    </span>

    {/* ledger lines with dotted leaders */}
    <div className="absolute left-[8%] top-[16%] w-[46%] space-y-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
      <p className="m-0 flex items-baseline gap-2">
        <span>Specimen</span>
        <span className="min-w-4 flex-1 border-b border-dotted border-line-strong" />
        <span className="max-w-[55%] truncate normal-case tracking-normal text-ink">{title}</span>
      </p>
      <p className="m-0 flex items-baseline gap-2">
        <span>Filed</span>
        <span className="min-w-4 flex-1 border-b border-dotted border-line-strong" />
        <span className="text-ink">{year || "undated"}</span>
      </p>
      <p className="m-0 flex items-baseline gap-2">
        <span>Figure</span>
        <span className="min-w-4 flex-1 border-b border-dotted border-line-strong" />
        <span>none</span>
      </p>
    </div>

    {/* the honesty stamp */}
    <span className="absolute bottom-[14%] right-[8%] rotate-[-7deg] rounded-ctl border-2 border-signal px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-signal opacity-80">
      No figure filed
    </span>
  </div>
);
