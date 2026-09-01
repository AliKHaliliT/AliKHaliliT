import { ArrowUpRight, Star, X, type LucideIcon } from "lucide-react";
import { Modal, Badge, Markdown, SafeImage, SpineArt, StoryLink } from "@/shared/ui";
import { formatShortDate } from "@/shared/lib";
import { ShelfItem } from "@/entities/record";

interface ItemModalProps {
  item: ShelfItem | null;
  /** The shelf's placeholder glyph, shown when the item has no image. */
  icon: LucideIcon;
  isOpen: boolean;
  onClose: () => void;
}

/** One library entry in detail, whatever shelf it came from. */
export const ItemModal = ({ item, icon: Icon, isOpen, onClose }: ItemModalProps) => {
  if (!item) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} label={item.title}>
      {/* The close control gets its own strip so it never sits on content. */}
      <div className="flex items-center justify-end border-b border-line px-3 py-2">
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-ink"
          title="Close"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>
      <div className="relative flex flex-col gap-8 p-6 md:flex-row md:p-8">
        <div className="w-full flex-shrink-0 md:w-1/3">
          <div className="aspect-[2/3] overflow-hidden rounded-ctl border border-line bg-surface">
            <SafeImage
              src={item.image}
              alt={item.title}
              fallback={<SpineArt title={item.title} byline={item.byline} seed={item.slug} icon={Icon} />}
            />
          </div>
        </div>

        <div className="flex-1">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {item.status && (
              <Badge tone={item.stage === "current" ? "canopy" : "neutral"}>{item.status}</Badge>
            )}
            {item.date && <Badge>{formatShortDate(item.date)}</Badge>}
          </div>

          <h2 className="mb-1 font-serif text-2xl font-semibold text-ink">{item.title}</h2>
          {item.byline && <p className="mb-4 text-lg text-muted">{item.byline}</p>}

          {item.rating != null && (
            <div className="mb-4 flex items-center gap-1.5 text-signal">
              <Star size={15} className="fill-current" />
              <span className="font-mono text-[11px]">{item.rating}/5</span>
            </div>
          )}

          {item.desc && <p className="mb-6 leading-relaxed text-muted">{item.desc}</p>}

          {(item.body || "").trim() && (
            <div>
              <p className="mb-2 font-mono text-eyebrow uppercase text-muted">My notes</p>
              <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed text-muted prose-headings:font-serif prose-headings:font-semibold prose-h1:text-lg prose-h2:text-base prose-h3:text-base">
                <Markdown>{item.body || ""}</Markdown>
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-4">
            {item.story && <StoryLink to={item.story}>Read the full piece</StoryLink>}
            {item.link && (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-1.5 border-b border-line-strong pb-0.5 font-mono text-[11px] uppercase tracking-[0.1em] text-muted transition-colors hover:border-signal hover:text-signal"
              >
                Visit
                <ArrowUpRight size={12} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
