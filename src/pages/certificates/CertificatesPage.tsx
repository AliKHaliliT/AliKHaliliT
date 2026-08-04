import { useState } from "react";
import { m } from "framer-motion";
import { Award, ExternalLink } from "lucide-react";
import { useContent } from "@/entities/record";
import { PageHeader, FilterBar, EmptyState, Badge } from "@/shared/ui";
import { usePageDescription } from "@/entities/site";

const TYPE_ORDER = ["technical", "professional", "academic", "language", "other"] as const;

/** The certificate ledger, filterable by kind. */
export const CertificatesPage = () => {
  const { certificates } = useContent();
  const [filter, setFilter] = useState<string>("all");

  // Only offer pills for types that actually have entries.
  const presentTypes = TYPE_ORDER.filter((t) =>
    certificates.some((c) => (c.certType || "other") === t)
  );

  const visible = filter === "all" ? certificates : certificates.filter((c) => c.certType === filter);

  return (
    <div className="pb-12">

      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        <PageHeader
          eyebrow="Career"
          title="Certificates"
          meta={`${certificates.length} credential${certificates.length !== 1 ? "s" : ""}`}
          description={usePageDescription("certificates")}
        />

        {presentTypes.length > 1 && (
          <FilterBar
            className="mb-6"
            value={filter}
            onChange={setFilter}
            options={["all", ...presentTypes].map((t) => ({
              value: t,
              label: t.charAt(0).toUpperCase() + t.slice(1),
            }))}
          />
        )}

        {/* Ledger */}
        {visible.length === 0 ? (
          <EmptyState
            icon={Award}
            title="No certificates found."
            hint={
              filter !== "all"
                ? "Try a different filter."
                : "Nothing logged here yet."
            }
          />
        ) : (
          <div className="rounded-card border border-line bg-card divide-y divide-line">
            {visible.map((cert, i) => {
              const year = cert.date?.slice(0, 4);
              return (
                <m.article
                  key={cert.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: Math.min(i * 0.03, 0.3) }}
                  className="flex gap-5 px-5 py-4 transition-colors duration-150 hover:bg-surface/60"
                >
                  {/* Year rail */}
                  <div className="hidden sm:block w-12 shrink-0 pt-0.5">
                    <span className="font-mono text-[11px] text-muted">
                      {year ?? "-"}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h2 className="text-[15px] font-serif font-semibold text-ink leading-snug">
                      {cert.title}
                    </h2>
                    <p className="text-sm text-muted mt-1">
                      {cert.issuer}
                      {year && (
                        <span className="sm:hidden font-mono text-[11px]">
                          {" "}· {year}
                        </span>
                      )}
                    </p>
                    {cert.credentialId && (
                      <p className="font-mono text-[11px] text-muted mt-1.5">
                        ID {cert.credentialId}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    {cert.certType && <Badge>{cert.certType}</Badge>}
                    {cert.link && (
                      <a
                        href={cert.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-ctl text-muted hover:text-signal transition-colors duration-150"
                        title="View credential"
                      >
                        <ExternalLink size={15} />
                      </a>
                    )}
                  </div>
                </m.article>
              );
            })}
          </div>
        )}
      </m.div>
    </div>
  );
};
