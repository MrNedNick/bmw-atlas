import { expect, it } from "vitest";
import { families } from "./models";
import { sources } from "./sources";
import {
  EMPTY_FILTERS,
  familyMatches,
  validateCatalog,
} from "../domain/catalog";
it("validates every researched fact and reference", () =>
  expect(validateCatalog(families, sources)).toEqual([]));
it("finds Cyrillic and chassis-code aliases", () => {
  expect(
    families
      .filter((f) => familyMatches(f, { ...EMPTY_FILTERS, query: "тройка" }))
      .map((f) => f.id),
  ).toEqual(["bmw-3-series"]);
  expect(
    families
      .filter((f) => familyMatches(f, { ...EMPTY_FILTERS, query: "G60" }))
      .map((f) => f.id),
  ).toEqual(["bmw-5-series"]);
});
it("combines fuel and year on the same generation", () => {
  expect(
    familyMatches(families[1], {
      ...EMPTY_FILTERS,
      year: "2000",
      fuel: "Mild hybrid",
    }),
  ).toBe(false);
  expect(
    familyMatches(families[1], {
      ...EMPTY_FILTERS,
      year: "2024",
      fuel: "Mild hybrid",
    }),
  ).toBe(true);
});
it("advertises electric facts only where engine records exist", () => {
  expect(
    families
      .filter((f) => familyMatches(f, { ...EMPTY_FILTERS, fuel: "Электро" }))
      .map((f) => f.id),
  ).toEqual(["bmw-5-series", "bmw-x5"]);
  expect(
    families
      .filter((f) =>
        familyMatches(f, { ...EMPTY_FILTERS, fuel: "Plug-in hybrid" }),
      )
      .map((f) => f.id),
  ).toEqual(["bmw-x5", "bmw-x3", "bmw-7-series", "bmw-m5"]);
});

it("covers all four BMW X3 generations with images and sourced facelifts", () => {
  const x3 = families.find((f) => f.id === "bmw-x3")!;
  expect(x3.generations.map((g) => g.code)).toEqual([
    "E83",
    "F25",
    "G01",
    "G45",
  ]);
  expect(x3.generations.every((g) => g.photo)).toBe(true);
  expect(x3.generations.flatMap((g) => g.revisions).map((r) => r.year)).toEqual(
    [2006, 2014, 2021],
  );
  expect(x3.generations[3].highlights?.join(" ")).toContain("81–90 км");
});

it("covers all seven BMW 7 Series generations with sourced images", () => {
  const seven = families.find((f) => f.id === "bmw-7-series")!;
  expect(seven.generations.map((g) => g.code)).toEqual([
    "E23",
    "E32",
    "E38",
    "E65 / E66",
    "F01 / F02",
    "G11 / G12",
    "G70",
  ]);
  expect(seven.generations.every((g) => g.photo)).toBe(true);
  expect(seven.generations.flatMap((g) => g.highlights ?? []).length).toBe(19);
  expect(
    seven.generations.flatMap((g) => g.revisions).map((r) => r.year),
  ).toEqual([2005, 2012, 2019, 2026]);
});

it("covers all four BMW 1 Series generations and the drive-layout transition", () => {
  const one = families.find((f) => f.id === "bmw-1-series")!;
  expect(one.generations.map((g) => g.code)).toEqual([
    "E81 / E82 / E87 / E88",
    "F20 / F21",
    "F40",
    "F70",
  ]);
  expect(one.generations.every((g) => g.photo)).toBe(true);
  expect(one.generations[1].revisions.map((r) => r.year)).toEqual([2015]);
  expect(one.generations[1].highlights?.join(" ")).toContain("заднеприводный");
  expect(one.generations[2].highlights?.join(" ")).toContain(
    "переднеприводная",
  );
});

it("covers five BMW X5 generations and their sourced facelifts", () => {
  const x5 = families.find((f) => f.id === "bmw-x5")!;
  expect(x5.generations.map((g) => g.code)).toEqual([
    "E53",
    "E70",
    "F15",
    "G05",
    "G65",
  ]);
  expect(
    x5.generations.flatMap((g) =>
      g.revisions.filter((r) => r.kind === "Рестайлинг").map((r) => r.year),
    ),
  ).toEqual([2003, 2010, 2023]);
});

it("contains only BMW histories", () =>
  expect(families.every((f) => f.brand === "BMW")).toBe(true));

it("keeps BMW M as separate sourced histories with their own images", () => {
  expect(families.find((f) => f.id === "bmw-m3")?.generations).toHaveLength(6);
  expect(families.find((f) => f.id === "bmw-m5")?.generations).toHaveLength(7);
  for (const family of families.filter((f) => f.id.startsWith("bmw-m"))) {
    for (const generation of family.generations) {
      expect(generation.photo?.url).toContain(
        `editorial-${generation.id.replace("-e26", "")}`,
      );
      expect(generation.photo?.note).toContain("Редакционная визуализация");
    }
  }
});
