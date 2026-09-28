import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { families } from "../data/models";
import { EMPTY_FILTERS } from "../domain/catalog";
import {
  CollectionCatalog,
  collectionSelection,
  isFacelift,
} from "./CollectionCatalog";
const selection = {
  collection: "",
  decade: "",
  phase: "" as const,
  filters: { ...EMPTY_FILTERS },
};
describe("collection chapters", () => {
  it("shows every generation exactly once with no filter", () => {
    const ids = collectionSelection(families, selection, []).flatMap((e) =>
      e.generations.map((g) => g.id),
    );
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBe(
      families.reduce((n, f) => n + f.generations.length, 0),
    );
  });
  it("intersects decade, collection, query and facelift on the same generation", () => {
    const selected = collectionSelection(
      families,
      {
        ...selection,
        collection: "x",
        decade: "2020",
        phase: "facelift",
        filters: { ...EMPTY_FILTERS, query: "BMW G07" },
      },
      [],
    );
    expect(selected.flatMap((e) => e.generations.map((g) => g.id))).toEqual([
      "bmw-x7-g07-lci",
    ]);
    expect(
      collectionSelection(
        families,
        { ...selection, decade: "1920", phase: "facelift" },
        [],
      ),
    ).toEqual([]);
  });
  it("limits a chassis search to its versions even when the family has chassis aliases", () => {
    const find = (query: string) =>
      collectionSelection(
        families,
        { ...selection, filters: { ...EMPTY_FILTERS, query } },
        [],
      ).flatMap((e) => e.generations.map((g) => g.id));
    expect(find("F22")).toEqual(["bmw-2-f22", "bmw-2-f22-lci"]);
    expect(find("F22 LCI")).toEqual(["bmw-2-f22-lci"]);
  });
  it("does not classify a model-year update or a whole lineage as a facelift", () => {
    const g = families
      .flatMap((f) => f.generations)
      .find((g) => g.id === "bmw-2-g42-2024")!;
    expect(isFacelift(g)).toBe(false);
    const lineage = families
      .flatMap((f) => f.generations)
      .find((g) => g.id === "bmw-m3-g80")!;
    expect(isFacelift(lineage)).toBe(false);
  });
  it("provides real model links for new tabs and keeps the garage separate", () => {
    const family = families.find((f) => f.id === "bmw-x7")!;
    const html = renderToStaticMarkup(
      <CollectionCatalog
        expanded={false}
        onExpandedChange={() => {}}
        families={[family]}
        selection={selection}
        saved={[]}
        language="en"
        onChange={() => {}}
        onSave={() => {}}
        onOpen={() => {}}
        hrefFor={(f, g) => `?model=${f.id}&generation=${g.id}`}
      />,
    );
    expect(html).toContain(
      'href="?model=bmw-x7&amp;generation=bmw-x7-g07-lci"',
    );
    expect(html).toContain('aria-label="Save to garage BMW X7"');
    expect(html).not.toMatch(/[А-Яа-яЁё]/);
  });
});
