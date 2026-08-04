import { m } from "framer-motion";
import { Building2, ExternalLink } from "lucide-react";
import { useContent } from "@/entities/record";
import { PageHeader, EmptyState, Badge } from "@/shared/ui";
import { formatMonthYear } from "@/shared/lib";
import { usePageDescription } from "@/entities/site";

const dateRange = (start?: string, end?: string) => {
  if (!start && !end) return undefined;
  return `${start ? formatMonthYear(start) : ""} – ${
    end ? formatMonthYear(end) : "Present"
  }`;
};

/** The memberships and affiliations. */
export const OrganizationsPage = () => {
  const { organizations } = useContent();

  return (
    <div className="pb-12">

      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        <PageHeader
          eyebrow="Career"
          title="Organizations"
          meta={`${organizations.length} membership${organizations.length !== 1 ? "s" : ""}`}
          description={usePageDescription("organizations")}
        />

        {/* Ledger */}
        {organizations.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No organizations yet."
            hint="Nothing logged here yet."
          />
        ) : (
          <div className="rounded-card border border-line bg-card divide-y divide-line">
            {organizations.map((org, i) => {
              const range = dateRange(org.startDate, org.endDate);
              const startYear = org.startDate?.slice(0, 4);
              return (
                <m.article
                  key={org.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: Math.min(i * 0.03, 0.3) }}
                  className="flex gap-5 px-5 py-4 transition-colors duration-150 hover:bg-surface/60"
                >
                  {/* Year rail */}
                  <div className="hidden sm:block w-12 shrink-0 pt-0.5">
                    <span className="font-mono text-[11px] text-muted">
                      {startYear ?? "-"}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h2 className="text-[15px] font-serif font-semibold text-ink leading-snug">
                      {org.title}
                    </h2>
                    {(org.role || org.location) && (
                      <p className="text-sm text-muted mt-1">
                        {[org.role, org.location].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    {range && (
                      <p className="font-mono text-[11px] text-muted mt-1.5">
                        {range}
                      </p>
                    )}
                    {org.body && (
                      <p
                        className="text-sm text-muted leading-relaxed mt-2"
                        dangerouslySetInnerHTML={{ __html: org.body }}
                      />
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    {org.memberType && <Badge>{org.memberType}</Badge>}
                    {org.website && (
                      <a
                        href={org.website}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-ctl text-muted hover:text-signal transition-colors duration-150"
                        title="Website"
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
