import { describe, expect, it } from "vitest";
import { safetyRatingView, validateSafetyRatings, type SafetyRating } from ".";

const base = (id: string, pack: "standard" | "optional"): SafetyRating => ({
  id,
  status: "rated",
  scheme: "Euro NCAP",
  protocolYear: 2022,
  testedVariant: "BMW example, LHD",
  market: "Europe",
  safetyPack: {
    status: pack,
    label: pack === "standard" ? "Standard" : "Safety Pack",
  },
  overall: { value: 5, scale: "stars-5" },
  components: [{ label: "Adult occupant", value: 88, scale: "percent" }],
  source: "source",
});

describe("safety rating boundaries", () => {
  it("keeps standard and safety-pack results as separate scenarios", () => {
    const ratings = [base("standard", "standard"), base("pack", "optional")];
    const view = safetyRatingView(ratings);
    expect(view.status).toBe("rated");
    if (view.status === "rated") {
      expect(view.ratings).toHaveLength(2);
      expect(view.ratings.map((rating) => rating.safetyPack.status)).toEqual([
        "standard",
        "optional",
      ]);
    }
    expect(validateSafetyRatings(ratings)).toEqual([]);
  });

  it("represents missing coverage as unknown instead of zero", () => {
    expect(safetyRatingView([])).toMatchObject({ status: "unknown" });
    expect(JSON.stringify(safetyRatingView([]))).not.toContain('"value":0');
  });
});
