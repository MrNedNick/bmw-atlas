import { describe, it, expect } from "vitest";
import {
  normalize,
  parseSelection,
  validateCatalog,
  formatVolume,
  type ModelFamily,
  type Source,
} from "./catalog";
const sources: Source[] = [
  {
    id: "source",
    title: "Source",
    publisher: "Maker",
    url: "https://example.com",
    date: "2026-09-06",
    scope: "test",
  },
];
const fixture = (): ModelFamily => ({
  id: "family",
  brand: "BMW",
  vehicleKind: "Автомобиль",
  name: "Model",
  aliases: [],
  tagline: "",
  summary: "",
  body: [],
  source: "source",
  countries: [],
  countryScope: "global",
  volume: null,
  generations: [
    {
      id: "g1",
      label: "I",
      code: "G1",
      start: 2000,
      end: 2010,
      dateScope: "global",
      description: "",
      source: "source",
      revisions: [],
      revisionCoverage: "partial",
      powertrains: [],
      volume: null,
      assembly: [],
      rating: null,
    },
  ],
});
describe("catalogue boundaries", () => {
  it("normalizes accented names and Cyrillic without inventing aliases", () => {
    expect(normalize("Coupé  —  Ёж")).toBe("coupe еж");
    expect(normalize("BMW i3")).not.toBe(normalize("BMW 3"));
  });
  it("does not turn missing production into zero", () =>
    expect(formatVolume(null)).toBe("Нет подтверждённых данных"));
  it("rejects duplicate generation IDs", () => {
    const f = fixture();
    f.generations.push({ ...f.generations[0] });
    expect(validateCatalog([f], sources)).toContain("duplicate id: g1");
  });
  it("rejects facts without a registered source", () => {
    const f = fixture();
    f.generations[0].source = "missing";
    expect(validateCatalog([f], sources)).toContain("unknown source: missing");
  });
  it("allows overlapping generation production", () => {
    const f = fixture();
    f.generations.push({
      ...f.generations[0],
      id: "g2",
      start: 2008,
      end: null,
    });
    expect(validateCatalog([f], sources)).toEqual([]);
  });
  it("rejects reversed date ranges", () => {
    const f = fixture();
    f.generations[0].end = 1999;
    expect(validateCatalog([f], sources)).toContain("invalid dates: g1");
  });
  it("bounds and deduplicates URL selections", () => {
    expect(
      parseSelection("a,a,missing,b,c,d,e", ["a", "b", "c", "d", "e"]),
    ).toEqual(["a", "b", "c", "d"]);
  });
});

it("rejects another brand even if its facts are valid", () => {
  const f = fixture();
  f.brand = "Other";
  expect(validateCatalog([f], sources)).toContain("unsupported brand: family");
});
