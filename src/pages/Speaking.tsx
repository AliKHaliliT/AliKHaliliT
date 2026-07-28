import { useState, useMemo } from "react";
import { m } from "framer-motion";
import { Mic2, ExternalLink, Video, Presentation } from "lucide-react";
import { useContent } from "@/context/ContentContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { FilterBar } from "@/components/ui/FilterBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { TagList } from "@/components/ui/TagList";
import { SPEAKING_TYPE_LABEL, typeLabel } from "@/lib/labels";
import { StoryLink } from "@/components/ui/StoryLink";
import { usePageDescription } from "@/lib/pageCopy";

export const Speaking = () => {
  const { speaking } = useContent();
  const [typeFilter, setTypeFilter] = useState("All");

  const allTypes = useMemo(() => {
    const types = new Set(["All"]);
    speaking.forEach((s) => {
      if (s.speakingType) types.add(s.speakingType);
    });
    return Array.from(types);
  }, [speaking]);

  const filtered = useMemo(() => {
    if (typeFilter === "All") return speaking;
    return speaking.filter((s) => s.speakingType === typeFilter);
  }, [speaking, typeFilter]);

  return (
    <div className="pb-12">

      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        <PageHeader
          eyebrow="Career"
          title="Speaking"
          meta={`${speaking.length} entr${speaking.length !== 1 ? "ies" : "y"}`}
          description={usePageDescription("speaking")}
        />

        <FilterBar
          className="mb-6"
          value={typeFilter}
          onChange={setTypeFilter}
          options={allTypes.map((t) => ({
            value: t,
            label: t === "All" ? "All" : typeLabel(SPEAKING_TYPE_LABEL, t),
          }))}
        />

        {/* Ledger */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={Mic2}
            title="No speaking engagements found."
            hint={
              typeFilter !== "All"
                ? "Try a different filter."
                : "Nothing logged here yet."
            }
          />
        ) : (
          <div className="rounded-card border border-[var(--color-border)] bg-[var(--color-card)] divide-y divide-[var(--color-border)]">
            {filtered.map((item, i) => {
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
                    {(item.event || item.location) && (
                      <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                        {item.event && (
                          <span className="font-medium text-[var(--color-text-primary)]">
                            {item.event}
                          </span>
                        )}
                        {item.event && item.location && " · "}
                        {item.location}
                        {year && (
                          <span className="sm:hidden font-mono text-[11px] text-[var(--color-text-secondary)]">
                            {" "}· {year}
                          </span>
                        )}
                      </p>
                    )}
                    {item.body && (
                      <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mt-2 line-clamp-3">
                        {item.body}
                      </p>
                    )}
                    <TagList tags={item.tags} className="mt-2" />
                    {item.story && (
                      <StoryLink to={item.story} className="mt-2.5">
                        Read the story
                      </StoryLink>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <Badge>
                      {typeLabel(SPEAKING_TYPE_LABEL, item.speakingType)}
                    </Badge>
                    <div className="flex items-center gap-1">
                      {item.slides && (
                        <a
                          href={item.slides}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-ctl text-[var(--color-text-secondary)] hover:text-signal transition-colors duration-150"
                          title="View slides"
                        >
                          <Presentation size={15} />
                        </a>
                      )}
                      {item.video && (
                        <a
                          href={item.video}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-ctl text-[var(--color-text-secondary)] hover:text-signal transition-colors duration-150"
                          title="Watch recording"
                        >
                          <Video size={15} />
                        </a>
                      )}
                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-ctl text-[var(--color-text-secondary)] hover:text-signal transition-colors duration-150"
                          title="Event page"
                        >
                          <ExternalLink size={15} />
                        </a>
                      )}
                    </div>
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
