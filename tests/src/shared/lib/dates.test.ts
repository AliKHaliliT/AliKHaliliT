import { describe, expect, it } from "vitest";
import { formatMonthYear, formatMonthYearRange } from "@/shared/lib/dates";

describe("formatMonthYear", () => {
  it("formats YYYY-MM as 'Mmm YYYY'", () => {
    expect(formatMonthYear("2024-01")).toBe("Jan 2024");
    expect(formatMonthYear("2023-12")).toBe("Dec 2023");
  });

  it("returns a bare year unchanged", () => {
    expect(formatMonthYear("2024")).toBe("2024");
  });

  it("is timezone-independent (no Date parsing)", () => {
    // "2024-01" via new Date() would render Dec 2023 west of UTC.
    expect(formatMonthYear("2024-01")).toBe("Jan 2024");
  });
});

describe("formatMonthYearRange", () => {
  it("renders start – end", () => {
    expect(formatMonthYearRange("2021-09", "2023-04")).toBe(
      "Sep 2021 – Apr 2023"
    );
  });

  it("renders Present without an end date (including empty string)", () => {
    expect(formatMonthYearRange("2021-09")).toBe("Sep 2021 – Present");
    expect(formatMonthYearRange("2021-09", "")).toBe("Sep 2021 – Present");
  });

  it("returns null without a start date", () => {
    expect(formatMonthYearRange(undefined, "2023-04")).toBeNull();
    expect(formatMonthYearRange("")).toBeNull();
  });
});
