import { describe, expect, it } from "vitest";
import { resolveFact, validateFactAssertions, type FactAssertion } from ".";

const scope = { region: "US", year: 2024, body: "Седан" };
const assertion = (
  id: string,
  value: number | null,
  sourceId = "source-a",
): FactAssertion<number> => ({
  id,
  field: "power",
  value,
  sourceId,
  observedAt: "2024-01-15",
  scope,
});

describe("source-backed facts", () => {
  it("conflicting power remains visible with the complete source history", () => {
    const result = resolveFact("power", scope, [
      assertion("power-a", 255),
      assertion("power-b", 258, "source-b"),
    ]);
    expect(result).toMatchObject({
      field: "power",
      status: "conflicting",
      value: null,
      sourceIds: ["source-a", "source-b"],
    });
    expect(result.assertions.map((item) => item.value)).toEqual([255, 258]);
  });

  it("confirms matching claims while retaining provenance per field", () => {
    const result = resolveFact("power", scope, [
      assertion("power-a", 255),
      assertion("power-b", 255, "source-b"),
    ]);
    expect(result.status).toBe("confirmed");
    expect(result.value).toBe(255);
    expect(result.sourceIds).toEqual(["source-a", "source-b"]);
  });

  it("keeps unknown assertions and never converts them to zero", () => {
    const result = resolveFact("power", scope, [assertion("power-a", null)]);
    expect(result.status).toBe("unknown");
    expect(result.value).toBeNull();
    expect(result.assertions).toHaveLength(1);
  });

  it("does not create conflicts across region, year or body scopes", () => {
    const european: FactAssertion<number> = {
      ...assertion("power-eu", 250, "source-b"),
      scope: { region: "EU", year: 2023, body: "Универсал" },
    };
    const result = resolveFact("power", scope, [
      assertion("power-us", 255),
      european,
    ]);
    expect(result.status).toBe("confirmed");
    expect(result.value).toBe(255);
    expect(result.assertions.map((item) => item.id)).toEqual(["power-us"]);
  });

  it("rejects missing provenance, invalid scope and impossible dates", () => {
    const invalid = assertion("bad", 255, "missing");
    invalid.observedAt = "2024-02-30";
    invalid.scope = { region: "", year: 0, body: "" };
    expect(
      validateFactAssertions([invalid], new Set(["source-a", "source-b"])),
    ).toEqual([
      "unknown assertion source: bad",
      "invalid assertion date: bad",
      "invalid assertion scope: bad",
    ]);
  });
});
