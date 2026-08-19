import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { m } from "framer-motion";
import {
  Search, X, ArrowRight, ArrowUpRight,
  Briefcase, GraduationCap, Trophy, FolderOpen, BookOpen, FileText, Sprout, Zap,
  BookMarked, BadgeCheck, Mic2, Heart, Building2, Smile, MapPin,
} from "lucide-react";
import { useContent } from "@/entities/record";
import { cn, excerpt, formatShortDate, useScrollLock } from "@/shared/lib";

type SearchResult = {
  id: string | number;
  title: string;
  subtitle?: string;
  type: string;
  href: string;
  score: number;
};

const TYPE_ICON: Record<string, React.ElementType> = {
  Blog: FileText,
  Garden: Sprout,
  Projects: FolderOpen,
  Experience: Briefcase,
  Education: GraduationCap,
  Awards: Trophy,
  Publications: BookMarked,
  Certificates: BadgeCheck,
  Speaking: Mic2,
  Volunteering: Heart,
  Organizations: Building2,
  Interests: Smile,
  Library: BookOpen,
  Travel: MapPin,
  Updates: Zap,
};

function hit(text: string | undefined, q: string) {
  return !!text && text.toLowerCase().includes(q);
}
function hitTags(tags: string[] | undefined, q: string) {
  return !!tags && tags.some((t) => t.toLowerCase().includes(q));
}

/**
 * Weighted match: the title outranks structured facts (degree, venue,
 * company, ...), which outrank tags, which outrank a hit buried in the body.
 * The weights keep the wider index useful instead of noisy: a body-only
 * match still surfaces, but never above a title match.
 */
function scoreOf(
  q: string,
  parts: {
    title?: string;
    facts?: Array<string | undefined>;
    tags?: string[];
    body?: string;
  },
): number {
  if (hit(parts.title, q)) return 4;
  if (parts.facts?.some((f) => hit(f, q))) return 3;
  if (hitTags(parts.tags, q)) return 2;
  if (hit(parts.body, q)) return 1;
  return 0;
}

/**
 * The command palette: a substring search over every collection at once.
 *
 * Opens on Ctrl+K, Cmd+K, or a dispatched `open-search` event, and filters the
 * in-memory record directly rather than any index. Results are scored so a title
 * hit outranks a structured-fact hit, which outranks tags, which outrank a hit
 * buried in a body, and each collection is capped so one cannot crowd out the rest.
 */
export const SearchModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const {
    blog, posts, projects, experience, education, awards, books, updates,
    publications, certificates, speaking, volunteering, organizations,
    interests, trips, countries,
  } = useContent();

  // Ctrl+K global shortcut + custom event from Header
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape") setIsOpen(false);
    };
    const onOpen = () => setIsOpen(true);
    document.addEventListener("keydown", onKey);
    document.addEventListener("open-search", onOpen);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("open-search", onOpen);
    };
  }, []);

  // Reset the query when the modal opens (render-time adjustment).
  const [prevOpen, setPrevOpen] = useState(isOpen);
  if (isOpen !== prevOpen) {
    setPrevOpen(isOpen);
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
    }
  }

  useScrollLock(isOpen);

  // Focus is a DOM side effect and stays in an effect.
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const results = useMemo((): SearchResult[] => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const res: SearchResult[] = [];
    const push = (
      score: number,
      r: Omit<SearchResult, "score">,
    ) => {
      if (score > 0) res.push({ ...r, score });
    };

    blog.forEach((p) =>
      push(scoreOf(q, { title: p.title, facts: [p.excerpt, p.series], tags: p.tags, body: p.body }), {
        id: p.id, title: p.title, subtitle: p.excerpt, type: "Blog", href: p.externalUrl || `/blog/${p.slug}`,
      }));
    posts.forEach((p) =>
      push(scoreOf(q, { title: p.title, facts: [p.desc, p.postType], tags: p.tags, body: p.body }), {
        id: p.id, title: p.title, subtitle: p.desc, type: "Garden", href: `/garden/${p.slug}`,
      }));
    projects.forEach((p) =>
      push(scoreOf(q, { title: p.title, facts: [p.role, p.year], tags: p.tags, body: p.body || p.fullDesc }), {
        id: p.id, title: p.title, subtitle: p.role, type: "Projects", href: "/projects",
      }));
    experience.forEach((e) =>
      push(scoreOf(q, { title: e.title, facts: [e.company, e.location, e.employmentType], tags: e.tags, body: e.body }), {
        id: e.id, title: e.title, subtitle: e.company, type: "Experience", href: "/experience",
      }));
    education.forEach((e) =>
      push(scoreOf(q, { title: e.title, facts: [e.institution, e.degree, e.field, e.location], tags: e.tags, body: e.body }), {
        id: e.id, title: e.title, subtitle: e.institution, type: "Education", href: "/education",
      }));
    awards.forEach((a) =>
      push(scoreOf(q, { title: a.title, facts: [a.issuer, a.awardType], tags: a.tags, body: a.body }), {
        id: a.id, title: a.title, subtitle: a.issuer, type: "Awards", href: "/awards",
      }));
    publications.forEach((p) =>
      push(scoreOf(q, { title: p.title, facts: [p.authors, p.venue, p.year, p.pubType], tags: p.tags, body: p.body }), {
        id: p.id, title: p.title, subtitle: p.venue, type: "Publications", href: "/publications",
      }));
    certificates.forEach((c) =>
      push(scoreOf(q, { title: c.title, facts: [c.issuer, c.certType], tags: c.tags, body: c.body }), {
        id: c.id, title: c.title, subtitle: c.issuer, type: "Certificates", href: "/certificates",
      }));
    speaking.forEach((s) =>
      push(scoreOf(q, { title: s.title, facts: [s.event, s.location, s.speakingType], tags: s.tags, body: s.body }), {
        id: s.id, title: s.title, subtitle: s.event, type: "Speaking", href: "/speaking",
      }));
    volunteering.forEach((v) =>
      push(scoreOf(q, { title: v.title, facts: [v.organization, v.role], tags: v.tags, body: v.body }), {
        id: v.id, title: v.title, subtitle: v.organization, type: "Volunteering", href: "/volunteering",
      }));
    organizations.forEach((o) =>
      push(scoreOf(q, { title: o.title, facts: [o.role, o.memberType, o.location], tags: o.tags, body: o.body }), {
        id: o.id, title: o.title, subtitle: o.role, type: "Organizations", href: "/organizations",
      }));
    interests.forEach((i) =>
      push(scoreOf(q, { title: i.title, facts: [i.category], tags: i.tags, body: i.body }), {
        id: i.id, title: i.title, subtitle: i.category, type: "Interests", href: "/interests",
      }));
    books.forEach((b) =>
      push(scoreOf(q, { title: b.title, facts: [b.author, b.status], tags: b.tags, body: b.body || b.notes }), {
        id: b.id, title: b.title, subtitle: b.author, type: "Library", href: "/library",
      }));
    trips.forEach((t) =>
      push(scoreOf(q, { title: t.city, facts: [t.country], tags: t.tags, body: t.body }), {
        id: t.id, title: t.city, subtitle: t.country, type: "Travel", href: `/travel/city/${t.slug}`,
      }));
    countries.forEach((c) =>
      push(scoreOf(q, { title: c.name, facts: [c.code, c.years], tags: c.tags, body: c.body }), {
        id: `country-${c.id}`, title: c.name, subtitle: c.years, type: "Travel", href: `/travel/country/${c.slug}`,
      }));
    updates.forEach((u) =>
      push(scoreOf(q, { title: u.body ? excerpt(u.body, 60) : "Update", facts: [u.updateType], tags: u.tags, body: u.body }), {
        id: u.id,
        title: u.body ? excerpt(u.body, 60) : "Update",
        subtitle: u.date ? formatShortDate(u.date) : undefined,
        type: "Updates",
        href: "/updates",
      }));

    // Best matches first; a stable per-type cap keeps one noisy collection
    // (28 projects) from drowning the rest.
    const perType = new Map<string, number>();
    return res
      .sort((a, b) => b.score - a.score)
      .filter((r) => {
        const n = perType.get(r.type) ?? 0;
        perType.set(r.type, n + 1);
        return n < 5;
      })
      .slice(0, 24);
  }, [query, blog, posts, projects, experience, education, awards, books, updates,
      publications, certificates, speaking, volunteering, organizations, interests, trips, countries]);

  // Results grouped by type (types ordered by their best match), with a
  // flattened view for keyboard navigation across group boundaries.
  const grouped = useMemo(() => {
    const order: string[] = [];
    const map = new Map<string, SearchResult[]>();
    for (const r of results) {
      if (!map.has(r.type)) {
        map.set(r.type, []);
        order.push(r.type);
      }
      map.get(r.type)!.push(r);
    }
    return order.map((type) => ({ type, items: map.get(type)! }));
  }, [results]);
  const flat = useMemo(() => grouped.flatMap((g) => g.items), [grouped]);
  // One pass to place every result, so the rows below look their position up
  // instead of scanning the flat list once per row.
  const flatIndex = useMemo(() => new Map(flat.map((r, i) => [r, i])), [flat]);

  // Snap the highlight back to the top whenever the result set changes.
  const [prevResults, setPrevResults] = useState(results);
  if (results !== prevResults) {
    setPrevResults(results);
    setSelectedIndex(0);
  }

  const handleSelect = useCallback(
    (href: string) => {
      // Off-site results (external blog posts) open in a new tab.
      if (/^https?:\/\//.test(href)) {
        window.open(href, "_blank", "noopener,noreferrer");
      } else {
        navigate(href);
      }
      setIsOpen(false);
    },
    [navigate]
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, flat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && flat[selectedIndex]) {
      handleSelect(flat[selectedIndex].href);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
      onClick={() => setIsOpen(false)}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />

      <m.div
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        initial={{ opacity: 0, scale: 0.97, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="relative w-full max-w-2xl overflow-hidden rounded-[14px] border border-line bg-[color-mix(in_srgb,var(--card)_88%,transparent)] shadow-overlay backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input: the row itself carries focus feedback (a quiet signal
            shift on its hairline) instead of the global outline ring. */}
        <div className="group flex items-center gap-3 border-b border-line px-4 py-3.5 transition-colors focus-within:border-[color-mix(in_srgb,var(--signal)_45%,var(--line))]">
          <Search
            size={16}
            className="flex-shrink-0 text-muted transition-colors group-focus-within:text-signal"
          />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search everything…"
            aria-label="Search everything"
            data-quiet-focus
            className="flex-1 bg-transparent font-mono text-[13px] tracking-[0.02em] text-ink outline-none placeholder:text-muted"
          />
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-ctl text-muted hover:text-ink transition-colors"
            title="Close search"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto custom-scrollbar">
          {!query.trim() && (
            <div className="px-4 py-8 text-center text-sm text-muted">
              Type to search the whole site
            </div>
          )}

          {query.trim() && results.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted">
              No results for “{query}”
            </div>
          )}

          {grouped.map((group) => (
            <div key={group.type}>
              <p className="m-0 flex items-center gap-2 px-4 pb-1 pt-3 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted">
                {group.type}
                <span className="h-px flex-1 bg-line" aria-hidden="true" />
              </p>
              {group.items.map((result) => {
                const Icon = TYPE_ICON[result.type] ?? Search;
                const index = flatIndex.get(result) ?? -1;
                const isSelected = index === selectedIndex;
                const external = /^https?:\/\//.test(result.href);
                const Arrow = external ? ArrowUpRight : ArrowRight;
                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSelect(result.href)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-150",
                      isSelected ? "bg-field/10" : "hover:bg-surface"
                    )}
                  >
                    <Icon
                      size={15}
                      className={cn(
                        "flex-shrink-0",
                        isSelected ? "text-signal" : "text-muted"
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink truncate">
                        {result.title}
                      </p>
                      {result.subtitle && (
                        <p className="text-xs text-muted truncate">
                          {result.subtitle}
                        </p>
                      )}
                    </div>
                    <Arrow
                      size={14}
                      className={cn(
                        "flex-shrink-0",
                        isSelected ? "text-signal" : "text-muted"
                      )}
                    />
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Keyboard hints */}
        <div className="px-4 py-2 border-t border-line flex items-center gap-4 font-mono text-[10px] text-muted">
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 border border-line rounded-ctl">↑↓</kbd> navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 border border-line rounded-ctl">↵</kbd> open
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 border border-line rounded-ctl">esc</kbd> close
          </span>
        </div>
      </m.div>
    </div>
  );
};
