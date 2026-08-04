// Skill parsing and iconography, shared by the home telemetry chapter and
// the /skills page (kept out of the component file for fast-refresh).

import { type LucideIcon, Bot, Box, Brain, Cloud, Code2, Cog, Cpu, Database, Eye, Globe, MessageSquare, Ruler, Sparkles, TerminalSquare } from "lucide-react";

/** One parsed category line: the category and the items listed under it. */
export interface SkillGroup {
  category: string;
  items: string[];
}

/** Parse structured settings text: one `Category: item, item` per line.
 *  Forgiving by design: a line without a colon still renders as a bare
 *  name (nothing a visitor typed into Settings can crash the site). */
export const parseKeyValue = (raw: string): SkillGroup[] =>
  raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const colon = line.indexOf(":");
      if (colon === -1) return { category: line, items: [] };
      return {
        category: line.slice(0, colon).trim() || line,
        items: line
          .slice(colon + 1)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };
    });

/** Glyph for a skill category, matched on keywords so owner-invented
 *  category names still get a sensible instrument face. */
const SKILL_ICON_RULES: Array<[RegExp, LucideIcon]> = [
  [/vision|image/i, Eye],
  [/geo|spatial|map/i, Globe],
  [/nlp|llm|language model|prompt/i, MessageSquare],
  [/agent/i, Bot],
  [/ai|machine learning|deep/i, Brain],
  [/cloud|infrastructure|devops/i, Cloud],
  [/robot/i, Cog],
  [/embedded|edge|iot|hardware/i, Cpu],
  [/data|database|time-series|knowledge/i, Database],
  [/cad|simulation|design software/i, Box],
  [/software|language|framework|code/i, Code2],
  [/platform|tool/i, TerminalSquare],
  [/principle|engineering|architecture/i, Ruler],
];
/**
 * Picks a glyph for a skill category by keyword.
 *
 * Matching on keywords rather than an enum is deliberate, since the owner
 * invents their own category names and every one of them still needs a face.
 *
 * @param category - The category name as the owner wrote it.
 *
 * @returns The matching glyph, or a neutral sparkle when nothing matches.
 */
export const skillIcon = (category: string): LucideIcon =>
  SKILL_ICON_RULES.find(([re]) => re.test(category))?.[1] ?? Sparkles;
