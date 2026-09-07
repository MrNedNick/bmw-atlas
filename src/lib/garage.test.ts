import { expect, it } from "vitest";
import { parseGarage } from "./garage";
it("recovers from missing, malformed and wrong-shaped storage", () => {
  for (const raw of [null, "{bad", "null", "{}", "42"])
    expect(parseGarage(raw, ["bmw-e30"])).toEqual([]);
});
it("retains existing BMW selections and removes deleted IDs and duplicates", () => {
  expect(
    parseGarage('["removed-model","bmw-3-series","bmw-3-series",3,null]', [
      "bmw-3-series",
    ]),
  ).toEqual(["bmw-3-series"]);
});
