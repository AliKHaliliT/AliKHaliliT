// The display labels and the employment-kind reader the list pages share.

import { describe, expect, it } from "vitest";
import { employmentTypes } from "@/entities/record/labels";

describe("employmentTypes", () => {
  it("reads an entry that names no kind as none", () => {
    expect(employmentTypes(undefined)).toEqual([]);
  });

  it("reads one kind as a list of one", () => {
    expect(employmentTypes("contract")).toEqual(["contract"]);
  });

  it("keeps several kinds in the order written", () => {
    expect(employmentTypes(["contract", "part-time"])).toEqual(["contract", "part-time"]);
  });
});
