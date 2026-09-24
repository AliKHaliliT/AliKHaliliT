// The read-only record door: override-first while the fingerprint holds,
// seed-wins the moment a redeploy changes the markdown underneath, and a
// broken override named for the page instead of rendered.

import { beforeEach, describe, expect, it } from "vitest";
import { installLocalStorageMock } from "@/shared/testing/localStorageMock";
import { ContentService } from "@/entities/record/store";
import { loadInitialData, loadSettings, seedFingerprint } from "@/entities/record/seed";

let store: Map<string, string>;

beforeEach(() => {
  store = installLocalStorageMock();
});

const refusedKeys = () => ContentService.refused().map((r) => r.key);

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
    const custom = [{ id: "x", type: "books", title: "Only me" }];
    store.set("os_content_books", JSON.stringify(custom));
    store.set("os_content_seed_books", "some-older-fingerprint");
    expect(ContentService.getAll("books")).toEqual(loadInitialData("books"));
    expect(store.has("os_content_books")).toBe(false);
    expect(store.has("os_content_seed_books")).toBe(false);
  });

  it("does not name a stale override it dropped, since dropping it is the designed path", () => {
    store.set("os_content_books", JSON.stringify([{ id: "x", type: "books", title: "Only me" }]));
    store.set("os_content_seed_books", "some-older-fingerprint");
    ContentService.getAll("books");
    expect(refusedKeys()).not.toContain("os_content_books");
  });

  it("falls back to bundled markdown and names the key when the stored value is corrupt JSON", () => {
    store.set("os_content_books", "{not json");
    expect(ContentService.getAll("books")).toEqual(loadInitialData("books"));
    expect(ContentService.refused()).toContainEqual({
      key: "os_content_books",
      type: "books",
      reason: expect.stringMatching(/\S/),
    });
  });

  it("falls back and names the key when the stored shape breaks the contract", () => {
    // Parseable JSON of the wrong shape used to reach the pages untouched and
    // crash somewhere far from the cause; now the door rejects it.
    store.set("os_content_books", JSON.stringify({ id: "x", type: "books" }));
    expect(ContentService.getAll("books")).toEqual(loadInitialData("books"));
    expect(refusedKeys()).toContain("os_content_books");
  });

  it("falls back and names the key when stored items are filed under the wrong collection", () => {
    store.set("os_content_books", JSON.stringify([{ id: "x", type: "projects" }]));
    expect(ContentService.getAll("books")).toEqual(loadInitialData("books"));
    expect(refusedKeys()).toContain("os_content_books");
  });

  it("forgets a refusal once the key reads cleanly again", () => {
    store.set("os_content_books", "{not json");
    ContentService.getAll("books");
    store.set("os_content_books", JSON.stringify([{ id: "x", type: "books", title: "Fixed" }]));
    ContentService.getAll("books");
    expect(refusedKeys()).not.toContain("os_content_books");
  });

  it("treats unreadable storage as holding nothing, naming no key", () => {
    Object.defineProperty(globalThis, "localStorage", {
      value: {
        getItem: () => {
          throw new Error("storage is disabled in this browser");
        },
      },
      configurable: true,
      writable: true,
    });
    expect(ContentService.getAll("books")).toEqual(loadInitialData("books"));
    expect(refusedKeys()).not.toContain("os_content_books");
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

  it("falls back to bundled settings and names the key when the stored profile breaks the contract", () => {
    store.set("os_settings", JSON.stringify({ id: "profile", type: "books" }));
    expect(ContentService.getSettings()).toEqual(loadSettings());
    expect(ContentService.refused()).toContainEqual({
      key: "os_settings",
      type: "settings",
      reason: expect.stringMatching(/\S/),
    });
  });
});
