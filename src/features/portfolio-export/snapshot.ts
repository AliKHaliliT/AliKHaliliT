// Builds the portfolio.json export: a full snapshot of the owner's profile
// and every content collection (localStorage edits included, via
// ContentService). Feeds the resume builder's import and doubles as a backup.

import { ContentService } from "@/entities/record";
import { loadStoredPalette, SEED_PALETTE } from "@/entities/site";
import {
  PORTFOLIO_CONTENT_TYPES,
  PORTFOLIO_FORMAT,
  PORTFOLIO_VERSION,
  type PortfolioSnapshot,
} from "./contract";

/**
 * Gathers the whole record into one snapshot.
 *
 * @param nowIso - The export moment, passed in so the builder stays pure.
 *
 * @returns The snapshot, carrying every collection plus the profile and the
 *   palette currently in force.
 */
export function buildPortfolioSnapshot(exportedAt: string): PortfolioSnapshot {
  const content: PortfolioSnapshot["content"] = {};
  for (const type of PORTFOLIO_CONTENT_TYPES) {
    content[type] = ContentService.getAll(type);
  }
  return {
    format: PORTFOLIO_FORMAT,
    version: PORTFOLIO_VERSION,
    exportedAt,
    settings: ContentService.getSettings(),
    // The owner's current look rides along so the importer can adopt it.
    palette: loadStoredPalette() ?? SEED_PALETTE,
    content,
  };
}

/** Exact file format for portfolio.json (what the resume builder imports). */
export function toPortfolioFileJson(snapshot: PortfolioSnapshot): string {
  return JSON.stringify(snapshot, null, 2) + "\n";
}
