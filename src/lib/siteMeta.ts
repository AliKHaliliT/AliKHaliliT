// Site identity model + head-tag generation. Dependency-free on purpose:
// imported by both the app (src/lib/site.ts) and vite.config.ts (the
// siteSeed plugin), so it must not pull in React or browser globals.

export interface SiteIdentity {
  /** Product/wordmark text shown in the top bar and footer colophon. */
  name: string;
  /** Base document title (browser tab); pages prefix their own label. */
  title: string;
  /** Meta + Open Graph description. */
  description: string;
  /** Meta author / colophon owner. */
  author: string;
  /** Canonical origin for og:url, e.g. "https://user.github.io/repo". "" = unset. */
  url: string;
  /** Oversized hero monogram. Empty/absent = derived from the name's initials. */
  mark?: string;
  /** Big serif footer sign-off, newline-separated; the last line is drawn in the
   *  accent. Empty/absent = "Built from {city}, logged everywhere." */
  tagline?: string;
  /** Footer colophon line (the year is appended). Empty/absent = "A dossier by {owner}". */
  colophon?: string;
  /** Per-page header descriptions, keyed by page (e.g. "blog", "projects").
   *  Missing/empty keys fall back to the template's default copy. */
  pageCopy?: Record<string, string>;
}

export const SITE_KEYS = ["name", "title", "description", "author", "url"] as const;
export const SITE_OPTIONAL_KEYS = ["mark", "tagline", "colophon"] as const;

export function isSiteIdentity(value: unknown): value is SiteIdentity {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  const pageCopyOk =
    record.pageCopy === undefined ||
    (typeof record.pageCopy === "object" &&
      record.pageCopy !== null &&
      Object.values(record.pageCopy).every((v) => typeof v === "string"));
  return (
    SITE_KEYS.every((key) => typeof record[key] === "string") &&
    SITE_OPTIONAL_KEYS.every(
      (key) => record[key] === undefined || typeof record[key] === "string"
    ) &&
    pageCopyOk
  );
}

/** The hero watermark: the explicit mark, else the site name's initials. */
export function siteMark(site: SiteIdentity): string {
  const explicit = site.mark?.trim();
  if (explicit) return explicit;
  const initials = site.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0] ?? "")
    .join("")
    .toUpperCase();
  return initials || "◇";
}

/** Minimal escaping for values the siteSeed plugin splices into raw HTML. */
export const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * Head metas derived from the identity, in Vite HtmlTagDescriptor shape.
 * The <title> and the description meta already exist in index.html and are
 * rewritten in place by the plugin; these are the tags it injects fresh.
 */
export function siteHeadTags(site: SiteIdentity) {
  const metas: Record<string, string>[] = [
    { name: "author", content: site.author },
    { property: "og:site_name", content: site.name },
    { property: "og:title", content: site.title },
    { property: "og:description", content: site.description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: site.title },
    { name: "twitter:description", content: site.description },
  ];
  if (site.url) metas.push({ property: "og:url", content: site.url });
  return metas.map((attrs) => ({ tag: "meta", attrs, injectTo: "head" as const }));
}
