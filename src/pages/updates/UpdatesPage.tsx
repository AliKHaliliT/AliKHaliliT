import { useMemo } from "react";
import { m } from "framer-motion";
import { Zap, ExternalLink, Star, FileText, Link2 } from "lucide-react";
import { cn, formatMonthDay, formatMonthLong } from "@/shared/lib";
import { useContent, Update } from "@/entities/record";
import { PageHeader, EmptyState, Badge, TagList, Markdown } from "@/shared/ui";
import { usePageDescription } from "@/entities/site";

const UPDATE_ICONS = {
  note: FileText,
  link: Link2,
  milestone: Star,
};

const UPDATE_LABELS = {
  note: "Note",
  link: "Link",
  milestone: "Milestone",
};

function groupByMonth(updates: Update[]) {
  const groups: Record<string, Update[]> = {};
  updates.forEach((u) => {
    const key = formatMonthLong(u.date);
    if (!groups[key]) groups[key] = [];
    groups[key].push(u);
  });
  return groups;
}

/** The update log: notes, links, and milestones on one timeline. */
export const UpdatesPage = () => {
  const { updates } = useContent();

  const grouped = useMemo(() => groupByMonth(updates), [updates]);

  return (
    <div className="pb-12">

      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        <PageHeader
          eyebrow="Writing"
          title="Updates"
          meta={`${updates.length} entr${updates.length === 1 ? "y" : "ies"}`}
          description={usePageDescription("updates")}
        />

        {updates.length === 0 ? (
          <EmptyState
            icon={Zap}
            title="Nothing logged yet."
            hint="The feed is quiet for now."
          />
        ) : (
          <div className="mx-auto max-w-2xl space-y-10">
            {Object.entries(grouped).map(([month, monthUpdates]) => (
              <section key={month}>
                <h2 className="font-mono text-eyebrow uppercase text-muted mb-3 pl-1">
                  {month}
                </h2>
                <div className="rounded-card border border-line bg-card divide-y divide-line">
                  {monthUpdates.map((update, idx) => {
                    const updateType = update.updateType || "note";
                    const Icon = UPDATE_ICONS[updateType];
                    const milestone = updateType === "milestone";

                    return (
                      <m.article
                        key={update.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: Math.min(idx * 0.03, 0.3) }}
                        className="flex gap-4 px-5 py-4"
                      >
                        {/* Date rail */}
                        <div className="w-14 shrink-0 pt-0.5">
                          <span className="font-mono text-[11px] text-muted">
                            {formatMonthDay(update.date)}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <Icon
                              size={13}
                              className={cn(
                                "shrink-0",
                                milestone
                                  ? "text-signal"
                                  : "text-muted"
                              )}
                            />
                            <Badge tone={milestone ? "signal" : "neutral"}>
                              {UPDATE_LABELS[updateType]}
                            </Badge>
                          </div>

                          {/* Link card (for link type) */}
                          {updateType === "link" && update.link && (
                            <a
                              href={update.link}
                              target="_blank"
                              rel="noreferrer"
                              className="group flex items-center gap-2 mb-2 px-3 py-2 rounded-ctl border border-line text-sm font-medium text-ink hover:border-line-strong hover:text-signal transition-colors duration-150"
                            >
                              <Link2 size={13} className="flex-shrink-0" />
                              <span className="truncate">
                                {update.linkTitle || update.link}
                              </span>
                              <ExternalLink
                                size={11}
                                className="flex-shrink-0 ml-auto opacity-60 group-hover:opacity-100"
                              />
                            </a>
                          )}

                          <div
                            className={cn(
                              "prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed [&_p]:my-0",
                              milestone
                                ? "font-medium text-ink"
                                : "text-muted"
                            )}
                          >
                            <Markdown>{update.body || ""}</Markdown>
                          </div>

                          <TagList tags={update.tags} className="mt-2.5" />
                        </div>
                      </m.article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </m.div>
    </div>
  );
};
