// Plain-text helpers for surfaces that show raw content strings
// (ledger rows, search results, meta lines).

/** Strip the markdown syntax that plausibly appears in short bodies. */
export function stripMarkdown(raw: string): string {
  return raw
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1") // images → alt
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // links → label
    .replace(/(\*\*|__)(.*?)\1/g, "$2") // bold
    .replace(/(\*|_)(.*?)\1/g, "$2") // italics
    .replace(/`([^`]*)`/g, "$1") // inline code
    .replace(/^#{1,6}\s.*$/gm, "") // heading lines (title text reads badly mid-prose)
    .replace(/^>\s?/gm, "") // blockquotes
    .replace(/\s+/g, " ") // collapse whitespace/newlines
    .trim();
}

/** ISO country code for display chips: the explicit `code` field wins, else
 *  the letters are recovered from a regional-indicator flag emoji. Raw flag
 *  emoji are never rendered (Windows shows them as unstyled letter pairs). */
export function countryCode(code?: string, flag?: string): string | null {
  if (code?.trim()) return code.trim().toUpperCase();
  const letters = [...(flag ?? "")]
    .map((ch) => {
      const cp = ch.codePointAt(0) ?? 0;
      return cp >= 0x1f1e6 && cp <= 0x1f1ff ? String.fromCharCode(65 + cp - 0x1f1e6) : "";
    })
    .join("");
  return letters.length === 2 ? letters : null;
}

/** Hostname of a URL without the "www." prefix, for labeling off-site links. */
export function hostLabel(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "") || null;
  } catch {
    return null;
  }
}

export interface ProfileLink {
  label: string;
  url: string;
  icon?: string;
}

/** Parse the free-form profile `links` field: one link per line, either
 *  `Label: https://url`, `Label [icon]: https://url` (icon names resolve via
 *  the LINK_ICONS registry), or a bare URL (labeled by its hostname). Nothing
 *  is hardcoded per platform; any link a person wants on their dossier is valid. */
export function parseProfileLinks(raw?: string): ProfileLink[] {
  return (raw ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => {
      const colon = line.indexOf(":");
      const rawHead = colon > 0 ? line.slice(0, colon).trim() : "";
      const iconMatch = rawHead.match(/^(.*?)\s*\[([a-z0-9-]+)\]$/i);
      const head = iconMatch ? iconMatch[1].trim() : rawHead;
      const icon = iconMatch ? iconMatch[2].toLowerCase() : undefined;
      const bare = !head || /^(https?|mailto|tel)$/i.test(head);
      const target = bare ? line : line.slice(colon + 1).trim();
      if (!target) return [];
      const url = /^[a-z][a-z0-9+.-]*:/i.test(target) ? target : `https://${target}`;
      if (bare) return [{ label: hostLabel(url) ?? target, url }];
      return [{ label: head, url, ...(icon ? { icon } : {}) }];
    });
}

/** Human-readable, scraper-resistant email rendering:
 *  "ali@example.com" reads as "ali [at] example [dot] com". */
export function obfuscateEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  return `${local} [at] ${domain.split(".").join(" [dot] ")}`;
}

/** First substantive line of a markdown body, cleaned for card prose. */
export function firstLine(body: string | undefined, max = 150): string | null {
  const line = (body ?? "")
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l && !l.startsWith("#"));
  return line ? excerpt(line.replace(/^[-*+]\s+/, ""), max) : null;
}

/**
 * Cut `raw` down to at most `max` characters on a word boundary and add an
 * ellipsis. Markdown syntax is stripped first so excerpts read as prose.
 */
export function excerpt(raw: string, max: number): string {
  const text = stripMarkdown(raw);
  if (text.length <= max) return text;
  const cut = text.slice(0, max + 1);
  const lastSpace = cut.lastIndexOf(" ");
  const clipped = cut
    .slice(0, lastSpace > max * 0.6 ? lastSpace : max)
    .replace(/[\s.,;:!?]+$/, "");
  return `${clipped}…`;
}
