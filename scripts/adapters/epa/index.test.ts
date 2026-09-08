import { describe, expect, it } from "vitest";
import { adaptEpaRow, EPA_DATASET_MANIFEST } from ".";

describe("EPA adapter", () => {
  it("keeps US model-year MPG explicitly scoped to EPA cycles", () => {
    const record = adaptEpaRow({
      id: 47_001,
      year: 2024,
      make: "BMW",
      model: "330i",
      fuelType1: "Premium Gasoline",
      cylinders: 4,
      displ: 2,
      trany: "Automatic 8-spd",
      drive: "Rear-Wheel Drive",
      city08: 25,
      highway08: 34,
      comb08: 29,
    })!;

    expect(record).toMatchObject({
      id: "epa:vehicle:47001:my2024",
      market: "US",
      modelYear: 2024,
      make: "BMW",
    });
    expect(record.consumption.map(({ unit }) => unit)).toEqual([
      "mpg-US",
      "mpg-US",
      "mpg-US",
    ]);
    expect(
      record.consumption.every(({ cycle }) => cycle.startsWith("EPA")),
    ).toBe(true);
    expect(JSON.stringify(record)).not.toContain("WLTP");
  });

  it("keeps electric efficiency separate from liquid-fuel economy", () => {
    const record = adaptEpaRow({
      id: 47_002,
      year: 2024,
      make: "BMW",
      model: "i5 eDrive40",
      fuelType1: "Electricity",
      city08: 111,
      highway08: 102,
      comb08: 106,
      combE: 31.8,
    })!;

    expect(record.consumption).toContainEqual({
      value: 106,
      unit: "MPGe",
      cycle: "EPA combined",
      energySource: "Electricity",
    });
    expect(record.consumption).toContainEqual({
      value: 31.8,
      unit: "kWh/100 mi",
      cycle: "EPA combined",
      energySource: "Electricity",
    });
    expect(record.consumption.some(({ unit }) => unit === "mpg-US")).toBe(
      false,
    );
  });

  it("rejects foreign, incomplete and zero-valued rows", () => {
    expect(
      adaptEpaRow({
        id: 1,
        year: 2024,
        make: "Other",
        model: "Unknown",
        fuelType1: "Gasoline",
      }),
    ).toBeNull();
    const record = adaptEpaRow({
      id: 2,
      year: 2024,
      make: "BMW",
      model: "X3",
      fuelType1: "Premium Gasoline",
      comb08: 0,
    })!;
    expect(record.consumption).toEqual([]);
    expect(record.powertrain.cylinders).toBeNull();
  });

  it("publishes a source and public-domain licence manifest", () => {
    expect(EPA_DATASET_MANIFEST).toMatchObject({
      market: "US",
      cycle: "EPA label",
      license: { name: "U.S. Public Domain" },
    });
    expect(EPA_DATASET_MANIFEST.url).toMatch(/^https:\/\/www\.epa\.gov\//);
  });
});
