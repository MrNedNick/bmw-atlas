import { readFileSync, existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { families } from "./models";
import { validateCatalog } from "../domain/catalog";
import { sources } from "./sources";

const snapshot = JSON.parse(
  readFileSync(
    new URL("../../public/data/catalog.json", import.meta.url),
    "utf8",
  ),
);
describe("BMW distribution", () => {
  it("ships only BMW names with accurate counters and unique IDs", () => {
    expect(snapshot.models.length).toBe(snapshot.modelCount);
    expect(snapshot.makeCount).toBe(1);
    expect(
      snapshot.models.every((m: { make: string }) => m.make === "BMW"),
    ).toBe(true);
    expect(new Set(snapshot.models.map((m: { id: string }) => m.id)).size).toBe(
      snapshot.modelCount,
    );
    expect(
      snapshot.sources.every((s: { make: string }) => s.make === "BMW"),
    ).toBe(true);
  });
  it("ships every credited photograph as a local asset", () => {
    const photos = families.flatMap((f) =>
      f.generations.flatMap((g) => (g.photo ? [g.photo] : [])),
    );
    expect(photos.length).toBeGreaterThanOrEqual(3);
    for (const p of photos)
      expect(
        existsSync(new URL("../../public/" + p.url, import.meta.url)),
      ).toBe(true);
  });
  it("uses the unified editorial image set for every detailed generation", () => {
    const photos = families.flatMap((f) => f.generations.map((g) => g.photo));
    expect(photos).toHaveLength(47);
    expect(
      photos.every((p) => p?.url.startsWith("images/editorial-bmw-")),
    ).toBe(true);
    expect(
      photos.every((p) => p?.note?.includes("Редакционная визуализация")),
    ).toBe(true);
  });
  it("rejects a photo without licence provenance", () => {
    const copy = structuredClone(families);
    copy
      .find((f) => f.id === "bmw-3-series")!
      .generations.find((g) => g.id === "bmw-g20")!.photo!.licenseUrl = "";
    expect(validateCatalog(copy, sources)).toContain("invalid photo: bmw-g20");
  });
});
