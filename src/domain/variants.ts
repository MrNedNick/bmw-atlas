import type { ModelFamily, Source } from "./catalog";

export interface Market {
  id: string;
  countryCode: string;
  label: string;
}

export interface VehicleVariant {
  id: string;
  generationId: string;
  marketingName: string;
  engineCode: string | null;
  gearbox: string | null;
  drive: "front" | "rear" | "all" | null;
  body: string;
  marketId: string;
  observedAt: string;
  production: { from: string | null; to: string | null } | null;
  modelYears: number[] | null;
  sourceIds: string[];
}

export function variantsFor(
  variants: readonly VehicleVariant[],
  scope: { generationId: string; marketId: string },
): VehicleVariant[] {
  return variants.filter(
    (v) =>
      v.generationId === scope.generationId && v.marketId === scope.marketId,
  );
}

const validDate = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  Number.isFinite(Date.parse(value)) &&
  new Date(value).toISOString().slice(0, 10) === value;

export function validateVariants(
  variants: readonly VehicleVariant[],
  markets: readonly Market[],
  families: readonly ModelFamily[],
  sources: readonly Source[],
): string[] {
  const errors: string[] = [],
    ids = new Set<string>(),
    marketIds = new Set<string>();
  const generations = new Map(
    families.flatMap((f) =>
      f.generations.map((g) => [g.id, { family: f, generation: g }] as const),
    ),
  );
  const sourceIds = new Set(sources.map((s) => s.id));
  for (const market of markets) {
    if (marketIds.has(market.id)) errors.push(`duplicate market: ${market.id}`);
    marketIds.add(market.id);
    if (!market.id || !market.label || !/^[A-Z]{2}$/.test(market.countryCode))
      errors.push(`invalid market: ${market.id}`);
  }
  for (const variant of variants) {
    const id = variant.id,
      owner = generations.get(variant.generationId);
    if (!id || ids.has(id)) errors.push(`duplicate or empty variant: ${id}`);
    ids.add(id);
    if (!owner || owner.family.brand !== "BMW")
      errors.push(`unknown BMW generation: ${id}`);
    if (!marketIds.has(variant.marketId)) errors.push(`unknown market: ${id}`);
    if (
      !variant.marketingName.trim() ||
      !variant.body ||
      (owner && !owner.family.body.includes(variant.body))
    )
      errors.push(`invalid identity or body: ${id}`);
    if (!validDate(variant.observedAt))
      errors.push(`invalid observation date: ${id}`);
    if (
      !variant.sourceIds.length ||
      variant.sourceIds.some((s) => !sourceIds.has(s))
    )
      errors.push(`unknown variant source: ${id}`);
    for (const field of [variant.engineCode, variant.gearbox])
      if (field !== null && !field.trim())
        errors.push(`empty specification: ${id}`);
    if (
      variant.drive !== null &&
      !["front", "rear", "all"].includes(variant.drive)
    )
      errors.push(`invalid drive: ${id}`);
    if (
      variant.modelYears !== null &&
      (!variant.modelYears.length ||
        variant.modelYears.some(
          (y) => !Number.isInteger(y) || y < 1886 || y > 2100,
        ) ||
        new Set(variant.modelYears).size !== variant.modelYears.length)
    )
      errors.push(`invalid model years: ${id}`);
    if (variant.production) {
      const { from, to } = variant.production;
      if (
        (from !== null && !validDate(from)) ||
        (to !== null && !validDate(to)) ||
        (from !== null && to !== null && from > to) ||
        (from === null && to === null)
      )
        errors.push(`invalid production period: ${id}`);
    }
  }
  return errors;
}
