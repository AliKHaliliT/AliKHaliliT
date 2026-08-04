import { describe, expect, it } from "vitest";
import { parseKeyValue, skillIcon } from "@/shared/lib/skills";

describe("parseKeyValue", () => {
  it("parses Category: item, item lines", () => {
    expect(parseKeyValue("Core AI: TensorFlow, PyTorch\nRobotics: ROS2")).toEqual([
      { category: "Core AI", items: ["TensorFlow", "PyTorch"] },
      { category: "Robotics", items: ["ROS2"] },
    ]);
  });

  it("keeps colon-less lines as bare names instead of dropping them", () => {
    expect(parseKeyValue("English\nFarsi: Native")).toEqual([
      { category: "English", items: [] },
      { category: "Farsi", items: ["Native"] },
    ]);
  });

  it("survives empty and whitespace-only input", () => {
    expect(parseKeyValue("")).toEqual([]);
    expect(parseKeyValue("  \n \n")).toEqual([]);
  });
});

describe("skillIcon", () => {
  it("matches keywords case-insensitively and falls back for unknowns", () => {
    expect(skillIcon("Computer Vision")).not.toBe(skillIcon("Underwater Basket Weaving"));
    expect(skillIcon("NLP & LLMs")).toBeTruthy();
  });
});
