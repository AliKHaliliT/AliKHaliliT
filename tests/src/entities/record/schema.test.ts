// The record contract: what a collection must look like to enter the site,
// and what the guards say when it does not.

import { describe, expect, it } from "vitest";
import {
  RecordContractError,
  validateItems,
  validateSeedItem,
  validateSettings,
} from "@/entities/record/schema";

const SOURCE = 'localStorage "os_content_books"';

describe("validateItems", () => {
  it("passes a well-formed collection through unchanged", () => {
    const items = [{ id: "x", slug: "x", type: "books", title: "Only me" }];
    expect(validateItems(items, "books", SOURCE)).toBe(items);
  });

  it("accepts a numeric id, which the editing surface still writes", () => {
    expect(validateItems([{ id: 1, type: "books" }], "books", SOURCE)).toHaveLength(1);
  });

  it("rejects a value that is not a list", () => {
    expect(() => validateItems({ id: "x", type: "books" }, "books", SOURCE)).toThrow(
      RecordContractError
    );
  });

  it("rejects an item stored under the wrong collection", () => {
    expect(() => validateItems([{ id: "x", type: "projects" }], "books", SOURCE)).toThrow(
      /claims type "projects"/
    );
  });

  it("rejects an item with no usable id", () => {
    expect(() => validateItems([{ type: "books" }], "books", SOURCE)).toThrow(/no usable id/);
  });

  it("rejects tags that are not a list", () => {
    expect(() =>
      validateItems([{ id: "x", type: "books", tags: "one" }], "books", SOURCE)
    ).toThrow(/tags is present but not a list/);
  });

  it("names the source and the offending index", () => {
    try {
      validateItems([{ id: "ok", type: "books" }, null], "books", SOURCE);
      expect.unreachable("expected a contract error");
    } catch (e) {
      expect(e).toBeInstanceOf(RecordContractError);
      expect((e as RecordContractError).source).toBe(SOURCE);
      expect((e as Error).message).toContain("at index 1");
    }
  });
});

describe("validateSeedItem", () => {
  it("names the markdown file when frontmatter cannot make an item", () => {
    expect(() => validateSeedItem({ type: "books" }, "books", "src/content/books/x.md")).toThrow(
      /src\/content\/books\/x\.md/
    );
  });
});

describe("validateSettings", () => {
  it("accepts the minimum a profile needs", () => {
    const settings = { id: "profile", type: "settings", name: "Stored", role: "Dev" };
    expect(validateSettings(settings, "seed")).toBe(settings);
  });

  it("rejects a profile with no name", () => {
    expect(() => validateSettings({ id: "profile", type: "settings" }, "seed")).toThrow(
      /no name/
    );
  });

  it("rejects a collection where a profile belongs", () => {
    expect(() => validateSettings([], "seed")).toThrow(/not an object/);
  });
});
