// Characterization tests for ContentService: pins the localStorage-first,
// bundled-markdown-fallback behavior before refactoring.

import { beforeEach, describe, expect, it, vi } from "vitest";
import { installLocalStorageMock } from "@/shared/testing/localStorageMock";
import { ContentService } from "@/entities/record/store";
import { loadInitialData, loadSettings } from "@/entities/record/seed";

let store: Map<string, string>;

beforeEach(() => {
  store = installLocalStorageMock();
  vi.restoreAllMocks();
});

describe("ContentService.getAll", () => {
  it("falls back to bundled markdown when localStorage is empty", () => {
    expect(ContentService.getAll("books")).toEqual(loadInitialData("books"));
  });

  it("returns the localStorage copy verbatim when present (shadows markdown)", () => {
    const custom = [{ id: "x", type: "books", title: "Only me" }];
    store.set("os_content_books", JSON.stringify(custom));
    expect(ContentService.getAll("books")).toEqual(custom);
  });

  it("falls back to bundled markdown when the stored value is corrupt JSON", () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    store.set("os_content_books", "{not json");
    expect(ContentService.getAll("books")).toEqual(loadInitialData("books"));
    expect(errSpy).toHaveBeenCalled();
  });

  it("falls back to bundled markdown when the stored shape breaks the contract", () => {
    // Parseable JSON of the wrong shape used to reach the pages untouched and
    // crash somewhere far from the cause; now the door rejects it.
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    store.set("os_content_books", JSON.stringify({ id: "x", type: "books" }));
    expect(ContentService.getAll("books")).toEqual(loadInitialData("books"));
    expect(errSpy).toHaveBeenCalled();
  });

  it("falls back when stored items are filed under the wrong collection", () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    store.set("os_content_books", JSON.stringify([{ id: "x", type: "projects" }]));
    expect(ContentService.getAll("books")).toEqual(loadInitialData("books"));
    expect(errSpy).toHaveBeenCalled();
  });
});

describe("ContentService.save", () => {
  it("writes JSON under os_content_<type>", () => {
    const items = [{ id: 1, type: "books", title: "T" }];
    // Current behavior: cast-free call sites pass AnyContentItem[]; shape is not validated.
    ContentService.save("books", items as never);
    expect(JSON.parse(store.get("os_content_books")!)).toEqual(items);
  });
});

describe("ContentService settings", () => {
  it("falls back to bundled settings markdown when localStorage is empty", () => {
    expect(ContentService.getSettings()).toEqual(loadSettings());
  });

  it("returns stored settings verbatim when present", () => {
    const s = { id: "profile", type: "settings", name: "Stored", role: "Dev" };
    store.set("os_settings", JSON.stringify(s));
    expect(ContentService.getSettings()).toEqual(s);
  });

  it("saveSettings writes to os_settings", () => {
    const s = { id: "profile", type: "settings", name: "N", role: "R" };
    ContentService.saveSettings(s as never);
    expect(JSON.parse(store.get("os_settings")!)).toEqual(s);
  });
});
