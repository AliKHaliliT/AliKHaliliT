/**
 * The contract every record item must satisfy to enter the site.
 *
 * Two doors lead into this slice and neither is trustworthy by construction.
 * The bundled markdown is committed content, so a malformed file is an
 * authoring bug and this module throws. The localStorage override is written
 * by a separate application in the same browser, so a malformed value is not
 * this site's bug to crash on; the store catches the error and falls back to
 * the committed seed.
 *
 * Only invariants the whole site depends on are checked. Optional fields stay
 * optional, because a guard that outgrows the model rejects valid content.
 */

import { AnyContentItem, ContentType, UserSettings } from "./model";

/** Raised when content crossing into the record does not match its shape. */
export class RecordContractError extends Error {
  /** Where the offending value came from, named so it can be fixed or cleared. */
  readonly source: string;

  /**
   * @param source - The file or storage key the value arrived from.
   * @param detail - What was wrong, in terms an author can act on.
   */
  constructor(source: string, detail: string) {
    super(`Record contract violated by ${source}: ${detail}`);
    this.name = "RecordContractError";
    this.source = source;
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Describes what is wrong with one candidate item.
 *
 * @param value - The candidate, straight from JSON or frontmatter.
 * @param type - The collection the item is supposed to belong to.
 *
 * @returns A reason string, or null when the item is acceptable.
 */
function itemProblem(value: unknown, type: ContentType): string | null {
  if (!isRecord(value)) return "item is not an object";
  if (typeof value.id !== "string" && typeof value.id !== "number") {
    return "item has no usable id";
  }
  if (value.type !== type) {
    return `item claims type "${String(value.type)}" in the ${type} collection`;
  }
  if (value.tags !== undefined && !Array.isArray(value.tags)) {
    return "tags is present but not a list";
  }
  return null;
}

/**
 * Checks a whole collection before it reaches the site.
 *
 * @param value - The parsed candidate, expected to be an array of items.
 * @param type - The collection the value is supposed to hold.
 * @param source - Where the value came from, for the error message.
 *
 * @returns The same value, now known to hold record items.
 *
 * @throws RecordContractError When the value is not an array of items of this
 * type, naming the first offending index so the fix is obvious.
 */
export function validateItems(
  value: unknown,
  type: ContentType,
  source: string
): AnyContentItem[] {
  if (!Array.isArray(value)) {
    throw new RecordContractError(source, `expected a list of ${type} items`);
  }
  for (const [index, item] of value.entries()) {
    const problem = itemProblem(item, type);
    if (problem) throw new RecordContractError(source, `${problem} (at index ${index})`);
  }
  return value as AnyContentItem[];
}

/**
 * Checks one item as it comes off a bundled markdown file.
 *
 * @param value - The item assembled from the file's frontmatter and body.
 * @param type - The collection the file belongs to.
 * @param path - The markdown path, so a broken file names itself.
 *
 * @returns The same item, now known to be a record item.
 *
 * @throws RecordContractError When the frontmatter cannot produce a valid item.
 */
export function validateSeedItem(
  value: unknown,
  type: ContentType,
  path: string
): AnyContentItem {
  const problem = itemProblem(value, type);
  if (problem) throw new RecordContractError(path, problem);
  return value as AnyContentItem;
}

/**
 * Checks the settings object, the one collection that is a single item.
 *
 * @param value - The parsed candidate.
 * @param source - Where the value came from, for the error message.
 *
 * @returns The same value, now known to be settings.
 *
 * @throws RecordContractError When the value cannot act as the owner profile.
 */
export function validateSettings(value: unknown, source: string): UserSettings {
  if (!isRecord(value)) throw new RecordContractError(source, "settings is not an object");
  if (value.type !== "settings") {
    throw new RecordContractError(source, `settings claims type "${String(value.type)}"`);
  }
  if (typeof value.name !== "string") {
    throw new RecordContractError(source, "settings has no name");
  }
  return value as unknown as UserSettings;
}
