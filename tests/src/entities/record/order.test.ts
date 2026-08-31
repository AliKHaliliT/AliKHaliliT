import { describe, expect, it } from "vitest";
import { orderItems } from "@/entities/record/order";
import { MediaItem, Project } from "@/entities/record/model";

const media = (over: Partial<MediaItem>): MediaItem => ({
  id: over.slug || "m",
  slug: over.slug || "m",
  type: "media",
  title: over.slug || "A Thing",
  medium: "film",
  ...over,
});

const project = (over: Partial<Project>): Project => ({
  id: over.slug || "p",
  slug: over.slug || "p",
  type: "projects",
  title: over.slug || "A Project",
  role: "Maker",
  year: "2024",
  ...over,
});

describe("orderItems: policies", () => {
  it("orders alphabetically by display name", () => {
    const out = orderItems(
      [media({ slug: "cedar" }), media({ slug: "alder" }), media({ slug: "birch" })],
      "media",
      "alphabetical"
    );
    expect(out.map((i) => i.slug)).toEqual(["alder", "birch", "cedar"]);
  });

  it("orders chronologically newest first, undated closing alphabetically", () => {
    const out = orderItems(
      [
        media({ slug: "undated-b" }),
        media({ slug: "old", date: "2024-01" }),
        media({ slug: "undated-a" }),
        media({ slug: "new", date: "2026-01" }),
      ],
      "media",
      "chronological"
    );
    expect(out.map((i) => i.slug)).toEqual(["new", "old", "undated-a", "undated-b"]);
  });

  it("reads a year field for year-kinded types", () => {
    const out = orderItems(
      [project({ slug: "p1", year: "2020" }), project({ slug: "p2", year: "2025" })],
      "projects",
      "chronological"
    );
    expect(out.map((i) => i.slug)).toEqual(["p2", "p1"]);
  });

  it("keeps arrival order when no policy is given", () => {
    const items = [media({ slug: "z" }), media({ slug: "a" })];
    expect(orderItems(items, "media").map((i) => i.slug)).toEqual(["z", "a"]);
  });
});

describe("orderItems: pins", () => {
  it("lifts pinned entries to the front in ascending pin order", () => {
    const out = orderItems(
      [
        media({ slug: "plain" }),
        media({ slug: "second", pin: 2 }),
        media({ slug: "first", pin: 1 }),
      ],
      "media",
      "alphabetical"
    );
    expect(out.map((i) => i.slug)).toEqual(["first", "second", "plain"]);
  });

  it("lifts pins even without a policy and ignores unusable pin values", () => {
    const out = orderItems(
      [
        media({ slug: "plain" }),
        media({ slug: "bad", pin: "soon" as unknown as number }),
        media({ slug: "good", pin: 1 }),
      ],
      "media"
    );
    expect(out.map((i) => i.slug)).toEqual(["good", "plain", "bad"]);
  });

  it("breaks pin ties by the policy order and never mutates the input", () => {
    const items = [
      media({ slug: "b", pin: 1 }),
      media({ slug: "a", pin: 1 }),
      media({ slug: "c" }),
    ];
    const out = orderItems(items, "media", "alphabetical");
    expect(out.map((i) => i.slug)).toEqual(["a", "b", "c"]);
    expect(items.map((i) => i.slug)).toEqual(["b", "a", "c"]);
  });
});
