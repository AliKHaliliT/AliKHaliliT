import { Link, useLocation } from "react-router-dom";
import { PillLink } from "@/shared/ui";

/** Catch-all for unknown URLs: a dossier entry that doesn't exist. */
export const NotFoundPage = () => {
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-[55vh] flex-col items-start justify-center py-16">
      <p className="font-mono text-eyebrow uppercase text-signal">
        404 · No record
      </p>
      <h1 className="mt-4 font-serif text-display font-semibold tracking-[-0.02em] text-ink">
        This page isn't in the file.
      </h1>
      <p className="mt-4 max-w-[44ch] font-serif text-lg italic text-muted">
        Nothing is logged at{" "}
        <code className="rounded-ctl border border-line px-1.5 py-0.5 font-mono text-sm not-italic">
          {pathname}
        </code>
        . It may have moved, or it never existed.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-3.5">
        <PillLink to="/">Back to the dossier</PillLink>
        <Link
          to="/blog"
          className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted underline decoration-line-strong underline-offset-4 transition-colors hover:text-signal"
        >
          Or read the writing
        </Link>
      </div>
    </div>
  );
};
