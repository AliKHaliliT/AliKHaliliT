// Site identity: the wordmark, document title, and meta description follow
// the content model like the palette does. src/content/settings/site.json is
// the deployed-default seed (baked into index.html by the siteSeed plugin in
// vite.config.ts: a separated admin pushes that file to rebrand the live
// site); `os_site` in localStorage is the per-browser override edited in
// Admin → Settings → Site identity.

import { useEffect, useState } from "react";
import seedJson from "@/content/settings/site.json";
import { isSiteIdentity, type SiteIdentity } from "./siteMeta";
import { safeSetItem } from "./storage";

export type { SiteIdentity } from "./siteMeta";

const STORAGE_KEY = "os_site";
const CHANGE_EVENT = "os-site-changed";

export const SEED_SITE = seedJson as SiteIdentity;

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

function notifyChange() {
  // Guarded so the storage API stays usable in non-DOM test environments.
  if (typeof document !== "undefined") document.dispatchEvent(new Event(CHANGE_EVENT));
}

export function saveStoredSite(site: SiteIdentity) {
  safeSetItem(STORAGE_KEY, JSON.stringify(site));
  notifyChange();
}

/** Remove the per-browser override; the deployed seed shows through. */
export function clearStoredSite() {
  localStorage.removeItem(STORAGE_KEY);
  notifyChange();
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

/** Live view of the identity; re-renders when the admin saves an edit. */
export function useSiteIdentity(): SiteIdentity {
  const [site, setSite] = useState<SiteIdentity>(currentSite);
  useEffect(() => {
    const onChange = () => setSite(currentSite());
    document.addEventListener(CHANGE_EVENT, onChange);
    return () => document.removeEventListener(CHANGE_EVENT, onChange);
  }, []);
  return site;
}
