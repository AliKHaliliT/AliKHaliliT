import { useState } from "react";
import { obfuscateEmail } from "@/shared/lib";

/**
 * Email contact without a scrapeable mailto: the address renders in the
 * "[at] / [dot]" form and a click copies the real address (assembled only
 * at interaction time) to the clipboard. Pass children to use a custom
 * face (e.g. an icon); the obfuscated form then lives in the tooltip.
 */
export const ObfuscatedEmail = ({
  email,
  className,
  title,
  children,
}: {
  email: string;
  className?: string;
  title?: string;
  children?: React.ReactNode;
}) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard unavailable (permissions, old browser): show the address
      // itself so the visitor can copy it by hand.
      window.prompt("Email address:", email);
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      title={title ?? `${obfuscateEmail(email)} · click to copy`}
      aria-label={`Copy email address ${obfuscateEmail(email)}`}
      className={className}
    >
      {copied ? "Copied ✓" : (children ?? obfuscateEmail(email))}
    </button>
  );
};
