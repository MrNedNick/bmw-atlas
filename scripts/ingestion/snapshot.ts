import { createHash } from "node:crypto";
import {
  copyFile,
  mkdir,
  readFile,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import { dirname, join } from "node:path";

export interface VpicRow {
  MakeId?: number;
  MakeName?: string;
  Make_ID?: number;
  Make_Name?: string;
  Model_ID?: number;
  Model_Name?: string;
}

interface SnapshotModel {
  id: string;
  make: string;
  name: string;
  source: "vpic";
}

export interface CatalogSnapshot {
  version: 1;
  retrievedAt: string;
  source: string;
  scope: string;
  makeCount: number;
  modelCount: number;
  sources: { make: string; id: number; count: number }[];
  models: SnapshotModel[];
}

interface StagedMake {
  make: string;
  id: number;
  count: number;
  models: SnapshotModel[];
  sha256: string;
}

interface ImportState {
  version: 1;
  selected: { make: string; id: number }[];
  completed: Record<string, StagedMake>;
}

export interface SnapshotImportOptions {
  rootDir?: string;
  getResults: (path: string) => Promise<VpicRow[]>;
  now?: () => Date;
  minimumModels?: number;
  beforePromote?: (snapshot: CatalogSnapshot) => Promise<void> | void;
}

const stableJson = (value: unknown) => JSON.stringify(value);
export const sha256 = (value: unknown) =>
  createHash("sha256").update(stableJson(value)).digest("hex");

async function readJson<T>(path: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(path, "utf8")) as T;
  } catch {
    return null;
  }
}

async function writeAtomic(path: string, value: string) {
  await mkdir(dirname(path), { recursive: true });
  const next = `${path}.next`;
  await writeFile(next, value);
  await rename(next, path);
}

const sameSelection = (
  left: ImportState["selected"],
  right: ImportState["selected"],
) => stableJson(left) === stableJson(right);

const validStagedMake = (
  item: StagedMake,
  expected: { make: string; id: number },
) =>
  item.make === expected.make &&
  item.id === expected.id &&
  item.count === item.models.length &&
  item.models.every((model) => model.make === expected.make) &&
  item.sha256 === sha256(item.models);

export function validateSnapshot(
  snapshot: CatalogSnapshot,
  expectedMakes = ["BMW"],
  minimumModels = 20,
) {
  const errors: string[] = [];
  if (snapshot.makeCount !== expectedMakes.length)
    errors.push("unexpected make count");
  if (snapshot.modelCount !== snapshot.models.length)
    errors.push("model count mismatch");
  if (snapshot.models.length < minimumModels)
    errors.push("unexpectedly small catalogue");
  if (
    snapshot.models.some(
      (model) => !expectedMakes.includes(model.make) || !model.name.trim(),
    )
  )
    errors.push("foreign or empty model");
  if (
    new Set(snapshot.models.map((model) => model.id)).size !==
    snapshot.models.length
  )
    errors.push("duplicate model id");
  if (
    snapshot.sources.length !== expectedMakes.length ||
    snapshot.sources.some(
      (source) =>
        !expectedMakes.includes(source.make) ||
        source.count <= 0 ||
        source.id <= 0,
    )
  )
    errors.push("invalid source coverage");
  return errors;
}

export async function runSnapshotImport({
  rootDir = process.cwd(),
  getResults,
  now = () => new Date(),
  minimumModels = 20,
  beforePromote,
}: SnapshotImportOptions) {
  const target = join(rootDir, "public/data/catalog.json");
  const stateDir = join(rootDir, "var/ingestion/vpic");
  const stagingPath = join(stateDir, "staging.json");
  const candidatePath = join(stateDir, "candidate.json");
  const lastGoodPath = join(stateDir, "last-known-good.json");

  await mkdir(stateDir, { recursive: true });
  const makes = await getResults("GetMakesForVehicleType/car");
  const selected = makes
    .filter((row) => row.MakeName?.toUpperCase() === "BMW")
    .map((row) => ({ make: "BMW", id: row.MakeId ?? 0 }));
  if (selected.length !== 1 || selected[0].id <= 0)
    throw new Error(
      "Expected exactly one BMW make; previous snapshot preserved",
    );

  const previousState = await readJson<ImportState>(stagingPath);
  const state: ImportState =
    previousState?.version === 1 &&
    sameSelection(previousState.selected, selected) &&
    Object.entries(previousState.completed).every(([make, item]) => {
      const expected = selected.find((candidate) => candidate.make === make);
      return expected !== undefined && validStagedMake(item, expected);
    })
      ? previousState
      : { version: 1, selected, completed: {} };

  for (const make of selected) {
    if (state.completed[make.make]) continue;
    const rows = await getResults(`GetModelsForMakeId/${make.id}`);
    const models = rows
      .filter(
        (row) =>
          row.Make_Name?.toUpperCase() === make.make && row.Model_Name?.trim(),
      )
      .map((row) => ({
        id: `vpic-${row.Make_ID}-${row.Model_ID}`,
        make: make.make,
        name: row.Model_Name!.trim(),
        source: "vpic" as const,
      }));
    state.completed[make.make] = {
      make: make.make,
      id: make.id,
      count: models.length,
      models,
      sha256: sha256(models),
    };
    await writeAtomic(stagingPath, stableJson(state));
  }

  const staged = selected.map((make) => state.completed[make.make]);
  if (staged.some((item) => !item))
    throw new Error("Incomplete import; previous snapshot preserved");
  const unique = [
    ...new Map(
      staged.flatMap((item) => item.models).map((model) => [model.id, model]),
    ).values(),
  ].sort(
    (a, b) => a.make.localeCompare(b.make) || a.name.localeCompare(b.name),
  );
  const snapshot: CatalogSnapshot = {
    version: 1,
    retrievedAt: now().toISOString(),
    source: "https://vpic.nhtsa.dot.gov/api/",
    scope:
      "BMW-only NHTSA vPIC model-name index. US-regulatory coverage, including motorcycle names. Not a complete historical BMW specification database.",
    makeCount: staged.length,
    modelCount: unique.length,
    sources: staged.map((item) => ({
      make: item.make,
      id: item.id,
      count: item.count,
    })),
    models: unique,
  };
  const errors = validateSnapshot(
    snapshot,
    selected.map((make) => make.make),
    minimumModels,
  );
  if (errors.length)
    throw new Error(`${errors.join("; ")}; previous snapshot preserved`);

  await writeAtomic(candidatePath, stableJson(snapshot));
  await beforePromote?.(snapshot);
  const current = await readJson<CatalogSnapshot>(target);
  if (current) {
    await copyFile(target, lastGoodPath);
    await writeAtomic(`${lastGoodPath}.sha256`, `${sha256(current)}\n`);
  }
  await mkdir(dirname(target), { recursive: true });
  await rename(candidatePath, target);
  await writeAtomic(join(stateDir, "current.sha256"), `${sha256(snapshot)}\n`);
  await rm(stagingPath, { force: true });
  return snapshot;
}
