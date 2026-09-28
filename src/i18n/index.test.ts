import { describe, expect, it } from "vitest";
import { families } from "../data/models";
import { messages, catalogText } from ".";

describe("locales", () => {
  it("keeps both dictionaries complete and rejects empty translations", () => {
    expect(Object.keys(messages.en).sort()).toEqual(
      Object.keys(messages.ru).sort(),
    );
    for (const dict of Object.values(messages))
      for (const value of Object.values(dict))
        expect(value.trim()).not.toBe("");
  });
  it("provides English and Russian summaries and descriptions for every catalogue entry", () => {
    for (const family of families) {
      expect(catalogText("ru", `family.${family.id}.summary`)).toBeTruthy();
      expect(catalogText("en", `family.${family.id}.summary`)).not.toMatch(
        /[А-Яа-яЁё]/,
      );
      for (const g of family.generations) {
        expect(
          catalogText("ru", `generation.${g.id}.description`),
        ).toBeTruthy();
        expect(catalogText("en", `generation.${g.id}.description`)).not.toMatch(
          /[А-Яа-яЁё]/,
        );
      }
    }
  });
});
