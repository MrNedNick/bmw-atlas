import { describe, expect, it } from "vitest";
import { faceliftCount, validateRevisions, type Revision } from ".";

const revision = (kind: Revision["kind"]): Revision => ({
  year: 2024,
  kind,
  title: "Documented change",
  source: "source",
  market: "Europe",
  bodies: ["Седан"],
});

describe("known revisions", () => {
  it("counts only facelifts", () => {
    expect(
      faceliftCount([
        revision("facelift"),
        revision("model-year"),
        revision("technical"),
      ]),
    ).toBe(1);
  });

  it("requires market and body scope", () => {
    const unscoped = revision("facelift");
    unscoped.market = "";
    unscoped.bodies = [];
    expect(
      validateRevisions([unscoped], { id: "g1", start: 2020, end: null }),
    ).toContain("revision without scope: g1");
  });
});
