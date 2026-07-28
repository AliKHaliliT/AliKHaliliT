// Builds the portfolio.json export: a full snapshot of the owner's profile
// and every content collection (localStorage edits included, via
// ContentService). Feeds the resume builder's import and doubles as a backup.

import { ContentService } from "./contentService";
import {
  PORTFOLIO_CONTENT_TYPES,
  PORTFOLIO_FORMAT,
  PORTFOLIO_VERSION,
  type PortfolioSnapshot,
} from "@/types/portfolio";

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
    content,
  };
}

/** Exact file format for portfolio.json (what the resume builder imports). */
export function toPortfolioFileJson(snapshot: PortfolioSnapshot): string {
  return JSON.stringify(snapshot, null, 2) + "\n";
}
