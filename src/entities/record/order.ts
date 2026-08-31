/**
 * How a collection is ordered: pins first, then a policy.
 *
 * Every entry may carry a `pin` number, and pinned entries lead their
 * collection in ascending pin order, in the capped previews and on the full
 * pages alike, so "show these five first" is frontmatter rather than code.
 * Behind the pins, a policy orders the rest: alphabetical always works
 * because every item has a title, and chronological degrades gracefully,
 * reading each type's own date field, sorting what carries one newest first,
 * and letting undated entries close the list alphabetically instead of
 * failing or scattering.
 */

import { AnyContentItem, ContentType } from "./model";

/** The orderings an owner may choose per section; anything else means the default. */
export type OrderingPolicy = "alphabetical" | "chronological";

/** Whether a seed value names a policy this module knows. */
export const isOrderingPolicy = (value: unknown): value is OrderingPolicy =>
  value === "alphabetical" || value === "chronological";

/**
 * Which frontmatter field "chronological" reads per type, and whether it holds
 * a date string or a bare year. A type not listed here still orders
 * chronologically through its plain `date` field when entries carry one.
 */
export const DATE_FIELDS: Partial<
  Record<ContentType, { field: string; kind: "date" | "year" }>
> = {
  updates: { field: "date", kind: "date" },
  blog: { field: "date", kind: "date" },
  awards: { field: "date", kind: "date" },
  speaking: { field: "date", kind: "date" },
  certificates: { field: "date", kind: "date" },
  experience: { field: "startDate", kind: "date" },
  education: { field: "startDate", kind: "date" },
  volunteering: { field: "startDate", kind: "date" },
  organizations: { field: "startDate", kind: "date" },
  publications: { field: "year", kind: "year" },
  projects: { field: "year", kind: "year" },
  trips: { field: "date", kind: "date" },
  posts: { field: "date", kind: "date" },
  courses: { field: "date", kind: "date" },
  media: { field: "date", kind: "date" },
};

// Ordering reads fields that only some collections carry, so the dynamic
// lookup is confined to these helpers instead of loosening the item type.
type Loose = Record<string, unknown>;
const fieldOf = (item: AnyContentItem, field: string): unknown =>
  (item as unknown as Loose)[field];

const alphaValue = (item: AnyContentItem): string =>
  String(
    fieldOf(item, "title") ??
      fieldOf(item, "name") ??
      fieldOf(item, "city") ??
      item.slug ??
      ""
  );

/** An item's place in time; malformed or missing values read as 0 (oldest)
    instead of poisoning the comparator with NaN. */
const timeValue = (item: AnyContentItem, type: ContentType): number => {
  const spec = DATE_FIELDS[type] ?? { field: "date", kind: "date" };
  const raw = fieldOf(item, spec.field);
  const n =
    spec.kind === "year"
      ? parseInt(String(raw || "0"), 10)
      : new Date((raw as string) || 0).getTime();
  return Number.isNaN(n) ? 0 : n;
};

/**
 * The comparator a policy means for one collection.
 *
 * @param type - The collection being ordered, which names the date field.
 * @param policy - The chosen ordering.
 *
 * @returns A comparator: alphabetical by display name, or newest first with
 *   undated entries closing the list alphabetically.
 */
export function comparatorFor(
  type: ContentType,
  policy: OrderingPolicy
): (a: AnyContentItem, b: AnyContentItem) => number {
  if (policy === "alphabetical") {
    return (a, b) => alphaValue(a).localeCompare(alphaValue(b));
  }
  return (a, b) =>
    timeValue(b, type) - timeValue(a, type) ||
    alphaValue(a).localeCompare(alphaValue(b));
}

/** An entry's pin, when it carries a usable one. */
const pinOf = (item: AnyContentItem): number | undefined => {
  const raw = Number(fieldOf(item, "pin"));
  return Number.isFinite(raw) ? raw : undefined;
};

/**
 * Orders one collection: pinned entries first in ascending pin order, the
 * rest under the given policy.
 *
 * @param items - The collection, in whatever order it arrived.
 * @param type - The collection's type, which names its date field.
 * @param policy - The ordering for the unpinned tail; omitted, the arrival
 *   order stands and only the pins are lifted.
 *
 * @returns A new, ordered array; the input is never mutated.
 */
export function orderItems<T extends AnyContentItem>(
  items: T[],
  type: ContentType,
  policy?: OrderingPolicy
): T[] {
  const base = policy ? [...items].sort(comparatorFor(type, policy)) : [...items];
  const pinned = base.filter((i) => pinOf(i) !== undefined);
  if (pinned.length === 0) return base;
  pinned.sort((a, b) => (pinOf(a) as number) - (pinOf(b) as number));
  return [...pinned, ...base.filter((i) => pinOf(i) === undefined)];
}
