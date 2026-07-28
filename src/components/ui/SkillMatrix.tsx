// The skill matrix: category cards with keyword-matched instrument icons and
// square item chips. Shared by the home page's telemetry chapter and the
// dedicated /skills page (the rule: nothing on the home page is orphaned).

import { SkillGroup, skillIcon } from "@/lib/skills";

export const SkillMatrix = ({
  skills,
  maxItems,
}: {
  skills: SkillGroup[];
  /** Cap chips per category (compact home view); a "+N" chip carries the rest. */
  maxItems?: number;
}) => {
  if (skills.length === 0) return null;
  return (
    <div className="grid gap-px overflow-hidden rounded-card border border-dashed border-[var(--color-border)] bg-[var(--color-border)] sm:grid-cols-2 lg:grid-cols-3">
      {skills.map(({ category, items }) => {
        const Icon = skillIcon(category);
        const shown = maxItems ? items.slice(0, maxItems) : items;
        return (
          <div key={category} className="bg-[var(--color-card)] p-4">
            <p className="mb-2.5 flex items-center gap-2 font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">
              <span className="flex h-6 w-6 items-center justify-center rounded-ctl border border-[var(--color-border)] text-signal">
                <Icon size={12} strokeWidth={1.75} />
              </span>
              {category}
            </p>
            <p className="m-0 flex flex-wrap gap-1">
              {shown.map((item) => (
                <span
                  key={item}
                  className="rounded-ctl border border-[var(--color-border)] px-1.5 py-0.5 font-mono text-[11px] tracking-[0.02em] text-[var(--color-text-primary)]"
                >
                  {item}
                </span>
              ))}
              {items.length > shown.length && (
                <span className="rounded-ctl border border-dashed border-[var(--color-border)] px-1.5 py-0.5 font-mono text-[11px] tracking-[0.02em] text-[var(--color-text-secondary)]">
                  +{items.length - shown.length}
                </span>
              )}
            </p>
          </div>
        );
      })}
    </div>
  );
};
