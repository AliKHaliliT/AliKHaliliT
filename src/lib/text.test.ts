import { describe, expect, it } from "vitest";
import { countryCode, hostLabel, obfuscateEmail, parseProfileLinks } from "./text";

describe("hostLabel", () => {
  it("returns the hostname without the www prefix", () => {
    expect(hostLabel("https://www.kaggle.com/example")).toBe("kaggle.com");
    expect(hostLabel("https://medium.com/@user/story")).toBe("medium.com");
  });

  it("returns null for strings that are not URLs", () => {
    expect(hostLabel("not a url")).toBeNull();
  });
});

describe("parseProfileLinks", () => {
  it("parses labeled lines", () => {
    expect(
      parseProfileLinks(
        "Kaggle: https://www.kaggle.com/user\nHugging Face: https://huggingface.co/user",
      ),
    ).toEqual([
      { label: "Kaggle", url: "https://www.kaggle.com/user" },
      { label: "Hugging Face", url: "https://huggingface.co/user" },
    ]);
  });

  it("labels bare URLs by hostname", () => {
    expect(parseProfileLinks("https://www.researchgate.net/profile/X")).toEqual([
      { label: "researchgate.net", url: "https://www.researchgate.net/profile/X" },
    ]);
  });

  it("prefixes https on schemeless targets", () => {
    expect(parseProfileLinks("Kaggle: kaggle.com/user")).toEqual([
      { label: "Kaggle", url: "https://kaggle.com/user" },
    ]);
  });

  it("keeps mailto and tel targets intact", () => {
    expect(parseProfileLinks("Academic email: mailto:a@university.edu")).toEqual([
      { label: "Academic email", url: "mailto:a@university.edu" },
    ]);
  });

  it("extracts the optional [icon] token from the label", () => {
    expect(parseProfileLinks("Academic email [at]: mailto:a@university.edu")).toEqual([
      { label: "Academic email", url: "mailto:a@university.edu", icon: "at" },
    ]);
    expect(parseProfileLinks("YouTube [YouTube]: https://youtube.com/@x")).toEqual([
      { label: "YouTube", url: "https://youtube.com/@x", icon: "youtube" },
    ]);
  });

  it("skips blank lines and labels without targets", () => {
    expect(parseProfileLinks("\n  \nBroken:\n")).toEqual([]);
    expect(parseProfileLinks(undefined)).toEqual([]);
  });
});

describe("obfuscateEmail", () => {
  it("renders the at/dot form", () => {
    expect(obfuscateEmail("ali@gmail.com")).toBe("ali [at] gmail [dot] com");
    expect(obfuscateEmail("a.b@sub.uni.ca")).toBe("a.b [at] sub [dot] uni [dot] ca");
  });

  it("passes through strings without an @", () => {
    expect(obfuscateEmail("not-an-email")).toBe("not-an-email");
  });
});

describe("countryCode", () => {
  it("prefers the explicit code field", () => {
    expect(countryCode("jp", "🇪🇸")).toBe("JP");
  });

  it("recovers letters from a regional-indicator flag", () => {
    expect(countryCode(undefined, "🇪🇸")).toBe("ES");
  });

  it("returns null with neither", () => {
    expect(countryCode(undefined, undefined)).toBeNull();
  });
});
