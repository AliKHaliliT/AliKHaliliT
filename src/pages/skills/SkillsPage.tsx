import { m } from "framer-motion";
import { Wrench } from "lucide-react";
import { useContent } from "@/entities/record";
import { PageHeader, EmptyState, Markdown, SkillMatrix } from "@/shared/ui";
import { parseKeyValue } from "@/shared/lib";
import { usePageDescription } from "@/entities/site";

/**
 * The dedicated home of the toolkit: every skill category from the profile,
 * spoken languages, and (when written) the owner's setup notes. The home
 * page's skill matrix links here; nothing on the home page is orphaned.
 */
export const SkillsPage = () => {
  const { settings } = useContent();
  const skills = settings.skills ? parseKeyValue(settings.skills) : [];
  const languages = settings.languages ? parseKeyValue(settings.languages) : [];
  const uses = settings.uses?.trim();
  const itemCount = skills.reduce((n, g) => n + g.items.length, 0);

  return (
    <div className="pb-12">
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        <PageHeader
          eyebrow="Career"
          title="Skills"
          meta={`${skills.length} ${skills.length === 1 ? "category" : "categories"} · ${itemCount} ${itemCount === 1 ? "entry" : "entries"}`}
          description={usePageDescription("skills")}
        />

        {skills.length === 0 && languages.length === 0 && !uses ? (
          <EmptyState icon={Wrench} title="No skills listed yet." />
        ) : (
          <div className="space-y-10">
            <SkillMatrix skills={skills} />

            {languages.length > 0 && (
              <section>
                <h2 className="mb-3 font-mono text-eyebrow uppercase text-muted">
                  Spoken languages
                </h2>
                <div className="border-t border-dashed border-line">
                  {languages.map((l) => (
                    <div
                      key={l.category}
                      className="flex flex-wrap items-baseline gap-x-5 gap-y-1 border-b border-dashed border-line px-1 py-3"
                    >
                      <span className="w-28 shrink-0 font-serif text-lg tracking-[-0.01em] text-ink">
                        {l.category}
                      </span>
                      <span className="font-mono text-xs tracking-[0.02em] text-muted">
                        {l.items.join(" · ")}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {uses && (
              <section>
                <h2 className="mb-3 font-mono text-eyebrow uppercase text-muted">
                  The setup
                </h2>
                <div className="prose dark:prose-invert prose-essay">
                  <Markdown>{uses}</Markdown>
                </div>
              </section>
            )}
          </div>
        )}
      </m.div>
    </div>
  );
};
