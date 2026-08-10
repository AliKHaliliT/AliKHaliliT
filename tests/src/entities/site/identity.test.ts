// Pins the site identity contract: seed validity, export format, and the
// localStorage override round-trip (mirrors palette.test.ts).

import { describe, it, expect, beforeEach } from "vitest";
import { installLocalStorageMock } from "@/shared/testing/localStorageMock";
import {
  SEED_SITE,
  currentSite,
  loadStoredSite,
  toSeedFileJson,
} from "@/entities/site/identity";
import {
  SITE_KEYS,
  SITE_OPTIONAL_KEYS,
  escapeHtml,
  isSiteIdentity,
  siteHeadTags,
  siteMark,
} from "@/entities/site/meta";

describe("site seed (src/content/settings/site.json)", () => {
  it("defines every identity field as a string", () => {
    expect(isSiteIdentity(SEED_SITE)).toBe(true);
    for (const key of ["name", "title", "description", "author"] as const) {
      expect(SEED_SITE[key].length, `seed.${key} must not be empty`).toBeGreaterThan(0);
    }
  });

  it("round-trips through the export format", () => {
    const parsed = JSON.parse(toSeedFileJson(SEED_SITE));
    expect(parsed).toEqual({
      ...Object.fromEntries(SITE_KEYS.map((key) => [key, SEED_SITE[key]])),
      ...Object.fromEntries(
        SITE_OPTIONAL_KEYS.filter((key) => SEED_SITE[key] !== undefined).map(
          (key) => [key, SEED_SITE[key]]
        )
      ),
      // The demo seed ships one pageCopy override on purpose (it documents
      // the feature); the exporter carries it through.
      pageCopy: SEED_SITE.pageCopy,
    });
  });

  it("keeps owner-voice overrides through the export format", () => {
    const edited = { ...SEED_SITE, tagline: "Made in a shed,\nshipped anyway.", colophon: "By me" };
    const parsed = JSON.parse(toSeedFileJson(edited));
    expect(parsed.tagline).toBe("Made in a shed,\nshipped anyway.");
    expect(parsed.colophon).toBe("By me");
  });

  it("persists only non-empty page-copy overrides", () => {
    const edited = {
      ...SEED_SITE,
      pageCopy: { blog: "Dispatches from the lab.", projects: "   ", garden: "" },
    };
    const parsed = JSON.parse(toSeedFileJson(edited));
    expect(parsed.pageCopy).toEqual({ blog: "Dispatches from the lab." });
    // With nothing set, the key is omitted entirely.
    expect(JSON.parse(toSeedFileJson({ ...SEED_SITE, pageCopy: undefined })).pageCopy).toBeUndefined();
  });

  it("validates page copy as an optional record of strings", () => {
    expect(isSiteIdentity({ ...SEED_SITE, pageCopy: { blog: "hi" } })).toBe(true);
    expect(isSiteIdentity({ ...SEED_SITE, pageCopy: undefined })).toBe(true);
    expect(isSiteIdentity({ ...SEED_SITE, pageCopy: { blog: 3 } })).toBe(false);
    expect(isSiteIdentity({ ...SEED_SITE, pageCopy: "blog" })).toBe(false);
  });
});

describe("siteMark", () => {
  it("prefers the explicit mark and falls back to name initials", () => {
    expect(siteMark({ ...SEED_SITE, mark: "OS" })).toBe("OS");
    expect(siteMark({ ...SEED_SITE, name: "Personal OS", mark: "" })).toBe("PO");
    expect(siteMark({ ...SEED_SITE, name: "Vita", mark: undefined })).toBe("V");
    expect(siteMark({ ...SEED_SITE, name: "  ", mark: "  " })).toBe("◇");
  });

  it("accepts identities with and without the optional fields", () => {
    expect(isSiteIdentity({ ...SEED_SITE, mark: undefined })).toBe(true);
    expect(isSiteIdentity({ ...SEED_SITE, mark: 3 })).toBe(false);
    expect(isSiteIdentity({ ...SEED_SITE, tagline: "One line", colophon: "By me" })).toBe(true);
    expect(isSiteIdentity({ ...SEED_SITE, tagline: 3 })).toBe(false);
    expect(isSiteIdentity({ ...SEED_SITE, colophon: [] })).toBe(false);
  });
});

describe("siteHeadTags", () => {
  it("emits og/twitter/author metas, og:url only when set", () => {
    const tags = siteHeadTags({ ...SEED_SITE, url: "" });
    const props = tags.map((t) => t.attrs.property ?? t.attrs.name);
    expect(props).toContain("og:title");
    expect(props).toContain("og:description");
    expect(props).toContain("twitter:card");
    expect(props).toContain("author");
    expect(props).not.toContain("og:url");

    const withUrl = siteHeadTags({ ...SEED_SITE, url: "https://example.com" });
    expect(withUrl.map((t) => t.attrs.property)).toContain("og:url");
  });

  it("escapes HTML-sensitive characters for raw splicing", () => {
    expect(escapeHtml("R&D <\"lab\">")).toBe("R&amp;D &lt;&quot;lab&quot;&gt;");
  });
});

describe("stored site round-trip", () => {
  beforeEach(() => {
    installLocalStorageMock();
  });

  it("returns null when nothing is saved and falls back to the seed", () => {
    expect(loadStoredSite()).toBeNull();
    expect(currentSite()).toEqual(SEED_SITE);
  });

  it("reads an override the admin wrote and falls back once it is cleared", () => {
    const edited = { ...SEED_SITE, name: "My Corner", title: "Me: My Corner" };
    localStorage.setItem("os_site", JSON.stringify(edited));
    expect(loadStoredSite()?.name).toBe("My Corner");
    expect(currentSite().title).toBe("Me: My Corner");
    localStorage.removeItem("os_site");
    expect(loadStoredSite()).toBeNull();
    expect(currentSite()).toEqual(SEED_SITE);
  });

  it("rejects malformed payloads instead of throwing", () => {
    localStorage.setItem("os_site", "{not json");
    expect(loadStoredSite()).toBeNull();
    localStorage.setItem("os_site", JSON.stringify({ name: "x" }));
    expect(loadStoredSite()).toBeNull();
  });
});
