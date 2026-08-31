// Characterization tests for contentLoader: they pin CURRENT behavior
// (including quirks) so the loader can be refactored safely. If a test here
// starts failing after an intentional behavior change, update it deliberately.

import { describe, expect, it } from "vitest";
import { loadInitialData, loadSettings } from "@/entities/record/seed";
import { ContentType } from "@/entities/record";

const ALL_TYPES: ContentType[] = [
  "projects",
  "posts",
  "books",
  "media",
  "trips",
  "countries",
  "courses",
  "blog",
  "updates",
  "experience",
  "education",
  "awards",
  "publications",
  "speaking",
  "volunteering",
  "certificates",
  "references",
  "interests",
  "organizations",
  "settings",
];

type Loose = Record<string, unknown>;

describe("loadInitialData: item shape", () => {
  it.each(ALL_TYPES)("every %s item has the base fields", (type) => {
    for (const item of loadInitialData(type) as unknown as Loose[]) {
      expect(item.id).toBeTruthy();
      expect(typeof item.slug).toBe("string");
      expect((item.slug as string).length).toBeGreaterThan(0);
      expect(typeof item.title).toBe("string");
      expect(Array.isArray(item.tags)).toBe(true);
      expect(typeof item.body).toBe("string");
    }
  });

  // The seed here is Ali's real record: some folders stay empty until he has
  // data for them, so the loader returns an array for every type and items
  // for the populated ones.
  it("returns an array for every content folder, items for the populated ones", () => {
    for (const type of ALL_TYPES) {
      expect(Array.isArray(loadInitialData(type)), type).toBe(true);
    }
    for (const type of ["projects", "blog", "education", "experience", "publications", "certificates", "interests", "books", "media", "trips", "countries", "speaking", "volunteering", "updates"] as const) {
      expect(loadInitialData(type).length, type).toBeGreaterThan(0);
    }
  });

  // The garden is empty since the played-games list moved to the library's
  // games shelf, so the postType mapping holds vacuously until a note exists.
  it("posts: the internal type stays 'posts' for whatever the garden holds", () => {
    const posts = loadInitialData("posts") as unknown as Loose[];
    for (const p of posts) {
      expect(p.type).toBe("posts");
    }
  });

  it("every item's internal type matches the requested content type", () => {
    for (const type of ALL_TYPES) {
      for (const item of loadInitialData(type) as unknown as Loose[]) {
        expect(item.type, `${type}/${item.slug}`).toBe(type);
      }
    }
  });

  it("only updates carry an updateType (defaulting to 'note')", () => {
    for (const b of loadInitialData("books") as unknown as Loose[]) {
      expect(b.postType).toBeUndefined();
      expect(b.updateType).toBeUndefined();
    }
    for (const u of loadInitialData("updates") as unknown as Loose[]) {
      expect(typeof u.updateType).toBe("string");
    }
  });
});

// Oracle comparators: replicas of the pre-refactor sort logic. The refactored
// loader must produce orderings that these comparators consider sorted.
const byDateDesc =
  (field: string) => (a: Loose, b: Loose) =>
    new Date((b[field] as string) || 0).getTime() -
    new Date((a[field] as string) || 0).getTime();
const byYearDesc = (a: Loose, b: Loose) =>
  parseInt((b.year as string) || "0", 10) -
  parseInt((a.year as string) || "0", 10);

const SORT_ORACLES: Array<[ContentType, (a: Loose, b: Loose) => number]> = [
  ["updates", byDateDesc("date")],
  ["blog", byDateDesc("date")],
  ["awards", byDateDesc("date")],
  ["speaking", byDateDesc("date")],
  ["certificates", byDateDesc("date")],
  ["experience", byDateDesc("startDate")],
  ["education", byDateDesc("startDate")],
  ["volunteering", byDateDesc("startDate")],
  ["organizations", byDateDesc("startDate")],
  ["publications", byYearDesc],
  // Recency-ordered since 2026-07-24 so capped previews show the latest.
  ["projects", byYearDesc],
  ["trips", byDateDesc("date")],
  ["posts", byDateDesc("date")],
  ["courses", byDateDesc("date")],
  ["media", byDateDesc("date")],
];

describe("loadInitialData: sorting", () => {
  it.each(SORT_ORACLES.map(([t]) => t))(
    "%s items come back in the pinned order",
    (type) => {
      const oracle = SORT_ORACLES.find(([t]) => t === type)![1];
      const items = loadInitialData(type) as unknown as Loose[];
      // A stable re-sort with the original comparator must be a no-op.
      const resorted = [...items].sort(oracle);
      expect(items.map((i) => i.id)).toEqual(resorted.map((i) => i.id));
    }
  );

  // The universal rule since 2026-07-24: anything undated reads alphabetically.
  it("undated types come back in alphabetical order", () => {
    for (const type of ["books", "interests", "countries", "references"] as ContentType[]) {
      const items = loadInitialData(type) as unknown as Loose[];
      const labels = items.map((i) => String(i.title ?? i.name ?? ""));
      expect(labels).toEqual([...labels].sort((a, b) => a.localeCompare(b)));
    }
  });
});

describe("loadSettings", () => {
  it("returns the profile from settings markdown with a name and role", () => {
    const s = loadSettings();
    expect(typeof s.name).toBe("string");
    expect(s.name.length).toBeGreaterThan(0);
    expect(typeof s.role).toBe("string");
  });
});
