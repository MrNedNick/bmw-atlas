import { describe, expect, it } from "vitest";
import { factories, productionRuns } from "./catalog";
import { formatProductionPeriod, validateProduction, type Factory } from ".";

const generationIds = new Set(productionRuns.map((run) => run.generationId));
const sourceIds = new Set([
  "bmw-production",
  "bmw-1-f70-production",
  "bmw-x3-rosslyn-production",
]);

describe("production geography", () => {
  it("keeps every run scoped by period, region and body", () => {
    expect(
      validateProduction(factories, productionRuns, generationIds, sourceIds),
    ).toEqual([]);
  });

  it("does not accept a brand-country guess as a factory location", () => {
    const inferred = {
      ...factories[0],
      id: "brand-country-only",
      city: "",
      locationEvidence: "brand-origin",
    } as unknown as Factory;
    expect(validateProduction([inferred], [], new Set(), sourceIds)).toContain(
      "factory location is not production-sourced: brand-country-only",
    );
  });

  it("keeps an open production period explicit", () => {
    expect(formatProductionPeriod(productionRuns.at(-1)!)).toBe(
      "2024-10-01–н. в.",
    );
  });

  it("rejects an empty body scope instead of treating it as all bodies", () => {
    const invalid = {
      ...productionRuns[0],
      id: "unscoped",
      bodies: {
        status: "known" as const,
        values: [],
        appliesTo: "factory" as const,
      },
    };
    expect(
      validateProduction(factories, [invalid], generationIds, sourceIds),
    ).toContain("production run without body scope: unscoped");
  });
});
