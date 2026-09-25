import { describe, expect, it } from "vitest";
import { gallerySelection } from "./gallery";
import { faceliftExhibits } from "../FaceliftExhibit";
import { families } from "../../data/models";

describe("collection photo routes", () => {
  it("searches exact generations instead of every generation in a family", () => {
    const rows = gallerySelection("", "E30", false);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((row) => row.generation.code.includes("E30"))).toBe(true);
  });
  it("combines a room, search and facelift filter", () => {
    expect(
      gallerySelection("x", "X7", true).map((row) => row.generation.id),
    ).toEqual(["bmw-x7-g07-lci"]);
    expect(gallerySelection("motorrad", "X7", true)).toEqual([]);
    expect(gallerySelection("x", "X7", false)).toHaveLength(2);
  });
  it("compares two distinct photographed phases in the same family", () => {
    for (const pair of faceliftExhibits) {
      const family = families.find((f) => f.id === pair.family)!;
      const before = family.generations.find((g) => g.id === pair.before)!;
      const after = family.generations.find((g) => g.id === pair.after)!;
      expect(before.photo?.url).toBeTruthy();
      expect(after.photo?.url).toBeTruthy();
      expect(before.photo?.url).not.toBe(after.photo?.url);
      expect(after.start).toBe(pair.year);
      expect(
        after.revisions.some(
          (r) => r.kind === "facelift" && r.year === pair.year,
        ),
      ).toBe(true);
    }
  });
});
