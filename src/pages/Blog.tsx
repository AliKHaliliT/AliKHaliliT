import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { m, AnimatePresence } from "framer-motion";
import { FileText, ArrowRight, ArrowUpRight } from "lucide-react";
import { useContent } from "@/context/ContentContext";
import { formatShortDate } from "@/lib/dates";
import { hostLabel } from "@/lib/text";
import { PageHeader } from "@/components/ui/PageHeader";
import { FilterBar } from "@/components/ui/FilterBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { TagList } from "@/components/ui/TagList";
import { usePageDescription } from "@/lib/pageCopy";

export const Blog = () => {
  const { blog } = useContent();
  const [tagFilter, setTagFilter] = useState("All");
  const [seriesFilter, setSeriesFilter] = useState("All");

  const allTags = useMemo(() => {
    const tags = new Set(["All"]);
    blog.forEach((p) => {
      if (Array.isArray(p.tags)) p.tags.forEach((t) => tags.add(t));
    });
    return Array.from(tags);
  }, [blog]);

  const allSeries = useMemo(() => {
    const series = new Set(["All"]);
    blog.forEach((p) => {
      if (p.series) series.add(p.series);
    });
    return Array.from(series);
  }, [blog]);

  const filtered = useMemo(() => {
    return blog.filter((p) => {
      const matchTag =
        tagFilter === "All" ||
        (Array.isArray(p.tags) && p.tags.includes(tagFilter));
      const matchSeries =
        seriesFilter === "All" || p.series === seriesFilter;
      return matchTag && matchSeries;
    });
  }, [blog, tagFilter, seriesFilter]);

  return (
    <div className="pb-12">

      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        <PageHeader
          eyebrow="Writing"
          title="Blog"
          meta={`${blog.length} post${blog.length !== 1 ? "s" : ""}`}
          description={usePageDescription("blog")}
        />

        {/* Filters */}
        <div className="mb-6 space-y-2">
          {allSeries.length > 1 && (
            <FilterBar
              value={seriesFilter}
              onChange={setSeriesFilter}
              options={allSeries.map((s) => ({ value: s, label: s }))}
            />
          )}
          {allTags.length > 1 && (
            <FilterBar
              value={tagFilter}
              onChange={setTagFilter}
              options={allTags.map((t) => ({ value: t, label: t }))}
            />
          )}
        </div>

        {/* Post List */}
        <div className="space-y-6">
          <AnimatePresence>
            {filtered.map((post) => {
              // Off-site posts (canonical home elsewhere) read differently:
              // dashed frame, host chip, and a link-out instead of a route.
              const host = post.externalUrl ? hostLabel(post.externalUrl) : null;
              return (
              <m.article
                key={post.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className={`group relative rounded-card border bg-[var(--color-card)] transition-all duration-200 hover:-translate-y-px hover:border-[var(--color-border-strong)] hover:shadow-lift overflow-hidden flex flex-col md:flex-row ${
                  post.externalUrl
                    ? "border-dashed border-[var(--color-border-strong)]"
                    : "border-[var(--color-border)]"
                }`}
              >
                {post.cover && (
                  <div className="md:w-64 lg:w-80 h-48 md:h-auto flex-shrink-0 overflow-hidden rounded-ctl m-4 mb-0 md:mb-4 md:mr-0 bg-[var(--color-background)]">
                    <img
                      src={post.cover}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                    />
                  </div>
                )}
                <div className="p-6 flex flex-col justify-between flex-1">
                  <div>
                    {(post.series || host) && (
                      <span className="mb-3 flex flex-wrap items-center gap-1.5">
                        {post.series && <Badge>{post.series}</Badge>}
                        {host && (
                          <Badge tone="signal">
                            <span className="inline-flex items-center gap-1">
                              <ArrowUpRight size={11} />
                              {host}
                            </span>
                          </Badge>
                        )}
                      </span>
                    )}
                    <h2 className="text-xl font-serif font-semibold text-[var(--color-text-primary)] mb-2 group-hover:text-signal transition-colors duration-150 leading-snug">
                      {/* Stretched link: the whole card is clickable, with real
                          anchor semantics (middle-click, keyboard, crawlers). */}
                      {post.externalUrl ? (
                        <a
                          href={post.externalUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="after:absolute after:inset-0"
                        >
                          {post.title}
                        </a>
                      ) : (
                        <Link to={`/blog/${post.slug}`} className="after:absolute after:inset-0">
                          {post.title}
                        </Link>
                      )}
                    </h2>
                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <TagList tags={post.tags} max={4} className="mt-2" />
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--color-border)]">
                    <span className="font-mono text-[11px] text-[var(--color-text-secondary)]">
                      {formatShortDate(post.date)}
                      {post.readingTime ? ` · ${post.readingTime} min` : ""}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-medium text-[var(--color-text-secondary)] group-hover:text-signal transition-colors duration-150">
                      {host ? (
                        <>
                          Read on {host}{" "}
                          <ArrowUpRight
                            size={12}
                            className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform duration-200"
                          />
                        </>
                      ) : (
                        <>
                          Read{" "}
                          <ArrowRight
                            size={12}
                            className="group-hover:translate-x-1 transition-transform duration-200"
                          />
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </m.article>
              );
            })}
          </AnimatePresence>
          {filtered.length === 0 && (
            <EmptyState
              icon={FileText}
              title="No posts found."
              hint={
                tagFilter !== "All" || seriesFilter !== "All"
                  ? "Try a different filter."
                  : "The first post is still being written."
              }
            />
          )}
        </div>
      </m.div>
    </div>
  );
};
