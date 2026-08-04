import { ReactNode, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { animate, m, useInView, useReducedMotion } from "framer-motion";
import {
  ArrowRight, ArrowUpRight, BookOpen, Github, Globe, GraduationCap, Link2,
  Linkedin, MapPin, Phone, Twitter,
} from "lucide-react";
import { ObfuscatedEmail, SkillMatrix, AmbientField, Badge, PillLink, PixelBand, SectionBlock, TagList, DraftingPlot } from "@/shared/ui";
import { parseKeyValue, formatMonthYearRange, formatShortDate, excerpt, firstLine, parseProfileLinks, LINK_ICONS } from "@/shared/lib";
import { useContent, EMPLOYMENT_TYPE_LABEL, typeLabel } from "@/entities/record";
import { useSiteIdentity, siteMark } from "@/entities/site";

/** "1 paper", "3 papers": CountCell units read as prose. */
const plural = (n: number, unit: string) => (n === 1 ? unit : `${unit}s`);


/** Meter behavior for count cells: ticks up from zero the first time it
 *  scrolls into view. Renders the true value immediately so the number is
 *  correct without observers, and stays put under reduced motion. */
const CountUp = ({ value }: { value: number }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView || reduced || value <= 0) return;
    const controls = animate(0, value, {
      duration: 0.9,
      ease: [0.2, 0.7, 0.2, 1],
      onUpdate: (v) => {
        el.textContent = String(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [inView, value, reduced]);

  return <span ref={ref}>{value}</span>;
};

/** Shared reveal: sections rise into view once, standing down with reduced motion. */
const Rise = ({ children, className }: { children: ReactNode; className?: string }) => (
  <m.div
    className={className}
    initial={{ opacity: 0, y: 12 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.1 }}
    transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
  >
    {children}
  </m.div>
);

/* ── Hero ─────────────────────────────────────────────────────────── */

const Hero = () => {
  const { settings } = useContent();
  const site = useSiteIdentity();
  const year = new Date().getFullYear();

  // Email is deliberately NOT a mailto link (scraper bait): it renders as an
  // obfuscated copy-chip after the icon squares instead.
  const socials = [
    { icon: Phone, link: settings.phone ? `tel:${settings.phone}` : undefined, label: "Phone" },
    { icon: Globe, link: settings.website, label: "Website" },
    { icon: Github, link: settings.github, label: "GitHub" },
    { icon: Linkedin, link: settings.linkedin, label: "LinkedIn" },
    { icon: Twitter, link: settings.twitter, label: "Twitter" },
    { icon: GraduationCap, link: settings.scholar, label: "Scholar" },
    { icon: BookOpen, link: settings.medium, label: "Medium" },
    { icon: Link2, link: settings.orcid, label: "ORCID" },
  ].filter((s) => s.link);

  // Owner-defined links (Kaggle, Hugging Face, anything): labeled chips
  // alongside the icon squares. The hero shows at most 12; a "+N" chip
  // points at the footer, where the complete set always lives.
  const allCustomLinks = parseProfileLinks(settings.links);
  const customLinks = allCustomLinks.slice(0, 12);
  const hiddenLinks = allCustomLinks.length - customLinks.length;

  const [firstName, ...rest] = (settings.name || "Your Name").split(" ");
  const restName = rest.join(" ");

  return (
    <section className="relative overflow-hidden pb-14 pt-10 md:pb-20 md:pt-16">
      {/* Fireflies drift behind the masthead; the outlined mark sits above them. */}
      <AmbientField variant="hero" className="absolute inset-0" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-2 top-0 select-none font-serif text-[clamp(8rem,22vw,17rem)] font-semibold leading-[0.8] tracking-[-0.04em] text-transparent [-webkit-text-stroke:1px_var(--line)]"
      >
        {siteMark(site)}
      </div>

      <div className="relative">
        <m.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
          className="flex flex-wrap items-center gap-2.5"
        >
          {settings.avatar && (
            <img
              src={settings.avatar}
              alt={settings.name || "Profile"}
              className="h-9 w-9 rounded-ctl border border-line-strong object-cover"
            />
          )}
          <Badge>Dossier · {year}</Badge>
          {settings.role && <Badge>Role · {settings.role}</Badge>}
          {settings.location && (
            <Badge>
              <MapPin size={10} aria-hidden="true" /> {settings.location}
              {settings.nationality ? ` · ${settings.nationality}` : ""}
            </Badge>
          )}
          {settings.workMode && <Badge>{settings.workMode}</Badge>}
          {settings.availability && <Badge tone="signal">{settings.availability}</Badge>}
        </m.div>

        <h1 className="mt-8 font-serif font-semibold leading-[0.98] tracking-[-0.035em] text-ink">
          {/* pb + negative mb widen the reveal mask so serif descenders
              (g, y) survive the leading-[0.98] line box. */}
          <span className="-mb-[0.15em] block overflow-hidden pb-[0.15em] text-[clamp(3rem,8.5vw,6.5rem)]">
            <m.span
              className="block"
              initial={{ y: "115%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.65, ease: [0.2, 0.7, 0.2, 1] }}
            >
              {firstName} {restName.split(" ")[0] || ""}
            </m.span>
          </span>
          {restName.split(" ").length > 1 && (
            <span className="-mb-[0.15em] block overflow-hidden pb-[0.15em] text-[clamp(2rem,5.8vw,4.5rem)] text-muted">
              <m.span
                className="block"
                initial={{ y: "115%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.65, delay: 0.08, ease: [0.2, 0.7, 0.2, 1] }}
              >
                {restName.split(" ").slice(1).join(" ")}
              </m.span>
            </span>
          )}
        </h1>

        {(settings.bio || settings.body) && (
          <m.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="mt-6 max-w-[36ch] font-serif text-[clamp(1.15rem,2.2vw,1.6rem)] italic leading-snug text-muted"
          >
            {settings.bio || settings.body}
          </m.p>
        )}

        <m.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.25 }}
          className="mt-9 flex flex-wrap items-center gap-3.5"
        >
          <PillLink to="/experience">View the record</PillLink>
          <PillLink to="/blog" variant="ghost">
            Read the writing
          </PillLink>
          {(socials.length > 0 || customLinks.length > 0) && (
            <span className="ml-1 flex flex-wrap gap-1.5">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.link || "#"}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-ctl border border-line-strong text-muted transition-[color,border-color,transform] duration-150 hover:-translate-y-px hover:border-signal hover:text-signal active:scale-95"
                >
                  <s.icon size={14} />
                </a>
              ))}
              {settings.email && (
                <ObfuscatedEmail
                  email={settings.email}
                  className="flex h-9 items-center rounded-ctl border border-line-strong px-2.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted transition-[color,border-color,transform] duration-150 hover:-translate-y-px hover:border-signal hover:text-signal active:scale-95"
                />
              )}
              {customLinks.map((l) => {
                const Icon = l.icon ? LINK_ICONS[l.icon] : undefined;
                const base =
                  "flex h-9 items-center rounded-ctl border border-line-strong text-muted transition-[color,border-color,transform] duration-150 hover:-translate-y-px hover:border-signal hover:text-signal active:scale-95";
                const chip = `${base} px-2.5 font-mono text-[10px] uppercase tracking-[0.1em]`;
                if (l.url.startsWith("mailto:")) {
                  return (
                    <ObfuscatedEmail
                      key={`${l.label}-${l.url}`}
                      email={l.url.slice(7)}
                      title={`${l.label} · click to copy`}
                      className={chip}
                    />
                  );
                }
                return (
                  <a
                    key={`${l.label}-${l.url}`}
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={Icon ? l.label : undefined}
                    title={Icon ? l.label : undefined}
                    className={Icon ? `${base} w-9 justify-center` : chip}
                  >
                    {Icon ? <Icon size={14} /> : l.label}
                  </a>
                );
              })}
              {hiddenLinks > 0 && (
                <a
                  href="#site-footer"
                  title="All links live in the footer"
                  className="flex h-9 items-center rounded-ctl border border-dashed border-line-strong px-2.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted transition-[color,border-color,transform] duration-150 hover:-translate-y-px hover:border-signal hover:text-signal active:scale-95"
                >
                  +{hiddenLinks}
                </a>
              )}
            </span>
          )}
        </m.div>
      </div>
    </section>
  );
};

/** The trailing cell of a ledger row: an outbound anchor to the item's own
    link when it has one, an inert arrow otherwise. Sits above the row's
    stretched link, so the two click targets never nest. */
const RowOut = ({ link, label }: { link?: string; label: string }) => {
  if (!link)
    return (
      <ArrowRight
        size={14}
        className="text-muted transition-transform group-hover:translate-x-1 group-hover:text-signal"
      />
    );
  return (
    <a
      href={link}
      target="_blank"
      rel="noreferrer"
      aria-label={`Open ${label} directly`}
      title="Open directly"
      className="relative z-10 flex h-7 w-7 items-center justify-center self-center justify-self-end rounded-ctl text-muted transition-colors hover:bg-field/10 hover:text-signal"
    >
      <ArrowUpRight size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </a>
  );
};

/* ── 001 Telemetry ────────────────────────────────────────────────── */

/** The Now chapter reads straight from the updates feed: nothing on the home
 *  page is orphaned, so "what's happening" belongs to /updates, not to loose
 *  profile strings. Hidden while the feed is empty. */
const NowSection = () => {
  const { updates } = useContent();
  const latest = updates.slice(0, 3);
  if (latest.length === 0) return null;

  return (
    <SectionBlock no="001" label="Telemetry" title="Now" href="/updates" linkText="All updates">
      <Rise>
        <div className="mb-2 mt-5 border-t border-dashed border-line">
          {latest.map((u) => (
            <div
              key={u.id}
              className="group relative grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-dashed border-line px-1.5 py-4 transition-colors hover:bg-field/5 sm:grid-cols-[6.5rem_1fr_auto_auto]"
            >
              <Link to="/updates" aria-label="All updates" className="absolute inset-0" />
              <span className="hidden font-mono text-[11px] tabular-nums tracking-[0.03em] text-muted sm:block">
                {u.date ? formatShortDate(u.date).toUpperCase() : "-"}
              </span>
              <span className="truncate font-serif text-lg tracking-[-0.01em]">
                {u.body ? excerpt(u.body, 110) : u.linkTitle || "Update"}
              </span>
              <Badge tone={u.updateType === "milestone" ? "signal" : "neutral"}>
                {u.updateType || "note"}
              </Badge>
              <RowOut link={u.link} label={u.linkTitle || "this update"} />
            </div>
          ))}
        </div>
      </Rise>
    </SectionBlock>
  );
};

/* ── 002 Toolkit ──────────────────────────────────────────────────── */

const ToolkitSection = () => {
  const { settings } = useContent();
  const skills = settings.skills ? parseKeyValue(settings.skills) : [];
  const languages = settings.languages ? parseKeyValue(settings.languages) : [];
  // Spoken languages; relabeled when a "Languages" skills category exists.
  const spokenLabel = skills.some((s) => s.category.toLowerCase() === "languages")
    ? "Spoken"
    : "Languages";
  if (skills.length === 0 && languages.length === 0) return null;

  return (
    <SectionBlock no="002" label="Toolkit" title="Skills" href="/skills" linkText="Full toolkit">
      <Rise>
        {skills.length > 0 && (
          <div className="mb-4 mt-5">
            <SkillMatrix skills={skills} maxItems={8} />
          </div>
        )}
        {languages.length > 0 && (
          <div className="mb-2 flex flex-wrap items-center gap-1.5 px-1">
            <span className="mr-3 font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-muted">
              {spokenLabel}
            </span>
            {languages.map((l) => (
              <span
                key={l.category}
                className="flex items-baseline gap-2 rounded-ctl border border-line px-2.5 py-1.5"
              >
                <span className="font-serif text-sm font-semibold leading-none text-ink">
                  {l.category}
                </span>
                {l.items[0] && (
                  <span className="font-mono text-[10px] uppercase leading-none tracking-[0.06em] text-muted">
                    {l.items[0]}
                  </span>
                )}
              </span>
            ))}
          </div>
        )}
      </Rise>
    </SectionBlock>
  );
};

/* ── 003 Career ───────────────────────────────────────────────────── */

const CareerSection = () => {
  const { experience, education } = useContent();
  const stack = experience.slice(0, 3);
  const degrees = education.slice(0, 4);
  const stickyTops = ["top-[84px]", "top-[108px]", "top-[132px]"];

  if (experience.length === 0 && education.length === 0) return null;

  return (
    <SectionBlock no="003" label="Career" title="Experience" href="/experience" linkText="All positions">
      <div className="mt-4 pb-10">
        {/* The cards' sticky scope must end here: if the education ledger
            shared this container, it would scroll underneath the stuck cards. */}
        <div>
        {stack.map((item, i) => (
          <article
            key={item.id}
            className={`sticky ${stickyTops[i] ?? "top-[132px]"} mb-5 rounded-card border border-line-strong bg-card p-6 shadow-lift md:p-8`}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 className="font-serif text-[clamp(1.35rem,2.6vw,1.9rem)] font-semibold tracking-[-0.02em]">
                {item.title}
              </h3>
              <span className="flex items-center gap-2.5 text-sm font-medium text-muted">
                {item.company}
                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Open ${item.company} directly`}
                    title="Open directly"
                    className="flex h-8 w-8 items-center justify-center rounded-ctl border border-line-strong text-muted transition-[color,border-color,transform] duration-150 hover:-translate-y-px hover:border-signal hover:text-signal"
                  >
                    <ArrowUpRight size={13} />
                  </a>
                )}
              </span>
            </div>
            {firstLine(item.body) && (
              <p className="mt-3 max-w-[64ch] text-[15px] leading-relaxed text-muted">
                {firstLine(item.body)}
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone={!item.endDate ? "signal" : "neutral"}>
                {formatMonthYearRange(item.startDate, item.endDate)}
              </Badge>
              {item.employmentType && (
                <Badge>{typeLabel(EMPLOYMENT_TYPE_LABEL, item.employmentType)}</Badge>
              )}
              {item.location && <Badge>{item.location}</Badge>}
            </div>
            <TagList tags={item.tags} max={6} className="mt-4" />
          </article>
        ))}
        </div>

        {education.length > 0 && (
          <Rise className="mt-10">
            <p className="mb-1 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted">
              Education
            </p>
            <div className="border-t border-dashed border-line">
              {degrees.map((e) => (
                <div
                  key={e.id}
                  className="group relative grid grid-cols-[1fr_auto] items-baseline gap-4 border-b border-dashed border-line px-1 py-3.5 transition-colors hover:bg-field/5 sm:grid-cols-[auto_1fr_auto]"
                >
                  <Link to="/education" aria-label="All education" className="absolute inset-0" />
                  <span className="hidden font-mono text-[11px] tabular-nums text-muted sm:block sm:w-40">
                    {formatMonthYearRange(e.startDate, e.endDate)}
                  </span>
                  <span className="font-serif text-lg tracking-[-0.01em]">
                    {e.title}
                    <span className="text-muted"> · {e.institution}</span>
                  </span>
                  <RowOut link={e.link} label={e.institution} />
                </div>
              ))}
              {education.length > degrees.length && (
                <Link
                  to="/education"
                  className="group flex items-center gap-2 border-b border-dashed border-line px-1 py-3.5 font-mono text-[11px] uppercase tracking-[0.1em] text-muted transition-colors hover:bg-field/5 hover:text-signal"
                >
                  +{education.length - degrees.length} more · all education
                  <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                </Link>
              )}
            </div>
          </Rise>
        )}
      </div>
    </SectionBlock>
  );
};

/* ── 005 Honors & output ──────────────────────────────────────────── */

const CountCell = ({
  label,
  count,
  unit,
  latest,
  href,
  linkText,
  border,
}: {
  label: string;
  count: number;
  unit: string;
  latest?: string;
  href: string;
  linkText: string;
  border?: boolean;
}) => (
  <div
    className={`flex flex-col gap-2.5 bg-card p-6 ${
      border ? "border-b border-dashed border-line lg:border-b-0 lg:border-r" : ""
    }`}
  >
    <Badge className="self-start">{label}</Badge>
    <p className="m-0 font-serif text-4xl font-semibold leading-none tracking-[-0.03em]">
      <CountUp value={count} />{" "}
      <span className="font-serif text-base font-normal italic tracking-normal text-muted">
        {unit}
      </span>
    </p>
    {latest && (
      <p className="m-0 text-sm leading-snug text-muted">{latest}</p>
    )}
    <Link
      to={href}
      className="group mt-auto flex w-fit items-center gap-1.5 border-b border-line-strong pb-0.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-muted transition-colors hover:border-signal hover:text-signal"
    >
      {linkText}
      <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
    </Link>
  </div>
);

/** Grid column classes per visible cell count (Tailwind needs literals). */
const CELL_COLS: Record<number, string> = {
  1: "",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

const HonorsSection = () => {
  const { awards, certificates, publications, speaking } = useContent();
  // Empty records hide instead of bragging about zero.
  const cells = [
    { label: "Awards", count: awards.length, unit: plural(awards.length, "honor"), latest: awards[0]?.title, href: "/awards" },
    { label: "Certificates", count: certificates.length, unit: "earned", latest: certificates[0]?.title, href: "/certificates" },
    { label: "Publications", count: publications.length, unit: plural(publications.length, "paper"), latest: publications[0]?.title, href: "/publications" },
    { label: "Speaking", count: speaking.length, unit: speaking.length === 1 ? "entry" : "entries", latest: speaking[0]?.title, href: "/speaking" },
  ].filter((c) => c.count > 0);
  if (cells.length === 0) return null;

  return (
    <SectionBlock no="005" label="Recognition" title="Honors & output">
      <Rise>
        <div className={`mb-2 mt-5 grid overflow-hidden rounded-card border border-dashed border-line ${CELL_COLS[cells.length]}`}>
          {cells.map((c, i) => (
            <CountCell
              key={c.label}
              border={i < cells.length - 1}
              label={c.label}
              count={c.count}
              unit={c.unit}
              latest={c.latest}
              href={c.href}
              linkText="Open record"
            />
          ))}
        </div>
      </Rise>
    </SectionBlock>
  );
};

/* ── 004 Selected work ────────────────────────────────────────────── */

/** The featured card's click surface: outbound to the project's link, or
    into the projects record when the entry has none. */
const FeaturedCardShell = ({ link, children }: { link?: string; children: React.ReactNode }) => {
  const cls =
    "group mb-2 mt-5 grid overflow-hidden rounded-card border border-line-strong bg-card transition-all duration-200 hover:-translate-y-px hover:shadow-lift md:grid-cols-[1.15fr_0.85fr]";
  return link ? (
    <a href={link} target="_blank" rel="noopener noreferrer" className={cls}>
      {children}
    </a>
  ) : (
    <Link to="/projects" className={cls}>
      {children}
    </Link>
  );
};

const WorkSection = () => {
  const { projects } = useContent();
  const featured = projects.find((p) => p.featured) ?? projects[0];
  const rest = projects.filter((p) => p !== featured).slice(0, 3);
  const featuredDesc = featured?.desc || firstLine(featured?.body || featured?.fullDesc, 180);

  if (projects.length === 0) return null;

  return (
    <SectionBlock no="004" label="Selected work" title="Projects" href="/projects" linkText="All projects">
      {featured && (
        <Rise>
          {/* The whole card is one click target: the project's own link when
              it has one, the projects record otherwise. */}
          <FeaturedCardShell link={featured.link}>
            <div className="flex flex-col gap-4 p-7 md:p-9">
              <div className="flex items-start justify-between gap-4">
                <Badge tone="signal">Featured</Badge>
                {featured.link ? (
                  <ArrowUpRight
                    size={18}
                    className="text-muted transition-colors group-hover:text-signal"
                  />
                ) : (
                  <ArrowRight
                    size={18}
                    className="text-muted transition-colors group-hover:text-signal"
                  />
                )}
              </div>
              <h3 className="m-0 font-serif text-[clamp(1.5rem,3vw,2.25rem)] font-semibold tracking-[-0.02em] transition-colors duration-150 group-hover:text-signal">
                {featured.title}
              </h3>
              {featuredDesc && (
                <p className="m-0 max-w-[52ch] text-[15px] leading-relaxed text-muted">
                  {featuredDesc}
                </p>
              )}
              <div className="mt-auto flex flex-wrap gap-2 pt-2">
                {featured.role && <Badge>Role · {featured.role}</Badge>}
                {featured.year && <Badge>Since · {featured.year}</Badge>}
                {featured.stats && <Badge>{featured.stats}</Badge>}
              </div>
            </div>
            <div
              aria-hidden={featured.image ? undefined : true}
              className="relative min-h-56 border-t border-dashed border-line bg-[color-mix(in_srgb,var(--field)_10%,var(--card))] [background-image:linear-gradient(color-mix(in_srgb,var(--line)_55%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_srgb,var(--line)_55%,transparent)_1px,transparent_1px)] [background-size:26px_26px] md:border-l md:border-t-0"
            >
              {featured.image ? (
                <img src={featured.image} alt={featured.title} className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <DraftingPlot title={featured.title} year={featured.year} />
              )}
            </div>
          </FeaturedCardShell>
        </Rise>
      )}
      {rest.length > 0 && (
        <Rise>
          <div className="mb-2 border-t border-dashed border-line">
            {rest.map((p) => (
              <div
                key={p.id}
                className="group relative grid grid-cols-[1fr_auto] items-baseline gap-4 border-b border-dashed border-line px-1 py-3.5 transition-colors hover:bg-field/5 sm:grid-cols-[1fr_auto_auto]"
              >
                <Link to="/projects" aria-label="All projects" className="absolute inset-0" />
                <span className="truncate font-serif text-lg tracking-[-0.01em]">
                  {p.title}
                  {p.role && <span className="text-muted"> · {p.role}</span>}
                </span>
                {p.year && (
                  <span className="hidden font-mono text-[11px] tabular-nums text-muted sm:block">
                    {p.year}
                  </span>
                )}
                <RowOut link={p.link} label={p.title} />
              </div>
            ))}
            {projects.length > rest.length + 1 && (
              <p className="mb-0 px-1 py-3 font-mono text-[11px] text-muted">
                + {projects.length - rest.length - 1} more in the record
              </p>
            )}
          </div>
        </Rise>
      )}
    </SectionBlock>
  );
};

/* ── 006 Field notes ──────────────────────────────────────────────── */

const NotesSection = () => {
  const { blog, posts, updates } = useContent();

  const rows: Array<{ key: string; date?: string; title: string; kind: string; live?: boolean; href: string; ext?: boolean }> = [
    ...blog.slice(0, 3).map((p) => ({
      key: `b-${p.id}`, date: p.date, title: p.title, kind: "Blog",
      href: p.externalUrl || `/blog/${p.slug}`, ext: Boolean(p.externalUrl),
    })),
    ...posts.slice(0, 2).map((p) => ({
      key: `g-${p.id}`, date: p.date, title: p.title, kind: p.postType || "Garden",
      live: p.postType === "Evergreen", href: `/garden/${p.slug}`,
    })),
    ...updates.slice(0, 2).map((u) => ({
      key: `u-${u.id}`, date: u.date, title: u.body ? excerpt(u.body, 64) : "Update", kind: u.updateType || "Note", href: "/updates",
    })),
  // Per-type caps keep the mix; the ledger itself must read chronologically.
  ].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));

  if (rows.length === 0) return null;

  return (
    <SectionBlock no="006" label="Field notes" title="Writing" href="/blog" linkText="All writing">
      <Rise>
        <div className="mb-2 mt-5 border-t border-dashed border-line">
          {rows.map((row) => {
            const rowClass =
              "group grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-dashed border-line px-1.5 py-4 transition-colors hover:bg-field/5 sm:grid-cols-[6.5rem_1fr_auto_auto]";
            const inner = (
              <>
                <span className="hidden font-mono text-[11px] tabular-nums tracking-[0.03em] text-muted sm:block">
                  {row.date ? formatShortDate(row.date).toUpperCase() : "-"}
                </span>
                <span className="truncate font-serif text-lg tracking-[-0.01em]">{row.title}</span>
                <Badge tone={row.live ? "signal" : "neutral"}>{row.kind}</Badge>
                {row.ext ? (
                  <ArrowUpRight
                    size={14}
                    className="text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-signal"
                  />
                ) : (
                  <ArrowRight
                    size={14}
                    className="text-muted transition-transform group-hover:translate-x-1 group-hover:text-signal"
                  />
                )}
              </>
            );
            // Off-site pieces get a real outbound anchor, not a route.
            return row.ext ? (
              <a key={row.key} href={row.href} target="_blank" rel="noreferrer" className={rowClass}>
                {inner}
              </a>
            ) : (
              <Link key={row.key} to={row.href} className={rowClass}>
                {inner}
              </Link>
            );
          })}
        </div>
      </Rise>
    </SectionBlock>
  );
};

/* ── 007 Elsewhere ────────────────────────────────────────────────── */

const ElsewhereSection = () => {
  const { books, countries, trips, interests, volunteering, organizations } = useContent();
  const reading = books.find((b) => b.status === "Reading");
  const readCount = books.filter((b) => b.status === "Read").length;
  const interestChips = interests.slice(0, 8);
  const shownCountries = countries.slice(0, 12);

  // Same rule as Recognition: an empty record hides its cell, and the
  // whole chapter stands down when off-the-clock life has no entries yet.
  const cells = [
    {
      label: "Library",
      visible: books.length > 0,
      count: books.length,
      unit: `${plural(books.length, "book")} · ${readCount} read`,
      latest: reading ? `Currently reading ${reading.title}.` : "Status, ratings, and notes for every book.",
      href: "/library",
      linkText: "Open library",
    },
    {
      label: "Travel",
      visible: countries.length + trips.length > 0,
      count: countries.length,
      unit: `${countries.length === 1 ? "country" : "countries"} · ${trips.length} ${trips.length === 1 ? "city" : "cities"}`,
      latest: trips[0] ? `Last logged: ${trips[0].city}.` : "A country → city atlas of everywhere logged.",
      href: "/travel",
      linkText: "Open atlas",
    },
    {
      label: "Community",
      visible: volunteering.length + organizations.length > 0,
      count: volunteering.length + organizations.length,
      unit: `${plural(volunteering.length + organizations.length, "role")} · ${interests.length} ${plural(interests.length, "interest")}`,
      latest: volunteering[0] ? `${volunteering[0].title} · ${volunteering[0].organization}.` : undefined,
      href: "/volunteering",
      linkText: "Open record",
    },
  ].filter((c) => c.visible);
  if (cells.length === 0 && shownCountries.length === 0 && interestChips.length === 0)
    return null;

  return (
    <SectionBlock no="007" label="Off the clock" title="Elsewhere">
      <Rise>
        {cells.length > 0 && (
          <div className={`mb-2 mt-5 grid overflow-hidden rounded-card border border-dashed border-line ${CELL_COLS[Math.min(cells.length, 3)]}`}>
            {cells.map((c, i) => (
              <CountCell
                key={c.label}
                border={i < cells.length - 1}
                label={c.label}
                count={c.count}
                unit={c.unit}
                latest={c.latest}
                href={c.href}
                linkText={c.linkText}
              />
            ))}
          </div>
        )}

        {(shownCountries.length > 0 || interestChips.length > 0) && (
          <div className="mb-2 border-t border-dashed border-line">
            {shownCountries.length > 0 && (
              <Link
                to="/travel"
                className="group flex flex-wrap items-baseline gap-x-5 gap-y-1 border-b border-dashed border-line px-1 py-3 transition-colors hover:bg-field/5"
              >
                <span className="w-28 shrink-0 font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-muted">
                  Atlas
                </span>
                <span className="font-mono text-xs tracking-[0.02em] text-ink">
                  {shownCountries
                    .map((c) => c.name)
                    .join(" · ")}
                  {countries.length > shownCountries.length &&
                    ` · +${countries.length - shownCountries.length}`}
                </span>
              </Link>
            )}
            {interestChips.length > 0 && (
              <Link
                to="/interests"
                className="group flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-dashed border-line px-1 py-3 transition-colors hover:bg-field/5"
              >
                <span className="w-28 shrink-0 font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-muted">
                  Interests
                </span>
                <span className="flex flex-wrap gap-1.5">
                  {interestChips.map((i) => (
                    <Badge key={i.id}>{i.title}</Badge>
                  ))}
                  {interests.length > interestChips.length && (
                    <Badge>+{interests.length - interestChips.length}</Badge>
                  )}
                </span>
              </Link>
            )}
          </div>
        )}
      </Rise>
    </SectionBlock>
  );
};

/* ── The dossier ──────────────────────────────────────────────────── */

export const DashboardPage = () => (
  <div className="-mt-8">
    <Hero />
    <PixelBand className="-mx-5 mb-0" />
    <div className="space-y-14 pt-2">
      <NowSection />
      <ToolkitSection />
      <CareerSection />
      <WorkSection />
      <HonorsSection />
      <NotesSection />
      <ElsewhereSection />
    </div>
  </div>
);
