import { cn } from "@/lib/utils";
import { GroundTrack } from "@/components/ui/GroundTrack";

/**
 * The one page header: an instrument-style mono readout (eyebrow + optional
 * right-hand meta), the display-face title, and the ground track.
 */
export const PageHeader = ({
  eyebrow,
  title,
  description,
  meta,
  className,
}: {
  /** Mono readout above the title, e.g. "Publications · 12 records" */
  eyebrow: string;
  title: string;
  description?: string;
  /** Optional right-aligned mono data, e.g. coordinates or a date range */
  meta?: string;
  className?: string;
}) => (
  <header className={cn("mb-10", className)}>
    <div className="flex items-baseline justify-between gap-4">
      <p className="font-mono text-eyebrow uppercase text-[var(--color-text-secondary)]">
        {eyebrow}
      </p>
      {meta && (
        <p className="hidden font-mono text-eyebrow uppercase text-[var(--color-text-secondary)] sm:block">
          {meta}
        </p>
      )}
    </div>
    <h1 className="mt-2 font-serif text-display font-semibold text-[var(--color-text-primary)]">
      {title}
    </h1>
    {description && (
      <p className="mt-3 max-w-xl font-serif text-base italic leading-relaxed text-[var(--color-text-secondary)]">
        {description}
      </p>
    )}
    <GroundTrack className="mt-6" />
  </header>
);
