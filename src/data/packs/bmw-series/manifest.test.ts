import { describe, expect, it } from "vitest";
import { assetByGeneration } from "../../assets";
import { families } from "../../models";
import { sources } from "../../sources";
import { bmwSeriesInventory, validateSeriesInventory } from "./manifest";

describe("BMW numbered-series inventory", () => {
  it("has a source-backed coverage state for every inventoried lineage", () => {
    expect(
      validateSeriesInventory(
        bmwSeriesInventory,
        sources,
        families,
        assetByGeneration,
      ),
    ).toEqual([]);
    expect(new Set(bmwSeriesInventory.map((item) => item.series))).toEqual(
      new Set(["1", "2", "4", "6", "7", "8"]),
    );
  });

  it("groups body codes inside one generation record", () => {
    const firstFour = bmwSeriesInventory.filter(
      (item) => item.series === "4" && item.generationKey === "f3x",
    );
    expect(firstFour).toHaveLength(1);
    expect(firstFour[0].chassisCodes).toEqual(["F32", "F33", "F36"]);
  });

  it("keeps the historical break in the 8 Series lineage", () => {
    expect(
      bmwSeriesInventory.find((item) => item.generationKey === "g1x")
        ?.continuity,
    ).toBe("restart-after-gap");
  });

  it("makes G70 the first complete detailed dossier", () => {
    const detailed = bmwSeriesInventory.filter(
      (item) => item.status === "detailed",
    );
    expect(detailed.map((item) => item.generationId)).toEqual(["bmw-7-g70"]);
    expect(detailed[0].aliases).toContain("i7");
    expect(detailed[0].missingFields).toContain(
      "отдельное изображение обновления 2026 года",
    );
  });

  it("rejects an image whose licence metadata is unavailable", () => {
    const withoutLicensedPhoto = { ...assetByGeneration };
    delete withoutLicensedPhoto["bmw-7-g70"];
    expect(
      validateSeriesInventory(
        bmwSeriesInventory,
        sources,
        families,
        withoutLicensedPhoto,
      ),
    ).toContain("missing detailed photo: bmw-series-7-g70");
  });
});
