import { useMemo, useState } from "react";
import { m } from "framer-motion";
import { Library } from "lucide-react";
import { ItemModal } from "./ItemModal";
import { ShelfCard } from "./ShelfCard";
import { shelfIcon } from "./shelfIcon";
import { useContent, buildShelves, shelfFront, Shelf, ShelfItem } from "@/entities/record";
import { PageHeader, EmptyState, SectionBlock } from "@/shared/ui";
import { usePageDescription } from "@/entities/site";

/** How many covers a hub row shows before deferring to the shelf page. */
const FRONT_CAP = 5;

/** The stage tallies a shelf header wears: what is in hand, done, and waiting. */
const stageLine = (shelf: Shelf): string => {
  const tally = { current: 0, done: 0, queued: 0 };
  for (const item of shelf.items) tally[item.stage] += 1;
  return [
    tally.current > 0 ? `${tally.current} in hand` : "",
    tally.done > 0 ? `${tally.done} finished` : "",
    tally.queued > 0 ? `${tally.queued} queued` : "",
  ]
    .filter(Boolean)
    .join(" · ");
};

/**
 * The library as a hall of shelves: one chapter per category, fronting a few
 * covers each. A cover opens its detail here, in place; only the chapter's
 * "All N" link leaves for the shelf's own page, so the back button never has
 * to undo a peek.
 */
export const LibraryPage = () => {
  const { books, media } = useContent();
  const shelves = useMemo(() => buildShelves(books, media), [books, media]);
  const total = shelves.reduce((n, s) => n + s.items.length, 0);
  const [selected, setSelected] = useState<{ item: ShelfItem; shelfSlug: string } | null>(null);

  return (
    <div className="pb-12">
      <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
        <PageHeader
          eyebrow="Life"
          title="Library"
          meta={`${total} ${total === 1 ? "entry" : "entries"} · ${shelves.length} ${shelves.length === 1 ? "shelf" : "shelves"}`}
          description={usePageDescription("library")}
        />

        {shelves.length === 0 ? (
          <EmptyState
            icon={Library}
            title="The library is empty."
            hint="The shelves are still being stocked."
          />
        ) : (
          <div className="space-y-14">
            {shelves.map((shelf, index) => {
              const Icon = shelfIcon(shelf.slug);
              const front = shelfFront(shelf, FRONT_CAP);
              return (
                <SectionBlock
                  key={shelf.slug}
                  no={String(index + 1).padStart(3, "0")}
                  label={stageLine(shelf) || "Shelf"}
                  title={shelf.label}
                  href={`/library/${shelf.slug}`}
                  linkText={`All ${shelf.items.length}`}
                >
                  <div className="grid grid-cols-2 gap-6 pt-4 sm:grid-cols-3 md:grid-cols-5">
                    {front.map((item) => (
                      <div key={item.slug} onClick={() => setSelected({ item, shelfSlug: shelf.slug })}>
                        <ShelfCard item={item} icon={Icon} />
                      </div>
                    ))}
                  </div>
                </SectionBlock>
              );
            })}
          </div>
        )}
      </m.div>

      <ItemModal
        item={selected?.item ?? null}
        icon={shelfIcon(selected?.shelfSlug ?? "")}
        isOpen={!!selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
};
