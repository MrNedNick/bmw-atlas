import { describe, expect, it, vi } from "vitest";
import { families } from "../../../src/data/models";
import {
  acceptedAliasAdditions,
  createAliasCandidates,
  fetchWikidataEntities,
  type WikidataEntity,
} from ".";

describe("Wikidata alias adapter", () => {
  it("keeps an ambiguous alias as a choice and preserves the manual owner", () => {
    const entities: WikidataEntity[] = [
      {
        id: "Q100",
        labels: { en: { language: "en", value: "BMW M3" } },
        aliases: { en: [{ language: "en", value: "BMW M5" }] },
      },
    ];
    const candidates = createAliasCandidates(
      families,
      [{ entityId: "Q100", familyId: "bmw-m3" }],
      entities,
    );
    const conflict = candidates.find(
      (candidate) => candidate.alias === "BMW M5",
    )!;

    expect(conflict.status).toBe("ambiguous");
    expect(conflict.familyChoices).toEqual(["bmw-m3", "bmw-m5"]);
    expect(acceptedAliasAdditions(candidates).get("bmw-m3")).toBeUndefined();
    expect(
      families.find((family) => family.id === "bmw-m5")?.aliases,
    ).toContain("BMW M5");
  });

  it("uses scoped ids, entity links and only imports aliases", () => {
    const candidates = createAliasCandidates(
      families,
      [{ entityId: "Q200", familyId: "bmw-r32" }],
      [
        {
          id: "Q200",
          aliases: { ru: [{ language: "ru", value: "Р 32 БМВ" }] },
        },
      ],
    );
    expect(candidates[0]).toMatchObject({
      id: "wikidata:Q200:ru:р 32 бмв",
      entityUrl: "https://www.wikidata.org/wiki/Q200",
      status: "accepted",
      boundFamilyId: "bmw-r32",
    });
    expect(acceptedAliasAdditions(candidates).get("bmw-r32")).toEqual([
      "Р 32 БМВ",
    ]);
    expect(
      Object.keys(candidates[0]).some((key) => key.includes("power")),
    ).toBe(false);
  });

  it("requires a choice when external entities propose the same alias", () => {
    const candidates = createAliasCandidates(
      families,
      [
        { entityId: "Q201", familyId: "bmw-r32" },
        { entityId: "Q202", familyId: "bmw-gs-boxer" },
      ],
      [
        {
          id: "Q201",
          aliases: { en: [{ language: "en", value: "Classic boxer" }] },
        },
        {
          id: "Q202",
          aliases: { en: [{ language: "en", value: "Classic boxer" }] },
        },
      ],
    );
    expect(candidates).toHaveLength(2);
    expect(
      candidates.every((candidate) => candidate.status === "ambiguous"),
    ).toBe(true);
    expect(candidates[0].familyChoices).toEqual(["bmw-gs-boxer", "bmw-r32"]);
    expect(acceptedAliasAdditions(candidates).size).toBe(0);
  });

  it("batches entity reads and waits between requests", async () => {
    const ids = Array.from({ length: 51 }, (_, index) => `Q${index + 1}`);
    const sleep = vi.fn(async () => undefined);
    const fetchFn = vi.fn(async (input: string | URL | Request) => {
      const url = new URL(String(input));
      const requested = url.searchParams.get("ids")!.split("|");
      return new Response(
        JSON.stringify({
          entities: Object.fromEntries(requested.map((id) => [id, { id }])),
        }),
      );
    });

    const result = await fetchWikidataEntities(ids, {
      fetchFn,
      sleep,
      minimumIntervalMs: 750,
    });
    expect(result).toHaveLength(51);
    expect(fetchFn).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledWith(750);
  });
});
