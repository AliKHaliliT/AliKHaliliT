/**
 * The record's storage door, and it only reads: bundled markdown, optionally
 * shadowed by an override the companion admin wrote into this browser.
 *
 * The override is another application's output, so it is validated on the way
 * in and honored only while the committed seed still matches the fingerprint
 * recorded beside it; the site never renders unchecked or stale data.
 */

import { loadInitialData, loadSettings, orderingFor, seedFingerprint } from "./seed";
import { AnyContentItem, ContentType, UserSettings } from "./model";
import { orderItems } from "./order";
import { validateItems, validateSettings } from "./schema";

const STORAGE_PREFIX = "os_content_";
const SETTINGS_KEY = "os_settings";
const SEED_PREFIX = "os_content_seed_";

// An override is the companion admin's output riding this browser's storage, and it
// wins only while the committed record still matches the fingerprint recorded at save
// time. The moment a redeploy changes the markdown underneath it, the deployment wins
// and the stale copy is dropped, so the site never shows an old edit over a newer record.
function seedChangedSince(type: ContentType): boolean {
  const saved = localStorage.getItem(`${SEED_PREFIX}${type}`);
  return saved !== null && saved !== seedFingerprint(type);
}

function dropStaleOverride(type: ContentType) {
  localStorage.removeItem(`${STORAGE_PREFIX}${type}`);
  localStorage.removeItem(`${SEED_PREFIX}${type}`);
  console.info(
    `[personal-os] Bundled markdown for "${type}" changed since this browser's copy ` +
      "was saved; the deployment wins and the stale copy was dropped."
  );
}

/**
 * The record's store: bundled markdown, optionally shadowed by this browser.
 *
 * The override is written by the companion admin panel rather than by this site,
 * which is why every read of it is checked rather than trusted.
 *
 * @example
 * ```ts
 * const books = ContentService.getAll("books")
 * ```
 */
export const ContentService = {
  /**
   * Reads one collection, preferring this browser's override.
   *
   * @param type - The collection to read.
   *
   * @returns The stored items while the committed seed still matches the
   *   fingerprint recorded when they were saved, otherwise the seed. A stale
   *   override is dropped, and a broken one is reported and never reaches a page.
   */
  getAll: (type: ContentType): AnyContentItem[] => {
    try {
      const key = `${STORAGE_PREFIX}${type}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        if (seedChangedSince(type)) {
          dropStaleOverride(type);
        } else {
          // An override keeps the order it was saved in unless the owner
          // seeded a policy; pins lead either way, matching the file door.
          return orderItems(
            validateItems(JSON.parse(stored), type, `localStorage "${key}"`),
            type,
            orderingFor(type)
          );
        }
      }
    } catch (e) {
      console.error(`Failed to load ${type}`, e);
    }
    return loadInitialData(type);
  },

  /**
   * Reads the owner profile, preferring this browser's override.
   *
   * @returns The stored profile when it satisfies the contract, otherwise the
   *   committed seed.
   */
  getSettings: (): UserSettings => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        return validateSettings(JSON.parse(stored), `localStorage "${SETTINGS_KEY}"`);
      }
    } catch (e) {
      console.error("Failed to load settings", e);
    }
    return loadSettings();
  }
};
