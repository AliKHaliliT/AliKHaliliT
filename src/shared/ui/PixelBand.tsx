import { cn } from "@/shared/lib";

// Deterministic mosaic: 0 empty, 1 field, 2 faded field, 3 pulse/shade.
const SEEDS = [
  3, 0, 1, 0, 2, 0, 0, 1, 3, 0, 0, 2, 1, 0, 3, 0, 0, 1, 0, 2, 0, 3, 1, 0,
  0, 2, 0, 1, 3, 0, 2, 0, 0, 1, 0, 3, 0, 2, 1, 0, 3, 0, 0, 2, 0, 1, 0, 3,
];

const CELL: Record<number, string> = {
  1: "bg-field",
  2: "bg-field/45",
  3: "bg-pulse/70",
};

/**
 * The signature texture: a thin pixel-mosaic strip between dashed hairlines,
 * used as a section divider. `offset` shifts the pattern so stacked bands
 * don't repeat.
 */
export const PixelBand = ({
  className,
  offset = 0,
}: {
  className?: string;
  offset?: number;
}) => (
  <div
    aria-hidden="true"
    className={cn(
      "grid h-[22px] grid-cols-[repeat(48,1fr)] border-y border-dashed border-line",
      className
    )}
  >
    {SEEDS.map((_, i) => {
      const v = SEEDS[(i + offset) % SEEDS.length];
      // A third of the lit cells wink at long, staggered periods, so the
      // band reads as live telemetry. Delays are deterministic per cell.
      const live = v !== 0 && i % 3 === 0;
      return (
        <i
          key={i}
          className={cn(CELL[v] ?? "", live && "pb-live")}
          style={live ? { animationDelay: `${((i * 131) % 61) / 10}s` } : undefined}
        />
      );
    })}
  </div>
);
