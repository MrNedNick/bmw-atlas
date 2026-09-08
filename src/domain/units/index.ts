export type PowerUnit = "kW" | "PS" | "hp";
export type DisplacementUnit = "cm3" | "l";
export type TorqueUnit = "Nm" | "lb-ft";
export type MassUnit = "kg" | "lb";
export type LengthUnit = "mm" | "cm" | "m" | "in";
export type ConsumptionUnit =
  | "l/100km"
  | "km/l"
  | "mpg-us"
  | "mpg-uk"
  | "kWh/100km";
export type ConsumptionCycle =
  | "NEDC"
  | "WLTP"
  | "EPA"
  | "JC08"
  | "CLTC"
  | "unknown";

export interface MeasurementScope {
  region: string;
  year: number;
  body: string;
}

export interface ScopedMeasurement<Unit extends string> {
  value: number | null;
  unit: Unit;
  scope: MeasurementScope;
  sourceId: string;
}

export interface ConsumptionMeasurement
  extends ScopedMeasurement<ConsumptionUnit> {
  cycle: ConsumptionCycle;
}

const positiveOrNull = (value: number | null): number | null =>
  value === null || !Number.isFinite(value) || value <= 0 ? null : value;

const convertByBaseFactor = <Unit extends string>(
  value: number | null,
  from: Unit,
  to: Unit,
  unitsPerBase: Record<Unit, number>,
): number | null => {
  const known = positiveOrNull(value);
  return known === null
    ? null
    : (known / unitsPerBase[from]) * unitsPerBase[to];
};

const POWER_UNITS_PER_KW: Record<PowerUnit, number> = {
  kW: 1,
  PS: 1.3596216173039043,
  hp: 1.3410220895950277,
};

const DISPLACEMENT_UNITS_PER_CM3: Record<DisplacementUnit, number> = {
  cm3: 1,
  l: 0.001,
};

const TORQUE_UNITS_PER_NM: Record<TorqueUnit, number> = {
  Nm: 1,
  "lb-ft": 0.7375621492772656,
};

const MASS_UNITS_PER_KG: Record<MassUnit, number> = {
  kg: 1,
  lb: 2.2046226218487757,
};

const LENGTH_UNITS_PER_MM: Record<LengthUnit, number> = {
  mm: 1,
  cm: 0.1,
  m: 0.001,
  in: 1 / 25.4,
};

export const convertPower = (
  value: number | null,
  from: PowerUnit,
  to: PowerUnit,
) => convertByBaseFactor(value, from, to, POWER_UNITS_PER_KW);

export const convertDisplacement = (
  value: number | null,
  from: DisplacementUnit,
  to: DisplacementUnit,
) => convertByBaseFactor(value, from, to, DISPLACEMENT_UNITS_PER_CM3);

export const convertTorque = (
  value: number | null,
  from: TorqueUnit,
  to: TorqueUnit,
) => convertByBaseFactor(value, from, to, TORQUE_UNITS_PER_NM);

export const convertMass = (
  value: number | null,
  from: MassUnit,
  to: MassUnit,
) => convertByBaseFactor(value, from, to, MASS_UNITS_PER_KG);

export const convertLength = (
  value: number | null,
  from: LengthUnit,
  to: LengthUnit,
) => convertByBaseFactor(value, from, to, LENGTH_UNITS_PER_MM);

const fuelConsumptionToLitresPer100Km = (
  value: number,
  unit: Exclude<ConsumptionUnit, "kWh/100km">,
) => {
  switch (unit) {
    case "l/100km":
      return value;
    case "km/l":
      return 100 / value;
    case "mpg-us":
      return 235.214583 / value;
    case "mpg-uk":
      return 282.4809363 / value;
  }
};

const litresPer100KmToFuelConsumption = (
  value: number,
  unit: Exclude<ConsumptionUnit, "kWh/100km">,
) => {
  switch (unit) {
    case "l/100km":
      return value;
    case "km/l":
      return 100 / value;
    case "mpg-us":
      return 235.214583 / value;
    case "mpg-uk":
      return 282.4809363 / value;
  }
};

export function convertConsumption(
  value: number | null,
  from: ConsumptionUnit,
  to: ConsumptionUnit,
): number | null {
  const known = positiveOrNull(value);
  if (known === null) return null;
  if (from === to) return known;
  if (from === "kWh/100km" || to === "kWh/100km") return null;
  return litresPer100KmToFuelConsumption(
    fuelConsumptionToLitresPer100Km(known, from),
    to,
  );
}

export function convertScopedMeasurement<Unit extends string>(
  measurement: ScopedMeasurement<Unit>,
  to: Unit,
  convert: (value: number | null, from: Unit, to: Unit) => number | null,
): ScopedMeasurement<Unit> {
  return {
    ...measurement,
    value: convert(measurement.value, measurement.unit, to),
    unit: to,
    scope: { ...measurement.scope },
  };
}

export function convertConsumptionMeasurement(
  measurement: ConsumptionMeasurement,
  to: ConsumptionUnit,
): ConsumptionMeasurement {
  return {
    ...convertScopedMeasurement(measurement, to, convertConsumption),
    cycle: measurement.cycle,
  };
}
