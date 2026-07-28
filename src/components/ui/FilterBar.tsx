import { useState } from "react";
import { cn } from "@/lib/utils";

export type FilterOption = { value: string; label: string };

/** Pills shown before the row collapses behind a "+N more" toggle. */
const COLLAPSE_AT = 8;

/**
 * The one filter row: mono pills, signal for the active channel. Long option
 * sets collapse to the first eight pills plus a "+N more" toggle instead of
 * wrapping into a wall; the active pill is always kept visible.
 */
export const FilterBar = ({
  options,
  value,
  onChange,
  className,
}: {
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) => {
  const [expanded, setExpanded] = useState(false);

  // "All" plus a single channel filters nothing: showing it is just noise.
  if (options.length < 3) return null;

  // Collapsing away a single pill is sillier than showing it.
  const collapsible = options.length > COLLAPSE_AT + 1;
  let shown = expanded || !collapsible ? options : options.slice(0, COLLAPSE_AT);
  const active = options.find((o) => o.value === value);
  if (active && !shown.includes(active)) shown = [...shown, active];

  return (
    <div
      className={cn("flex flex-wrap items-center gap-1.5 pb-1", className)}
      role="group"
      aria-label="Filter"
    >
      {shown.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
          className={cn(
            "rounded-full border px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] whitespace-nowrap transition-[color,background-color,border-color,transform] duration-150 active:scale-[0.96]",
            value === opt.value
              ? "border-[var(--color-text-primary)] bg-[var(--color-text-primary)] text-[var(--color-background)]"
              : "border-[var(--color-border-strong)] text-[var(--color-text-secondary)] hover:border-signal hover:text-signal"
          )}
        >
          {opt.label}
        </button>
      ))}
      {collapsible && (
        <button
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="rounded-full border border-dashed border-[var(--color-border-strong)] px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] whitespace-nowrap text-[var(--color-text-secondary)] transition-[color,border-color,transform] duration-150 hover:border-signal hover:text-signal active:scale-[0.96]"
        >
          {expanded ? "Less" : `+${options.length - COLLAPSE_AT} more`}
        </button>
      )}
    </div>
  );
};
