// Pins the palette override contract: preset integrity, generated CSS
// specificity/shape, and storage round-trip guards.

import { describe, it, expect, beforeEach } from "vitest";
import { installLocalStorageMock } from "@/shared/testing/localStorageMock";
import {
  PALETTE_PRESETS,
  SEED_PALETTE,
  TOKEN_GUIDE,
  generatePaletteCss,
  getPreset,
  loadStoredPalette,
  saveStoredPalette,
  toSeedFileJson,
} from "@/entities/site/palette";

const HEX = /^#[0-9a-f]{6}$/i;

describe("palette presets", () => {
  it("every preset defines every token as 6-digit hex in both modes", () => {
    for (const preset of PALETTE_PRESETS) {
      for (const mode of ["light", "dark"] as const) {
        for (const { key } of TOKEN_GUIDE) {
          expect(preset[mode][key], `${preset.id}.${mode}.${key}`).toMatch(HEX);
        }
      }
    }
  });

  it("preset ids are unique", () => {
    const ids = PALETTE_PRESETS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("seed palette (src/content/settings/palette.json)", () => {
  it("defines every token as 6-digit hex in both modes", () => {
    for (const mode of ["light", "dark"] as const) {
      for (const { key } of TOKEN_GUIDE) {
        expect(SEED_PALETTE[mode][key], `seed.${mode}.${key}`).toMatch(HEX);
      }
    }
  });

  it("matches the preset it claims to be based on (when not custom)", () => {
    if (SEED_PALETTE.basedOn === "custom") return;
    const preset = getPreset(SEED_PALETTE.basedOn);
    expect(preset, `seed.basedOn "${SEED_PALETTE.basedOn}" must name a preset`).toBeDefined();
    expect(SEED_PALETTE.light).toEqual(preset!.light);
    expect(SEED_PALETTE.dark).toEqual(preset!.dark);
  });

  it("round-trips through the export format", () => {
    const parsed = JSON.parse(toSeedFileJson(SEED_PALETTE));
    expect(parsed).toEqual({
      basedOn: SEED_PALETTE.basedOn,
      light: SEED_PALETTE.light,
      dark: SEED_PALETTE.dark,
    });
  });
});

describe("generatePaletteCss", () => {
  const p = getPreset("meridian")!;

  it("scopes light to :root:root and dark to the dark theme attribute", () => {
    const css = generatePaletteCss(p);
    expect(css).toContain(":root:root {");
    expect(css).toContain(':root:root[data-theme="dark"] {');
  });

  it("writes the raw variable layer that the token utilities resolve through", () => {
    const css = generatePaletteCss(p);
    expect(css).toContain(`--surface: ${p.light.background};`);
    expect(css).toContain(`--footer-ink: ${p.dark.footerInk};`);
  });

  it("writes each variable exactly once per mode", () => {
    // The override used to append a legacy alias of the accent, which became a
    // duplicate declaration once the variables took their own names.
    const light = generatePaletteCss(p).split("\n")[0];
    const signals = light.match(/--signal:/g) ?? [];
    expect(signals).toHaveLength(1);
  });
});

describe("stored palette round-trip", () => {
  beforeEach(() => {
    installLocalStorageMock();
  });

  it("returns null when nothing is saved", () => {
    expect(loadStoredPalette()).toBeNull();
  });

  it("round-trips a saved palette", () => {
    const preset = getPreset("blueprint")!;
    saveStoredPalette({ basedOn: "blueprint", light: preset.light, dark: preset.dark });
    const loaded = loadStoredPalette();
    expect(loaded?.basedOn).toBe("blueprint");
    expect(loaded?.dark.signal).toBe(preset.dark.signal);
  });

  it("rejects malformed payloads instead of throwing", () => {
    localStorage.setItem("os_palette", "{not json");
    expect(loadStoredPalette()).toBeNull();
    localStorage.setItem("os_palette", JSON.stringify({ basedOn: "x" }));
    expect(loadStoredPalette()).toBeNull();
  });
});
