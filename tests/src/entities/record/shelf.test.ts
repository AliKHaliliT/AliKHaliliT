import { describe, expect, it } from "vitest";
import { buildShelves, shelfFront, shelfSlug, stageOf } from "@/entities/record/shelf";
import { Book, MediaItem } from "@/entities/record/model";

const book = (over: Partial<Book>): Book => ({
  id: over.slug || "b",
  slug: "b",
  type: "books",
  title: "A Book",
  author: "Someone",
  status: "Read",
  ...over,
});

const media = (over: Partial<MediaItem>): MediaItem => ({
  id: over.slug || "m",
  slug: "m",
  type: "media",
  title: "A Thing",
  medium: "film",
  ...over,
});

describe("stageOf", () => {
  it("reads an -ing label as work in hand", () => {
    for (const s of ["Reading", "Watching", "Playing", "Replaying", "binging"]) {
      expect(stageOf(s), s).toBe("current");
    }
  });

  it("reads a To-prefixed label as queued", () => {
    for (const s of ["To Read", "To Watch", "to play"]) {
      expect(stageOf(s), s).toBe("queued");
    }
  });

  it("reads anything else, including no status, as done", () => {
    for (const s of ["Read", "Watched", "Played", "Abandoned", "", undefined]) {
      expect(stageOf(s), String(s)).toBe("done");
    }
  });
});

describe("shelfSlug", () => {
  it("lowercases and hyphenates the medium", () => {
    expect(shelfSlug("Film")).toBe("film");
    expect(shelfSlug("Board Game")).toBe("board-game");
  });

  it("falls back to 'other' when the medium is missing", () => {
    expect(shelfSlug(undefined)).toBe("other");
    expect(shelfSlug("  ")).toBe("other");
  });
});

describe("buildShelves", () => {
  it("shelves books first, then each distinct medium alphabetically", () => {
    const shelves = buildShelves(
      [book({ slug: "b1" })],
      [
        media({ slug: "g1", medium: "game" }),
        media({ slug: "f1", medium: "film" }),
        media({ slug: "g2", medium: "game" }),
      ]
    );
    expect(shelves.map((s) => s.slug)).toEqual(["books", "film", "game"]);
    expect(shelves.map((s) => s.label)).toEqual(["Books", "Films", "Games"]);
    expect(shelves[2].items).toHaveLength(2);
  });

  it("labels an owner-invented medium as its own Title Case", () => {
    const [shelf] = buildShelves([], [media({ medium: "board game" })]);
    expect(shelf.label).toBe("Board Game");
  });

  it("omits empty collections instead of shelving nothing", () => {
    expect(buildShelves([], [])).toEqual([]);
    expect(buildShelves([], [media({})]).map((s) => s.slug)).toEqual(["film"]);
  });

  it("normalizes books and media into one item shape", () => {
    const [shelfOfBooks] = buildShelves(
      [book({ slug: "b1", author: "Marlowe", cover: "c.jpg", notes: "kept" })],
      []
    );
    expect(shelfOfBooks.items[0]).toMatchObject({
      byline: "Marlowe",
      image: "c.jpg",
      body: "kept",
      stage: "done",
    });
  });
});

describe("shelfFront", () => {
  it("leads with work in hand and respects the cap", () => {
    const [shelf] = buildShelves(
      [],
      [
        media({ slug: "done1", status: "Watched" }),
        media({ slug: "done2", status: "Watched" }),
        media({ slug: "now", status: "Watching" }),
      ]
    );
    const front = shelfFront(shelf, 2);
    expect(front.map((i) => i.slug)).toEqual(["now", "done1"]);
  });

  it("pins outrank work in hand", () => {
    const [shelf] = buildShelves(
      [],
      [
        media({ slug: "now", status: "Watching" }),
        media({ slug: "chosen", status: "Watched", pin: 1 }),
      ]
    );
    expect(shelfFront(shelf, 2).map((i) => i.slug)).toEqual(["chosen", "now"]);
  });
});

describe("per-shelf ordering", () => {
  // This deployment seeds no ordering.json, so every shelf keeps its
  // collection order while pins still lead.
  it("shelves keep collection order with pins lifted while nothing is seeded", () => {
    const [shelf] = buildShelves(
      [],
      [
        media({ slug: "zeppelin", title: "Zeppelin", medium: "game", date: "2026-01" }),
        media({ slug: "anvil", title: "Anvil", medium: "game", date: "2020-01" }),
        media({ slug: "keep", title: "Keep", medium: "game", pin: 1 }),
      ]
    );
    expect(shelf.items.map((i) => i.slug)).toEqual(["keep", "zeppelin", "anvil"]);
  });

  it("a shelf without a seeded policy keeps its collection order", () => {
    const [shelf] = buildShelves(
      [],
      [media({ slug: "z", medium: "film" }), media({ slug: "a", medium: "film" })]
    );
    expect(shelf.items.map((i) => i.slug)).toEqual(["z", "a"]);
  });
});
