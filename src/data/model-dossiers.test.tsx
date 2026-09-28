import { FamilyDetail } from "../features/FamilyDetail";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { families } from "./models";
import { modelDossiers } from "./model-dossiers";
import { sourceById } from "./sources";
import { assetByGeneration } from "./assets";
import { messages } from "../i18n";
import { AtelierGallery } from "../features/AtelierGallery";
import { ateliers } from "./ateliers";

describe("reserved collection entries", () => {
  it("renders every supplemented model overview in English without Russian fragments", () => {
    for (const family of families)
      for (const generation of family.generations.filter(
        (g) => modelDossiers[g.id],
      )) {
        const html = renderToStaticMarkup(
          <FamilyDetail
            family={family}
            generation={generation}
            language="en"
            saved={false}
            onSave={() => {}}
            onBack={() => {}}
            onGeneration={() => {}}
            hrefForGeneration={(id) => `?generation=${id}`}
          />,
        );
        expect(html, generation.id).not.toMatch(/[А-Яа-яЁё]/);
      }
  });
  it("gives every missing photograph a sourced bilingual dossier and an exact output slot", () => {
    const generations = families.flatMap((f) => f.generations);
    for (const generation of generations.filter((g) => !g.photo)) {
      const dossier = modelDossiers[generation.id];
      expect(dossier, generation.id).toBeDefined();
      expect(sourceById[dossier.source]).toBeDefined();
      expect(dossier.outputFile).toBe(
        `public/images/editorial-${generation.id}.webp`,
      );
      expect(dossier.facts.length).toBeGreaterThanOrEqual(2);
      for (const key of [...dossier.facts, dossier.photoBrief]) {
        expect(messages.ru[key].length).toBeGreaterThan(40);
        expect(messages.en[key].length).toBeGreaterThan(40);
        expect(messages.en[key]).not.toMatch(/[А-Яа-яЁё]/);
      }
    }
    for (const id of Object.keys(modelDossiers))
      expect(generations.some((g) => g.id === id)).toBe(true);
  });
  it("keeps facelift images separate and resolves registered series images after all entries exist", () => {
    expect(modelDossiers["bmw-2-f22-lci"].phase).toBe("facelift");
    expect(modelDossiers["bmw-2-g42-2024"].phase).toBe("model-year");
    expect(
      new Set(Object.values(modelDossiers).map((d) => d.outputFile)).size,
    ).toBe(Object.keys(modelDossiers).length);
    for (const family of families.filter((f) =>
      [
        "bmw-2-coupe",
        "bmw-2-gran-coupe",
        "bmw-4-coupe",
        "bmw-6-series",
        "bmw-6-gran-turismo",
      ].includes(f.id),
    )) {
      for (const generation of family.generations)
        expect(generation.photo).toEqual(assetByGeneration[generation.id]);
    }
  });
  it("keeps ateliers outside BMW model families and renders both languages with verified sources", () => {
    for (const a of ateliers) {
      expect(families.some((f) => f.id === a.id)).toBe(false);
      for (const source of a.sources) expect(sourceById[source]).toBeDefined();
    }
    const english = renderToStaticMarkup(<AtelierGallery language="en" />);
    expect(english).not.toMatch(/[А-Яа-яЁё]/);
    expect(english).toContain("A BMW Group brand since 2026");
    expect(english).toContain("Independent manufacturer");
    expect(renderToStaticMarkup(<AtelierGallery language="ru" />)).toContain(
      "Ателье",
    );
  });
});
