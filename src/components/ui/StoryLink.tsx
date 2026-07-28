import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The bridge between a record and its long-form piece: any content item can
 * carry a `story` route (a blog post or garden note, or an external URL) and
 * this renders the consistent "read the full story" affordance for it.
 */
export const StoryLink = ({
  to,
  children,
  className,
}: {
  to: string;
  children?: React.ReactNode;
  className?: string;
}) => {
  const external = /^https?:\/\//.test(to);
  const cls = cn(
    "inline-flex items-center gap-1 font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-signal transition-colors hover:text-[var(--color-text-primary)]",
    className,
  );
  const label = children ?? "Read the story";
  return external ? (
    <a href={to} target="_blank" rel="noreferrer" className={cls}>
      {label}
      <ArrowUpRight size={11} />
    </a>
  ) : (
    <Link to={to} className={cls}>
      {label}
      <ArrowRight size={11} />
    </Link>
  );
};
