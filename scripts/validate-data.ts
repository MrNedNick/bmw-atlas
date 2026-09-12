import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { markets, variants } from "../src/data/variants";
import {
  validateVariants,
  type Market,
  type VehicleVariant,
} from "../src/domain/variants";
import { families } from "../src/data/models";
import { sources } from "../src/data/sources";
import {
  validateCatalog,
  type ModelFamily,
  type Source,
} from "../src/domain/catalog";
import { factories, productionRuns } from "../src/domain/production/catalog";
import { validateProduction } from "../src/domain/production";
import { assetByGeneration } from "../src/data/assets";
import {
  bmwSeriesInventory,
  validateSeriesInventory,
} from "../src/data/packs/bmw-series/manifest";
import {
  bmwXZInventory,
  validateBMWXZInventory,
} from "../src/data/packs/bmw-x-z/manifest";

export interface CatalogRelease {
  releaseVersion: number;
  sources: Source[];
  families: ModelFamily[];
  markets: Market[];
  variants: VehicleVariant[];
}

type ReleaseSchema = {
  required: string[];
  properties: { releaseVersion: { minimum: number } };
  $defs: {
    powertrain: { properties: { powerUnit: { enum: string[] } } };
  };
};

const schema = JSON.parse(
  readFileSync(
    new URL("../schema/catalog-release.schema.json", import.meta.url),
    "utf8",
  ),
) as ReleaseSchema;

export const currentRelease = (): CatalogRelease => ({
  releaseVersion: 1,
  sources,
  families,
  markets,
  variants,
});

const validateSchemaShape = (release: CatalogRelease): string[] => {
  const errors: string[] = [];
  const record = release as unknown as Record<string, unknown>;
  for (const field of schema.required)
    if (!(field in record)) errors.push(`missing release package: ${field}`);
  if (
    !Number.isInteger(release.releaseVersion) ||
    release.releaseVersion < schema.properties.releaseVersion.minimum
  )
    errors.push("invalid release version");
  const powerUnits = new Set(schema.$defs.powertrain.properties.powerUnit.enum);
  for (const family of release.families)
    for (const generation of family.generations)
      for (const powertrain of generation.powertrains)
        if (!powerUnits.has(powertrain.powerUnit))
          errors.push(`invalid unit: ${powertrain.id}`);
  return errors;
};

export function validateRelease(release: CatalogRelease): string[] {
  const generationIds = new Set(
    release.families.flatMap((family) =>
      family.generations.map((generation) => generation.id),
    ),
  );
  const sourceIds = new Set(release.sources.map((source) => source.id));
  return [
    ...validateSchemaShape(release),
    ...validateCatalog(release.families, release.sources),
    ...validateProduction(factories, productionRuns, generationIds, sourceIds),
    ...validateSeriesInventory(
      bmwSeriesInventory,
      release.sources,
      release.families,
      assetByGeneration,
    ),
    ...validateBMWXZInventory(
      bmwXZInventory,
      release.sources,
      release.families,
      assetByGeneration,
    ),
    ...validateVariants(
      release.variants,
      release.markets,
      release.families,
      release.sources,
    ),
  ];
}

export function releaseSummary(release: CatalogRelease) {
  return `Valid release ${release.releaseVersion}: ${release.families.length} families, ${release.families.reduce((total, family) => total + family.generations.length, 0)} generations, ${release.sources.length} sources`;
}

const isMain =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const release = currentRelease();
  const errors = validateRelease(release);
  if (errors.length) {
    console.error(errors.join("\n"));
    process.exitCode = 1;
  } else console.log(releaseSummary(release));
}
