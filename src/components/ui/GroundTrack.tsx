import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { trackPosition, TRACK_TICKS } from "@/lib/nav";

/**
 * The site's signature element: a thin ground-track line with a signal
 * node marking where the current page sits in the site map. Ticks mark
 * the group boundaries (Career / Writing / Personal). The node is static
 * per page: the header remounts inside the route transition, which
 * already carries the motion between pages.
 */
export const GroundTrack = ({ className }: { className?: string }) => {
  const { pathname } = useLocation();
  const position = trackPosition(pathname);

  return (
    <div className={cn("relative h-2", className)} aria-hidden="true">
      <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-[var(--color-border)]" />
      {TRACK_TICKS.map((tick) => (
        <div
          key={tick}
          style={{ left: `${tick * 100}%` }}
          className="absolute top-1/2 h-[7px] w-px -translate-y-1/2 bg-[var(--color-border-strong)]"
        />
      ))}
      <div
        style={{ left: `${position * 100}%` }}
        className="gt-breathe absolute top-1/2 h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rounded-[1.5px] bg-field shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-field)_30%,transparent)] transition-[left] duration-200 ease-out"
      />
    </div>
  );
};
