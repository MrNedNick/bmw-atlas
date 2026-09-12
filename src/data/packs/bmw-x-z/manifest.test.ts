import { describe, expect, it } from "vitest";
import { assetByGeneration } from "../../assets";
import { families } from "../../models";
import { sources } from "../../sources";
import {
  bmwXZImageTasks,
  bmwXZInventory,
  validateBMWXZInventory,
} from "./manifest";

describe("BMW X and Z master inventory", () => {
  it("covers every X1-X7 and historical Z family", () => {
    expect(
      validateBMWXZInventory(
        bmwXZInventory,
        sources,
        families,
        assetByGeneration,
      ),
    ).toEqual([]);
    expect(new Set(bmwXZInventory.map((entry) => entry.family))).toEqual(
      new Set([
        "X1",
        "X2",
        "X3",
        "X4",
        "X5",
        "X6",
        "X7",
        "Z1",
        "Z3",
        "Z4",
        "Z8",
      ]),
    );
  });

  it("keeps every confirmed facelift as a separate visual phase", () => {
    const phase = (family: string, generationKey: string, year: number) =>
      bmwXZInventory
        .find(
          (entry) =>
            entry.family === family && entry.generationKey === generationKey,
        )
        ?.visualPhases.some(
          (entry) => entry.kind === "facelift" && entry.from === year,
        );
    expect(phase("X1", "e84", 2012)).toBe(true);
    expect(phase("X3", "g01", 2021)).toBe(true);
    expect(phase("X5", "g05", 2023)).toBe(true);
    expect(phase("X7", "g07", 2022)).toBe(true);
    expect(phase("Z3", "e36-7-e36-8", 1999)).toBe(true);
    expect(phase("Z4", "e89", 2013)).toBe(true);
  });

  it("links M and electric derivatives without merging them into regular X generations", () => {
    const g01 = bmwXZInventory.find((entry) => entry.generationKey === "g01");
    expect(g01?.mDerivativeIds).toContain("X3 M F97");
    expect(g01?.electricDerivativeIds).toContain("iX3 G08");
    expect(g01?.chassisCodes).not.toContain("F97");
  });

  it("produces one deterministic work order for every missing visual", () => {
    expect(bmwXZImageTasks.length).toBeGreaterThan(20);
    expect(new Set(bmwXZImageTasks.map((task) => task.id)).size).toBe(
      bmwXZImageTasks.length,
    );
    expect(
      bmwXZImageTasks.every((task) => task.outputFile.endsWith(".webp")),
    ).toBe(true);
  });

  it("rejects a detailed generation without its licensed asset", () => {
    const assets = { ...assetByGeneration };
    delete assets["bmw-x5-g65"];
    expect(
      validateBMWXZInventory(bmwXZInventory, sources, families, assets),
    ).toContain("missing detailed X/Z photo: bmw-x-z-x5-g65");
  });
});
