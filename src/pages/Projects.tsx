import { useState, useMemo } from "react";
import { m } from "framer-motion";
import { FolderOpen, ArrowRight, ArrowUpRight, Star } from "lucide-react";
import { ProjectModal } from "@/components/projects/ProjectModal";
import { useContent } from "@/context/ContentContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { FilterBar } from "@/components/ui/FilterBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { SafeImage } from "@/components/ui/SafeImage";
import { TagList } from "@/components/ui/TagList";
import { firstLine, hostLabel } from "@/lib/text";
import { Project } from "@/types/content";
import { usePageDescription } from "@/lib/pageCopy";

/** One-line prose for a project row or card. The generous cap only guards
 *  against huge bodies; the ledger rows truncate with CSS at the column edge,
 *  so this never double-ellipsizes mid-word. */
const summary = (p: Project) =>
  p.desc || firstLine(p.body || p.fullDesc, 200);

export const Projects = () => {
  const { projects } = useContent();
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // A record this size needs a curated filter row, not every tag that ever
  // appeared: only tags carried by 3+ projects earn a pill.
  const filterTags = useMemo(() => {
    const counts = new Map<string, number>();
    projects?.forEach((p) =>
      (p.tags ?? []).forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)),
    );
    return [
      "All",
      ...[...counts.entries()]
        .filter(([, n]) => n >= 3)
        .sort((a, b) => b[1] - a[1])
        .map(([t]) => t),
    ];
  }, [projects]);

  const filtered = useMemo(() => {
    if (!projects) return [];
    if (selectedFilter === "All") return projects;
    return projects.filter(
      (p) => Array.isArray(p.tags) && p.tags.includes(selectedFilter),
    );
  }, [selectedFilter, projects]);

  const featured = filtered.find((p) => p.featured);
  const rest = filtered.filter((p) => p !== featured);

  // The record reads as a ledger grouped by year, newest first.
  const byYear = useMemo(() => {
    const groups = new Map<string, Project[]>();
    rest.forEach((p) => {
      const y = p.year || "Undated";
      if (!groups.has(y)) groups.set(y, []);
      groups.get(y)!.push(p);
    });
    // Descending localeCompare would rank the "Undated" label above every
    // numeric year (letters sort after digits); undated entries close the
    // ledger instead.
    return [...groups.entries()].sort((a, b) => {
      if (a[0] === "Undated") return 1;
      if (b[0] === "Undated") return -1;
      return b[0].localeCompare(a[0]);
    });
  }, [rest]);

  return (
    <div className="pb-12">
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        <PageHeader
          eyebrow="Career"
          title="Projects"
          meta={`${projects?.length ?? 0} project${projects?.length !== 1 ? "s" : ""}`}
          description={usePageDescription("projects")}
        />

        {filterTags.length > 2 && (
          <FilterBar
            className="mb-8"
            value={selectedFilter}
            onChange={setSelectedFilter}
            options={filterTags.map((t) => ({ value: t, label: t }))}
          />
        )}

        {filtered.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="No projects found."
            hint={
              selectedFilter !== "All"
                ? "Try a different filter."
                : "Nothing logged here yet."
            }
          />
        ) : (
          <div className="space-y-10">
            {/* Featured: the one project that gets an image up front. */}
            {featured && (
              <m.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => setSelectedProject(featured)}
                className="group grid cursor-pointer overflow-hidden rounded-card border border-[var(--color-border)] bg-[var(--color-card)] transition-all duration-200 hover:-translate-y-px hover:border-[var(--color-border-strong)] hover:shadow-lift md:grid-cols-[1.1fr_1fr]"
              >
                <div className="relative min-h-48 bg-[var(--color-background)] md:min-h-full">
                  <SafeImage
                    src={featured.image}
                    alt={featured.title}
                    className="absolute inset-0 transition-transform duration-200 group-hover:scale-[1.02]"
                    fallback={
                      <div className="absolute inset-0 flex items-center justify-center text-[var(--color-text-secondary)]">
                        <FolderOpen size={40} strokeWidth={1.25} />
                      </div>
                    }
                  />
                </div>
                <div className="flex flex-col p-6 md:p-8">
                  <p className="mb-3 flex items-center gap-1.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-signal">
                    <Star size={11} className="fill-current" />
                    Featured
                    {featured.year && (
                      <span className="text-[var(--color-text-secondary)]">
                        {" "}
                        · {featured.year}
                      </span>
                    )}
                  </p>
                  <h2 className="mb-1 font-serif text-2xl font-semibold text-[var(--color-text-primary)] transition-colors duration-150 group-hover:text-signal">
                    {featured.title}
                  </h2>
                  <p className="mb-3 text-sm font-medium text-[var(--color-text-secondary)]">
                    {featured.role}
                  </p>
                  {summary(featured) && (
                    <p className="mb-4 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                      {summary(featured)}
                    </p>
                  )}
                  <TagList tags={featured.tags} max={6} className="mt-auto" />
                </div>
              </m.div>
            )}

            {/* The record: a year-grouped ledger. Rows open the full entry;
                images stay in the entry so the index never waits on a CDN. */}
            {byYear.map(([year, group]) => (
              <section key={year}>
                <h2 className="mb-1 flex items-baseline gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--color-text-secondary)]">
                  {year}
                  <span className="text-[10px] normal-case tracking-normal opacity-70">
                    {group.length} {group.length === 1 ? "entry" : "entries"}
                  </span>
                </h2>
                <div className="border-t border-dashed border-[var(--color-border)]">
                  {group.map((project) => {
                    const host = project.link ? hostLabel(project.link) : null;
                    return (
                      // Not one big <button>: the row is a relative box, the
                      // title button stretches over it (after:inset-0) to open
                      // the entry, and the host chip is a REAL link layered
                      // above that overlay (z-10), so clicking the chip goes
                      // straight to the site while everywhere else still opens
                      // the card. Same pattern as the blog's stretched links.
                      <div
                        key={project.id}
                        // The host column has a FIXED width (not auto): every
                        // row resolves the fr columns identically, so titles,
                        // summaries, and chips align down the ledger whether
                        // or not an entry carries a link.
                        className="group relative grid w-full grid-cols-[1fr_auto] items-center gap-x-4 border-b border-dashed border-[var(--color-border)] px-1.5 py-4 text-left transition-colors hover:bg-field/5 md:grid-cols-[minmax(14rem,1.2fr)_2fr_7rem_auto]"
                      >
                        <span className="min-w-0">
                          <button
                            onClick={() => setSelectedProject(project)}
                            className="block w-full truncate text-left font-serif text-lg tracking-[-0.01em] text-[var(--color-text-primary)] transition-colors duration-150 group-hover:text-signal after:absolute after:inset-0"
                          >
                            {project.title}
                          </button>
                          <span className="block truncate text-xs text-[var(--color-text-secondary)]">
                            {project.role}
                          </span>
                        </span>
                        <span className="hidden min-w-0 truncate text-sm leading-relaxed text-[var(--color-text-secondary)] md:block">
                          {summary(project)}
                        </span>
                        <span className="hidden min-w-0 justify-end md:flex">
                          {host && project.link && (
                            <a
                              href={project.link}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={`Visit ${host}`}
                              className="relative z-10 flex min-w-0 items-center gap-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-text-secondary)] transition-colors hover:text-signal"
                            >
                              <ArrowUpRight size={10} className="shrink-0" />
                              <span className="truncate">{host}</span>
                            </a>
                          )}
                        </span>
                        <ArrowRight
                          size={14}
                          className="text-[var(--color-text-secondary)] transition-transform group-hover:translate-x-1 group-hover:text-signal"
                        />
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </m.div>

      <ProjectModal
        project={selectedProject}
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </div>
  );
};
