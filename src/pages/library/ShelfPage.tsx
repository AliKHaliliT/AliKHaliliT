import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { m } from "framer-motion";
import { ArrowLeft, Library } from "lucide-react";
import { ItemModal } from "./ItemModal";
import { ShelfCard } from "./ShelfCard";
import { shelfIcon } from "./shelfIcon";
import { useContent, buildShelves, ShelfItem, ShelfStage } from "@/entities/record";
import { PageHeader, FilterBar, EmptyState } from "@/shared/ui";

const ALL = "All";

/** Stats and filter pills read queued, then in hand, then done: the reading order of a to-do. */
const STAGE_ORDER: Record<ShelfStage, number> = { queued: 0, current: 1, done: 2 };

/** One shelf of the library in full, filterable by its own status labels. */
export const ShelfPage = () => {
  const { shelf: shelfParam } = useParams();
  const { books, media } = useContent();
  const [filter, setFilter] = useState(ALL);

  const shelf = useMemo(
    () => buildShelves(books, media).find((s) => s.slug === shelfParam),
    [books, media, shelfParam]
  );

  // The URL may name an entry (search deep-links do); it seeds the modal once
  // and is cleared in place so the history never holds a modal-open state.
  const [params, setParams] = useSearchParams();
  const [selected, setSelected] = useState<ShelfItem | null>(() => {
    const wanted = params.get("item");
    return (wanted && shelf?.items.find((i) => i.slug === wanted)) || null;
  });
  useEffect(() => {
    if (params.get("item")) setParams({}, { replace: true });
  }, [params, setParams]);

  // Distinct status labels, stage-ordered, with their counts.
  const statuses = useMemo(() => {
    const counts = new Map<string, { count: number; stage: ShelfStage }>();
    for (const item of shelf?.items || []) {
      if (!item.status) continue;
      const entry = counts.get(item.status) || { count: 0, stage: item.stage };
      counts.set(item.status, { ...entry, count: entry.count + 1 });
    }
    return [...counts.entries()]
      .map(([label, { count, stage }]) => ({ label, count, stage }))
      .sort((a, b) => STAGE_ORDER[a.stage] - STAGE_ORDER[b.stage] || b.count - a.count);
  }, [shelf]);

  const visible = useMemo(() => {
    const items = shelf?.items || [];
    return filter === ALL ? items : items.filter((i) => i.status === filter);
  }, [shelf, filter]);

  if (!shelf) {
    return (
      <div className="pb-12">
        <EmptyState icon={Library} title="No such shelf." hint="The library holds no shelf by this name." />
        <div className="mt-6 flex justify-center">
          <Link
            to="/library"
            className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-muted transition-colors hover:text-signal"
          >
            <ArrowLeft size={12} /> Back to the library
          </Link>
        </div>
      </div>
    );
  }

  const Icon = shelfIcon(shelf.slug);

  return (
    <div className="pb-12">
      <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
        <Link
          to="/library"
          className="mb-4 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-muted transition-colors hover:text-signal"
        >
          <ArrowLeft size={12} /> Library
        </Link>

        <PageHeader
          eyebrow="Life · Library"
          title={shelf.label}
          meta={`${shelf.items.length} ${shelf.items.length === 1 ? "entry" : "entries"}`}
        />

        {statuses.length > 0 && (
          <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-3">
            {statuses.map((s) => (
              <div key={s.label} className="rounded-card border border-line bg-card p-5">
                <p className="font-mono text-eyebrow uppercase text-muted">{s.label}</p>
                <p className="mt-2 font-serif text-2xl font-semibold text-ink">{s.count}</p>
              </div>
            ))}
          </div>
        )}

        {statuses.length > 1 && (
          <FilterBar
            className="mb-6"
            value={filter}
            onChange={setFilter}
            options={[ALL, ...statuses.map((s) => s.label)].map((t) => ({ value: t, label: t }))}
          />
        )}

        {visible.length === 0 ? (
          <EmptyState
            icon={Icon}
            title="Nothing on this shelf."
            hint={filter !== ALL ? "Try a different filter." : "The shelf is still being stocked."}
          />
        ) : (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-5">
            {visible.map((item) => (
              <m.div
                layout
                key={item.slug}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                onClick={() => setSelected(item)}
              >
                <ShelfCard item={item} icon={Icon} />
              </m.div>
            ))}
          </div>
        )}
      </m.div>

      <ItemModal item={selected} icon={Icon} isOpen={!!selected} onClose={() => setSelected(null)} />
    </div>
  );
};
