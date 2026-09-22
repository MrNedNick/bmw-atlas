import { readFileSync, existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { families } from "./models";
import { assetByGeneration } from "./assets";
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
    expect(photos).toHaveLength(88);
    expect(
      photos.every((p) => p?.url.startsWith("images/editorial-bmw-")),
    ).toBe(true);
    expect(
      photos.every((p) => p?.note?.includes("Редакционная визуализация")),
    ).toBe(true);
  });
  it("keeps the flagship M visuals tied to exact press photographs", () => {
    for (const id of [
      "bmw-m2-f87",
      "bmw-m2-g87",
      "bmw-i3-i01",
      "bmw-i4-g26",
      "bmw-i4-g26-lci",
      "bmw-i5-g60",
      "bmw-ix1-u11",
      "bmw-ix2-u10",
      "bmw-ix3-g08",
      "bmw-ix3-g08-lci",
      "bmw-ix-i20",
      "bmw-ix-i20-lci",
      "bmw-m4-f82",
      "bmw-m4-g82",
      "bmw-z3-m-e36",
      "bmw-z4-m-e85",
      "bmw-m3-g80",
      "bmw-m5-e28",
      "bmw-m5-e34",
      "bmw-m5-e39",
      "bmw-m5-e60",
      "bmw-m5-f10",
      "bmw-m5-f90",
      "bmw-m5-g90",
      "bmw-m6-e24",
      "bmw-m6-e63",
      "bmw-m6-f13",
      "bmw-m8-f92",
      "bmw-x3-m-f97",
      "bmw-x3-m-f97-lci",
      "bmw-x4-m-f98",
      "bmw-x4-m-f98-lci",
      "bmw-x5-g05-lci",
      "bmw-s1000rr-k67",
      "bmw-r18",
      "bmw-ce04",
    ]) {
      const reference = assetByGeneration[id].reference;
      expect(reference?.imageId).toMatch(/^P\d+$/);
      expect(reference?.page).toContain(reference?.imageId);
      expect(reference?.imageUrl).toContain(reference?.imageId);
      expect(reference?.verifiedDetails.length).toBeGreaterThanOrEqual(5);
      expect(
        existsSync(new URL("../../" + reference?.localFile, import.meta.url)),
      ).toBe(true);
    }
  });
  it("rejects a photo without licence provenance", () => {
    const copy = structuredClone(families);
    copy
      .find((f) => f.id === "bmw-3-series")!
      .generations.find((g) => g.id === "bmw-g20")!.photo!.licenseUrl = "";
    expect(validateCatalog(copy, sources)).toContain("invalid photo: bmw-g20");
  });
});
