/**
 * The library's shelving logic, shared by the hub, the shelf pages, and search.
 *
 * A shelf is one category of the library. The book collection is the first
 * shelf, and every distinct medium in the media collection earns its own, so
 * a new category is a frontmatter value rather than a code change. Statuses
 * are open strings, and the stage a status implies is read from its English
 * shape instead of a closed list: a label ending in "ing" is work in hand
 * ("Reading", "Watching", "Replaying"), a label starting with "To " is queued
 * ("To Read", "To Play"), and anything else counts as done. Stats and filters
 * always show the exact labels; the stages only order and select.
 */

import { Book, MediaItem } from "./model";
import { typeLabel } from "./labels";
import { OrderingPolicy } from "./order";
import { orderingFor } from "./seed";

/** Where a status label places an item: in hand, waiting, or finished. */
export type ShelfStage = "current" | "done" | "queued";

/** One library entry, normalized so books and media render through one lens. */
export interface ShelfItem {
  slug: string;
  title: string;
  /** The author-analog line: an author, a director, a studio, a developer. */
  byline?: string;
  image?: string;
  status?: string;
  stage: ShelfStage;
  rating?: number;
  date?: string;
  link?: string;
  desc?: string;
  body?: string;
  story?: string;
  tags?: string[];
  pin?: number;
}

/** One category of the library, addressable at /library/:slug. */
export interface Shelf {
  slug: string;
  /** The shelf heading: "Books" for the book collection, the medium's Title Case otherwise. */
  label: string;
  /** Entries in collection order (media read newest first, books alphabetically). */
  items: ShelfItem[];
}

/** The stage a status label implies; no status reads as done. */
export const stageOf = (status?: string): ShelfStage => {
  const label = (status || "").trim();
  if (/^to\s/i.test(label)) return "queued";
  if (/ing$/i.test(label)) return "current";
  return "done";
};

/** The URL segment a medium earns under /library/. */
export const shelfSlug = (medium?: string): string =>
  ((medium || "").trim() || "other").toLowerCase().replace(/\s+/g, "-");

/** Shelf headings for the common mediums, pluralized to read like "Books";
    an owner-invented medium renders as its own Title Case, since no machine
    pluralizes an open string safely. */
const SHELF_LABELS: Record<string, string> = {
  film: "Films",
  series: "Series",
  anime: "Anime",
  game: "Games",
};

const bookToItem = (b: Book): ShelfItem => ({
  slug: b.slug,
  title: b.title,
  byline: b.author,
  image: b.cover,
  status: b.status,
  stage: stageOf(b.status),
  rating: b.rating,
  date: b.date,
  desc: undefined,
  body: b.body || b.notes,
  story: b.story,
  tags: b.tags,
  pin: b.pin,
});

const mediaToItem = (item: MediaItem): ShelfItem => ({
  slug: item.slug,
  title: item.title,
  byline: item.creator,
  image: item.image,
  status: item.status,
  stage: stageOf(item.status),
  rating: item.rating,
  date: item.date,
  link: item.link,
  desc: item.desc,
  body: item.body,
  story: item.story,
  tags: item.tags,
  pin: item.pin,
});

const pinOf = (item: ShelfItem): number | undefined =>
  Number.isFinite(Number(item.pin)) ? Number(item.pin) : undefined;

/** Per-shelf ordering, mirroring the collection rule on the normalized shape:
    pins lead ascending, the policy orders the rest, and chronological lets
    undated entries close the list alphabetically instead of failing. */
function orderShelfItems(items: ShelfItem[], policy?: OrderingPolicy): ShelfItem[] {
  const time = (i: ShelfItem) => {
    const n = new Date(i.date || 0).getTime();
    return Number.isNaN(n) ? 0 : n;
  };
  const base = [...items];
  if (policy === "alphabetical") base.sort((a, b) => a.title.localeCompare(b.title));
  if (policy === "chronological") {
    base.sort((a, b) => time(b) - time(a) || a.title.localeCompare(b.title));
  }
  const pinned = base.filter((i) => pinOf(i) !== undefined);
  if (pinned.length === 0) return base;
  pinned.sort((a, b) => (pinOf(a) as number) - (pinOf(b) as number));
  return [...pinned, ...base.filter((i) => pinOf(i) === undefined)];
}

/**
 * Assembles every shelf the record currently holds.
 *
 * Each shelf arrives in its collection's order (the owner's seeded policy or
 * the type default, pins first), and a media shelf with its own seeded policy
 * under the key `media/<slug>` reorders behind its pins.
 *
 * @param books - The book collection.
 * @param media - The media collection, whatever mediums it names.
 *
 * @returns Non-empty shelves only: books first when any exist, then one shelf
 *   per distinct medium, alphabetically by label so the order is stable.
 */
export function buildShelves(books: Book[], media: MediaItem[]): Shelf[] {
  const shelves: Shelf[] = [];
  if (books.length > 0) {
    shelves.push({ slug: "books", label: "Books", items: books.map(bookToItem) });
  }
  const byMedium = new Map<string, MediaItem[]>();
  for (const item of media) {
    const key = shelfSlug(item.medium);
    byMedium.set(key, [...(byMedium.get(key) || []), item]);
  }
  const mediaShelves = [...byMedium.entries()].map(([slug, items]) => ({
    slug,
    label: SHELF_LABELS[slug] ?? typeLabel({}, items[0].medium || "other"),
    items: orderShelfItems(items.map(mediaToItem), orderingFor(`media/${slug}`)),
  }));
  mediaShelves.sort((a, b) => a.label.localeCompare(b.label));
  return [...shelves, ...mediaShelves];
}

/**
 * The hub's selection for one shelf: pinned entries first, then everything in
 * hand, then the rest in shelf order, capped.
 *
 * @param shelf - The shelf to pick from.
 * @param cap - How many entries the hub row holds.
 *
 * @returns At most `cap` items, pins leading.
 */
export function shelfFront(shelf: Shelf, cap: number): ShelfItem[] {
  const pinned = shelf.items.filter((i) => pinOf(i) !== undefined);
  const current = shelf.items.filter((i) => pinOf(i) === undefined && i.stage === "current");
  const rest = shelf.items.filter((i) => pinOf(i) === undefined && i.stage !== "current");
  return [...pinned, ...current, ...rest].slice(0, cap);
}
