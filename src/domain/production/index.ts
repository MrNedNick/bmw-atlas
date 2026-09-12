export type AssemblyType = "full" | "CKD" | "SKD" | "unknown";

export interface Factory {
  id: string;
  name: string;
  city: string;
  country: string;
  coordinates: { latitude: number; longitude: number } | null;
  source: string;
  locationEvidence: "production-source";
}

export type BodyScope =
  | {
      status: "known";
      values: string[];
      appliesTo: "factory" | "generation";
    }
  | { status: "unknown"; reason: string };

export interface ProductionRun {
  id: string;
  generationId: string;
  factoryId: string;
  from: string;
  to: string | null;
  datePrecision: "year" | "month" | "day";
  region: string;
  bodies: BodyScope;
  assemblyType: AssemblyType;
  source: string;
  note?: string;
}

const dateValue = (value: string) => {
  const match = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2] ?? 1);
  const day = Number(match[3] ?? 1);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return year * 10_000 + month * 100 + day;
};

export function formatProductionPeriod(run: ProductionRun) {
  return `${run.from}–${run.to ?? "н. в."}`;
}

export function runsForGeneration(generationId: string, runs: ProductionRun[]) {
  return runs.filter((run) => run.generationId === generationId);
}

export function validateProduction(
  factories: Factory[],
  runs: ProductionRun[],
  generationIds: Set<string>,
  sourceIds: Set<string>,
) {
  const errors: string[] = [];
  const factoryIds = new Set<string>();
  const runIds = new Set<string>();

  for (const factory of factories) {
    if (factoryIds.has(factory.id))
      errors.push(`duplicate factory: ${factory.id}`);
    factoryIds.add(factory.id);
    if (
      !factory.name.trim() ||
      !factory.city.trim() ||
      !factory.country.trim() ||
      factory.locationEvidence !== "production-source"
    )
      errors.push(`factory location is not production-sourced: ${factory.id}`);
    if (!sourceIds.has(factory.source))
      errors.push(`unknown factory source: ${factory.id}`);
    if (
      factory.coordinates &&
      (Math.abs(factory.coordinates.latitude) > 90 ||
        Math.abs(factory.coordinates.longitude) > 180)
    )
      errors.push(`invalid factory coordinates: ${factory.id}`);
  }

  for (const run of runs) {
    if (runIds.has(run.id)) errors.push(`duplicate production run: ${run.id}`);
    runIds.add(run.id);
    if (!factoryIds.has(run.factoryId))
      errors.push(`unknown factory: ${run.id}`);
    if (!generationIds.has(run.generationId))
      errors.push(`unknown generation: ${run.id}`);
    if (!sourceIds.has(run.source))
      errors.push(`unknown production source: ${run.id}`);
    if (!run.region.trim())
      errors.push(`production run without region: ${run.id}`);

    const from = dateValue(run.from);
    const to = run.to ? dateValue(run.to) : null;
    if (from === null || (run.to !== null && to === null) || (to && to < from))
      errors.push(`invalid production period: ${run.id}`);

    if (
      (run.bodies.status === "known" &&
        (run.bodies.values.length === 0 ||
          run.bodies.values.some((body) => !body.trim()) ||
          !["factory", "generation"].includes(run.bodies.appliesTo))) ||
      (run.bodies.status === "unknown" && !run.bodies.reason.trim())
    )
      errors.push(`production run without body scope: ${run.id}`);
  }

  return errors;
}
