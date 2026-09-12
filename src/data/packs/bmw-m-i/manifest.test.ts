import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { assetByGeneration } from "../../assets";
import { families } from "../../models";
import { sourceById } from "../../sources";
import { bmwMIInventory } from "./manifest";

describe("BMW M and i progress manifest", () => {
  it("keeps every completed object connected to a card, source and local image", () => {
    const generationIds = new Set(
      families.flatMap((family) =>
        family.generations.map((generation) => generation.id),
      ),
    );
    for (const entry of bmwMIInventory) {
      expect(generationIds.has(entry.generationId)).toBe(true);
      expect(entry.sourceIds.every((id) => sourceById[id])).toBe(true);
      const asset = assetByGeneration[entry.generationId];
      expect(asset).toBeDefined();
      expect(
        existsSync(new URL(`../../../../public/${asset.url}`, import.meta.url)),
      ).toBe(true);
      expect(entry.missingFields.length).toBeGreaterThan(0);
    }
  });

  it("does not classify M4 or XM as M Sport", () => {
    expect(
      bmwMIInventory
        .filter((entry) => entry.lineage === "M")
        .map((entry) => entry.family),
    ).toEqual(["M4", "XM"]);
  });
});
