import { describe, expect, it } from "vitest";
import { currentRelease, validateRelease } from "./validate-data";

describe("catalog release schema", () => {
  it("accepts the complete current release", () => {
    expect(validateRelease(currentRelease())).toEqual([]);
  });

  it("blocks release on an invalid foreign source", () => {
    const release = structuredClone(currentRelease());
    release.families[0].generations[0].source = "missing-source";
    expect(validateRelease(release)).toContain(
      "unknown source: missing-source",
    );
  });

  it("blocks release on an invalid date scope and negative range", () => {
    const release = structuredClone(currentRelease());
    release.variants[0].observedAt = "2024-02-30";
    release.families[0].generations[0].end = 1900;
    expect(validateRelease(release)).toContain(
      `invalid observation date: ${release.variants[0].id}`,
    );
    expect(validateRelease(release)).toContain(
      `invalid dates: ${release.families[0].generations[0].id}`,
    );
  });

  it("blocks release on an invalid unit", () => {
    const release = structuredClone(currentRelease());
    const powertrain = release.families
      .flatMap((family) => family.generations)
      .flatMap((generation) => generation.powertrains)[0];
    Object.assign(powertrain, { powerUnit: "watts" });
    expect(validateRelease(release)).toContain(
      `invalid unit: ${powertrain.id}`,
    );
  });
});
