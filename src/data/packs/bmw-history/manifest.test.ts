import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { EMPTY_FILTERS, familyMatches } from "../../../domain/catalog";
import { assetByGeneration } from "../../assets";
import { families } from "../../models";
import { sources } from "../../sources";
import { bmwHistoryInventory, validateBMWHistoryInventory } from "./manifest";

const isetta = families.find((family) => family.id === "bmw-isetta")!;

describe("BMW history progress manifest", () => {
  it("connects every archived body to a card, sources and a licensed photo", () => {
    expect(
      validateBMWHistoryInventory(
        bmwHistoryInventory,
        sources,
        families,
        assetByGeneration,
      ),
    ).toEqual([]);
    for (const entry of bmwHistoryInventory.filter(
      (item) => item.status === "detailed",
    )) {
      const asset = assetByGeneration[entry.generationId!];
      expect(
        existsSync(new URL(`../../../../public/${asset.url}`, import.meta.url)),
      ).toBe(true);
      expect(
        existsSync(
          new URL(`../../../../${asset.reference?.localFile}`, import.meta.url),
        ),
      ).toBe(true);
    }
  });

  it("keeps Isetta Standard and Export as separate bodies", () => {
    expect(isetta.generations.map((generation) => generation.code)).toEqual([
      "Standard",
      "Export",
    ]);
    const [standard, exportBody] = isetta.generations;
    expect([standard.start, standard.end]).toEqual([1955, 1957]);
    expect([exportBody.start, exportBody.end]).toEqual([1956, 1962]);
    expect(standard.photo?.url).not.toBe(exportBody.photo?.url);
    expect(
      familyMatches(isetta, { ...EMPTY_FILTERS, query: "Isetta Export" }),
    ).toBe(true);
    expect(familyMatches(isetta, { ...EMPTY_FILTERS, year: "1960" })).toBe(
      true,
    );
  });

  it("rejects an unknown photo license and a body dated outside its card", () => {
    const [standard, exportBody] = bmwHistoryInventory;
    const unlicensed = {
      ...assetByGeneration,
      [standard.generationId!]: {
        ...assetByGeneration[standard.generationId!],
        license: "unknown",
      },
    };
    expect(
      validateBMWHistoryInventory([standard], sources, families, unlicensed),
    ).toEqual(["unknown history photo license: bmw-history-isetta-standard"]);
    expect(
      validateBMWHistoryInventory(
        [{ ...exportBody, production: { from: "1955-03", to: "1962-05" } }],
        sources,
        families,
        assetByGeneration,
      ),
    ).toEqual([
      "history dates differ from generation: bmw-history-isetta-export",
    ]);
  });

  it("does not treat the BMW 600 as an Isetta version", () => {
    expect(
      familyMatches(isetta, { ...EMPTY_FILTERS, query: "Isetta 600" }),
    ).toBe(false);
  });

  it("inventories the archived bodies from pre-war cars to E3/E9", () => {
    const families = new Set(bmwHistoryInventory.map((item) => item.family));
    for (const family of [
      "3/15 PS",
      "3/20 PS",
      "328",
      "335",
      "501/502",
      "503",
      "507",
      "600",
      "700",
      "Neue Klasse",
      "02",
      "E3",
      "E9",
    ])
      expect(families).toContain(family);
    const sourceById = new Map(sources.map((source) => [source.id, source]));
    for (const item of bmwHistoryInventory.filter(
      (entry) => entry.status === "index",
    )) {
      expect(item.generationId).toBeNull();
      for (const id of item.sourceIds)
        expect(sourceById.get(id)?.publisher).toBe("BMW Group Classic");
    }
  });

  it("reads 2002 as a model name and keeps 328 apart from the modern 328i", () => {
    const byId = (id: string) =>
      bmwHistoryInventory.find((item) => item.id === id)!;
    const twoDoor = byId("bmw-history-02-sedan");
    expect(twoDoor.aliases).toContain("2002");
    expect(twoDoor.production).toEqual({ from: "1966-03", to: "1977-07" });
    const roadster = byId("bmw-history-328");
    expect(roadster.production).toEqual({ from: "1936", to: "1940" });
    expect(roadster.aliases.some((alias) => /328i/i.test(alias))).toBe(false);
    expect(roadster.missingFields).toContain("месяцы начала и конца выпуска");
  });

  it("rejects malformed and inverted production periods", () => {
    const [row] = bmwHistoryInventory.filter((item) => item.status === "index");
    for (const production of [
      { from: "1936-13", to: "1940" },
      { from: "1940", to: "1936" },
      { from: "36", to: "1940" },
    ])
      expect(
        validateBMWHistoryInventory(
          [{ ...row, production }],
          sources,
          families,
          assetByGeneration,
        ),
      ).toEqual([`invalid history period: ${row.id}`]);
  });

  it("gives the 328 its own dated card without mixing it with the modern 328i", () => {
    const roadster = families.find((family) => family.id === "bmw-328")!;
    expect(roadster.generations.map((generation) => generation.id)).toEqual([
      "bmw-328-roadster",
    ]);
    expect(familyMatches(roadster, { ...EMPTY_FILTERS, year: "1938" })).toBe(
      true,
    );
    expect(familyMatches(roadster, { ...EMPTY_FILTERS, query: "328i" })).toBe(
      false,
    );
  });

  it("dates the 503 by production, not by its 1955 debut", () => {
    const car = families.find((family) => family.id === "bmw-503")!;
    const [body] = car.generations;
    expect([body.start, body.end]).toEqual([1956, 1960]);
    expect(body.photo?.subject).toContain("Cabriolet");
    expect(familyMatches(car, { ...EMPTY_FILTERS, year: "1955" })).toBe(false);
  });

  it("keeps the BMW 600 apart from the Isetta it grew out of", () => {
    const car = families.find((family) => family.id === "bmw-600")!;
    expect(car.generations[0].volume?.value).toBe(34_813);
    expect(familyMatches(car, { ...EMPTY_FILTERS, year: "1956" })).toBe(false);
    expect(familyMatches(isetta, { ...EMPTY_FILTERS, query: "BMW 600" })).toBe(
      false,
    );
  });

  it("keeps the 700 Sport and 700 CS as one coupé with separate powertrains", () => {
    const car = families.find((family) => family.id === "bmw-700")!;
    expect(car.generations.map((generation) => generation.code)).toEqual([
      "700 Coupé",
    ]);
    expect(
      car.generations[0].powertrains.map((powertrain) => powertrain.power),
    ).toEqual([30, 40, 40]);
  });

  it("labels the 2000 CS photo as a converted 2000 C", () => {
    const car = families.find((family) => family.id === "bmw-neue-klasse")!;
    expect(car.generations[0].photo?.subject).toContain("2000 C с двигателем");
    expect(familyMatches(car, { ...EMPTY_FILTERS, query: "2000 CA" })).toBe(
      true,
    );
  });
});
