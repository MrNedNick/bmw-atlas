import { expect, it } from "vitest";
import { catalogGroups } from "./catalog-groups";
import { families } from "./models";

it("places every detailed family in one clear catalogue category", () => {
  const groupedIds = catalogGroups.flatMap((group) => group.familyIds);

  expect(new Set(groupedIds).size).toBe(groupedIds.length);
  expect([...groupedIds].sort()).toEqual(
    families.map((family) => family.id).sort(),
  );
});

it("keeps the BMW i, BMW M and Motorrad lineages separate", () => {
  const idsFor = (groupId: string) =>
    catalogGroups.find((group) => group.id === groupId)?.familyIds;

  expect(idsFor("i")).toContain("bmw-i5-g60-lineage");
  expect(idsFor("m")).toContain("bmw-z3-m");
  expect(idsFor("motorrad")).toEqual(["bmw-r32", "bmw-gs-boxer"]);
});
