import { useMemo } from "react";
import { m } from "framer-motion";
import { Heart, MapPin, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { TagList } from "@/components/ui/TagList";
import { useContent } from "@/context/ContentContext";
import { cn } from "@/lib/utils";
import { formatMonthYearRange } from "@/lib/dates";
import { usePageDescription } from "@/lib/pageCopy";
import { StoryLink } from "@/components/ui/StoryLink";

export const Volunteering = () => {
  const { volunteering } = useContent();

  const grouped = useMemo(() => {
    const map = new Map<string, typeof volunteering>();
    volunteering.forEach((v) => {
      const org = v.organization || "Other";
      if (!map.has(org)) map.set(org, []);
      map.get(org)!.push(v);
    });
    return Array.from(map.entries());
  }, [volunteering]);

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <PageHeader
        eyebrow="Career"
        title="Volunteering"
        meta={`${volunteering.length} role${volunteering.length !== 1 ? "s" : ""}`}
        description={usePageDescription("volunteering")}
      />

      {volunteering.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Nothing logged yet."
          hint="Nothing logged here yet."
        />
      ) : (
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-0 top-6 bottom-6 w-px bg-[var(--color-border)]" />

          <div className="space-y-5">
            {grouped.map(([org, entries]) => {
              const ongoing = entries.some((e) => !e.endDate);
              return (
                <m.div
                  key={org}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="relative pl-8"
                >
                  {/* Timeline node: signal while any role is ongoing */}
                  <div
                    className={cn(
                      "absolute left-0 top-[26px] h-[9px] w-[9px] -translate-x-[4px] rounded-full border-2 border-[var(--color-background)]",
                      ongoing ? "bg-signal" : "bg-[var(--color-border-strong)]"
                    )}
                  />

                  <div className="rounded-card border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-[var(--color-border)]">
                      <h2 className="font-serif font-semibold text-[var(--color-text-primary)]">{org}</h2>
                    </div>
                    <div className="divide-y divide-[var(--color-border)]">
                      {entries.map((item) => (
                        <div key={item.id} className="p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              {(item.startDate || item.endDate) && (
                                <p className="font-mono text-[11px] text-[var(--color-text-secondary)] mb-1.5">
                                  {formatMonthYearRange(item.startDate, item.endDate)}
                                </p>
                              )}
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h3 className="font-semibold text-[var(--color-text-primary)] leading-snug">
                                  {item.title}
                                </h3>
                                {!item.endDate && <Badge tone="signal">Ongoing</Badge>}
                              </div>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--color-text-secondary)]">
                                {item.role && (
                                  <span className="font-medium text-[var(--color-text-primary)]">
                                    {item.role}
                                  </span>
                                )}
                                {item.location && (
                                  <span className="flex items-center gap-1 text-xs">
                                    <MapPin size={11} />
                                    {item.location}
                                  </span>
                                )}
                              </div>
                              {item.body && (
                                <p className="mt-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
                                  {item.body}
                                </p>
                              )}
                              <TagList tags={item.tags} className="mt-2.5" />
                              {item.story && (
                                <StoryLink to={item.story} className="mt-2.5">
                                  Read the story
                                </StoryLink>
                              )}
                            </div>
                            {item.link && (
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-shrink-0 mt-1 text-[var(--color-text-secondary)] hover:text-signal transition-colors duration-150"
                                title="Visit"
                              >
                                <ExternalLink size={15} />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </m.div>
              );
            })}
          </div>
        </div>
      )}
    </m.div>
  );
};
