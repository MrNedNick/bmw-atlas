import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import {
  runSnapshotImport,
  sha256,
  type CatalogSnapshot,
  type VpicRow,
} from "./snapshot";

const created: string[] = [];
afterEach(async () => {
  const { rm } = await import("node:fs/promises");
  await Promise.all(
    created.splice(0).map((path) => rm(path, { recursive: true })),
  );
});

const oldSnapshot: CatalogSnapshot = {
  version: 1,
  retrievedAt: "2026-01-01T00:00:00.000Z",
  source: "https://vpic.nhtsa.dot.gov/api/",
  scope: "last known good fixture",
  makeCount: 1,
  modelCount: 1,
  sources: [{ make: "BMW", id: 452, count: 1 }],
  models: [{ id: "vpic-452-1", make: "BMW", name: "Previous", source: "vpic" }],
};

const makes: VpicRow[] = [{ MakeId: 452, MakeName: "BMW" }];
const models: VpicRow[] = [
  { Make_ID: 452, Model_ID: 10, Make_Name: "BMW", Model_Name: "320i" },
  { Make_ID: 452, Model_ID: 11, Make_Name: "BMW", Model_Name: "R 1300 GS" },
];

describe("snapshot ingestion", () => {
  it("preserves the good database on interruption and resumes staged work", async () => {
    const rootDir = await mkdtemp(join(tmpdir(), "bmw-atlas-ingestion-"));
    created.push(rootDir);
    await mkdir(join(rootDir, "public/data"), { recursive: true });
    await writeFile(
      join(rootDir, "public/data/catalog.json"),
      JSON.stringify(oldSnapshot),
    );

    const firstGet = async (path: string) =>
      path === "GetMakesForVehicleType/car" ? makes : models;
    await expect(
      runSnapshotImport({
        rootDir,
        getResults: firstGet,
        minimumModels: 2,
        now: () => new Date("2026-09-08T12:00:00.000Z"),
        beforePromote: () => {
          throw new Error("simulated interruption");
        },
      }),
    ).rejects.toThrow("simulated interruption");

    expect(
      JSON.parse(
        await readFile(join(rootDir, "public/data/catalog.json"), "utf8"),
      ),
    ).toEqual(oldSnapshot);
    expect(existsSync(join(rootDir, "var/ingestion/vpic/staging.json"))).toBe(
      true,
    );

    const requested: string[] = [];
    const resumed = await runSnapshotImport({
      rootDir,
      minimumModels: 2,
      getResults: async (path) => {
        requested.push(path);
        if (path === "GetMakesForVehicleType/car") return makes;
        throw new Error("completed make must be resumed without refetching");
      },
      now: () => new Date("2026-09-08T12:00:00.000Z"),
    });

    expect(requested).toEqual(["GetMakesForVehicleType/car"]);
    expect(resumed.models.map((model) => model.name)).toEqual([
      "320i",
      "R 1300 GS",
    ]);
    expect(
      JSON.parse(
        await readFile(
          join(rootDir, "var/ingestion/vpic/last-known-good.json"),
          "utf8",
        ),
      ),
    ).toEqual(oldSnapshot);
    expect(
      await readFile(
        join(rootDir, "var/ingestion/vpic/current.sha256"),
        "utf8",
      ),
    ).toBe(`${sha256(resumed)}\n`);
    expect(existsSync(join(rootDir, "var/ingestion/vpic/staging.json"))).toBe(
      false,
    );
  });
});
