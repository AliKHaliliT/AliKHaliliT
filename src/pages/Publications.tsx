import { useState, useMemo } from "react";
import { m } from "framer-motion";
import { BookMarked, ExternalLink } from "lucide-react";
import { useContent } from "@/context/ContentContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { FilterBar } from "@/components/ui/FilterBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { TagList } from "@/components/ui/TagList";
import { PUB_TYPE_LABEL, typeLabel } from "@/lib/labels";
import { usePageDescription } from "@/lib/pageCopy";

/** Academic convention: the owner's name is emphasized in author lists.
 *  Prefix match covers a shortened byline against a longer full profile name. */
const isOwner = (author: string, name?: string) => {
  const a = author.trim().toLowerCase();
  const n = (name ?? "").trim().toLowerCase();
  return !!a && !!n && (a === n || n.startsWith(`${a} `) || a.startsWith(`${n} `));
};

export const Publications = () => {
  const { publications, settings } = useContent();
  const [typeFilter, setTypeFilter] = useState("All");

  const allTypes = useMemo(() => {
    const types = new Set(["All"]);
    publications.forEach((p) => {
      if (p.pubType) types.add(p.pubType);
    });
    return Array.from(types);
  }, [publications]);

  const filtered = useMemo(() => {
    if (typeFilter === "All") return publications;
    return publications.filter((p) => p.pubType === typeFilter);
  }, [publications, typeFilter]);

  return (
    <div className="pb-12">

      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        <PageHeader
          eyebrow="Career"
          title="Publications"
          meta={`${publications.length} record${publications.length !== 1 ? "s" : ""}`}
          description={usePageDescription("publications")}
        />

        {allTypes.length > 2 && (
          <FilterBar
            className="mb-6"
            value={typeFilter}
            onChange={setTypeFilter}
            options={allTypes.map((t) => ({
              value: t,
              label: t === "All" ? "All" : typeLabel(PUB_TYPE_LABEL, t),
            }))}
          />
        )}

        {/* Ledger */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={BookMarked}
            title="No publications found."
            hint={
              typeFilter !== "All"
                ? "Try a different filter."
                : "Nothing logged here yet."
            }
          />
        ) : (
          <div className="rounded-card border border-[var(--color-border)] bg-[var(--color-card)] divide-y divide-[var(--color-border)]">
            {filtered.map((pub, i) => (
              <m.article
                key={pub.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: Math.min(i * 0.03, 0.3) }}
                className="flex gap-5 px-5 py-4 transition-colors duration-150 hover:bg-[var(--color-background)]/60"
              >
                {/* Year rail */}
                <div className="hidden sm:block w-12 shrink-0 pt-0.5">
                  <span className="font-mono text-[11px] text-[var(--color-text-secondary)]">
                    {pub.year ?? "-"}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <h2 className="text-[15px] font-serif font-semibold text-[var(--color-text-primary)] leading-snug">
                    {pub.title}
                  </h2>
                  {pub.authors && (
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                      {pub.authors.split(",").map((author, idx, arr) => (
                        <span
                          key={idx}
                          className={
                            isOwner(author, settings.name)
                              ? "font-semibold text-[var(--color-text-primary)]"
                              : undefined
                          }
                        >
                          {author.trim()}
                          {idx < arr.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </p>
                  )}
                  {pub.venue && (
                    <p className="text-sm font-medium text-[var(--color-text-primary)] mt-0.5">
                      {pub.venue}
                      <span className="sm:hidden font-mono text-[11px] font-normal text-[var(--color-text-secondary)]">
                        {" "}· {pub.year}
                      </span>
                    </p>
                  )}
                  {pub.doi && (
                    <p className="font-mono text-[11px] text-[var(--color-text-secondary)] mt-1.5">
                      DOI {pub.doi}
                    </p>
                  )}
                  {pub.body && (
                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mt-2 line-clamp-3">
                      {pub.body}
                    </p>
                  )}
                  <TagList tags={pub.tags} className="mt-2" />
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  <Badge>{typeLabel(PUB_TYPE_LABEL, pub.pubType)}</Badge>
                  {pub.link && (
                    <a
                      href={pub.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-ctl text-[var(--color-text-secondary)] hover:text-signal transition-colors duration-150"
                      title="View paper"
                    >
                      <ExternalLink size={15} />
                    </a>
                  )}
                </div>
              </m.article>
            ))}
          </div>
        )}
      </m.div>
    </div>
  );
};
