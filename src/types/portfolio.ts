// The portfolio.json contract: the file the site exports and the resume
// builder (its own repo in the VITA ecosystem) imports. The builder keeps its
// OWN copy of this contract; the `format`/`version` fields are what keep the
// two sides honest across repos.

import { AnyContentItem, ContentType, UserSettings } from "./content";

export const PORTFOLIO_FORMAT = "vita-portfolio";
export const PORTFOLIO_VERSION = 1;

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
  "courses",
  "trips",
  "countries",
];

export interface PortfolioSnapshot {
  format: typeof PORTFOLIO_FORMAT;
  version: number;
  exportedAt: string;
  settings: UserSettings;
  content: Partial<Record<PortfolioContentType, AnyContentItem[]>>;
}
