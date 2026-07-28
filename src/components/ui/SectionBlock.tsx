import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { m } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Dossier chapter scaffold: mono chapter number + label in moss, a Fraunces
 * display title, and an optional "see all" ledger link. Sections are the
 * reading order of the dossier, so the numbering carries real sequence.
 */
export const SectionBlock = ({
  no,
  label,
  title,
  href,
  linkText = "See all",
  children,
  className,
}: {
  /** Chapter number, e.g. "001" */
  no: string;
  /** Mono label after the number, e.g. "TELEMETRY" */
  label: string;
  title: string;
  href?: string;
  linkText?: string;
  children: ReactNode;
  className?: string;
}) => (
  <section className={cn(className)}>
    {/* Chapter boundary: a solid, stronger rule with a square registration
        mark, deliberately distinct from the light dashed hairlines used for
        the ledgers INSIDE a chapter. */}
    <div aria-hidden="true" className="relative border-t border-[var(--color-border-strong)]">
      <span className="absolute left-0 top-[-3px] h-[5px] w-[5px] bg-field" />
    </div>
    {/* The header reveals with the same motion as the section body so a
        chapter never shows its title floating over invisible content. */}
    <m.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
      className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 pt-9 pb-2"
    >
      <div>
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-signal">
          {no} · {label}
        </p>
        <h2 className="mt-1.5 font-serif text-[clamp(1.9rem,4vw,3.25rem)] font-semibold leading-[1.02] tracking-[-0.025em] text-[var(--color-text-primary)]">
          {title}
        </h2>
      </div>
      {href && (
        <Link
          to={href}
          className="group mb-2 flex items-center gap-1.5 border-b border-[var(--color-border-strong)] pb-0.5 font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--color-text-secondary)] transition-colors hover:border-signal hover:text-signal"
        >
          {linkText}
          <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </m.div>
    {children}
  </section>
);
