import { existsSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { allGenerations } from "../models";
import { assetByGeneration, validateAssetRegistry } from ".";

describe("photo asset registry", () => {
  const generationIds = allGenerations.map(({ generation }) => generation.id);

  it("assigns exactly one local asset to its own generation", () => {
    expect(validateAssetRegistry(assetByGeneration, generationIds)).toEqual([]);
    expect(Object.keys(assetByGeneration).sort()).toEqual(
      allGenerations
        .filter(({ generation }) => generation.photo)
        .map(({ generation }) => generation.id)
        .sort(),
    );
    for (const { generation } of allGenerations) {
      if (generation.photo)
        expect(generation.photo.generationId).toBe(generation.id);
      expect(generation.photo).toBe(assetByGeneration[generation.id]);
    }
  });

  it("ships optimized images with complete attribution", () => {
    for (const asset of Object.values(assetByGeneration)) {
      const path = new URL(`../../../public/${asset.url}`, import.meta.url);
      expect(existsSync(path), asset.url).toBe(true);
      expect(
        statSync(path).size,
        `${asset.url} is unexpectedly large`,
      ).toBeLessThan(500_000);
      expect(asset.author).not.toBe("");
      expect(asset.license).not.toBe("");
      expect(asset.page).toMatch(/^https:\/\//);
      expect(asset.licenseUrl).toMatch(/^https:\/\//);
    }
  });

  it("ships every responsive cover in both browser formats", () => {
    for (const asset of Object.values(assetByGeneration)) {
      const stem = asset.url
        .split("/")
        .at(-1)!
        .replace(/\.[^.]+$/, "");
      for (const width of [480, 960])
        for (const format of ["avif", "webp"]) {
          const path = new URL(
            `../../../public/images/responsive/${stem}-${width}.${format}`,
            import.meta.url,
          );
          expect(existsSync(path), `${stem}-${width}.${format}`).toBe(true);
          expect(statSync(path).size).toBeLessThan(160000);
        }
    }
  });

  it("rejects an image assigned to another generation", () => {
    const [generationId, asset] = Object.entries(assetByGeneration)[0];
    expect(
      validateAssetRegistry(
        { [generationId]: { ...asset, generationId: "another-generation" } },
        generationIds,
      ),
    ).toContain(`asset generation mismatch: ${generationId}`);
  });
});
