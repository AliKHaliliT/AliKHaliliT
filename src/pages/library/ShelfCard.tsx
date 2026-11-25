import { Star, StarHalf, type LucideIcon } from "lucide-react";
import { Badge, SafeImage, SpineArt } from "@/shared/ui";
import { ShelfItem } from "@/entities/record";

/**
 * One cover on a shelf: the image (or its drawn spine), the status, the
 * title, the byline, and the rating. Purely presentational; the hub wraps it
 * in a link and the shelf page in a button.
 */
export const ShelfCard = ({ item, icon: Icon }: { item: ShelfItem; icon: LucideIcon }) => (
  <div className="group flex cursor-pointer flex-col gap-3 text-left">
    <div className="aspect-[2/3] overflow-hidden rounded-ctl border border-line bg-surface">
      <SafeImage
        src={item.image}
        alt={item.title}
        className="transition-transform duration-200 group-hover:scale-[1.02]"
        fallback={<SpineArt title={item.title} byline={item.byline} seed={item.slug} icon={Icon} />}
      />
    </div>

    <div>
      {item.status && (
        <Badge tone={item.stage === "current" ? "canopy" : "neutral"}>{item.status}</Badge>
      )}
      <h3 className="mt-2 line-clamp-1 font-semibold text-ink transition-colors duration-150 group-hover:text-signal">
        {item.title}
      </h3>
      {item.byline && <p className="text-sm text-muted">{item.byline}</p>}

      {item.rating != null && item.rating > 0 && (
        <div className="mt-1 flex gap-0.5 text-signal">
          {[...Array(5)].map((_, i) => {
            const rating = item.rating ?? 0;
            const full = rating >= i + 1;
            return (
              <span key={i} className="relative inline-flex">
                <Star size={12} fill={full ? "currentColor" : "none"} className={full ? "" : "text-line-strong"} />
                {!full && rating >= i + 0.5 && <StarHalf size={12} fill="currentColor" className="absolute inset-0" />}
              </span>
            );
          })}
        </div>
      )}
    </div>
  </div>
);
