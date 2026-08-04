import React from "react";
import { cn } from "@/shared/lib";

/** The one empty state. Quiet, and it says what to do next. */
export const EmptyState = ({
  icon: Icon,
  title,
  hint = "Nothing logged here yet.",
  className,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  title: string;
  hint?: string;
  className?: string;
}) => (
  <div className={cn("flex flex-col items-center py-16 text-center", className)}>
    <div className="flex h-10 w-10 items-center justify-center rounded-ctl border border-line text-muted">
      <Icon size={18} strokeWidth={1.75} />
    </div>
    <p className="mt-4 text-sm font-medium text-ink">
      {title}
    </p>
    <p className="mt-1 max-w-xs text-sm text-muted">
      {hint}
    </p>
  </div>
);
