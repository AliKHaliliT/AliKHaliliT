// The read-only record door: override-first while the fingerprint holds,
// seed-wins the moment a redeploy changes the markdown underneath.

import { beforeEach, describe, expect, it, vi } from "vitest";
import { installLocalStorageMock } from "@/shared/testing/localStorageMock";
import { ContentService } from "@/entities/record/store";
import { loadInitialData, loadSettings, seedFingerprint } from "@/entities/record/seed";

let store: Map<string, string>;

beforeEach(() => {
  store = installLocalStorageMock();
  vi.restoreAllMocks();
});

describe("ContentService.getAll", () => {
  it("falls back to bundled markdown when localStorage is empty", () => {
    expect(ContentService.getAll("books")).toEqual(loadInitialData("books"));
  });

  it("returns the localStorage copy while the seed fingerprint still matches", () => {
    const custom = [{ id: "x", type: "books", title: "Only me" }];
    store.set("os_content_books", JSON.stringify(custom));
    store.set("os_content_seed_books", seedFingerprint("books"));
    expect(ContentService.getAll("books")).toEqual(custom);
  });

  it("keeps an override that carries no fingerprint at all", () => {
    const custom = [{ id: "x", type: "books", title: "Only me" }];
    store.set("os_content_books", JSON.stringify(custom));
    expect(ContentService.getAll("books")).toEqual(custom);
  });

  it("drops the override and serves the seed when the markdown changed underneath", () => {
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    const custom = [{ id: "x", type: "books", title: "Only me" }];
    store.set("os_content_books", JSON.stringify(custom));
    store.set("os_content_seed_books", "some-older-fingerprint");
    expect(ContentService.getAll("books")).toEqual(loadInitialData("books"));
    expect(store.has("os_content_books")).toBe(false);
    expect(store.has("os_content_seed_books")).toBe(false);
    expect(infoSpy).toHaveBeenCalled();
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

describe("ContentService settings", () => {
  it("falls back to bundled settings markdown when localStorage is empty", () => {
    expect(ContentService.getSettings()).toEqual(loadSettings());
  });

  it("returns stored settings verbatim when present", () => {
    const s = { id: "profile", type: "settings", name: "Stored", role: "Dev" };
    store.set("os_settings", JSON.stringify(s));
    expect(ContentService.getSettings()).toEqual(s);
  });

});
