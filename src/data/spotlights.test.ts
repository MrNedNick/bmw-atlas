import { t, catalogText } from "../i18n";
import { describe, expect, it } from "vitest";
import { heroPower, spotlights } from "./spotlights";
import { allGenerations } from "./models";
import { sourceById } from "./sources";
import { seriesCollection } from "./packs/bmw-series/collection";

describe("model exhibit facts", () => {
  it("ties every specification and launch price to an existing model and source", () => {
    for (const [id, item] of Object.entries(spotlights)) {
      expect(
        allGenerations.some(({ generation }) => generation.id === id),
        id,
      ).toBe(true);
      expect(sourceById[item.source]).toBeDefined();
      expect(item.powerKw).toBeGreaterThan(0);
      expect(item.zeroTo100).toBeGreaterThan(0);
      expect(t("ru", item.intro) && t("en", item.intro)).toBeTruthy();
      if (item.price) {
        expect(sourceById[item.price.source]).toBeDefined();
        expect(item.price.market).not.toBe("");
        expect(
          t("ru", item.price.note) && t("en", item.price.note),
        ).toBeTruthy();
      }
    }
  });
  it("keeps metric horsepower distinct from mechanical horsepower", () => {
    const g = allGenerations.find(
      ({ generation }) => generation.id === "bmw-xm-g09",
    )!.generation;
    expect(heroPower(g)?.value).toBe("653 PS");
    const unrelated = {
      ...g,
      id: "test",
      powertrains: [
        { ...g.powertrains[0], power: 100, powerUnit: "hp" as const },
      ],
    };
    expect(heroPower(unrelated)?.value).toBe("100 hp");
    expect(heroPower({ ...unrelated, powertrains: [] })).toBeNull();
  });
  it("does not borrow pictures or sales totals from another phase", () => {
    for (const f of seriesCollection)
      for (const g of f.generations) {
        if (g.photo) expect(g.photo.generationId).toBe(g.id);
        expect(
          catalogText("en", `generation.${g.id}.description`),
        ).toBeTruthy();
      }
    const gt = seriesCollection.find((f) => f.id === "bmw-6-gran-turismo")!;
    expect(gt.volume?.metric).toBe("продано");
    expect(gt.generations.every((g) => g.volume === null)).toBe(true);
    const update = seriesCollection
      .flatMap((f) => f.generations)
      .find((g) => g.id === "bmw-2-g42-2024")!;
    expect(update.revisions[0].kind).toBe("model-year");
  });
});
