import { useState } from "react";
import { m } from "framer-motion";
import { Briefcase, MapPin, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { useContent } from "@/context/ContentContext";
import { Experience as ExperienceType } from "@/types/content";
import { cn } from "@/lib/utils";
import { formatMonthYearRange } from "@/lib/dates";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { TagList } from "@/components/ui/TagList";
import { EMPLOYMENT_TYPE_LABEL } from "@/lib/labels";
import { Markdown } from "@/components/ui/Markdown";
import { usePageDescription } from "@/lib/pageCopy";

function ExperienceCard({ item }: { item: ExperienceType }) {
  const [expanded, setExpanded] = useState(true);
  // No fabricated defaults: an entry without an employmentType shows none.
  const typeKey = item.employmentType;
  const ongoing = !item.endDate;

  return (
    <m.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="relative pl-8"
    >
      {/* Timeline node: signal while ongoing */}
      <div
        className={cn(
          "absolute left-0 top-[26px] h-[9px] w-[9px] -translate-x-[4px] rounded-full border-2 border-[var(--color-background)]",
          ongoing ? "bg-signal" : "bg-[var(--color-border-strong)]"
        )}
      />

      <div className="rounded-card border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setExpanded((p) => !p)}
          className="w-full text-left p-5 flex items-start justify-between gap-4 group"
          aria-expanded={expanded}
        >
          <div className="flex-1 min-w-0">
            <p className="font-mono text-[11px] text-[var(--color-text-secondary)] mb-1.5">
              {formatMonthYearRange(item.startDate, item.endDate)}
            </p>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-serif font-semibold text-[var(--color-text-primary)] text-base leading-snug">
                {item.title}
              </h3>
              {typeKey && (
                <Badge tone={ongoing ? "signal" : "neutral"}>
                  {EMPLOYMENT_TYPE_LABEL[typeKey] ?? typeKey}
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--color-text-secondary)]">
              <span className="font-medium text-[var(--color-text-primary)]">
                {item.link ? (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 hover:text-signal transition-colors duration-150"
                  >
                    {item.company}
                    <ExternalLink size={11} className="opacity-60" />
                  </a>
                ) : (
                  item.company
                )}
              </span>
              {item.location && (
                <span className="flex items-center gap-1 text-xs">
                  <MapPin size={11} />
                  {item.location}
                </span>
              )}
            </div>

            <TagList tags={item.tags} className="mt-2.5" />
          </div>

          <div className="text-[var(--color-text-secondary)] mt-1 flex-shrink-0">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </button>

        {/* Body */}
        {expanded && item.body && (
          <div className="px-5 pb-5 border-t border-[var(--color-border)] pt-4">
            <div className="prose prose-sm dark:prose-invert max-w-none text-[var(--color-text-secondary)] prose-li:my-0.5 prose-ul:my-1">
              <Markdown>
                {item.body}
              </Markdown>
            </div>
          </div>
        )}
      </div>
    </m.div>
  );
}

export const Experience = () => {
  const { experience } = useContent();

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <PageHeader
        eyebrow="Career"
        title="Experience"
        meta={`${experience.length} position${experience.length !== 1 ? "s" : ""}`}
        description={usePageDescription("experience")}
      />

      {experience.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="Nothing logged yet."
          hint="Nothing logged here yet."
        />
      ) : (
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-0 top-6 bottom-6 w-px bg-[var(--color-border)]" />

          <div className="space-y-5">
            {experience.map((item) => (
              <ExperienceCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </m.div>
  );
};
