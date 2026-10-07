import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { describe, it, expect } from "vitest";
import { families } from "./models";
import {
  EMPTY_FILTERS,
  familyMatches,
  type ModelFamily,
} from "../domain/catalog";
import { collectionSelection } from "../features/CollectionCatalog";
const read = (path: string) =>
  readFileSync(new URL(`../../public/data/${path}`, import.meta.url));
const index: ModelFamily[] = JSON.parse(read("family-index.json").toString());
describe("static browser catalogue", () => {
  it("preserves every search and filter result in the compact index", () => {
    const queries = ["", "F22", "G07", "LCI", "BMW 2002", "M850i", "Batmobile"];
    const filters = queries.map((query) => ({ ...EMPTY_FILTERS, query }));
    for (const family of families) {
      for (const body of family.body) filters.push({ ...EMPTY_FILTERS, body });
      for (const country of family.countries)
        filters.push({ ...EMPTY_FILTERS, country });
      for (const generation of family.generations) {
        filters.push({ ...EMPTY_FILTERS, year: String(generation.start) });
        for (const powertrain of generation.powertrains)
          filters.push({
            ...EMPTY_FILTERS,
            fuel: powertrain.fuel,
            year: String(generation.start),
          });
      }
    }
    const saved = [families[0].id];
    filters.push({ ...EMPTY_FILTERS, savedOnly: true });
    for (const filter of filters) {
      expect(
        index.filter((f) => familyMatches(f, filter, saved)).map((f) => f.id),
      ).toEqual(
        families
          .filter((f) => familyMatches(f, filter, saved))
          .map((f) => f.id),
      );
      const selection = {
        collection: "",
        decade: "",
        phase: "" as const,
        filters: filter,
      };
      const ids = (rows: ReturnType<typeof collectionSelection>) =>
        rows.flatMap((row) => row.generations.map((g) => g.id));
      expect(ids(collectionSelection(index, selection, saved))).toEqual(
        ids(collectionSelection(families, selection, saved)),
      );
    }
  });
  it("exports complete family details and matching compressed snapshots", () => {
    for (const family of families) {
      expect(JSON.parse(read(`families/${family.id}.json`).toString())).toEqual(
        family,
      );
      expect(gunzipSync(read(`families/${family.id}.json.gz`))).toEqual(
        read(`families/${family.id}.json`),
      );
    }
    expect(gunzipSync(read("family-index.json.gz"))).toEqual(
      read("family-index.json"),
    );
  });
});
