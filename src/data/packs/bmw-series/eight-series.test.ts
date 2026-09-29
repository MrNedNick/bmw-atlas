import { expect, it } from "vitest";
import { eightSeries } from "./eight-series";
import { spotlights } from "../../spotlights";
import { modelDossiers } from "../../model-dossiers";

it("separates the three modern bodies and their facelift photo slots", () => {
  expect(eightSeries).toHaveLength(3);
  expect(eightSeries.flatMap((f) => f.generations)).toHaveLength(7);
  for (const family of eightSeries) {
    const modern = family.generations.filter((g) => g.code !== "E31");
    expect(modern).toHaveLength(2);
    expect(modern[0].end).toBe(modern[1].start);
    expect(modern[1].revisions[0].kind).toBe("facelift");
    expect(modelDossiers[modern[0].id].outputFile).not.toBe(
      modelDossiers[modern[1].id].outputFile,
    );
    expect(modern.every((g) => g.volume === null)).toBe(true);
  }
});
it("keeps E31 production totals and technical changes separate from modern cars", () => {
  const e31 = eightSeries[0].generations[0];
  expect(e31.volume?.value).toBe(30621);
  expect(e31.revisions.map((r) => r.kind)).toEqual(["technical"]);
  expect(e31.powertrains.map((p) => p.power)).toEqual([300, 286, 326]);
  expect(spotlights["bmw-8-g15"].zeroTo100).toBe(3.7);
  expect(spotlights["bmw-8-g14"].zeroTo100).toBe(3.9);
  expect(spotlights["bmw-8-g16"].zeroTo100).toBe(3.9);
});
