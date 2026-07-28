import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { m, AnimatePresence } from "framer-motion";
import { Sprout, ArrowRight } from "lucide-react";
import { useContent } from "@/context/ContentContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { FilterBar } from "@/components/ui/FilterBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { TagList } from "@/components/ui/TagList";
import { usePageDescription } from "@/lib/pageCopy";

export const Garden = () => {
  const { posts } = useContent();

  const [typeFilter, setTypeFilter] = useState("All");
  const [tagFilter, setTagFilter] = useState("All Tags");

  const allTags = useMemo(() => {
    const tags = new Set(["All Tags"]);
    if (posts) {
      posts.forEach((p) => {
        if (Array.isArray(p.tags)) p.tags.forEach((t: string) => tags.add(t));
      });
    }
    return Array.from(tags);
  }, [posts]);

  // Note kinds are open (Seedling, Evergreen, List, whatever the owner
  // invents): counts and filters derive from what actually exists.
  const kinds = useMemo(() => {
    const counts = new Map<string, number>();
    posts?.forEach((p) => {
      const k = p.postType || "Seedling";
      counts.set(k, (counts.get(k) ?? 0) + 1);
    });
    return [...counts.entries()];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    return posts.filter((post) => {
      const matchType =
        typeFilter === "All" || (post.postType || "Seedling") === typeFilter;
      const matchTag =
        tagFilter === "All Tags" ||
        (Array.isArray(post.tags) && post.tags.includes(tagFilter));
      return matchType && matchTag;
    });
  }, [posts, typeFilter, tagFilter]);

  return (
    <div className="pb-12">

      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        <PageHeader
          eyebrow="Writing"
          title="Digital Garden"
          meta={
            kinds.map(([k, n]) => `${n} ${k.toLowerCase()}`).join(" · ") ||
            "0 notes"
          }
          description={usePageDescription("garden")}
        />

        <div className="mb-6 space-y-2">
          {kinds.length > 1 && (
            <FilterBar
              value={typeFilter}
              onChange={setTypeFilter}
              options={["All", ...kinds.map(([k]) => k)].map((t) => ({
                value: t,
                label: t,
              }))}
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

        {filteredPosts.length === 0 ? (
          <EmptyState
            icon={Sprout}
            title="Nothing growing here."
            hint={
              typeFilter !== "All" || tagFilter !== "All Tags"
                ? "Try a different filter."
                : "The first note is still being planted."
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
              {filteredPosts.map((post) => (
                <m.div
                  key={post.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className="group relative rounded-card border border-[var(--color-border)] bg-[var(--color-card)] transition-all duration-200 hover:-translate-y-px hover:border-[var(--color-border-strong)] hover:shadow-lift overflow-hidden p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <Badge
                      tone={post.postType === "Evergreen" ? "canopy" : "neutral"}
                    >
                      {post.postType}
                    </Badge>
                    <span className="font-mono text-[11px] text-[var(--color-text-secondary)]">
                      {post.date}
                    </span>
                  </div>

                  <h3 className="text-xl font-serif font-semibold text-[var(--color-text-primary)] mb-2 group-hover:text-signal transition-colors duration-150">
                    <Link to={`/garden/${post.slug}`} className="after:absolute after:inset-0">
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-sm text-[var(--color-text-secondary)] mb-4 line-clamp-2">
                    {post.desc}
                  </p>

                  <TagList tags={post.tags} max={4} className="mt-2 mb-4" />

                  <div className="flex items-center gap-1 text-sm font-medium text-[var(--color-text-secondary)] group-hover:text-signal transition-colors duration-150">
                    Read more{" "}
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-1 transition-transform duration-200"
                    />
                  </div>
                </m.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </m.div>
    </div>
  );
};
