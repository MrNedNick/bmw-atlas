import { describe, expect, it } from "vitest";
import { families } from "../data/models";
import { sources } from "../data/sources";
import { markets, variants } from "../data/variants";
import { validateVariants, variantsFor, type VehicleVariant } from "./variants";
const validate = (v: VehicleVariant[]) =>
  validateVariants(v, markets, families, sources);
const fixture = (): VehicleVariant => structuredClone(variants[0]);
describe("market-scoped variants", () => {
  it("validates the sourced first observation without inventing engine or dates", () => {
    expect(validate(variants)).toEqual([]);
    expect(variants[0].engineCode).toBeNull();
    expect(variants[0].production).toBeNull();
    expect(variants[0].modelYears).toBeNull();
  });
  it("never borrows a gearbox from the same name in another market", () => {
    const gb = {
      ...fixture(),
      marketingName: "320d",
      gearbox: "fixture-manual",
    };
    const de = {
      ...gb,
      id: "de-fixture",
      marketId: "de",
      gearbox: "fixture-automatic",
    };
    expect(
      variantsFor([gb, de], { generationId: "bmw-g20", marketId: "gb" }).map(
        (v) => v.gearbox,
      ),
    ).toEqual(["fixture-manual"]);
    expect(
      variantsFor([gb, de], { generationId: "bmw-g20", marketId: "us" }),
    ).toEqual([]);
    expect(
      variantsFor([gb, de], { generationId: "bmw-e90", marketId: "gb" }),
    ).toEqual([]);
  });
  it("rejects dangling market, generation and source references", () => {
    const v = fixture();
    v.marketId = "missing";
    v.generationId = "missing";
    v.sourceIds = ["missing"];
    expect(validate([v])).toHaveLength(3);
  });
  it("rejects duplicates and unsupported body types", () => {
    expect(validate([fixture(), fixture()])).toContain(
      "duplicate or empty variant: " + variants[0].id,
    );
    const v = fixture();
    v.body = "invalid";
    expect(validate([v])).toContain("invalid identity or body: " + v.id);
  });
  it("rejects invalid dates and reversed production periods", () => {
    const v = fixture();
    v.observedAt = "2024-02-30";
    v.production = { from: "2024-06-01", to: "2024-05-01" };
    expect(validate([v])).toContain("invalid observation date: " + v.id);
    expect(validate([v])).toContain("invalid production period: " + v.id);
  });
  it("does not treat model year as production year", () => {
    const v = fixture();
    v.production = { from: "2023-11-01", to: null };
    v.modelYears = [2024];
    expect(validate([v])).toEqual([]);
  });
  it("rejects empty values masquerading as known specifications", () => {
    const v = fixture();
    v.engineCode = " ";
    v.modelYears = [];
    v.production = { from: null, to: null };
    expect(validate([v])).toHaveLength(3);
  });
});
