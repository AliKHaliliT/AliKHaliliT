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

/** A saved copy the door set aside instead of rendering it. */
export interface RefusedCopy {
  /** The localStorage key holding the copy, which is what the owner clears. */
  key: string;
  /** The collection the copy claimed to be, or "settings" for the profile. */
  type: ContentType;
  /** Why the copy failed, in the words of the check that refused it. */
  reason: string;
}

// What the latest read of each key set aside. A key that reads cleanly again,
// or holds nothing, leaves the list, so the page only ever names live problems.
const refusals = new Map<string, RefusedCopy>();

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
}

// The copy saved under a key, or null when none is saved or storage cannot be
// read at all. An unreadable store holds nothing to honor or to name.
function savedCopy(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

// Parses and checks a saved copy. A copy that fails is recorded under its key,
// so the page can name what to clear, and the caller falls back to the seed.
function honor<T>(key: string, type: ContentType, stored: string, check: (value: unknown) => T): T | null {
  try {
    return check(JSON.parse(stored));
  } catch (e) {
    refusals.set(key, { key, type, reason: e instanceof Error ? e.message : String(e) });
    return null;
  }
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
   *   override is dropped, and a broken one is recorded for `refused` and never
   *   reaches a page.
   */
  getAll: (type: ContentType): AnyContentItem[] => {
    const key = `${STORAGE_PREFIX}${type}`;
    const stored = savedCopy(key);
    refusals.delete(key);
    if (!stored) return loadInitialData(type);
    if (seedChangedSince(type)) {
      dropStaleOverride(type);
      return loadInitialData(type);
    }
    // An override keeps the order it was saved in unless the owner
    // seeded a policy; pins lead either way, matching the file door.
    const items = honor(key, type, stored, (value) =>
      orderItems(validateItems(value, type, `localStorage "${key}"`), type, orderingFor(type))
    );
    return items ?? loadInitialData(type);
  },

  /**
   * Reads the owner profile, preferring this browser's override.
   *
   * @returns The stored profile when it satisfies the contract, otherwise the
   *   committed seed; a broken one is recorded for `refused`.
   */
  getSettings: (): UserSettings => {
    const stored = savedCopy(SETTINGS_KEY);
    refusals.delete(SETTINGS_KEY);
    const settings = stored
      ? honor(SETTINGS_KEY, "settings", stored, (value) => validateSettings(value, `localStorage "${SETTINGS_KEY}"`))
      : null;
    return settings ?? loadSettings();
  },

  /**
   * Names every saved copy the latest reads set aside, so the page can say
   * which key to clear.
   *
   * @returns One entry per refused key, empty when every override was honored
   *   or none exists.
   */
  refused: (): RefusedCopy[] => [...refusals.values()],
};
