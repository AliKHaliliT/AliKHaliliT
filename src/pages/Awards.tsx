import { m } from "framer-motion";
import { Trophy, ExternalLink } from "lucide-react";
import { useContent } from "@/context/ContentContext";
import { Award } from "@/types/content";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { TagList } from "@/components/ui/TagList";
import { AWARD_TYPE_LABEL, typeLabel } from "@/lib/labels";
import { usePageDescription } from "@/lib/pageCopy";

export const Awards = () => {
  const { awards } = useContent();

  // The loader already sorts newest-first; regrouping by type here would
  // shuffle the ledger with no visible group headers to explain it.
  const flattened: Award[] = awards;

  return (
    <div className="pb-12">

      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        <PageHeader
          eyebrow="Career"
          title="Awards"
          meta={`${awards.length} recognition${awards.length !== 1 ? "s" : ""}`}
          description={usePageDescription("awards")}
        />

        {/* Ledger */}
        {flattened.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="No awards yet."
            hint="Nothing logged here yet."
          />
        ) : (
          <div className="rounded-card border border-[var(--color-border)] bg-[var(--color-card)] divide-y divide-[var(--color-border)]">
            {flattened.map((item, i) => {
              const year = item.date?.slice(0, 4);
              return (
                <m.article
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: Math.min(i * 0.03, 0.3) }}
                  className="flex gap-5 px-5 py-4 transition-colors duration-150 hover:bg-[var(--color-background)]/60"
                >
                  {/* Year rail */}
                  <div className="hidden sm:block w-12 shrink-0 pt-0.5">
                    <span className="font-mono text-[11px] text-[var(--color-text-secondary)]">
                      {year ?? "-"}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h2 className="text-[15px] font-serif font-semibold text-[var(--color-text-primary)] leading-snug">
                      {item.title}
                    </h2>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                      {item.issuer}
                      {year && (
                        <span className="sm:hidden font-mono text-[11px]">
                          {" "}· {year}
                        </span>
                      )}
                    </p>
                    {item.amount && (
                      <p className="font-mono text-[11px] text-[var(--color-text-secondary)] mt-1.5">
                        {item.amount}
                      </p>
                    )}
                    {item.body && (
                      <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mt-2 line-clamp-3">
                        {item.body}
                      </p>
                    )}
                    <TagList tags={item.tags} className="mt-2" />
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <Badge>
                      {typeLabel(AWARD_TYPE_LABEL, item.awardType, "award")}
                    </Badge>
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-ctl text-[var(--color-text-secondary)] hover:text-signal transition-colors duration-150"
                        title="View award"
                      >
                        <ExternalLink size={15} />
                      </a>
                    )}
                  </div>
                </m.article>
              );
            })}
          </div>
        )}
      </m.div>
    </div>
  );
};
