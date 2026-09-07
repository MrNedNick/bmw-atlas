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
  ).toEqual(["bmw-5-series"]);
  expect(
    families.filter((f) =>
      familyMatches(f, { ...EMPTY_FILTERS, fuel: "Plug-in hybrid" }),
    ),
  ).toEqual([]);
});

it("contains only BMW histories", () =>
  expect(families.every((f) => f.brand === "BMW")).toBe(true));
