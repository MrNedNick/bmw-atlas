export const EPA_DATASET_MANIFEST = {
  id: "epa-fuel-economy-guide",
  title: "Fuel Economy Guide data",
  publisher: "U.S. Environmental Protection Agency",
  url: "https://www.epa.gov/compliance-and-fuel-economy-data/test-data-annual-fuel-economy-guide",
  market: "US",
  modelYearScope: "Model year, not production year",
  cycle: "EPA label",
  license: {
    name: "U.S. Public Domain",
    url: "https://edg.epa.gov/EPA_Data_License.html",
  },
} as const;

export interface EpaVehicleRow {
  id: string | number;
  year: string | number;
  make: string;
  model: string;
  fuelType1?: string;
  fuelType2?: string;
  cylinders?: string | number;
  displ?: string | number;
  trany?: string;
  drive?: string;
  city08?: string | number;
  highway08?: string | number;
  comb08?: string | number;
  cityA08?: string | number;
  highwayA08?: string | number;
  combA08?: string | number;
  combE?: string | number;
}

export type EpaConsumptionUnit = "mpg-US" | "MPGe" | "kWh/100 mi";
export type EpaCycle = "EPA city" | "EPA highway" | "EPA combined";

export interface EpaConsumption {
  value: number;
  unit: EpaConsumptionUnit;
  cycle: EpaCycle;
  energySource: string;
}

export interface EpaVehicleRecord {
  id: string;
  sourceId: typeof EPA_DATASET_MANIFEST.id;
  sourceUrl: string;
  market: "US";
  modelYear: number;
  make: "BMW";
  model: string;
  powertrain: {
    primaryFuel: string;
    secondaryFuel: string | null;
    cylinders: number | null;
    displacementL: number | null;
    transmission: string | null;
    drive: string | null;
  };
  consumption: EpaConsumption[];
}

const positiveNumber = (value: unknown) => {
  const number =
    typeof value === "number" ? value : Number(String(value ?? "").trim());
  return Number.isFinite(number) && number > 0 ? number : null;
};

const consumption = (
  values: Array<[unknown, EpaCycle]>,
  unit: EpaConsumptionUnit,
  energySource: string,
) =>
  values.flatMap(([raw, cycle]) => {
    const value = positiveNumber(raw);
    return value === null ? [] : [{ value, unit, cycle, energySource }];
  });

const isElectric = (fuel: string) => /electric/i.test(fuel);

export function adaptEpaRow(row: EpaVehicleRow): EpaVehicleRecord | null {
  const modelYear = positiveNumber(row.year);
  const sourceVehicleId = String(row.id).trim();
  const make = row.make.trim().toUpperCase();
  const model = row.model.trim();
  const primaryFuel = row.fuelType1?.trim() ?? "";
  const secondaryFuel = row.fuelType2?.trim() || null;
  if (
    make !== "BMW" ||
    modelYear === null ||
    !Number.isInteger(modelYear) ||
    !sourceVehicleId ||
    !model ||
    !primaryFuel
  )
    return null;

  const primaryUnit: EpaConsumptionUnit = isElectric(primaryFuel)
    ? "MPGe"
    : "mpg-US";
  const records = consumption(
    [
      [row.city08, "EPA city"],
      [row.highway08, "EPA highway"],
      [row.comb08, "EPA combined"],
    ],
    primaryUnit,
    primaryFuel,
  );
  if (secondaryFuel)
    records.push(
      ...consumption(
        [
          [row.cityA08, "EPA city"],
          [row.highwayA08, "EPA highway"],
          [row.combA08, "EPA combined"],
        ],
        isElectric(secondaryFuel) ? "MPGe" : "mpg-US",
        secondaryFuel,
      ),
    );
  const electricFuel = [primaryFuel, secondaryFuel].find(
    (fuel): fuel is string => Boolean(fuel && isElectric(fuel)),
  );
  if (electricFuel)
    records.push(
      ...consumption([[row.combE, "EPA combined"]], "kWh/100 mi", electricFuel),
    );

  return {
    id: `epa:vehicle:${sourceVehicleId}:my${modelYear}`,
    sourceId: EPA_DATASET_MANIFEST.id,
    sourceUrl: `https://www.fueleconomy.gov/feg/Find.do?action=sbs&id=${encodeURIComponent(sourceVehicleId)}`,
    market: "US",
    modelYear,
    make: "BMW",
    model,
    powertrain: {
      primaryFuel,
      secondaryFuel,
      cylinders: positiveNumber(row.cylinders),
      displacementL: positiveNumber(row.displ),
      transmission: row.trany?.trim() || null,
      drive: row.drive?.trim() || null,
    },
    consumption: records,
  };
}

export function adaptEpaRows(rows: readonly EpaVehicleRow[]) {
  return rows.flatMap((row) => {
    const record = adaptEpaRow(row);
    return record ? [record] : [];
  });
}
