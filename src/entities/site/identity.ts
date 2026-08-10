// Site identity: the wordmark, document title, and meta description follow
// the content model like the palette does. src/content/settings/site.json is
// the deployed-default seed (baked into index.html by the siteSeed plugin in
// vite.config.ts: a separated admin pushes that file to rebrand the live
// site); `os_site` in localStorage is the per-browser override edited in
// Admin → Settings → Site identity.

import { useState } from "react";
import seedJson from "@/content/settings/site.json";
import { isSiteIdentity, type SiteIdentity } from "./meta";

export type { SiteIdentity } from "./meta";

const STORAGE_KEY = "os_site";

/** The identity committed as site.json: what ships before any override. */
export const SEED_SITE = seedJson as SiteIdentity;

/**
 * Reads this browser's identity override.
 *
 * @returns The stored identity, or null when none is saved or the stored value
 *   no longer satisfies the shape.
 */
export function loadStoredSite(): SiteIdentity | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isSiteIdentity(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** The identity in effect: per-browser override if present, else the seed. */
export function currentSite(): SiteIdentity {
  return loadStoredSite() ?? SEED_SITE;
}

/** Exact seed-file format: what a separated admin pushes as site.json. */
export function toSeedFileJson(site: SiteIdentity): string {
  const { name, title, description, author, url, mark, tagline, colophon } = site;
  // Only page-copy overrides that actually say something are persisted.
  const pageCopy = Object.fromEntries(
    Object.entries(site.pageCopy ?? {}).filter(([, v]) => v.trim() !== ""),
  );
  // JSON.stringify drops undefined optionals, keeping old overrides byte-stable.
  return (
    JSON.stringify(
      {
        name, title, description, author, url, mark, tagline, colophon,
        pageCopy: Object.keys(pageCopy).length > 0 ? pageCopy : undefined,
      },
      null,
      2,
    ) + "\n"
  );
}

/** The identity in effect, read once per mount; the companion admin writes overrides. */
export function useSiteIdentity(): SiteIdentity {
  const [site] = useState<SiteIdentity>(currentSite);
  return site;
}
