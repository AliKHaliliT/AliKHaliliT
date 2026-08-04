import { useState } from "react";
import { cn } from "@/shared/lib";

/**
 * An image that fails quietly: hot-linked sources (GitHub social previews,
 * external CDNs) sometimes rate-limit or drop a request, so a broken load
 * swaps to the provided fallback instead of a browser broken-image glyph.
 * Lazy by default; the key remount resets the error state when src changes.
 */
export const SafeImage = ({
  src,
  alt,
  className,
  fallback,
}: {
  src?: string;
  alt: string;
  className?: string;
  fallback: React.ReactNode;
}) => {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <>{fallback}</>;
  return (
    <img
      key={src}
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={cn("h-full w-full object-cover", className)}
    />
  );
};
