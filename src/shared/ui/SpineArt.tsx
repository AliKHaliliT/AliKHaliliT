import type { LucideIcon } from "lucide-react";

/**
 * The drawn cover for a library entry that has no image: a spine in the
 * dossier language, composed from the entry's own title so no two look alike
 * and the same title always looks the same. A seeded band carries the brand
 * mosaic, thin ribs cross the lower half like a bound edge, and the title is
 * set in the display face with the shelf's glyph as a small stamp. Every
 * color is a palette token, so each theme and preset draws its own spines,
 * and nothing here needs a license.
 *
 * Pure ornament: the parent frame is decorative and the title is repeated in
 * the card's own text, so the art is marked aria-hidden.
 */

/** A small deterministic hash so a title always yields the same spine. */
const hashOf = (seed: string): number => {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const TONES = ["var(--color-signal)", "var(--color-pulse)", "var(--color-field)"];

/** The drawn spine standing in for a missing library cover, composed from the entry itself. */
export const SpineArt = ({
  title,
  byline,
  seed,
  icon: Icon,
}: {
  title: string;
  byline?: string;
  /** What the drawing is derived from; the entry's slug keeps it stable across renames of display text. */
  seed: string;
  /** The shelf's glyph, stamped small in the corner. */
  icon: LucideIcon;
}) => {
  const h = hashOf(seed);
  const tone = TONES[h % 3];
  const accent = TONES[(h >> 3) % 3];
  const bandY = 40 + (h % 5) * 6;
  const bandH = 38 + ((h >> 5) % 4) * 8;
  const ribs = 2 + ((h >> 8) % 3);
  const mosaicX = 16 + ((h >> 11) % 4) * 12;
  const number = String(1 + (h % 899)).padStart(3, "0");

  return (
    <div aria-hidden className="relative h-full w-full overflow-hidden bg-[color-mix(in_srgb,var(--color-field)_6%,var(--color-card))]">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 200 300" preserveAspectRatio="none" fill="none">
        {/* the band, and the brand mosaic riding on it */}
        <rect x="0" y={bandY} width="200" height={bandH} fill={tone} opacity="0.9" />
        {[0, 1, 2].map((i) => (
          <rect
            key={`m${i}`}
            x={mosaicX + i * 14}
            y={bandY + bandH / 2 - 11}
            width="10"
            height="10"
            fill={i === 1 ? "var(--color-background)" : "var(--color-card)"}
            opacity={i === 1 ? 0.95 : 0.6}
          />
        ))}
        {[0, 1, 2].map((i) => (
          <rect
            key={`n${i}`}
            x={mosaicX + i * 14}
            y={bandY + bandH / 2 + 1}
            width="10"
            height="10"
            fill={i === 2 ? accent : "var(--color-card)"}
            opacity={i === 2 ? 1 : 0.6}
          />
        ))}

        {/* bound-edge ribs across the lower half */}
        <g stroke="var(--color-text-secondary)" strokeWidth="1" opacity="0.28">
          {Array.from({ length: ribs }, (_, i) => {
            const y = 236 + i * 14;
            return <line key={`r${i}`} x1="0" y1={y} x2="200" y2={y} />;
          })}
        </g>

        {/* the spine's left edge, a hairline with a registration mark */}
        <line x1="14" y1="0" x2="14" y2="300" stroke="var(--color-border-strong)" strokeWidth="1" opacity="0.7" />
        <rect x="11" y={bandY + bandH + 10} width="6" height="6" fill={accent} />
      </svg>

      {/* catalogue number and the title, in the dossier type */}
      <span className="absolute left-[14%] top-[4%] font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
        No. {number}
      </span>
      <div className="absolute inset-x-[14%] top-[46%] flex flex-col gap-1">
        <p className="m-0 line-clamp-3 font-serif text-[clamp(0.95rem,1.6vw,1.2rem)] font-semibold leading-[1.1] tracking-[-0.015em] text-[var(--color-text-primary)]">
          {title}
        </p>
        {byline && (
          <p className="m-0 line-clamp-1 font-mono text-[9.5px] uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
            {byline}
          </p>
        )}
      </div>
      <span className="absolute bottom-[5%] right-[8%] text-[var(--color-text-secondary)] opacity-70">
        <Icon size={14} strokeWidth={1.5} />
      </span>
    </div>
  );
};
