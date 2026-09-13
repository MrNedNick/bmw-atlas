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
      expect(asset.reference?.imageId).toMatch(/^P\d+$/);
      expect(asset.reference?.page).toContain(asset.reference?.imageId);
      expect(asset.reference?.imageUrl).toContain(asset.reference?.imageId);
      expect(
        existsSync(
          new URL(`../../../../${asset.reference?.localFile}`, import.meta.url),
        ),
      ).toBe(true);
      expect(asset.reference?.phase).toBe(entry.imagePhase);
      expect(asset.reference?.verifiedDetails.length).toBeGreaterThanOrEqual(5);
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
