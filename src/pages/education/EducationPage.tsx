import { m } from "framer-motion";
import { GraduationCap, ExternalLink, MapPin } from "lucide-react";
import { useContent, Education, Course } from "@/entities/record";
import { cn, formatMonthYear } from "@/shared/lib";
import { PageHeader, EmptyState, Badge, TagList, Markdown } from "@/shared/ui";
import { usePageDescription } from "@/entities/site";

/** True when the title already carries a value (punctuation-insensitive), so
 *  the card never repeats itself: "Ph.D. Electrical and Computer Engineering"
 *  suppresses both the PhD chip and the field line. */
const says = (title: string, value: string) => {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");
  return norm(title).includes(norm(value));
};

function EducationCard({ item }: { item: Education }) {
  const ongoing = !item.endDate;

  return (
    <m.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="relative pl-8"
    >
      {/* Timeline node: signal while ongoing */}
      <div
        className={cn(
          "absolute left-0 top-[26px] h-[9px] w-[9px] -translate-x-[4px] rounded-full border-2 border-surface",
          ongoing ? "bg-signal" : "bg-line-strong"
        )}
      />

      <div className="rounded-card border border-line bg-card p-5">
        <div className="flex-1 min-w-0">
          {(item.startDate || item.endDate || item.gpa) && (
            <p className="font-mono text-[11px] text-muted mb-1.5">
              {(item.startDate || item.endDate) && (
                <>
                  {item.startDate ? formatMonthYear(item.startDate) : "?"}
                  {" – "}
                  {item.endDate ? formatMonthYear(item.endDate) : "Present"}
                </>
              )}
              {item.gpa && (
                <>
                  {(item.startDate || item.endDate) && " · "}
                  GPA {item.gpa}
                </>
              )}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-serif font-semibold text-ink text-base leading-snug">
              {item.title}
            </h3>
            {item.degree && !says(item.title, item.degree) && <Badge>{item.degree}</Badge>}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
            <span className="font-medium text-ink">
              {item.link ? (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-signal transition-colors duration-150"
                >
                  {item.institution}
                  <ExternalLink size={11} className="opacity-60" />
                </a>
              ) : (
                item.institution
              )}
            </span>
            {item.field && !says(item.title, item.field) && (
              <span className="text-xs">{item.field}</span>
            )}
            {item.location && (
              <span className="flex items-center gap-1 text-xs">
                <MapPin size={11} />
                {item.location}
              </span>
            )}
          </div>

          <TagList tags={item.tags} className="mt-2.5" />
        </div>

        {item.body && (
          <div className="mt-4 pt-4 border-t border-line">
            <div className="prose prose-sm dark:prose-invert max-w-none text-muted prose-li:my-0.5 prose-ul:my-1">
              <Markdown>{item.body}</Markdown>
            </div>
          </div>
        )}
      </div>
    </m.div>
  );
}

function CourseCard({ item }: { item: Course }) {
  return (
    <m.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-ctl border border-line bg-card p-4"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {item.date && (
            <p className="font-mono text-[11px] text-muted mb-1">
              {item.date}
            </p>
          )}
          <h3 className="font-semibold text-sm text-ink leading-snug">
            {item.title}
          </h3>
          <p className="text-xs text-muted mt-0.5">{item.provider}</p>
        </div>
        {item.link && (
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 text-muted hover:text-signal transition-colors duration-150"
          >
            <ExternalLink size={13} />
          </a>
        )}
      </div>
      <TagList tags={item.tags} className="mt-2.5" />
    </m.div>
  );
}

/** The education history, newest first. */
export const EducationPage = () => {
  const { education, courses } = useContent();

  // "Certificate"-typed entries share the timeline but shouldn't be counted
  // (or headed) as degrees.
  const certCount = education.filter(
    (e) => (e.degree || "").toLowerCase() === "certificate"
  ).length;
  const degreeCount = education.length - certCount;
  const meta = [
    degreeCount > 0 && `${degreeCount} degree${degreeCount !== 1 ? "s" : ""}`,
    certCount > 0 && `${certCount} certificate${certCount !== 1 ? "s" : ""}`,
    courses.length > 0 && `${courses.length} course${courses.length !== 1 ? "s" : ""}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <PageHeader
        eyebrow="Career"
        title="Education"
        meta={meta || "Nothing logged"}
        description={usePageDescription("education")}
      />

      {education.length === 0 && courses.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="Nothing logged yet."
          hint="Nothing logged here yet."
        />
      ) : (
        <div className="space-y-10">
          {/* Degrees */}
          {education.length > 0 && (
            <section className="space-y-5">
              <h2 className="font-mono text-eyebrow uppercase text-muted">
                {certCount > 0 ? "Degrees & Certificates" : "Degrees"}
              </h2>
              <div className="relative">
                {/* Vertical timeline line */}
                <div className="absolute left-0 top-6 bottom-6 w-px bg-line" />
                <div className="space-y-5">
                  {education.map((item) => (
                    <EducationCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Courses (certificates proper live at /certificates) */}
          {courses.length > 0 && (
            <section className="space-y-4">
              <h2 className="font-mono text-eyebrow uppercase text-muted">
                Courses & Continued Learning
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {courses.map((item) => (
                  <CourseCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </m.div>
  );
};
