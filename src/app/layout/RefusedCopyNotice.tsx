/** The notice that names what the record set aside in this browser. */

import { useState } from "react";
import { m } from "framer-motion";
import { X } from "lucide-react";
import { useContent, type RefusedCopy } from "@/entities/record";

// "the profile" for the settings key, the collection's own name otherwise.
const copyOf = (copy: RefusedCopy) => (copy.type === "settings" ? "the profile" : copy.type);

/**
 * Tells the owner which saved copies in this browser failed their check, and
 * which key to clear. A browser holding none, which is every visitor's,
 * renders nothing.
 *
 * @returns The notice, or nothing when no copy was set aside or it was dismissed.
 */
export const RefusedCopyNotice = () => {
  const { refused } = useContent();
  const [dismissed, setDismissed] = useState(false);
  if (refused.length === 0 || dismissed) return null;

  return (
    <m.aside
      role="status"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-xl rounded-card border border-signal bg-card p-4 shadow-lift"
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="font-mono text-eyebrow uppercase text-signal">Saved copy set aside</p>
        <button
          onClick={() => setDismissed(true)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-ink"
          title="Dismiss"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
      <ul className="space-y-3">
        {refused.map((copy) => (
          <li key={copy.key} className="text-sm leading-relaxed text-ink">
            Your saved copy of {copyOf(copy)} didn't pass its check, so the published version
            is showing. Clear <code className="font-mono text-[12px] text-signal">{copy.key}</code> from
            this browser's storage to remove it.
            <span className="mt-1 block break-words font-mono text-[11px] text-muted">{copy.reason}</span>
          </li>
        ))}
      </ul>
    </m.aside>
  );
};
