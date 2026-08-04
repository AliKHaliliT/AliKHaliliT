import { m } from "framer-motion";
import { Heart } from "lucide-react";
import { useContent } from "@/entities/record";
import { PageHeader, EmptyState, StoryLink } from "@/shared/ui";
import { excerpt } from "@/shared/lib";
import { usePageDescription } from "@/entities/site";

const CATEGORY_ORDER = ["hobby", "sport", "creative", "technical", "social", "other"];

/** The interests, grouped by category. */
export const InterestsPage = () => {
  const { interests } = useContent();

  const grouped = interests.reduce<Record<string, typeof interests>>((acc, item) => {
    const cat = item.category || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  // Known categories keep their curated order; owner-invented ones follow
  // alphabetically instead of being silently dropped.
  const categories = [
    ...CATEGORY_ORDER.filter((c) => grouped[c]?.length),
    ...Object.keys(grouped)
      .filter((c) => !CATEGORY_ORDER.includes(c))
      .sort(),
  ];

  return (
    <div className="pb-12">

      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        <PageHeader
          eyebrow="Life"
          title="Interests"
          meta={`${interests.length} interest${interests.length !== 1 ? "s" : ""}`}
          description={usePageDescription("interests")}
        />

        {interests.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="No interests added yet."
            hint="Nothing logged here yet."
          />
        ) : (
          <div className="space-y-8">
            {categories.map((cat) => (
              <div key={cat}>
                <h2 className="font-mono text-eyebrow uppercase text-muted mb-1">
                  {cat}
                </h2>
                {/* A ledger, not cards: a bare interest is one quiet row, one
                    with prose grows, and nothing reserves empty space. */}
                <div className="border-t border-dashed border-line">
                  {grouped[cat].map((interest) => (
                    <div
                      key={interest.id}
                      className="flex flex-wrap items-baseline gap-x-5 gap-y-1 border-b border-dashed border-line px-1.5 py-3.5 sm:flex-nowrap"
                    >
                      <h3 className="m-0 w-full shrink-0 font-serif text-lg font-semibold leading-snug tracking-[-0.01em] text-ink sm:w-52">
                        {interest.title}
                      </h3>
                      {interest.body && (
                        <p className="m-0 min-w-0 flex-1 text-sm leading-relaxed text-muted">
                          {excerpt(interest.body, 160)}
                        </p>
                      )}
                      {interest.story && (
                        <StoryLink to={interest.story} className="ml-auto shrink-0">
                          More on this
                        </StoryLink>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </m.div>
    </div>
  );
};
