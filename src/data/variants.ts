import type { Market, VehicleVariant } from "../domain/variants";

export const markets: Market[] = [
  { id: "gb", countryCode: "GB", label: "United Kingdom" },
];
export const variants: VehicleVariant[] = [
  {
    id: "bmw-g20-320i-gb-saloon-2024-05",
    generationId: "bmw-g20",
    marketingName: "320i Saloon",
    engineCode: null,
    gearbox: null,
    drive: null,
    body: "Седан",
    marketId: "gb",
    observedAt: "2024-05-29",
    production: null,
    modelYears: null,
    sourceIds: ["bmw-2024"],
  },
];
