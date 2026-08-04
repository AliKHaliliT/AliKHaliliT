import { cn } from "@/shared/lib";

/** Content tags as quiet square chips: data is square, no rainbow. The
 *  border gives multi-word tags a shape of their own instead of reading as
 *  loose prose. */
export const TagList = ({
  tags,
  className,
  max,
}: {
  tags?: string[];
  className?: string;
  /** Cap visible tags on dense surfaces; a "+N" chip stands for the rest. */
  max?: number;
}) => {
  if (!tags?.length) return null;
  const shown = max ? tags.slice(0, max) : tags;
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {shown.map((tag) => (
        <span
          key={tag}
          className="rounded-ctl border border-line px-1.5 py-0.5 font-mono text-[10.5px] leading-tight text-muted"
        >
          {tag}
        </span>
      ))}
      {tags.length > shown.length && (
        <span className="rounded-ctl border border-dashed border-line px-1.5 py-0.5 font-mono text-[10.5px] leading-tight text-muted">
          +{tags.length - shown.length}
        </span>
      )}
    </div>
  );
};
