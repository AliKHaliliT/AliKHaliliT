import { cn } from "@/shared/lib";

type Tone = "neutral" | "signal" | "canopy";

/**
 * The one badge on the site. Taxonomies (pubType, employmentType, degree…)
 * differentiate by label, not hue; a colored dot is reserved for genuine
 * status: signal = current/featured, canopy = living/growing.
 */
export const Badge = ({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) => (
  <span
    className={cn(
      "inline-flex w-fit items-center gap-1.5 rounded-ctl border px-2 py-[3px]",
      "font-mono text-[10.5px] font-medium uppercase tracking-[0.09em] leading-none whitespace-nowrap",
      tone === "neutral"
        ? "border-line-strong text-muted"
        : "border-signal/50 text-signal",
      className
    )}
  >
    {tone !== "neutral" && (
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full bg-field shadow-[0_0_0_3px_color-mix(in_srgb,var(--field)_25%,transparent)]"
        aria-hidden="true"
      />
    )}
    {children}
  </span>
);
