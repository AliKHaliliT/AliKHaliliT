// Pins the site-side portfolio export: shape, coverage of every content
// collection, and that the file round-trips as JSON the resume builder
// (a separate repo with its own copy of this contract) will accept.

import { beforeEach, describe, expect, it } from "vitest";
import { installLocalStorageMock } from "@/shared/testing/localStorageMock";
import { buildPortfolioSnapshot, toPortfolioFileJson } from "@/features/portfolio-export/snapshot";
import {
  PORTFOLIO_CONTENT_TYPES,
  PORTFOLIO_FORMAT,
  PORTFOLIO_VERSION,
} from "@/features/portfolio-export/contract";

const NOW = "2026-07-18T00:00:00.000Z";

beforeEach(() => {
  installLocalStorageMock();
});

describe("buildPortfolioSnapshot", () => {
  it("carries format/version/exportedAt, settings, and every collection", () => {
    const snap = buildPortfolioSnapshot(NOW);
    expect(snap.format).toBe(PORTFOLIO_FORMAT);
    expect(snap.version).toBe(PORTFOLIO_VERSION);
    expect(snap.exportedAt).toBe(NOW);
    expect(snap.settings.name).toBeTruthy(); // seeded from profile.md
    for (const type of PORTFOLIO_CONTENT_TYPES) {
      expect(Array.isArray(snap.content[type]), `content.${type}`).toBe(true);
    }
    // Seed markdown guarantees at least some experience entries.
    expect(snap.content.experience!.length).toBeGreaterThan(0);
  });

  it("round-trips through the file format with the contract fields intact", () => {
    const snap = buildPortfolioSnapshot(NOW);
    const parsed = JSON.parse(toPortfolioFileJson(snap)) as Record<string, unknown>;
    // What the builder's validator keys on: format tag, version, settings,
    // and a content map holding arrays.
    expect(parsed.format).toBe(PORTFOLIO_FORMAT);
    expect(parsed.version).toBe(PORTFOLIO_VERSION);
    expect(parsed.exportedAt).toBe(NOW);
    expect(typeof parsed.settings).toBe("object");
    expect(typeof parsed.content).toBe("object");
  });
});
