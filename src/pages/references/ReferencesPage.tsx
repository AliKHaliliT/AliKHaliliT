import { m } from "framer-motion";
import { Users, Mail, Phone, ExternalLink } from "lucide-react";
import { useContent } from "@/entities/record";
import { PageHeader, EmptyState, ObfuscatedEmail } from "@/shared/ui";
import { usePageDescription } from "@/entities/site";

/** The references, with contact details obfuscated against scraping. */
export const ReferencesPage = () => {
  const { references } = useContent();

  return (
    <div className="pb-12">

      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        <PageHeader
          eyebrow="Career"
          title="References"
          meta={`${references.length} reference${references.length !== 1 ? "s" : ""}`}
          description={usePageDescription("references")}
        />

        {/* Ledger */}
        {references.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No references yet."
            hint="Available upon request."
          />
        ) : (
          <div className="rounded-card border border-line bg-card divide-y divide-line">
            {references.map((ref, i) => (
              <m.article
                key={ref.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: Math.min(i * 0.03, 0.3) }}
                className="flex gap-5 px-5 py-4 transition-colors duration-150 hover:bg-surface/60"
              >
                <div className="flex-1 min-w-0">
                  <h2 className="text-[15px] font-serif font-semibold text-ink leading-snug">
                    {ref.name}
                  </h2>
                  {ref.title && (
                    <p className="text-sm text-muted mt-1">
                      {ref.title}
                    </p>
                  )}
                  {(ref.relationship || ref.organization) && (
                    <p className="text-sm text-muted mt-0.5">
                      {[ref.relationship, ref.organization].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  {ref.body && (
                    <p className="text-sm text-muted italic leading-relaxed mt-2">
                      {ref.body}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  <div className="flex items-center gap-1">
                    {ref.email && (
                      <ObfuscatedEmail
                        email={ref.email}
                        className="p-1.5 rounded-ctl text-muted hover:text-signal transition-colors duration-150"
                      >
                        <Mail size={15} />
                      </ObfuscatedEmail>
                    )}
                    {ref.phone && (
                      <a
                        href={`tel:${ref.phone}`}
                        className="p-1.5 rounded-ctl text-muted hover:text-signal transition-colors duration-150"
                        title={ref.phone}
                        aria-label={`Call ${ref.name}`}
                      >
                        <Phone size={15} />
                      </a>
                    )}
                    {ref.link && (
                      <a
                        href={ref.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-ctl text-muted hover:text-signal transition-colors duration-150"
                        title="Profile"
                        aria-label={`View ${ref.name}'s profile`}
                      >
                        <ExternalLink size={15} />
                      </a>
                    )}
                  </div>
                </div>
              </m.article>
            ))}
          </div>
        )}
      </m.div>
    </div>
  );
};
