import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { AtelierCars, selectAtelierCars } from "./AtelierCars";
import { atelierCars } from "../data/atelier-cars";
import { families } from "../data/models";
import { sourceById } from "../data/sources";
import { messages } from "../i18n";

describe("ALPINA archive", () => {
  it("keeps separate body styles and facelift specifications", () => {
    expect(selectAtelierCars("all")).toHaveLength(6);
    expect(selectAtelierCars("sedan")).toHaveLength(3);
    expect(selectAtelierCars("touring")).toHaveLength(3);
    const lci = selectAtelierCars("facelift");
    expect(lci).toHaveLength(2);
    expect(lci.map((c) => c.zeroTo100)).toEqual([3.6, 3.7]);
    expect(lci.every((c) => c.powerKw === 364 && c.torqueNm === 730)).toBe(
      true,
    );
    expect(
      atelierCars.filter((c) => c.phase === "launch").map((c) => c.zeroTo100),
    ).toEqual([3.8, 3.9]);
  });
  it("stores the limited edition as a shared scope, not two separate runs", () => {
    const editions = atelierCars.filter((c) => c.editionLimit);
    expect(editions).toHaveLength(2);
    expect(new Set(editions.map((c) => c.editionScope)).size).toBe(1);
    expect(editions.every((c) => c.editionLimit === 250)).toBe(true);
  });
  it("provides sources, bilingual copy, donor links and unique future photographs", () => {
    expect(new Set(atelierCars.map((c) => c.id)).size).toBe(atelierCars.length);
    expect(new Set(atelierCars.map((c) => c.outputFile)).size).toBe(
      atelierCars.length,
    );
    for (const car of atelierCars) {
      expect(sourceById[car.source]).toBeDefined();
      expect(families.some((f) => f.id === car.baseFamilyId)).toBe(true);
      expect(families.some((f) => f.id === car.id)).toBe(false);
      expect(car.asOf).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      for (const locale of ["ru", "en"] as const) {
        expect(messages[locale][car.story].length).toBeGreaterThan(40);
        expect(messages[locale][car.photoBrief].length).toBeGreaterThan(40);
      }
    }
  });
  it("renders an English archive without Russian fragments and native disclosure controls", () => {
    const html = renderToStaticMarkup(<AtelierCars language="en" />);
    expect(html).not.toMatch(/[А-Яа-яЁё]/);
    expect(html.match(/<details>/g)).toHaveLength(6);
    expect(html).toContain('href="?view=models&amp;model=bmw-3-series"');
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain("combined B5 GT edition limit");
  });
});
