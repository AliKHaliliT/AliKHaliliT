// The portfolio.json contract: the file the site exports and the resume
// builder (its own repo in the VITA ecosystem) imports. The builder keeps its
// OWN copy of this contract; the `format`/`version` fields are what keep the
// two sides honest across repos.

import { AnyContentItem, ContentType, UserSettings } from "@/entities/record";
import type { Palette } from "@/entities/site";

/** The format name every export carries, and what the builder checks first. */
export const PORTFOLIO_FORMAT = "vita-portfolio";
/** The contract revision this site writes. */
export const PORTFOLIO_VERSION = 1;

/** The collections a snapshot carries, which is every one but settings. */
export type PortfolioContentType = Exclude<ContentType, "settings">;

/** Every content collection, in the canonical order used by the exporter. */
export const PORTFOLIO_CONTENT_TYPES: PortfolioContentType[] = [
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
  "projects",
  "posts",
  "blog",
  "updates",
  "books",
  "media",
  "courses",
  "trips",
  "countries",
];

/**
 * A whole exported record: the envelope, the profile, the palette, the content.
 *
 * This is the site's half of a contract the sister repositories keep their own
 * copies of; the format and version fields are what keep the halves honest. The
 * snapshot doubles as a complete backup of the record.
 */
export interface PortfolioSnapshot {
  format: typeof PORTFOLIO_FORMAT;
  version: number;
  exportedAt: string;
  settings: UserSettings;
  /** The owner's chosen look, so the sister apps can adopt it. Optional
   *  because older exports predate it. */
  palette?: Palette & { basedOn?: string };
  content: Partial<Record<PortfolioContentType, AnyContentItem[]>>;
}
