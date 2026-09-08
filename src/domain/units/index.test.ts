import { describe, expect, it } from "vitest";
import {
  convertConsumption,
  convertConsumptionMeasurement,
  convertDisplacement,
  convertLength,
  convertMass,
  convertPower,
  convertScopedMeasurement,
  convertTorque,
  type PowerUnit,
  type ScopedMeasurement,
} from ".";

const expectRoundTrip = <Unit extends string>(
  value: number,
  from: Unit,
  to: Unit,
  convert: (value: number | null, from: Unit, to: Unit) => number | null,
) => {
  const converted = convert(value, from, to);
  expect(converted).not.toBeNull();
  expect(convert(converted, to, from)).toBeCloseTo(value, 10);
};

describe("vehicle units", () => {
  it("round-trips power, displacement, torque, mass and length", () => {
    expectRoundTrip(250, "kW", "PS", convertPower);
    expectRoundTrip(250, "kW", "hp", convertPower);
    expectRoundTrip(2993, "cm3", "l", convertDisplacement);
    expectRoundTrip(580, "Nm", "lb-ft", convertTorque);
    expectRoundTrip(1875, "kg", "lb", convertMass);
    expectRoundTrip(4755, "mm", "in", convertLength);
  });

  it("round-trips liquid-fuel consumption units", () => {
    expectRoundTrip(7.2, "l/100km", "km/l", convertConsumption);
    expectRoundTrip(7.2, "l/100km", "mpg-us", convertConsumption);
    expectRoundTrip(7.2, "l/100km", "mpg-uk", convertConsumption);
  });

  it("does not convert unknown, invalid or dimensionally different values", () => {
    expect(convertPower(null, "kW", "hp")).toBeNull();
    expect(convertMass(0, "kg", "lb")).toBeNull();
    expect(convertLength(Number.NaN, "mm", "in")).toBeNull();
    expect(convertConsumption(18.9, "kWh/100km", "l/100km")).toBeNull();
    expect(convertConsumption(7.2, "l/100km", "kWh/100km")).toBeNull();
  });

  it("preserves source and required region, year and body scope", () => {
    const measurement: ScopedMeasurement<PowerUnit> = {
      value: 265,
      unit: "kW",
      scope: { region: "EU", year: 2017, body: "SAV" },
      sourceId: "bmw-x3-g01-launch",
    };
    expect(
      convertScopedMeasurement(measurement, "hp", convertPower),
    ).toMatchObject({
      unit: "hp",
      scope: { region: "EU", year: 2017, body: "SAV" },
      sourceId: "bmw-x3-g01-launch",
    });
  });

  it("keeps the test cycle explicit instead of treating cycles as units", () => {
    const result = convertConsumptionMeasurement(
      {
        value: 7.2,
        unit: "l/100km",
        cycle: "WLTP",
        scope: { region: "EU", year: 2024, body: "SAV" },
        sourceId: "bmw-x3-g45-launch",
      },
      "mpg-us",
    );
    expect(result.value).toBeCloseTo(32.6686920833, 8);
    expect(result.cycle).toBe("WLTP");
    expect(result.scope.region).toBe("EU");
  });
});
